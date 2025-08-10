// hooks/usePayments.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export interface PricingTier {
  tier: number
  name: string
  symbol: string
  individual: Record<string, number>
  bundles: {
    dual: number
    trinity: number
    complete: number
  }
}

export interface CheckoutData {
  planType: 'individual' | 'dual' | 'trinity' | 'complete'
  ecosystems: string[]
  tier: number
  billingCycle: 'monthly' | 'annual'
  price: number
  currency: string
  country: string
}

export interface SubscriptionStatus {
  subscription: any
  ecosystems: any[]
  quantumVault: any
  hasActiveSubscription: boolean
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const router = useRouter()

  // Create checkout session and redirect to Stripe
  const createCheckoutSession = async (checkoutData: CheckoutData) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  // Get subscription status
  const getSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/payments/status')
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      const data = await response.json()
      setSubscriptionStatus(data)
      return data

    } catch (error) {
      console.error('Error getting subscription status:', error)
      return null
    }
  }

  // Cancel subscription
  const cancelSubscription = async (immediately: boolean = false) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ immediately })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast.success(data.message)
      
      // Refresh subscription status
      await getSubscriptionStatus()
      
      return true

    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Open Stripe Customer Portal
  const openCustomerPortal = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open customer portal')
      }

      if (data.url) {
        window.location.href = data.url
      }

    } catch (error) {
      console.error('Portal error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to open portal')
    } finally {
      setLoading(false)
    }
  }

  // Load subscription status on mount
  useEffect(() => {
    getSubscriptionStatus()
  }, [])

  return {
    loading,
    subscriptionStatus,
    createCheckoutSession,
    getSubscriptionStatus,
    cancelSubscription,
    openCustomerPortal
  }
}

// hooks/usePricing.ts

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 1,
    name: 'România',
    symbol: '',
    individual: {
      'por-health': 29.99,
      'por-kids': 29.99,
      'por-mind': 29.99,
      'por-well': 29.99,
      'por-flow': 29.99,
      'por-blu': 29.99
    },
    bundles: {
      dual: 54.99,
      trinity: 79.99,
      complete: 149.99
    }
  },
  {
    tier: 2,
    name: 'US & EU',
    symbol: '$',
    individual: {
      'por-health': 9.99,
      'por-kids': 9.99,
      'por-mind': 9.99,
      'por-well': 9.99,
      'por-flow': 9.99,
      'por-blu': 9.99
    },
    bundles: {
      dual: 17.99,
      trinity: 24.99,
      complete: 49.99
    }
  },
  {
    tier: 3,
    name: 'Rest of World',
    symbol: '$',
    individual: {
      'por-health': 4.99,
      'por-kids': 4.99,
      'por-mind': 4.99,
      'por-well': 4.99,
      'por-flow': 4.99,
      'por-blu': 4.99
    },
    bundles: {
      dual: 8.99,
      trinity: 12.99,
      complete: 24.99
    }
  }
]

export interface GeolocationData {
  country: string
  countryCode: string
  region: string
  currency: string
  tier: number
}

