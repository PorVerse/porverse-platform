// app/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PricingTier {
  tier: 1 | 2 | 3;
  country: string;
  currency: string;
  symbol: string;
  region: string;
  individual: {
    mind: number;
    well: number;
    flow: number;
    blu: number;
  };
  bundles: {
    dual: number;
    triple: number;
    quantumTrinity: number;
    complete: number;
  };
  savings: {
    dual: number;
    triple: number;
    quantumTrinity: number;
    complete: number;
  };
}

interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  detected: boolean;
}

const pricingTiers: Record<number, PricingTier> = {
  1: {
    tier: 1,
    country: 'România',
    currency: 'RON',
    symbol: 'RON',
    region: 'Eastern Europe',
    individual: { mind: 29, well: 39, flow: 49, blu: 69 },
    bundles: { dual: 58, triple: 103, quantumTrinity: 129, complete: 199 },
    savings: { dual: 10, triple: 25, quantumTrinity: 17, complete: 59 }
  },
  2: {
    tier: 2,
    country: 'United States',
    currency: 'USD',
    symbol: '$',
    region: 'North America & Western Europe',
    individual: { mind: 19, well: 29, flow: 39, blu: 49 },
    bundles: { dual: 41, triple: 73, quantumTrinity: 99, complete: 149 },
    savings: { dual: 7, triple: 19, quantumTrinity: 37, complete: 87 }
  },
  3: {
    tier: 3,
    country: 'Canada',
    currency: 'USD',
    symbol: '$',
    region: 'Rest of World',
    individual: { mind: 15, well: 22, flow: 29, blu: 39 },
    bundles: { dual: 31, triple: 56, quantumTrinity: 69, complete: 109 },
    savings: { dual: 6, triple: 14, quantumTrinity: 29, complete: 59 }
  }
};

const ecosystems = [
  {
    id: 'por-health',
    name: 'PorHealth',
    subtitle: 'Sănătate & Fitness AI',
    description: 'Nutriție personalizată, antrenamente optimize și monitorizare biometrică avansată pentru transformarea fizică completă.',
    icon: '🌿',
    features: ['AI Nutrition Planner', 'Workout Optimizer', 'Biometric Tracking', 'Sleep Analysis', 'Supplement Guide'],
    tier: 'FREE',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    subtitle: 'Educație Conștientă',
    description: 'AI părinte-copil, homework scanner și dezvoltare holistică pentru copii în era digitală.',
    icon: '👶',
    features: ['Homework Scanner', 'Progress Tracking', 'Family Dashboard', 'Educational Games', 'Parent Analytics'],
    tier: 'FREE',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    subtitle: 'Educație Financiară AI',
    description: 'Money mindset, investiții inteligente și wealth building personalizat pentru libertate financiară.',
    icon: '🧠',
    features: ['Financial Planning', 'Investment AI', 'Budget Optimization', 'Wealth Building', 'Tax Strategies'],
    tier: 'PREMIUM',
    gradient: 'from-blue-500 to-blue-600',
    priceKey: 'mind'
  },
  {
    id: 'por-well',
    name: 'PorWell',
    subtitle: 'Mental Wellness AI',
    description: 'AI therapist, mood tracking și emotional intelligence optimization pentru echilibru interior.',
    icon: '🌻',
    features: ['AI Therapist', 'Mood Tracking', 'Anxiety Helper', 'Meditation Guide', 'Astrology AI'],
    tier: 'PREMIUM',
    gradient: 'from-purple-500 to-purple-600',
    priceKey: 'well'
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    subtitle: 'Productivitate Maximă',
    description: 'Task management AI, time optimization și workflow automation pentru performanță de nivel superior.',
    icon: '🌊',
    features: ['Task Management AI', 'Time Blocking', 'Focus Sessions', 'Calendar Optimization', 'Energy Management'],
    tier: 'PREMIUM',
    gradient: 'from-cyan-500 to-cyan-600',
    priceKey: 'flow'
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    subtitle: 'Strategic Life Planning',
    description: 'Executive coaching, vision boarding și legacy planning pentru lideri și visionari.',
    icon: '💧',
    features: ['Strategic Planning', 'Executive Coaching', 'Vision Boarding', 'Leadership Development', 'Legacy Planning'],
    tier: 'PREMIUM',
    gradient: 'from-amber-500 to-amber-600',
    priceKey: 'blu'
  }
];

