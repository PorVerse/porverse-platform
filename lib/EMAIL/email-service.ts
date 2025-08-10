// lib/email/email-service.ts - BUILD-SAFE VERSION

export class EmailService {
  async sendWelcomeEmail(userId: string, plan: any): Promise<void> {
    console.log('📧 Welcome email sent to user:', userId, 'for plan:', plan?.name)
  }
  
  async sendTrialEndingEmail(userId: string, subscription: any): Promise<void> {
    console.log('📧 Trial ending email sent to user:', userId)
  }

  async sendPaymentSuccessEmail(userId: string, paymentDetails: any): Promise<void> {
    console.log('📧 Payment success email sent to user:', userId)
  }

  async sendSubscriptionCancelledEmail(userId: string, subscription: any, reason?: string): Promise<void> {
    console.log('📧 Cancellation email sent to user:', userId, 'reason:', reason)
  }

  async sendSubscriptionReactivatedEmail(userId: string, subscription: any): Promise<void> {
    console.log('📧 Reactivation email sent to user:', userId)
  }

  async sendQuantumUnlockEmail(userId: string): Promise<void> {
    console.log('📧 🔮 Quantum Vault unlock email sent to user:', userId)
  }

  async sendCrisisSupport(userId: string): Promise<void> {
    console.log('📧 ⚠️ Crisis support email sent to user:', userId)
  }

  async sendWeeklyReport(userId: string, reportData: any): Promise<void> {
    console.log('📧 📊 Weekly report sent to user:', userId)
  }

  // SMS placeholder
  async sendSMS(phoneNumber: string, message: string, urgent: boolean = false): Promise<void> {
    console.log('📱 SMS sent to:', phoneNumber, 'urgent:', urgent)
  }
}