export const usePricing = () => {
  const [geolocation, setGeolocation] = useState<GeolocationData>({
    country: 'România',
    countryCode: 'RO',
    region: 'EU',
    currency: 'RON',
    tier: 1
  })
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<PricingTier>(PRICING_TIERS[0])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  // Detect user location for pricing
  const detectGeolocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      let tier = 3 // Default to tier 3
      let currency = 'USD'
      
      // Determine pricing tier based on country
      if (data.country_code === 'RO') {
        tier = 1
        currency = 'RON'
      } else if (['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'BE', 'LU', 'IE', 'PT', 'AU', 'NZ', 'JP', 'SG', 'HK'].includes(data.country_code)) {
        tier = 2
        currency = 'USD'
      }
      
      const geoData: GeolocationData = {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || 'Unknown',
        currency,
        tier
      }
      
      setGeolocation(geoData)
      setSelectedTier(PRICING_TIERS[tier - 1])
      
    } catch (error) {
      console.error('Error detecting geolocation:', error)
      // Fallback to default
    } finally {
      setLoading(false)
    }
  }

  // Calculate price with annual discount
  const calculatePrice = (basePrice: number, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    if (billingCycle === 'annual') {
      return Math.round(basePrice * 0.6) // 40% discount for annual
    }
    return basePrice
  }

  // Format price with currency
  const formatPrice = (price: number, tier: PricingTier = selectedTier) => {
    const finalPrice = calculatePrice(price, billingCycle)
    return `${tier.symbol}${finalPrice}`
  }

  // Calculate savings for annual billing
  const calculateAnnualSavings = (monthlyPrice: number) => {
    const annualPrice = calculatePrice(monthlyPrice, 'annual')
    const totalMonthlyPrice = monthlyPrice * 12
    const totalAnnualPrice = annualPrice * 12
    return totalMonthlyPrice - totalAnnualPrice
  }

  // Get ecosystem bundles
  const getEcosystemBundles = () => {
    return [
      {
        id: 'dual',
        name: 'Dual Pack',
        ecosystems: ['por-health', 'por-kids'],
        price: selectedTier.bundles.dual,
        description: 'Perfect for busy parents',
        savings: calculateAnnualSavings(selectedTier.bundles.dual)
      },
      {
        id: 'trinity',
        name: 'Trinity Pack',
        ecosystems: ['por-mind', 'por-flow', 'por-blu'],
        price: selectedTier.bundles.trinity,
        description: 'Unlock Quantum Vault + Business optimization',
        savings: calculateAnnualSavings(selectedTier.bundles.trinity),
        special: true,
        unlocks: 'Quantum Vault'
      },
      {
        id: 'complete',
        name: 'Complete Pack',
        ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        price: selectedTier.bundles.complete,
        description: 'Full transformation + Premium support',
        savings: calculateAnnualSavings(selectedTier.bundles.complete),
        special: true,
        unlocks: 'Everything + Priority Support'
      }
    ]
  }

  // Check if user has access to ecosystem
  const hasEcosystemAccess = (ecosystem: string, userEcosystems: any[] = []) => {
    const access = userEcosystems.find(e => e.ecosystem === ecosystem)
    return access && access.access_level === 'premium' && 
           (!access.expires_at || new Date(access.expires_at) > new Date())
  }

  // Check if user has Quantum Vault access
  const hasQuantumVaultAccess = (quantumVault: any) => {
    return quantumVault && quantumVault.access_level === 'full'
  }

  useEffect(() => {
    detectGeolocation()
  }, [])

  return {
    geolocation,
    loading,
    selectedTier,
    billingCycle,
    setBillingCycle,
    setSelectedTier,
    calculatePrice,
    formatPrice,
    calculateAnnualSavings,
    getEcosystemBundles,
    hasEcosystemAccess,
    hasQuantumVaultAccess,
    PRICING_TIERS
  }
}

// hooks/useSubscription.ts
import { usePayments } from './usePayments'

export const useSubscription = () => {
  const { subscriptionStatus, getSubscriptionStatus } = usePayments()
  const [loading, setLoading] = useState(true)

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    return subscriptionStatus?.hasActiveSubscription || false
  }

  // Check if user has access to specific ecosystem
  const hasEcosystemAccess = (ecosystem: string) => {
    if (!subscriptionStatus?.ecosystems) return false
    
    const access = subscriptionStatus.ecosystems.find(e => e.ecosystem === ecosystem)
    return access && access.access_level === 'premium' && 
           (!access.expires_at || new Date(access.expires_at) > new Date())
  }

  // Check if user has Quantum Vault access
  const hasQuantumVault = () => {
    return subscriptionStatus?.quantumVault && 
           subscriptionStatus.quantumVault.access_level === 'full'
  }

  // Get user's current plan
  const getCurrentPlan = () => {
    return subscriptionStatus?.subscription?.plan_type || 'free'
  }

  // Get accessible ecosystems
  const getAccessibleEcosystems = () => {
    if (!subscriptionStatus?.ecosystems) return []
    
    return subscriptionStatus.ecosystems
      .filter(e => e.access_level === 'premium' && 
                   (!e.expires_at || new Date(e.expires_at) > new Date()))
      .map(e => e.ecosystem)
  }

  // Get subscription expiry date
  const getExpiryDate = () => {
    return subscriptionStatus?.subscription?.current_period_end
  }

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = () => {
    const expiryDate = getExpiryDate()
    if (!expiryDate) return false
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 7 && diffDays > 0
  }

  // Check if subscription is in trial
  const isInTrial = () => {
    return subscriptionStatus?.subscription?.status === 'trialing'
  }

  // Get trial end date
  const getTrialEndDate = () => {
    return subscriptionStatus?.subscription?.trial_end
  }

  // Refresh subscription data
  const refreshSubscription = async () => {
    setLoading(true)
    await getSubscriptionStatus()
    setLoading(false)
  }

  useEffect(() => {
    if (subscriptionStatus) {
      setLoading(false)
    }
  }, [subscriptionStatus])

  return {
    loading,
    subscriptionStatus,
    hasActiveSubscription,
    hasEcosystemAccess,
    hasQuantumVault,
    getCurrentPlan,
    getAccessibleEcosystems,
    getExpiryDate,
    isExpiringSoon,
    isInTrial,
    getTrialEndDate,
    refreshSubscription
  }
}