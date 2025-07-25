// app/pricing/page.tsx - CORRECT FREEMIUM MODEL
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Shield, Sparkles, Crown, Heart, GraduationCap } from 'lucide-react'
import CheckoutButton from '@/components/payments/CheckoutButton'
import { toast } from 'react-hot-toast'

// CORRECT PRICING STRUCTURE
const PRICING_TIERS = [
  {
    tier: 1,
    name: 'România',
    symbol: '',
    currency: 'RON',
    // INDIVIDUAL PREMIUM ECOSYSTEMS
    premium: {
      'por-mind': 29.99,
      'por-well': 29.99, 
      'por-flow': 29.99,
      'por-blu': 29.99
    },
    // PREMIUM UPGRADES for FREE ecosystems
    upgrades: {
      'por-health-premium': 19.99,
      'por-kids-premium': 19.99
    },
    // BUNDLES
    bundles: {
      trinity: 79.99,        // PorMind + PorFlow + PorBlu (unlocks Quantum Vault)
      wellness: 54.99,       // PorMind + PorWell
      productivity: 54.99,   // PorFlow + PorBlu  
      quantum_direct: 99.99, // Direct Quantum Vault access
      complete: 149.99       // All 6 ecosystems + everything
    }
  },
  {
    tier: 2, // US & EU
    name: 'US & EU',
    symbol: '$',
    currency: 'USD',
    premium: {
      'por-mind': 9.99,
      'por-well': 9.99,
      'por-flow': 9.99, 
      'por-blu': 9.99
    },
    upgrades: {
      'por-health-premium': 6.99,
      'por-kids-premium': 6.99
    },
    bundles: {
      trinity: 24.99,
      wellness: 17.99,
      productivity: 17.99,
      quantum_direct: 29.99,
      complete: 49.99
    }
  },
  {
    tier: 3, // Rest of World
    name: 'Rest of World',
    symbol: '$',
    currency: 'USD',
    premium: {
      'por-mind': 4.99,
      'por-well': 4.99,
      'por-flow': 4.99,
      'por-blu': 4.99
    },
    upgrades: {
      'por-health-premium': 2.99,
      'por-kids-premium': 2.99
    },
    bundles: {
      trinity: 12.99,
      wellness: 8.99,
      productivity: 8.99,
      quantum_direct: 19.99,
      complete: 24.99
    }
  }
]

interface PricingOption {
  id: string
  name: string
  description: string
  ecosystems: string[]
  features: string[]
  type: 'free' | 'upgrade' | 'premium' | 'bundle'
  popular?: boolean
  unlocks?: string
  badge?: string
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(PRICING_TIERS[0])
  const [activeTab, setActiveTab] = useState<'free' | 'premium' | 'bundles'>('free')

  useEffect(() => {
    detectUserLocation()
  }, [])

