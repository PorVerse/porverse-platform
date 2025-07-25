// app/pricing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePricing } from '@/hooks/usePricing'
import { usePayments } from '@/hooks/usePayments'
import { useSubscription } from '@/hooks/useSubscription'
import { CheckoutData } from '@/hooks/usePayments'
import TrialBanner from '@/components/subscription/TrialBanner'

const ecosystems = [
  {
    id: 'por-health',
    name: 'PorHealth',
    icon: '🏥',
    description: 'AI-powered nutrition & fitness optimization',
    priceKey: 'por-health',
    gradient: 'from-green-500 to-emerald-600',
    features: [
      'Personalized meal plans',
      'Workout optimization',
      'Health metrics tracking',
      'AI nutrition coach',
      'Supplement recommendations'
    ]
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    icon: '🎓',
    description: 'Educational AI for children & parents',
    priceKey: 'por-kids',
    gradient: 'from-blue-500 to-cyan-600',
    features: [
      'Homework scanning & solving',
      'Interactive learning games',
      'Progress tracking',
      'Parental insights',
      'Curriculum alignment'
    ]
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    icon: '💰',
    description: 'Financial intelligence & wealth building',
    priceKey: 'por-mind',
    gradient: 'from-yellow-500 to-orange-600',
    features: [
      'Investment strategies',
      'Budget optimization',
      'Market analysis',
      'Financial planning',
      'Wealth tracking'
    ]
  },
  {
    id: 'por-well',
    name: 'PorWell',
    icon: '🧘',
    description: 'Mental wellness & emotional intelligence',
    priceKey: 'por-well',
    gradient: 'from-purple-500 to-pink-600',
    features: [
      'AI therapy sessions',
      'Mood tracking',
      'Meditation guides',
      'Stress management',
      'Emotional insights'
    ]
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    icon: '⚡',
    description: 'Productivity & time optimization',
    priceKey: 'por-flow',
    gradient: 'from-indigo-500 to-purple-600',
    features: [
      'Smart task management',
      'Focus optimization',
      'Automation workflows',
      'Time tracking',
      'Productivity analytics'
    ]
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    icon: '🎯',
    description: 'Strategic planning & executive coaching',
    priceKey: 'por-blu',
    gradient: 'from-slate-500 to-blue-600',
    features: [
      'Strategic planning',
      'Vision boarding',
      'Executive coaching',
      'Decision optimization',
      'Leadership insights'
    ]
  }
]

