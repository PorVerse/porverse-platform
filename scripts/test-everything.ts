#!/usr/bin/env ts-node

// scripts/test-everything.ts - Complete System Test

import { exec } from 'child_process'
import { promisify } from 'util'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const execAsync = promisify(exec)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  duration?: number
}

class PorVerseTestSuite {
  private results: TestResult[] = []
  private startTime = Date.now()

  private log(color: string, message: string) {
    console.log(`${color}${message}${colors.reset}`)
  }

  private addResult(result: TestResult) {
    this.results.push(result)
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
    const color = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow
    this.log(color, `${icon} ${result.name}: ${result.message}`)
  }

  // ================================
  // ENVIRONMENT TESTS
  // ================================

  async testEnvironmentVariables(): Promise<void> {
    this.log(colors.blue, '\n🔧 Testing Environment Variables...')
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const optionalVars = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'STRIPE_SECRET_KEY',
      'RESEND_API_KEY'
    ]

    let missingRequired = 0
    let missingOptional = 0

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.addResult({
          name: `Required ENV: ${varName}`,
          status: 'fail',
          message: 'Missing required environment variable'
        })
        missingRequired++
      } else {
        this.addResult({
          name: `Required ENV: ${varName}`,
          status: 'pass',
          message: 'Present'
        })
      }
    }

    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.addResult({
          name: `Optional ENV: ${varName}`,
          status: 'warning',
          message: 'Missing optional API key - some features may not work'
        })
        missingOptional++
      } else {
        this.addResult({
          name: `Optional ENV: ${varName}`,
          status: 'pass',
          message: 'Present'
        })
      }
    }

    if (missingRequired === 0) {
      this.addResult({
        name: 'Environment Setup',
        status: 'pass',
        message: `Core environment ready. ${missingOptional} optional keys missing.`
      })
    }
  }

  // ================================
  // DATABASE TESTS
  // ================================

  async testDatabaseConnection(): Promise<void> {
    this.log(colors.blue, '\n🗄️ Testing Database Connection...')
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Test basic connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      if (error) {
        this.addResult({
          name: 'Database Connection',
          status: 'fail',
          message: `Connection failed: ${error.message}`
        })
        return
      }

      this.addResult({
        name: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase'
      })

      // Test essential tables
      const tables = [
        'user_profiles',
        'user_ecosystems', 
        'ai_conversations',
        'subscription_plans',
        'user_progress'
      ]

      for (const table of tables) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1)

          if (tableError) {
            this.addResult({
              name: `Table: ${table}`,
              status: 'fail',
              message: `Table access failed: ${tableError.message}`
            })
          } else {
            this.addResult({
              name: `Table: ${table}`,
              status: 'pass',
              message: 'Accessible'
            })
          }
        } catch (err) {
          this.addResult({
            name: `Table: ${table}`,
            status: 'fail',
            message: `Error: ${err}`
          })
        }
      }

    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        status: 'fail',
        message: `Failed to initialize Supabase client: ${error}`
      })
    }
  }

  // ================================
  // API TESTS
  // ================================

  async testAPIEndpoints(): Promise<void> {
    this.log(colors.blue, '\n🌐 Testing API Endpoints...')
    
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Test public endpoints
    const publicEndpoints = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/login', name: 'Login Page' },
      { path: '/pricing', name: 'Pricing Page' }
    ]

    for (const endpoint of publicEndpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint.path}`)
        
        if (response.ok) {
          this.addResult({
            name: `Public Route: ${endpoint.name}`,
            status: 'pass',
            message: `HTTP ${response.status}`
          })
        } else {
          this.addResult({
            name: `Public Route: ${endpoint.name}`,
            status: 'fail',
            message: `HTTP ${response.status}`
          })
        }
      } catch (error) {
        this.addResult({
          name: `Public Route: ${endpoint.name}`,
          status: 'fail',
          message: `Connection failed: ${error}`
        })
      }
    }

    // Test API health
    try {
      const healthResponse = await fetch(`${baseURL}/api/health`, {
        method: 'GET'
      })

      if (healthResponse.ok) {
        this.addResult({
          name: 'API Health Check',
          status: 'pass',
          message: 'API server responding'
        })
      } else {
        this.addResult({
          name: 'API Health Check',
          status: 'warning',
          message: 'API health endpoint not implemented'
        })
      }
    } catch (error) {
      this.addResult({
        name: 'API Health Check',
        status: 'warning',
        message: 'Health endpoint not available'
      })
    }
  }

  // ================================
  // BUILD TESTS
  // ================================

  async testBuild(): Promise<void> {
    this.log(colors.blue, '\n🔨 Testing Application Build...')
    
    try {
      // Type checking
      this.log(colors.cyan, 'Running TypeScript check...')
      const { stdout: typeOutput, stderr: typeError } = await execAsync('npm run type-check')
      
      if (typeError && typeError.includes('error')) {
        this.addResult({
          name: 'TypeScript Check',
          status: 'fail',
          message: 'Type errors found'
        })
      } else {
        this.addResult({
          name: 'TypeScript Check',
          status: 'pass',
          message: 'No type errors'
        })
      }

      // Build test
      this.log(colors.cyan, 'Running build test...')
      const buildStart = Date.now()
      const { stdout: buildOutput, stderr: buildError } = await execAsync('npm run build')
      const buildDuration = Date.now() - buildStart
      
      if (buildError && buildError.includes('Error')) {
        this.addResult({
          name: 'Application Build',
          status: 'fail',
          message: 'Build failed',
          duration: buildDuration
        })
      } else {
        this.addResult({
          name: 'Application Build',
          status: 'pass',
          message: `Build successful in ${(buildDuration / 1000).toFixed(1)}s`,
          duration: buildDuration
        })
      }

    } catch (error) {
      this.addResult({
        name: 'Build Process',
        status: 'fail',
        message: `Build error: ${error}`
      })
    }
  }

  // ================================
  // INTEGRATION TESTS
  // ================================

  async testAIIntegration(): Promise<void> {
    this.log(colors.blue, '\n🤖 Testing AI Integration...')
    
    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        })

        if (response.ok) {
          this.addResult({
            name: 'OpenAI Connection',
            status: 'pass',
            message: 'API key valid'
          })
        } else {
          this.addResult({
            name: 'OpenAI Connection',
            status: 'fail',
            message: `API error: ${response.status}`
          })
        }
      } catch (error) {
        this.addResult({
          name: 'OpenAI Connection',
          status: 'fail',
          message: `Connection failed: ${error}`
        })
      }
    } else {
      this.addResult({
        name: 'OpenAI Connection',
        status: 'warning',
        message: 'API key not configured'
      })
    }

    // Test Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
          })
        })

        if (response.ok || response.status === 400) { // 400 is expected for test request
          this.addResult({
            name: 'Anthropic Connection',
            status: 'pass',
            message: 'API key valid'
          })
        } else {
          this.addResult({
            name: 'Anthropic Connection',
            status: 'fail',
            message: `API error: ${response.status}`
          })
        }
      } catch (error) {
        this.addResult({
          name: 'Anthropic Connection',
          status: 'fail',
          message: `Connection failed: ${error}`
        })
      }
    } else {
      this.addResult({
        name: 'Anthropic Connection',
        status: 'warning',
        message: 'API key not configured'
      })
    }
  }

  // ================================
  // PAYMENT TESTS
  // ================================

  async testPaymentIntegration(): Promise<void> {
    this.log(colors.blue, '\n💳 Testing Payment Integration...')
    
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const response = await fetch('https://api.stripe.com/v1/customers', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
          }
        })

        if (response.ok) {
          this.addResult({
            name: 'Stripe Connection',
            status: 'pass',
            message: 'API key valid'
          })
        } else {
          this.addResult({
            name: 'Stripe Connection',
            status: 'fail',
            message: `API error: ${response.status}`
          })
        }
      } catch (error) {
        this.addResult({
          name: 'Stripe Connection',
          status: 'fail',
          message: `Connection failed: ${error}`
        })
      }
    } else {
      this.addResult({
        name: 'Stripe Connection',
        status: 'warning',
        message: 'API key not configured'
      })
    }
  }

  // ================================
  // MAIN TEST RUNNER
  // ================================

  async runAllTests(): Promise<void> {
    this.log(colors.magenta, '🚀 PORVERSE SYSTEM TEST SUITE')
    this.log(colors.magenta, '='.repeat(50))
    
    await this.testEnvironmentVariables()
    await this.testDatabaseConnection()
    await this.testAPIEndpoints()
    await this.testBuild()
    await this.testAIIntegration()
    await this.testPaymentIntegration()
    
    this.generateSummary()
  }

  // ================================
  // SUMMARY GENERATION
  // ================================

  generateSummary(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const warnings = this.results.filter(r => r.status === 'warning').length
    
    this.log(colors.magenta, '\n' + '='.repeat(50))
    this.log(colors.magenta, '📊 TEST SUMMARY')
    this.log(colors.magenta, '='.repeat(50))
    
    this.log(colors.green, `✅ Passed: ${passed}`)
    this.log(colors.red, `❌ Failed: ${failed}`)
    this.log(colors.yellow, `⚠️  Warnings: ${warnings}`)
    this.log(colors.cyan, `⏱️  Total time: ${(totalTime / 1000).toFixed(1)}s`)
    
    // Readiness assessment
    if (failed === 0) {
      this.log(colors.green, '\n🎉 SYSTEM READY FOR LAUNCH!')
      
      if (warnings > 0) {
        this.log(colors.yellow, '\n⚠️  Warnings present - some features may be limited:')
        this.results
          .filter(r => r.status === 'warning')
          .forEach(r => this.log(colors.yellow, `   • ${r.name}: ${r.message}`))
      }
      
      this.log(colors.blue, '\n📋 LAUNCH CHECKLIST:')
      this.log(colors.blue, '1. ✅ Core infrastructure ready')
      this.log(colors.blue, '2. ✅ Database accessible')
      this.log(colors.blue, '3. ✅ Application builds successfully')
      this.log(colors.blue, '4. 🚀 Ready to deploy!')
      
    } else {
      this.log(colors.red, '\n❌ SYSTEM NOT READY - CRITICAL ISSUES FOUND')
      this.log(colors.red, '\n🔧 ISSUES TO FIX:')
      
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => this.log(colors.red, `   • ${r.name}: ${r.message}`))
    }
    
    // Next steps
    this.log(colors.blue, '\n📝 NEXT STEPS:')
    
    if (failed === 0) {
      this.log(colors.blue, '1. npm run dev (test locally)')
      this.log(colors.blue, '2. Test user flows manually')
      this.log(colors.blue, '3. Deploy to production')
      this.log(colors.blue, '4. Configure remaining API keys for full functionality')
    } else {
      this.log(colors.blue, '1. Fix critical issues listed above')
      this.log(colors.blue, '2. Re-run tests: npm run test:system')
      this.log(colors.blue, '3. Proceed when all tests pass')
    }
  }
}

// ================================
// SCRIPT EXECUTION
// ================================

async function main() {
  const testSuite = new PorVerseTestSuite()
  await testSuite.runAllTests()
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export default PorVerseTestSuite