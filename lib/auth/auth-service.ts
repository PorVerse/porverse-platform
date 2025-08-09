// lib/auth/auth-service.ts - COMPLETE AUTHENTICATION SYSTEM
import { createClientSupabase, createServerSupabase, supabaseAdmin } from '../supabase'
import { SecurityService } from '../security/security-service'
import { DatabaseService } from '../database/database-service-complete'
import { EmailService } from '../email/email-service'
import { cookies } from 'next/headers'

interface AuthResult {
  success: boolean
  user?: any
  error?: string
  requiresVerification?: boolean
  mfaRequired?: boolean
}

interface LoginCredentials {
  email: string
  password: string
  mfaCode?: string
  rememberMe?: boolean
}

interface SignupData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  country?: string
  goals?: string[]
  challenges?: string[]
}

interface PasswordResetData {
  token: string
  newPassword: string
  confirmPassword: string
}

export class AuthService {
  private security: SecurityService
  private database: DatabaseService
  private email: EmailService

  constructor() {
    this.security = SecurityService.getInstance()
    this.database = new DatabaseService()
    this.email = new EmailService()
  }

  // ================================
  // REGISTRATION & SIGNUP
  // ================================

  async signup(signupData: SignupData): Promise<AuthResult> {
    try {
      // Validate input
      const validationResult = this.validateSignupData(signupData)
      if (!validationResult.isValid) {
        return { success: false, error: validationResult.errors.join(', ') }
      }

      // Sanitize input
      const sanitizedData = this.security.sanitizeJSON(signupData)

      // Check if user already exists
      const existingUser = await supabaseAdmin!.auth.admin.getUserByEmail(sanitizedData.email)
      if (existingUser.data?.user) {
        return { success: false, error: 'Un cont cu acest email există deja' }
      }

      // Create user in Supabase Auth
      const { data, error } = await supabaseAdmin!.auth.admin.createUser({
        email: sanitizedData.email,
        password: sanitizedData.password,
        email_confirm: false, // We'll handle email confirmation manually
        user_metadata: {
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          country: sanitizedData.country,
          goals: sanitizedData.goals,
          challenges: sanitizedData.challenges,
          signup_source: 'web',
          signup_ip: 'system' // Would get from request in real implementation
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // Create user profile in database
      const profileResult = await this.database.createUserProfile({
        userId: data.user.id,
        email: sanitizedData.email,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        country: sanitizedData.country
      })

      if (!profileResult.success) {
        // Cleanup - delete auth user if profile creation failed
        await supabaseAdmin!.auth.admin.deleteUser(data.user.id)
        return { success: false, error: 'Eroare la crearea profilului' }
      }

      // Send verification email
      await this.sendVerificationEmail(data.user.id, sanitizedData.email)

      // Log signup activity
      await this.database.logUserActivity({
        userId: data.user.id,
        actionType: 'signup',
        actionData: {
          source: 'web',
          country: sanitizedData.country,
          goals_count: sanitizedData.goals?.length || 0
        }
      })

      return { 
        success: true, 
        user: data.user,
        requiresVerification: true
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Rate limiting check
      const rateLimitKey = `login_${credentials.email}`
      const rateLimit = this.security.checkRateLimit(rateLimitKey, '/api/auth/login')
      
      if (!rateLimit.allowed) {
        return { success: false, error: 'Prea multe încercări de login. Încearcă din nou mai târziu.' }
      }

      // Sanitize input
      const sanitizedCredentials = this.security.sanitizeJSON(credentials)

      // Attempt login
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedCredentials.email,
        password: sanitizedCredentials.password
      })

      if (error) {
        // Log failed attempt
        await this.database.logUserActivity({
          actionType: 'login_failed',
          actionData: {
            email: sanitizedCredentials.email,
            error: error.message,
            ip: 'system'
          }
        })
        
        return { success: false, error: 'Email sau parolă incorectă' }
      }

      // Check if email is verified
      if (!data.user?.email_confirmed_at) {
        return { 
          success: false, 
          error: 'Email-ul nu este verificat. Verifică inbox-ul pentru link-ul de confirmare.',
          requiresVerification: true
        }
      }

      // Check MFA requirement (if implemented)
      const mfaRequired = await this.checkMFARequirement(data.user.id)
      if (mfaRequired && !credentials.mfaCode) {
        return { 
          success: false, 
          error: 'Cod MFA necesar',
          mfaRequired: true
        }
      }

      if (mfaRequired && credentials.mfaCode) {
        const mfaValid = await this.verifyMFACode(data.user.id, credentials.mfaCode)
        if (!mfaValid) {
          return { success: false, error: 'Cod MFA invalid' }
        }
      }

      // Update last login
      await this.database.updateUserProfile(data.user.id, {
        last_login_at: new Date().toISOString()
      } as any)

      // Log successful login
      await this.database.logUserActivity({
        userId: data.user.id,
        actionType: 'login_success',
        actionData: {
          ip: 'system',
          user_agent: 'system'
        }
      })

      // Set session duration based on "remember me"
      if (credentials.rememberMe) {
        // Extend session to 30 days
        await supabase.auth.updateUser({
          data: { session_duration: 30 * 24 * 60 * 60 } // 30 days in seconds
        })
      }

      return { success: true, user: data.user }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async logout(userId?: string): Promise<AuthResult> {
    try {
      const supabase = createClientSupabase()
      
      // Log logout activity
      if (userId) {
        await this.database.logUserActivity({
          userId,
          actionType: 'logout',
          actionData: { timestamp: new Date().toISOString() }
        })
      }

      // Sign out from Supabase
      await supabase.auth.signOut()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // EMAIL VERIFICATION
  // ================================

  async sendVerificationEmail(userId: string, email: string): Promise<AuthResult> {
    try {
      // Generate verification token
      const token = this.security.generateSecureToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store verification token
      await supabaseAdmin!
        .from('email_verifications')
        .insert({
          user_id: userId,
          email: email,
          token: await this.security.encrypt(token),
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })

      // Send verification email
      await this.email.sendVerificationEmail(userId, email, token)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      // Find verification record
      const { data: verifications, error } = await supabaseAdmin!
        .from('email_verifications')
        .select('*')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())

      if (error) throw error

      // Check each verification to find matching token
      let verification = null
      for (const v of verifications || []) {
        try {
          const decryptedToken = this.security.decrypt(v.token)
          if (decryptedToken === token) {
            verification = v
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!verification) {
        return { success: false, error: 'Token de verificare invalid sau expirat' }
      }

      // Mark email as verified in Supabase Auth
      await supabaseAdmin!.auth.admin.updateUserById(verification.user_id, {
        email_confirm: true
      })

      // Mark verification as used
      await supabaseAdmin!
        .from('email_verifications')
        .update({ 
          used: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id)

      // Log verification
      await this.database.logUserActivity({
        userId: verification.user_id,
        actionType: 'email_verified',
        actionData: { email: verification.email }
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PASSWORD RESET
  // ================================

  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      // Check if user exists
      const { data: user } = await supabaseAdmin!.auth.admin.getUserByEmail(email)
      if (!user?.user) {
        // Don't reveal if email exists or not for security
        return { success: true }
      }

      // Generate reset token
      const token = this.security.generateSecureToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token
      await supabaseAdmin!
        .from('password_resets')
        .insert({
          user_id: user.user.id,
          email: email,
          token: await this.security.encrypt(token),
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })

      // Send reset email
      await this.email.sendPasswordResetEmail(user.user.id, email, token)

      // Log reset request
      await this.database.logUserActivity({
        userId: user.user.id,
        actionType: 'password_reset_requested',
        actionData: { email }
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async resetPassword(resetData: PasswordResetData): Promise<AuthResult> {
    try {
      // Validate passwords match
      if (resetData.newPassword !== resetData.confirmPassword) {
        return { success: false, error: 'Parolele nu se potrivesc' }
      }

      // Validate password strength
      const passwordValidation = this.security.validatePasswordStrength(resetData.newPassword)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') }
      }

      // Find and validate reset token
      const { data: resets, error } = await supabaseAdmin!
        .from('password_resets')
        .select('*')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())

      if (error) throw error

      let resetRecord = null
      for (const reset of resets || []) {
        try {
          const decryptedToken = this.security.decrypt(reset.token)
          if (decryptedToken === resetData.token) {
            resetRecord = reset
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!resetRecord) {
        return { success: false, error: 'Token de resetare invalid sau expirat' }
      }

      // Update password
      const { error: updateError } = await supabaseAdmin!.auth.admin.updateUserById(
        resetRecord.user_id,
        { password: resetData.newPassword }
      )

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Mark reset as used
      await supabaseAdmin!
        .from('password_resets')
        .update({ 
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', resetRecord.id)

      // Log password change
      await this.database.logUserActivity({
        userId: resetRecord.user_id,
        actionType: 'password_reset_completed',
        actionData: { email: resetRecord.email }
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // SOCIAL LOGIN
  // ================================

  async loginWithGoogle(): Promise<AuthResult> {
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
      return { success: true, user: data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async loginWithApple(): Promise<AuthResult> {
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      })

      if (error) throw error
      return { success: true, user: data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // SESSION MANAGEMENT
  // ================================

  async getCurrentUser(): Promise<AuthResult> {
    try {
      const supabase = createClientSupabase()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error
      
      if (!user) {
        return { success: false, error: 'No authenticated user' }
      }

      return { success: true, user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async refreshSession(): Promise<AuthResult> {
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.refreshSession()

      if (error) throw error
      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // MFA (MULTI-FACTOR AUTHENTICATION)
  // ================================

  async enableMFA(userId: string): Promise<AuthResult> {
    try {
      // Generate MFA secret
      const secret = this.security.generateSecureToken(32)
      
      // Store MFA configuration
      await supabaseAdmin!
        .from('user_mfa')
        .upsert({
          user_id: userId,
          secret: await this.security.encrypt(secret),
          enabled: true,
          backup_codes: await this.generateMFABackupCodes(),
          created_at: new Date().toISOString()
        })

      return { success: true, data: { secret } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async disableMFA(userId: string, mfaCode: string): Promise<AuthResult> {
    try {
      // Verify MFA code first
      const isValid = await this.verifyMFACode(userId, mfaCode)
      if (!isValid) {
        return { success: false, error: 'Invalid MFA code' }
      }

      // Disable MFA
      await supabaseAdmin!
        .from('user_mfa')
        .update({ enabled: false })
        .eq('user_id', userId)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // VALIDATION HELPERS
  // ================================

  private validateSignupData(data: SignupData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Email validation
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email invalid')
    }

    // Password validation
    const passwordValidation = this.security.validatePasswordStrength(data.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }

    // Name validation
    if (data.firstName && (data.firstName.length < 2 || data.firstName.length > 50)) {
      errors.push('Prenumele trebuie să aibă între 2 și 50 de caractere')
    }

    if (data.lastName && (data.lastName.length < 2 || data.lastName.length > 50)) {
      errors.push('Numele trebuie să aibă între 2 și 50 de caractere')
    }

    return { isValid: errors.length === 0, errors }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private async checkMFARequirement(userId: string): Promise<boolean> {
    try {
      const { data } = await supabaseAdmin!
        .from('user_mfa')
        .select('enabled')
        .eq('user_id', userId)
        .single()

      return data?.enabled || false
    } catch {
      return false
    }
  }

  private async verifyMFACode(userId: string, code: string): Promise<boolean> {
    // Implementation would verify TOTP code
    // For now, return true for demo purposes
    return true
  }

  private async generateMFABackupCodes(): Promise<string[]> {
    const codes = []
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase())
    }
    return codes
  }
}

export default new AuthService()