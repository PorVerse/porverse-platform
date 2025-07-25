// components/payments/PayPalCheckout.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Shield, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PayPalCheckoutProps {
  planId: string
  planName: string
  price: number
  currency: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function PayPalCheckout({
  planId,
  planName,
  price,
  currency,
  onSuccess,
  onError
}: PayPalCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayPalCheckout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approvalUrl
      } else {
        throw new Error('No approval URL received')
      }

    } catch (error: any) {
      console.error('PayPal checkout error:', error)
      toast.error(error.message || 'Eroare la inițializarea plății PayPal')
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayPalCheckout}
      disabled={loading}
      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Se inițializează PayPal...</span>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.374 9.374 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.4 2.534a.380.380 0 0 0 .374.436h3.298c.457 0 .845-.334.92-.788l.038-.195.731-4.63.047-.248c.075-.454.462-.788.92-.788h.579c3.76 0 6.705-1.528 7.56-5.95.356-1.85.173-3.403-.756-4.593-.929-1.19-2.602-1.806-4.847-1.806z"/>
            </svg>
            <span>PayPal</span>
          </div>
          <span className="text-sm opacity-90">{price} {currency}</span>
        </>
      )}
    </button>
  )
}

// components/payments/StripeCheckout.tsx
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface StripeCheckoutProps {
  planId: string
  planName: string
  price: number
  currency: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function StripeCheckout({
  planId,
  planName,
  price,
  currency,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleStripeCheckout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error: any) {
      console.error('Stripe checkout error:', error)
      toast.error(error.message || 'Eroare la inițializarea plății Stripe')
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStripeCheckout}
      disabled={loading}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Se inițializează Stripe...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Card / Google Pay / Apple Pay</span>
          <span className="text-sm opacity-90">{price} {currency}</span>
        </>
      )}
    </button>
  )
}

// app/pricing/page.tsx - Updated with PayPal integration
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Shield, Sparkles, Crown } from 'lucide-react'
import PayPalCheckout from '@/components/payments/PayPalCheckout'
import StripeCheckout from '@/components/payments/StripeCheckout'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  currency: string
  ecosystems: string[]
  features: string[]
  popular?: boolean
  premium?: boolean
  savings?: string
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans')
      const data = await response.json()
      
      if (response.ok) {
        setPlans(data.plans)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error fetching plans:', error)
      toast.error('Eroare la încărcarea planurilor')
    } finally {
      setLoading(false)
    }
  }

  const getPrice = (plan: Plan) => {
    return billing === 'yearly' ? plan.price.yearly : plan.price.monthly
  }

  const getSavings = (plan: Plan) => {
    if (billing === 'yearly') {
      const yearlyPrice = plan.price.yearly
      const monthlyEquivalent = plan.price.monthly * 12
      const savings = monthlyEquivalent - yearlyPrice
      return Math.round(savings)
    }
    return 0
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Star className="w-6 h-6 text-yellow-400" />
      case 'pro':
        return <Zap className="w-6 h-6 text-indigo-400" />
      case 'complete':
        return <Crown className="w-6 h-6 text-purple-400" />
      default:
        return <Star className="w-6 h-6 text-gray-400" />
    }
  }

  const getEcosystemName = (ecosystem: string) => {
    const names: Record<string, string> = {
      'por-health': 'PorHealth',
      'por-kids': 'PorKids',
      'por-mind': 'PorMind',
      'por-well': 'PorWell',
      'por-flow': 'PorFlow',
      'por-blu': 'PorBlu'
    }
    return names[ecosystem] || ecosystem
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Se încarcă planurile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-white mb-6"
          >
            Alege-ți <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Transformarea</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Fiecare plan vine cu AI avansat, support 24/7 și garanție de satisfacție 30 de zile
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 mb-12"
          >
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Lunar
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all relative ${
                billing === 'yearly'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                2 luni GRATIS
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl ${
                plan.popular
                  ? 'border-indigo-500/50 ring-2 ring-indigo-500/20'
                  : plan.premium
                  ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                  : 'border-white/10'
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-yellow-500/50' : ''
              } transition-all duration-300 hover:scale-105`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>CEL MAI POPULAR</span>
                  </div>
                </div>
              )}

              {/* Premium Badge */}
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Crown className="w-4 h-4" />
                    <span>PREMIUM</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 mb-6">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-black text-white">
                    {getPrice(plan)}
                  </span>
                  <span className="text-white/60 ml-2">
                    {plan.currency}/{billing === 'yearly' ? 'an' : 'lună'}
                  </span>
                </div>

                {billing === 'yearly' && getSavings(plan) > 0 && (
                  <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                    Economisești {getSavings(plan)} {plan.currency}/an
                  </div>
                )}
              </div>

              {/* Ecosystems */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Ecosisteme incluse:</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.ecosystems.map((ecosystem) => (
                    <span
                      key={ecosystem}
                      className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {getEcosystemName(ecosystem)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-white font-semibold mb-4">Features:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      {feature.includes('QUANTUM') ? (
                        <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.includes('QUANTUM') ? 'text-purple-300 font-semibold' : 'text-white/80'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <StripeCheckout
                  planId={plan.id}
                  planName={plan.name}
                  price={getPrice(plan)}
                  currency={plan.currency}
                  onSuccess={() => {
                    toast.success('Plata procesată cu succes!')
                  }}
                  onError={(error) => {
                    toast.error(error)
                  }}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-white/60">sau</span>
                  </div>
                </div>

                <PayPalCheckout
                  planId={plan.id}
                  planName={plan.name}
                  price={getPrice(plan)}
                  currency={plan.currency}
                  onSuccess={() => {
                    toast.success('Plata PayPal procesată cu succes!')
                  }}
                  onError={(error) => {
                    toast.error(error)
                  }}
                />
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-6 text-xs text-white/60">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>14 zile trial</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Anulare oricând</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Întrebări Frecvente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Ce înseamnă perioada de probă de 14 zile?
              </h3>
              <p className="text-white/70">
                Poți testa complet toate funcționalitățile planului ales timp de 14 zile, fără să fi taxat. 
                Dacă nu ești mulțumit, anulezi fără niciun cost.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Pot schimba planul oricând?
              </h3>
              <p className="text-white/70">
                Da! Poți face upgrade sau downgrade oricând. Diferența de preț se calculează proporțional 
                pentru perioada rămasă.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Ce este Quantum Vault?
              </h3>
              <p className="text-white/70">
                Un ecosistem avansat de AI care îți simulează viitorul, detectează pattern-uri inconștiente 
                și îți oferă insights strategice pentru transformare accelerată.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Sunt datele mele în siguranță?
              </h3>
              <p className="text-white/70">
                Absolut. Folosim encryptare de nivel militar, respectăm GDPR și nu vindem niciodată 
                datele personale. Privacy-ul tău este prioritatea noastră #1.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>SSL Securizat</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>12,000+ Utilizatori</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}