export default function PricingPage() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>('trinity')
  const [showStudentForm, setShowStudentForm] = useState(false)
  
  const { 
    geolocation, 
    loading: pricingLoading, 
    selectedTier, 
    billingCycle, 
    setBillingCycle,
    formatPrice,
    calculatePrice,
    calculateAnnualSavings,
    getEcosystemBundles
  } = usePricing()
  
  const { createCheckoutSession, loading: checkoutLoading } = usePayments()
  const { hasActiveSubscription, getCurrentPlan } = useSubscription()

  const loading = pricingLoading || checkoutLoading

  const handleSubscribe = async (
    planType: 'individual' | 'dual' | 'trinity' | 'complete',
    ecosystems: string[],
    price: number
  ) => {
    if (hasActiveSubscription()) {
      alert('You already have an active subscription. Please manage it in your dashboard.')
      return
    }

    const checkoutData: CheckoutData = {
      planType,
      ecosystems,
      tier: selectedTier.tier,
      billingCycle,
      price: calculatePrice(price, billingCycle),
      currency: selectedTier.tier === 1 ? 'RON' : 'USD',
      country: geolocation.countryCode
    }

    await createCheckoutSession(checkoutData)
  }

  const handleIndividualSubscribe = (ecosystem: string) => {
    const price = selectedTier.individual[ecosystem as keyof typeof selectedTier.individual]
    handleSubscribe('individual', [ecosystem], price)
  }

  const bundles = getEcosystemBundles()

  if (pricingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Detectăm locația ta...</h2>
          <p className="text-white/70">Personalizăm prețurile pentru regiunea ta</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/30"></div>
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-16 px-6">
          <h1 className="text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transformă-ți Viața
          </h1>
          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto mb-8">
            Alege planul perfect pentru călătoria ta de dezvoltare personală cu AI
          </p>
          
          {/* Location & Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full">
              <span className="text-white/70">📍 Detectat: </span>
              <span className="font-semibold text-white">{geolocation.country}</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1">
              <div className="flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Lunar
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all relative ${
                    billingCycle === 'annual'
                      ? 'bg-white text-slate-900'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Anual
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    -40%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Trial Banner */}
          <TrialBanner />
        </div>

        {/* Bundle Offers - Featured Section */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                🎁 Oferte Bundle
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Economisește prin combinarea ecosistemelor. Mai multe ecosisteme = transformare mai rapidă.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bundles.map(bundle => (
                <div 
                  key={bundle.id} 
                  className={`group relative backdrop-blur-xl border rounded-2xl p-8 transition-all hover:scale-105 cursor-pointer ${
                    bundle.special 
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  } ${selectedBundle === bundle.id ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedBundle(bundle.id)}
                >
                  {bundle.special && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        🔥 MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{bundle.description}</p>
                    
                    <div className="text-4xl font-black text-white mb-2">
                      {formatPrice(bundle.price)}
                      <span className="text-lg font-normal text-white/60">
                        /{billingCycle === 'monthly' ? 'lună' : 'an'}
                      </span>
                    </div>
                    
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-green-400 font-semibold">
                        💰 Economisești {formatPrice(bundle.savings)} anual
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {bundle.ecosystems.map(eco => {
                      const ecosystem = ecosystems.find(e => e.id === eco)!
                      return (
                        <div key={eco} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <span className="text-xl">{ecosystem.icon}</span>
                          <span className="text-white font-medium">{ecosystem.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  {bundle.unlocks && (
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-6">
                      <div className="text-purple-300 font-semibold text-sm">
                        🔓 {bundle.unlocks}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubscribe(
                        bundle.id as any,
                        bundle.ecosystems,
                        bundle.price
                      )
                    }}
                    disabled={loading || hasActiveSubscription()}
                    className={`w-full py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100 ${
                      bundle.special
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesăm...
                      </div>
                    ) : hasActiveSubscription() ? (
                      'Ai deja abonament activ'
                    ) : (
                      '🚀 Începe Transformarea'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Individual Ecosystems */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                🎯 Ecosisteme Individuale
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Începe cu un singur ecosistem și extinde-ți accesul ulterior.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystems.map(ecosystem => (
                <div 
                  key={ecosystem.id}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">{ecosystem.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{ecosystem.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{ecosystem.description}</p>
                    
                    <div className="text-3xl font-black text-white mb-2">
                      {formatPrice(selectedTier.individual[ecosystem.priceKey as keyof typeof selectedTier.individual])}
                      <span className="text-sm font-normal text-white/60">
                        /{billingCycle === 'monthly' ? 'lună' : 'an'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="text-xs text-white/50 line-through">
                        {selectedTier.symbol}{selectedTier.individual[ecosystem.priceKey as keyof typeof selectedTier.individual]}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {ecosystem.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-white/80">
                        <span className="text-green-400 mr-2">✨</span>
                        {feature}
                      </li>
                    ))}
                    <li className="text-white/60 text-sm italic">
                      +{ecosystem.features.length - 3} features mai multe
                    </li>
                  </ul>

                  <button 
                    onClick={() => handleIndividualSubscribe(ecosystem.id)}
                    disabled={loading || hasActiveSubscription()}
                    className={`w-full py-3 bg-gradient-to-r ${ecosystem.gradient} hover:opacity-90 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesăm...
                      </div>
                    ) : hasActiveSubscription() ? (
                      'Ai deja abonament'
                    ) : (
                      'Abonează-te Acum'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                📊 Comparație Features
              </h2>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="text-left p-4 font-semibold text-white">Feature</th>
                      <th className="text-center p-4 font-semibold text-white">Free</th>
                      <th className="text-center p-4 font-semibold text-white">Individual</th>
                      <th className="text-center p-4 font-semibold text-white">Trinity</th>
                      <th className="text-center p-4 font-semibold text-white">Complete</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    <tr className="border-t border-white/10">
                      <td className="p-4">AI Requests per month</td>
                      <td className="text-center p-4">50</td>
                      <td className="text-center p-4 text-green-400">1,000</td>
                      <td className="text-center p-4 text-green-400">Unlimited</td>
                      <td className="text-center p-4 text-green-400">Unlimited</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="p-4">Ecosystems Access</td>
                      <td className="text-center p-4">1 (limited)</td>
                      <td className="text-center p-4 text-green-400">1 (full)</td>
                      <td className="text-center p-4 text-green-400">3 (full)</td>
                      <td className="text-center p-4 text-green-400">6 (all)</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="p-4">🔮 Quantum Vault</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4 text-purple-400">✅</td>
                      <td className="text-center p-4 text-purple-400">✅</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="p-4">Priority Support</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4 text-green-400">✅</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="p-4">Data Export</td>
                      <td className="text-center p-4 text-green-400">✅</td>
                      <td className="text-center p-4 text-green-400">✅</td>
                      <td className="text-center p-4 text-green-400">✅</td>
                      <td className="text-center p-4 text-green-400">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Student Discount Section */}
        <section className="px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">🎓 Reducere Studenți</h3>
              <p className="text-white/80 mb-6">
                Ești student? Obține 50% reducere la orice plan cu verificarea statusului de student.
              </p>
              
              <button
                onClick={() => setShowStudentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
              >
                Verifică Statusul de Student
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                ❓ Întrebări Frecvente
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Pot să-mi anulez abonamentul oricând?",
                  a: "Da, poți anula abonamentul oricând din dashboard-ul tău. Vei avea acces până la sfârșitul perioadei de facturare."
                },
                {
                  q: "Ce include perioada de probă gratuită?",
                  a: "14 zile acces complet la toate features-urile planului ales, fără nicio restricție."
                },
                {
                  q: "Cum funcționează Quantum Vault-ul?",
                  a: "Quantum Vault se deschide automat când ai acces la 3+ ecosisteme. Include Future Self AI, Identity Simulator și alte features avansate."
                },
                {
                  q: "Pot să schimb planul ulterior?",
                  a: "Da, poți face upgrade sau downgrade oricând din Customer Portal-ul Stripe."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                  <p className="text-white/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Gata să-ți Transformi Viața?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Alătură-te miilor de oameni care și-au optimizat viața cu PorVerse AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSelectedBundle('trinity')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
              >
                🔮 Încearcă Trinity Pack
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
              >
                📱 Vezi Demo
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Student Verification Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">🎓 Verificare Student</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/80 mb-2">Email instituțional</label>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Instituția</label>
                <input
                  type="text"
                  placeholder="Universitatea din București"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowStudentForm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-lg font-semibold transition-all"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  // Handle student verification
                  setShowStudentForm(false)
                  alert('Verificarea a fost trimisă! Vei primi un email în 24h.')
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all"
              >
                Verifică
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}