  const detectUserLocation = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Default România pentru demo
      setSelectedTier(PRICING_TIERS[0])
    } catch (error) {
      console.error('Geo-detection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // PRICING OPTIONS - CORRECTLY STRUCTURED
  const freePlans: PricingOption[] = [
    {
      id: 'por-health-free',
      name: 'PorHealth FREE',
      description: 'Optimizarea sănătății cu AI basic',
      ecosystems: ['por-health'],
      type: 'free',
      features: [
        'Basic Nutrition Tracking',
        'Simple Workout Plans',
        'Health Tips AI',
        'Community Access',
        'Mobile App',
        '⚡ Ads supported'
      ]
    },
    {
      id: 'por-kids-free', 
      name: 'PorKids FREE',
      description: 'Educație smart pentru copii',
      ecosystems: ['por-kids'],
      type: 'free',
      features: [
        'Basic Homework Help',
        'Simple Educational Games',
        'Progress Tracking',
        'Parent Notifications',
        'Study Reminders',
        '⚡ Limited AI interactions'
      ]
    }
  ]

  const premiumUpgrades: PricingOption[] = [
    {
      id: 'por-health-premium',
      name: 'PorHealth PREMIUM',
      description: 'Nutrition & fitness AI superpowered',
      ecosystems: ['por-health'],
      type: 'upgrade',
      popular: true,
      features: [
        '🚀 Advanced AI Nutrition Planner',
        '🎯 Personalized Workout Optimizer',
        '📊 Complete Biometric Analysis',
        '🍽️ Smart Meal Planning & Shopping',
        '💪 Real-time Form Correction',
        '🏆 Achievement System',
        '❌ No ads, unlimited AI'
      ]
    },
    {
      id: 'por-kids-premium',
      name: 'PorKids PREMIUM', 
      description: 'Educational powerhouse pentru copii',
      ecosystems: ['por-kids'],
      type: 'upgrade',
      features: [
        '📸 AI Homework Scanner & Solver',
        '🎮 Advanced Educational Games',
        '🧠 Adaptive Learning System',
        '👨‍👩‍👧 Family Dashboard',
        '📈 Detailed Progress Analytics',
        '🏅 Gamified Learning Rewards',
        '❌ No ads, unlimited scans'
      ]
    }
  ]

  const premiumEcosystems: PricingOption[] = [
    {
      id: 'por-mind',
      name: 'PorMind',
      description: 'Financial education & wealth building AI',
      ecosystems: ['por-mind'],
      type: 'premium',
      features: [
        '💰 AI Financial Coach',
        '📊 Smart Investment Advisor',
        '🎯 Personalized Budgeting',
        '💎 Wealth Building Strategies',
        '📈 Market Analysis AI',
        '🏦 Bank Account Integration'
      ]
    },
    {
      id: 'por-well',
      name: 'PorWell',
      description: 'Mental wellness & AI therapy',
      ecosystems: ['por-well'],
      type: 'premium',
      features: [
        '🧠 AI Therapist 24/7',
        '😌 Advanced Mood Tracking',
        '🧘 Personalized Meditation',
        '💙 Anxiety & Stress Management',
        '📓 Smart Emotional Journal',
        '🚨 Crisis Detection & Support'
      ]
    },
    {
      id: 'por-flow',
      name: 'PorFlow',
      description: 'Productivity & time optimization AI',
      ecosystems: ['por-flow'],
      type: 'premium',
      features: [
        '⚡ AI Productivity Optimizer',
        '⏰ Smart Time Blocking',
        '🎯 Intelligent Task Prioritization',
        '🔥 Focus Session Tracker',
        '🤖 Workflow Automation',
        '📊 Performance Analytics'
      ]
    },
    {
      id: 'por-blu',
      name: 'PorBlu',
      description: 'Strategic planning & executive coaching',
      ecosystems: ['por-blu'],
      type: 'premium',
      features: [
        '🎯 Strategic Life Planning',
        '👔 AI Executive Coach',
        '🔮 Vision Board Creator',
        '📋 Decision Framework Tools',
        '🏆 Leadership Development',
        '💼 Legacy Planning'
      ]
    }
  ]

  const bundles: PricingOption[] = [
    {
      id: 'trinity',
      name: 'Trinity Pack',
      description: 'Business optimization combo',
      ecosystems: ['por-mind', 'por-flow', 'por-blu'],
      type: 'bundle',
      popular: true,
      unlocks: '🔮 QUANTUM VAULT ACCESS',
      badge: 'Most Popular',
      features: [
        '🔥 All PorMind, PorFlow & PorBlu features',
        '🔮 QUANTUM VAULT UNLOCK',
        '🚀 Future Self Simulator',
        '🎭 Identity Simulator',
        '🔄 Reverse Roadmap Planner',
        '🪞 Mirror Conversations',
        '📊 Pattern Detection AI'
      ]
    },
    {
      id: 'quantum_direct',
      name: 'Quantum Vault Direct',
      description: 'Direct access la Quantum Vault',
      ecosystems: ['quantum-vault'],
      type: 'bundle',
      unlocks: '🔮 QUANTUM VAULT ONLY',
      badge: 'Premium',
      features: [
        '🔮 Full Quantum Vault Access',
        '🚀 Future Self Generator',
        '🎭 Identity Simulation',
        '🔄 Reverse Life Planning',
        '🪞 AI Mirror Conversations',
        '📊 Deep Pattern Analysis',
        '🎯 Quantum Guidance System'
      ]
    },
    {
      id: 'complete',
      name: 'Complete Ecosystem',
      description: 'Everything + Premium support',
      ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
      type: 'bundle',
      unlocks: '👑 EVERYTHING + VIP',
      badge: 'Ultimate',
      features: [
        '🌟 ALL ecosystems (including premium upgrades)',
        '🔮 Full Quantum Vault Access',
        '👑 VIP Support 24/7',
        '🚀 Priority AI Processing',
        '📞 Monthly Coaching Calls',
        '🎯 Custom AI Training',
        '🏆 Lifetime Updates'
      ]
    }
  ]

  // Calculate price with discount
  const getPrice = (planId: string, type: 'upgrade' | 'premium' | 'bundle') => {
    let basePrice: number
    
    switch (type) {
      case 'upgrade':
        basePrice = selectedTier.upgrades[planId as keyof typeof selectedTier.upgrades] || 0
        break
      case 'premium':
        basePrice = selectedTier.premium[planId as keyof typeof selectedTier.premium] || 0
        break
      case 'bundle':
        basePrice = selectedTier.bundles[planId as keyof typeof selectedTier.bundles] || 0
        break
      default:
        basePrice = 0
    }

    if (billing === 'yearly') {
      return Math.round(basePrice * 0.6) // 40% discount
    }
    return basePrice
  }

  const formatPrice = (planId: string, type: 'upgrade' | 'premium' | 'bundle') => {
    const price = getPrice(planId, type)
    return `${selectedTier.symbol}${price}`
  }

  // Handle real checkout
  const handleCheckout = async (plan: PricingOption) => {
    if (plan.type === 'free') {
      // Redirect to signup for free plans
      window.location.href = '/auth/signup?plan=' + plan.id
      return
    }

    try {
      const checkoutData = {
        planType: plan.type,
        planId: plan.id,
        ecosystems: plan.ecosystems,
        tier: selectedTier.tier,
        billingCycle: billing,
        price: getPrice(plan.id, plan.type as any),
        currency: selectedTier.currency,
        country: selectedTier.name
      }

      // Create checkout session
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Checkout failed')
      }

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Eroare la checkout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Se încarcă planurile...</h2>
          <p className="text-white/70">Personalizăm prețurile pentru {selectedTier.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
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
            Începe GRATUIT cu PorHealth & PorKids, apoi upgrade când ești gata pentru mai mult
          </motion.p>

          {/* Location & Billing */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3">
              <span className="text-white/70">Prețuri pentru: </span>
              <span className="font-bold text-white">{selectedTier.name}</span>
            </div>

            <div className="inline-flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
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
                  40% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex">
              {[
                { id: 'free', label: '🆓 FREE Start', icon: Heart },
                { id: 'premium', label: '⭐ Premium', icon: Star },
                { id: 'bundles', label: '🔮 Bundles', icon: Crown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* FREE PLANS */}
        {activeTab === 'free' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {freePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-bold">
                    GRATUIT
                  </div>
                  <div className="text-3xl">
                    {plan.id.includes('health') ? '🌿' : '👶'}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <div className="text-4xl font-black text-emerald-400 mb-2">
                    GRATUIT
                  </div>
                  <div className="text-white/60">Pentru totdeauna</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  plan={{
                    id: plan.id,
                    name: plan.name,
                    type: plan.type,
                    price: 0,
                    currency: 'RON'
                  }}
                  billingCycle={billing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  🚀 Începe GRATUIT
                </CheckoutButton>
              </motion.div>
            ))}
          </div>
        )}

        {/* PREMIUM ECOSYSTEMS */}
        {activeTab === 'premium' && (
          <div>
            {/* Premium Upgrades */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-2">Upgrade la Premium</h2>
              <p className="text-white/70 text-center mb-8">Superpowers pentru ecosistemele gratuite</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                {premiumUpgrades.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl ${
                      plan.popular 
                        ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' 
                        : 'border-white/10'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                          RECOMANDAT
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-bold">
                        UPGRADE
                      </div>
                      <div className="text-3xl">
                        {plan.id.includes('health') ? '🌿' : '👶'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/70 mb-6">{plan.description}</p>

                    <div className="mb-8">
                      <div className="text-4xl font-black text-indigo-400 mb-2">
                        {formatPrice(plan.id, 'upgrade')}
                      </div>
                      <div className="text-white/60">/{billing === 'yearly' ? 'an' : 'lună'}</div>
                      {billing === 'yearly' && (
                        <div className="text-emerald-400 text-sm font-medium">
                          Economisești 40%
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <CheckoutButton
                      plan={{
                        id: plan.id,
                        name: plan.name,
                        type: plan.type,
                        price: getPrice(plan.id, 'upgrade'),
                        currency: selectedTier.currency
                      }}
                      billingCycle={billing}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      ⚡ Upgrade Premium
                    </CheckoutButton>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Individual Premium Ecosystems */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-2">Ecosisteme Premium</h2>
              <p className="text-white/70 text-center mb-8">Funcționalități avansate pentru fiecare domeniu</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {premiumEcosystems.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative bg-white/5 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl"
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {plan.id === 'por-mind' && '🧠'}
                        {plan.id === 'por-well' && '🌻'}
                        {plan.id === 'por-flow' && '🌊'}
                        {plan.id === 'por-blu' && '💧'}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-white/60 text-sm">{plan.description}</p>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-2xl font-black text-amber-400">
                        {formatPrice(plan.id, 'premium')}
                      </div>
                      <div className="text-white/60 text-sm">/{billing === 'yearly' ? 'an' : 'lună'}</div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/70 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <CheckoutButton
                      plan={{
                        id: plan.id,
                        name: plan.name,
                        type: plan.type,
                        price: getPrice(plan.id, 'premium'),
                        currency: selectedTier.currency
                      }}
                      billingCycle={billing}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-105 text-sm"
                    >
                      🚀 Începe Transformarea
                    </CheckoutButton>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUNDLES */}
        {activeTab === 'bundles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl ${
                  bundle.popular 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20 scale-105' 
                    : bundle.id === 'complete'
                    ? 'border-yellow-500/50 ring-2 ring-yellow-500/20'
                    : 'border-white/10'
                }`}
              >
                {bundle.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-6 py-2 rounded-full text-sm font-bold text-white ${
                      bundle.badge === 'Most Popular' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : bundle.badge === 'Ultimate'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      {bundle.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">
                    {bundle.id === 'trinity' && '🔮'}
                    {bundle.id === 'quantum_direct' && '⚡'}
                    {bundle.id === 'complete' && '👑'}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                  <p className="text-white/70">{bundle.description}</p>
                </div>

                {bundle.unlocks && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-6 text-center">
                    <div className="font-bold text-white mb-1">🎁 SPECIAL UNLOCK</div>
                    <div className="text-purple-300 font-semibold">{bundle.unlocks}</div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="text-4xl font-black text-white mb-2">
                    {formatPrice(bundle.id, 'bundle')}
                  </div>
                  <div className="text-white/60">/{billing === 'yearly' ? 'an' : 'lună'}</div>
                  {billing === 'yearly' && (
                    <div className="text-emerald-400 text-sm font-medium">
                      Economisești 40% anual
                    </div>
                  )}
                  
                  {/* Show savings vs individual */}
                  <div className="mt-2 text-sm text-white/60">
                    {bundle.id === 'trinity' && 'vs 89.97 RON individual'}
                    {bundle.id === 'complete' && 'vs 179.94 RON individual'}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {bundle.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  plan={{
                    id: bundle.id,
                    name: bundle.name,
                    type: bundle.type,
                    price: getPrice(bundle.id, 'bundle'),
                    currency: selectedTier.currency
                  }}
                  billingCycle={billing}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    bundle.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : bundle.id === 'complete'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                  }`}
                >
                  {bundle.id === 'trinity' && '🔮 Unlock Quantum Vault'}
                  {bundle.id === 'quantum_direct' && '⚡ Access Quantum Vault'}
                  {bundle.id === 'complete' && '👑 Get Everything'}
                </CheckoutButton>

                {/* Payment Method Info */}
                <div className="mt-4 text-center">
                  <div className="text-white/60 text-sm mb-2">Plăți securizate cu:</div>
                  <div className="flex justify-center space-x-4 text-2xl">
                    💳 🔒 💰
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quantum Vault Explanation */}
      {activeTab === 'bundles' && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 text-center"
          >
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ce este Quantum Vault?</h2>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Vault-ul cuantic este un laborator AI avansat care îți simulează viitorul, 
              creează conversații cu versiuni alternative ale tale și detectează pattern-uri 
              invizibile în comportamentul tău.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-bold text-white mb-2">Future Self Simulator</h3>
                <p className="text-white/70 text-sm">Vorbește cu tine de la 40-50 ani și primește sfaturi de la viitorul tău optimizat</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">🎭</div>
                <h3 className="font-bold text-white mb-2">Identity Simulator</h3>
                <p className="text-white/70 text-sm">Explorează timeline-uri alternative și vezi cum deciziile te modelează</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-bold text-white mb-2">Reverse Roadmap</h3>
                <p className="text-white/70 text-sm">Planifică backwards de la viziunea ta ideală la prezent</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold text-white mb-2">Pattern Detection</h3>
                <p className="text-white/70 text-sm">AI detectează pattern-uri subconștiente și blind spots</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Întrebări Frecvente</h2>
        
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">✅ Ce înseamnă GRATUIT pentru PorHealth & PorKids?</h3>
            <p className="text-white/70">
              Accesul gratuit include funcționalități de bază: tracking simplu, sfaturi AI standard, 
              și acces la comunitate. Upgrade-ul premium adaugă AI avansat, analize detaliate și funcții exclusive.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">🔮 Cum deblochez Quantum Vault?</h3>
            <p className="text-white/70">
              3 modalități: (1) Trinity Pack (PorMind + PorFlow + PorBlu), (2) Quantum Vault Direct, 
              sau (3) Complete Ecosystem. Trinity Pack este cea mai populară opțiune.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">💳 Ce metode de plată acceptați?</h3>
            <p className="text-white/70">
              PayPal, toate cardurile (Visa, Mastercard, AMEX), Google Pay, Apple Pay. 
              Plățile sunt securizate 256-bit SSL și procesate conform standardelor PCI DSS.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">🔄 Pot să fac upgrade ulterior?</h3>
            <p className="text-white/70">
              Absolut! Începi cu planurile gratuite, faci upgrade la premium când vrei, 
              și adaugi ecosisteme noi oricând. Plătești doar diferența pro-rata.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border-t border-white/10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Gata să îți transformi viața?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Începe azi cu PorHealth & PorKids GRATUIT. Fără card, fără obligații.
          </p>
          <CheckoutButton
            plan={{
              id: 'por-health-free',
              name: 'Start Free',
              type: 'free',
              price: 0,
              currency: 'RON'
            }}
            billingCycle={billing}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            🚀 Începe GRATUIT Acum
          </CheckoutButton>
        </div>
      </div>
    </div>
  )
}