const bundles = [
  {
    id: 'dual',
    name: 'Dual Pack',
    description: 'Orice 2 ecosisteme premium',
    discount: '15% reducere',
    badge: 'Popular',
    ecosystems: 2,
    priceKey: 'dual',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    id: 'triple',
    name: 'Triple Pack',
    description: 'Orice 3 ecosisteme premium',
    discount: '25% reducere',
    badge: 'Cea mai bună valoare',
    ecosystems: 3,
    priceKey: 'triple',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'quantum-trinity',
    name: 'Quantum Trinity',
    description: 'PorMind + PorFlow + PorBlu',
    discount: 'Deblochează Quantum Vault',
    badge: 'Premium Ultimate',
    ecosystems: 3,
    special: true,
    priceKey: 'quantumTrinity',
    unlocks: 'Quantum Vault',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'complete',
    name: 'Complete Pack',
    description: 'Toate 6 ecosistemele',
    discount: 'Cea mai mare economie',
    badge: 'Transformare completă',
    ecosystems: 6,
    priceKey: 'complete',
    gradient: 'from-purple-600 to-pink-600'
  }
];

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<PricingTier>(pricingTiers[1]);
  const [geolocation, setGeolocation] = useState<GeolocationData>({
    country: 'România',
    countryCode: 'RO',
    region: 'Eastern Europe',
    city: 'București',
    currency: 'RON',
    detected: false
  });
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState<string>('quantum-trinity');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockCountries = [
        { code: 'RO', country: 'România', tier: 1, region: 'Eastern Europe', city: 'București', currency: 'RON' },
        { code: 'US', country: 'United States', tier: 2, region: 'North America', city: 'New York', currency: 'USD' },
        { code: 'GB', country: 'United Kingdom', tier: 2, region: 'Western Europe', city: 'London', currency: 'USD' },
        { code: 'DE', country: 'Germany', tier: 2, region: 'Western Europe', city: 'Berlin', currency: 'EUR' },
        { code: 'CA', country: 'Canada', tier: 3, region: 'North America', city: 'Toronto', currency: 'USD' },
        { code: 'AU', country: 'Australia', tier: 3, region: 'Oceania', city: 'Sydney', currency: 'USD' }
      ];
      
      const randomCountry = mockCountries[Math.floor(Math.random() * mockCountries.length)];
      
      setGeolocation({
        country: randomCountry.country,
        countryCode: randomCountry.code,
        region: randomCountry.region,
        city: randomCountry.city,
        currency: randomCountry.currency,
        detected: true
      });
      
      setSelectedTier(pricingTiers[randomCountry.tier]);
    } catch (error) {
      console.error('Geo-detection failed:', error);
      setGeolocation(prev => ({ ...prev, detected: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (tierNumber: number) => {
    setSelectedTier(pricingTiers[tierNumber]);
  };

  const formatPrice = (price: number) => {
    const annualPrice = billingCycle === 'annual' ? Math.round(price * 0.6) : price;
    return `${selectedTier.symbol}${annualPrice}`;
  };

  const calculateSavings = (originalPrice: number, bundlePrice: number) => {
    const annualBundle = billingCycle === 'annual' ? Math.round(bundlePrice * 0.6) : bundlePrice;
    const annualOriginal = billingCycle === 'annual' ? Math.round(originalPrice * 0.6) : originalPrice;
    return annualOriginal - annualBundle;
  };

  const handleSubscribe = (planType: string, planName: string) => {
    const checkoutData = {
      plan: planType,
      name: planName,
      tier: selectedTier.tier,
      country: geolocation.country,
      billing: billingCycle,
      price: planType.includes('bundle') ? selectedTier.bundles[selectedBundle as keyof typeof selectedTier.bundles] : selectedTier.individual[planType as keyof typeof selectedTier.individual]
    };
    
    console.log('Redirecting to checkout with:', checkoutData);
    alert(`Redirecting to secure checkout for ${planName} - ${formatPrice(checkoutData.price)}/month`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Detectăm locația ta...</h2>
          <p className="text-white/70">Personalizăm prețurile pentru regiunea ta</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/30"></div>
        {isClient && (
          <div className="absolute inset-0">
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
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🧠</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                PorVerse
              </span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-white/70 hover:text-white transition-colors">
                ← Înapoi acasă
              </Link>
              <Link 
                href="/auth/login" 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Geo Detection Display */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">📍</span>
            <div>
              <span className="text-white font-semibold">
                Detectat: <span className="text-indigo-400">{geolocation.city}, {geolocation.country}</span>
              </span>
              <div className="text-sm text-white/60">
                Prețuri optimizate în {selectedTier.currency}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/70">Schimbă regiunea:</span>
            <select 
              value={selectedTier.tier} 
              onChange={(e) => handleTierChange(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
            >
              <option value={1} className="bg-slate-800">🇷🇴 România & Eastern Europe ({pricingTiers[1].currency})</option>
              <option value={2} className="bg-slate-800">🇺🇸 US & Western Europe ({pricingTiers[2].currency})</option>
              <option value={3} className="bg-slate-800">🇨🇦 Canada & Rest of World ({pricingTiers[3].currency})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="relative z-10 text-center py-16">
        <h1 className="text-5xl lg:text-6xl font-black mb-6">
          Alege planul perfect pentru
          <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            transformarea ta
          </span>
        </h1>
        <p className="text-xl text-white/80 max-w-4xl mx-auto mb-8">
          Preturi optimizate pentru {selectedTier.region}. Începe gratuit cu 2 ecosisteme,
          upgrade oricând pentru acces complet.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex bg-white/10 border border-white/20 rounded-2xl p-2 backdrop-blur-sm">
          <button 
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              billingCycle === 'monthly' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Lunar
          </button>
          <button 
            className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
              billingCycle === 'annual' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setBillingCycle('annual')}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              40% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Free Ecosystems */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              🆓 Începe Gratuit
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              2 ecosisteme complete, fără limitări, pentru totdeauna
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {ecosystems.filter(eco => eco.tier === 'FREE').map(ecosystem => (
              <div 
                key={ecosystem.id} 
                className="group relative bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{ecosystem.icon}</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-bold">
                    GRATUIT
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{ecosystem.name}</h3>
                <p className="text-emerald-400 font-semibold mb-4">{ecosystem.subtitle}</p>
                <p className="text-white/70 leading-relaxed mb-6">{ecosystem.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {ecosystem.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-white/80">
                      <span className="text-emerald-400 mr-2">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/auth/signup" 
                  className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold text-center transition-all hover:scale-105 shadow-lg hover:shadow-emerald-500/25 text-lg"
                >
                  🚀 Începe Gratuit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Individual Ecosystems */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              💎 Ecosisteme Premium
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Unlock advanced AI features pentru transformare accelerată
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystems.filter(eco => eco.tier === 'PREMIUM').map(ecosystem => (
              <div 
                key={ecosystem.id} 
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${ecosystem.gradient} opacity-10 rounded-bl-3xl rounded-tr-2xl`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform relative z-10">{ecosystem.icon}</span>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1">{ecosystem.name}</h3>
                <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${ecosystem.gradient} bg-clip-text text-transparent`}>
                  {ecosystem.subtitle}
                </p>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{ecosystem.description}</p>

                <div className="mb-4">
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(selectedTier.individual[ecosystem.priceKey as keyof typeof selectedTier.individual])}
                    </span>
                    <span className="text-white/60">/{billingCycle === 'monthly' ? 'lună' : 'an'}</span>
                    {billingCycle === 'annual' && (
                      <div className="text-xs text-white/50 line-through">
                        {selectedTier.symbol}{selectedTier.individual[ecosystem.priceKey as keyof typeof selectedTier.individual]}
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-1 mb-6">
                  {ecosystem.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center text-xs text-white/80">
                      <span className="text-indigo-400 mr-1">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSubscribe(ecosystem.priceKey!, ecosystem.name)}
                  className={`w-full py-3 bg-gradient-to-r ${ecosystem.gradient} hover:opacity-90 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg`}
                >
                  Abonează-te Acum
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Options */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              🎁 Bundle Offers
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Economisește prin combinarea ecosistemelor. Mai multe ecosisteme = transformare mai rapidă.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map(bundle => (
              <div 
                key={bundle.id} 
                className={`group relative bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer ${
                  bundle.special ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10'
                } ${selectedBundle === bundle.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setSelectedBundle(bundle.id)}
              >
                {bundle.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold text-white">
                    {bundle.badge}
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>
                  <p className="text-sm text-white/70 mb-4">{bundle.description}</p>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatPrice(selectedTier.bundles[bundle.priceKey as keyof typeof selectedTier.bundles])}
                    </div>
                    <div className="text-xs text-white/60">/{billingCycle === 'monthly' ? 'lună' : 'an'}</div>
                    
                    <div className="text-sm text-emerald-400 font-semibold mt-2">
                      Economisești {selectedTier.symbol}{calculateSavings(
                        bundle.ecosystems * 39,
                        selectedTier.bundles[bundle.priceKey as keyof typeof selectedTier.bundles]
                      )}
                    </div>
                  </div>
                </div>

                {bundle.unlocks && (
                  <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-center">
                    <div className="text-sm font-semibold text-purple-300">
                      🔮 Deblochează {bundle.unlocks}
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-sm text-white/80 mb-1">{bundle.ecosystems} ecosisteme premium</div>
                  <div className="text-xs text-emerald-400 font-semibold">{bundle.discount}</div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe('bundle', bundle.name);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                    bundle.special 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600' 
                      : `bg-gradient-to-r ${bundle.gradient} hover:opacity-90`
                  }`}
                >
                  {bundle.special ? '🔮 Unlock Quantum Vault' : 'Selectează Bundle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quantum Vault Showcase */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="text-2xl">🔮</span>
                  <span className="text-sm font-bold text-purple-300">EXPERIENȚA SUPREMĂ</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-black">
                  Quantum Vault
                  <span className="block text-2xl font-semibold text-purple-400 mt-2">
                    Future Self AI & Reality Simulation
                  </span>
                </h2>
                
                <p className="text-lg text-white/80 leading-relaxed">
                  Se deblochează automat când achiziționezi <strong>Quantum Trinity</strong> 
                  (PorMind + PorFlow + PorBlu). Experiența premium care îți arată versiunea 
                  viitoare ideală și planul exact pentru a ajunge acolo.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🧬</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Future Self AI Creation</h4>
                      <p className="text-sm text-white/70">Generează versiunea ta ideală din viitor cu detalii complete</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🌌</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Identity Shift Simulator</h4>
                      <p className="text-sm text-white/70">Testează decizii majore în timeline-uri alternative</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Reverse Roadmap Generator</h4>
                      <p className="text-sm text-white/70">Plan strategic din viitor spre prezent cu milestone-uri</p>
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-xl font-bold text-white mb-4">
                    Inclus în Quantum Trinity la {formatPrice(selectedTier.bundles.quantumTrinity)}/lună
                  </div>
                  <button 
                    onClick={() => handleSubscribe('quantum-trinity', 'Quantum Trinity')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105"
                  >
                    🔓 Deblochează Quantum Vault
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center relative overflow-hidden group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 relative">
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-spin-slow"></div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              🤔 Întrebări Frecvente
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Tot ce trebuie să știi despre planurile PorVerse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">De ce prețuri diferite per regiune?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Adaptăm prețurile la puterea de cumpărare locală pentru a face PorVerse accesibil în întreaga lume, păstrând aceeași calitate premium.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">Pot schimba planul oricând?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Da! Poți face upgrade sau downgrade oricând. Diferența se calculează proporțional pentru ciclul de facturare curent.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">Ce include Quantum Vault?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Future Self AI, Identity Shift Simulator, Reverse Roadmap Generator și Mirror of Other You - experiența AI supremă pentru transformare.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">Există garanție de returnare?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Da! 30 de zile garanție completă de returnare pentru toate planurile premium. Fără întrebări.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">Ecosistemele gratuite au limitări?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Nu! PorHealth și PorKids sunt complet funcționale gratuit pentru totdeauna. Zero limitări artificiale.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <h4 className="font-bold text-white mb-3">Datele mele sunt securizate?</h4>
              <p className="text-white/70 text-sm leading-relaxed">Absolut! Folosim encriptare enterprise-grade și nu vindem niciodată datele tale. Tu ești proprietarul complet al informațiilor tale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Gata să îți transformi viața?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Alătură-te celor peste 12,000 de utilizatori din {selectedTier.region} care și-au optimizat viața cu PorVerse
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link 
                href="/auth/signup" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-105"
              >
                🚀 Începe Gratuit Acum
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all hover:scale-105"
              >
                🎬 Vezi Demo Live
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <span className="text-xl">🛡️</span>
              <span>30 de zile gratuit • Fără card necesar • Anulare oricând</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}