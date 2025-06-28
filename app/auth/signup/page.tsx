// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

interface OnboardingData {
  goals: string[];
  currentChallenges: string[];
  ecosystemInterest: string[];
  experience: string;
}

const goalOptions = [
  { id: 'health', label: 'Îmbunătățire sănătate', icon: '🌿', gradient: 'from-emerald-500 to-emerald-600' },
  { id: 'finances', label: 'Optimizare financiară', icon: '🧠', gradient: 'from-blue-500 to-blue-600' },
  { id: 'productivity', label: 'Productivitate maximă', icon: '🌊', gradient: 'from-cyan-500 to-cyan-600' },
  { id: 'wellness', label: 'Mental wellness', icon: '🌻', gradient: 'from-purple-500 to-purple-600' },
  { id: 'planning', label: 'Strategic planning', icon: '💧', gradient: 'from-amber-500 to-amber-600' },
  { id: 'family', label: 'Educația copiilor', icon: '👶', gradient: 'from-pink-500 to-pink-600' }
];

const challengeOptions = [
  { id: 'time', label: 'Lipsă de timp', icon: '⏰', gradient: 'from-red-500 to-red-600' },
  { id: 'motivation', label: 'Lipsă de motivație', icon: '🔥', gradient: 'from-orange-500 to-orange-600' },
  { id: 'knowledge', label: 'Nu știu pe unde să încep', icon: '🤔', gradient: 'from-yellow-500 to-yellow-600' },
  { id: 'consistency', label: 'Dificultate în menținere', icon: '📈', gradient: 'from-green-500 to-green-600' },
  { id: 'overwhelm', label: 'Prea multe opțiuni', icon: '🌪️', gradient: 'from-blue-500 to-blue-600' },
  { id: 'resources', label: 'Resurse limitate', icon: '💰', gradient: 'from-purple-500 to-purple-600' }
];

const ecosystemOptions = [
  { id: 'por-health', name: 'PorHealth', description: 'Sănătate & Fitness AI', icon: '🌿', tier: 'FREE', gradient: 'from-emerald-500 to-emerald-600' },
  { id: 'por-kids', name: 'PorKids', description: 'Educație Conștientă', icon: '👶', tier: 'FREE', gradient: 'from-pink-500 to-pink-600' },
  { id: 'por-mind', name: 'PorMind', description: 'Educație Financiară AI', icon: '🧠', tier: 'PREMIUM', gradient: 'from-blue-500 to-blue-600' },
  { id: 'por-well', name: 'PorWell', description: 'Mental Wellness AI', icon: '🌻', tier: 'PREMIUM', gradient: 'from-purple-500 to-purple-600' },
  { id: 'por-flow', name: 'PorFlow', description: 'Productivitate Maximă', icon: '🌊', tier: 'PREMIUM', gradient: 'from-cyan-500 to-cyan-600' },
  { id: 'por-blu', name: 'PorBlu', description: 'Strategic Life Planning', icon: '💧', tier: 'PREMIUM', gradient: 'from-amber-500 to-amber-600' }
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goals: [],
    currentChallenges: [],
    ecosystemInterest: [],
    experience: 'beginner'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayToggle = (array: string[], value: string, setter: (data: Partial<OnboardingData>) => void) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    setter({ [array === onboardingData.goals ? 'goals' : array === onboardingData.currentChallenges ? 'currentChallenges' : 'ecosystemInterest']: newArray });
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Toate câmpurile sunt obligatorii');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu se potrivesc');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('Trebuie să accepți termenii și condițiile');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (step === 1 && !validateStep1()) {
      return;
    }
    
    if (step === 2 && onboardingData.goals.length === 0) {
      setError('Selectează cel puțin un obiectiv');
      return;
    }
    
    if (step === 3 && onboardingData.currentChallenges.length === 0) {
      setError('Selectează cel puțin o provocare');
      return;
    }
    
    setStep(step + 1);
  };

  const handleCompleteSignup = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData = {
        id: 'user_new_' + Date.now(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        subscription: 'free',
        ecosystems: ['por-health', 'por-kids'],
        onboarding: onboardingData,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('porverse_auth', JSON.stringify({
        user: userData,
        token: 'mock_jwt_token_' + Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }));
      
      localStorage.setItem('porverse_onboarding_complete', 'true');
      
      setStep(5);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (err: any) {
      setError('Eroare la crearea contului. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'microsoft' | 'apple') => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('porverse_auth', JSON.stringify({
        user: {
          id: 'user_social_' + Date.now(),
          email: `user@${provider}.com`,
          name: `User ${provider}`,
          subscription: 'free',
          ecosystems: ['por-health', 'por-kids']
        },
        token: 'mock_social_token_' + Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }));
      
      router.push('/dashboard');
    } catch (err: any) {
      setError('Eroare la înregistrarea cu ' + provider);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return ((step - 1) / 4) * 100;
  };

  const renderStep1 = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Creează contul PorVerse</h1>
        <p className="text-white/70">
          Alătură-te celor peste 12,000 de utilizatori care își transformă viața
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-300 animate-pulse">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">Prenume</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
                placeholder="Alex"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">Nume</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
                placeholder="Popescu"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/40 text-lg">📧</span>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
                placeholder="alex@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">Parolă</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/40 text-lg">🔒</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
                placeholder="Minimum 8 caractere"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
              >
                <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">Confirmă parola</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/40 text-lg">🔒</span>
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all"
                placeholder="Repetă parola"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="w-5 h-5 text-indigo-500 bg-white/10 border border-white/20 rounded focus:ring-indigo-500 focus:ring-2 mt-0.5"
                required
              />
              <span className="text-sm text-white/70 leading-relaxed">
                Accept <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">Termenii și Condițiile</Link> și{' '}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Politica de Confidențialitate</Link>
              </span>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
                className="w-5 h-5 text-indigo-500 bg-white/10 border border-white/20 rounded focus:ring-indigo-500 focus:ring-2 mt-0.5"
              />
              <span className="text-sm text-white/70 leading-relaxed">
                Vreau să primesc email-uri cu tips și noutăți PorVerse
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-white shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-105 text-lg"
          >
            🚀 Continuă cu Onboarding
          </button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-4 text-sm text-white/60 font-medium">sau înregistrează-te cu</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSocialSignup('google')} className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 backdrop-blur-sm group">
            <div className="text-center">
              <span className="text-xl group-hover:scale-110 transition-transform block">🔍</span>
              <span className="text-xs text-white/70 font-medium">Google</span>
            </div>
          </button>
          <button onClick={() => handleSocialSignup('microsoft')} className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 backdrop-blur-sm group">
            <div className="text-center">
              <span className="text-xl group-hover:scale-110 transition-transform block">🪟</span>
              <span className="text-xs text-white/70 font-medium">Microsoft</span>
            </div>
          </button>
          <button onClick={() => handleSocialSignup('apple')} className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 backdrop-blur-sm group">
            <div className="text-center">
              <span className="text-xl group-hover:scale-110 transition-transform block">🍎</span>
              <span className="text-xs text-white/70 font-medium">Apple</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">
            Ai deja cont?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
              Conectează-te aici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Care sunt obiectivele tale principale?</h1>
        <p className="text-white/70">
          Selectează domeniile în care vrei să evoluezi cu PorVerse
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-300 animate-pulse max-w-md mx-auto">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {goalOptions.map(goal => (
          <button
            key={goal.id}
            onClick={() => handleArrayToggle(onboardingData.goals, goal.id, updateOnboardingData)}
            className={`p-6 bg-white/5 backdrop-blur-xl border rounded-2xl transition-all hover:scale-105 hover:bg-white/10 ${
              onboardingData.goals.includes(goal.id) 
                ? `border-indigo-500 bg-gradient-to-br ${goal.gradient} bg-opacity-20` 
                : 'border-white/10'
            }`}
          >
            <div className="text-center">
              <span className="text-4xl mb-3 block">{goal.icon}</span>
              <h3 className="font-bold text-white text-lg">{goal.label}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center max-w-md mx-auto">
        <button 
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all hover:scale-105"
        >
          ← Înapoi
        </button>
        <button 
          onClick={handleNextStep}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-white transition-all hover:scale-105"
        >
          Continuă →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Ce provocări întâmpini acum?</h1>
        <p className="text-white/70">
          Ajută-ne să personalizăm experiența pentru nevoile tale
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-300 animate-pulse max-w-md mx-auto">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {challengeOptions.map(challenge => (
          <button
            key={challenge.id}
            onClick={() => handleArrayToggle(onboardingData.currentChallenges, challenge.id, updateOnboardingData)}
            className={`p-6 bg-white/5 backdrop-blur-xl border rounded-2xl transition-all hover:scale-105 hover:bg-white/10 ${
              onboardingData.currentChallenges.includes(challenge.id) 
                ? `border-indigo-500 bg-gradient-to-br ${challenge.gradient} bg-opacity-20` 
                : 'border-white/10'
            }`}
          >
            <div className="text-center">
              <span className="text-4xl mb-3 block">{challenge.icon}</span>
              <h3 className="font-bold text-white text-lg">{challenge.label}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center max-w-md mx-auto">
        <button 
          onClick={() => setStep(2)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all hover:scale-105"
        >
          ← Înapoi
        </button>
        <button 
          onClick={handleNextStep}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-white transition-all hover:scale-105"
        >
          Continuă →
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Alege ecosistemele tale</h1>
        <p className="text-white/70">
          Începi cu 2 ecosisteme gratuite. Poți adăuga altele oricând.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ecosystemOptions.map(ecosystem => (
          <div
            key={ecosystem.id}
            className={`relative p-6 bg-white/5 backdrop-blur-xl border rounded-2xl transition-all hover:scale-105 ${
              ecosystem.tier === 'FREE' 
                ? `cursor-pointer hover:bg-white/10 ${onboardingData.ecosystemInterest.includes(ecosystem.id) ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-white/10'}` 
                : 'border-white/10 opacity-75'
            }`}
            onClick={() => {
              if (ecosystem.tier === 'FREE') {
                handleArrayToggle(onboardingData.ecosystemInterest, ecosystem.id, updateOnboardingData);
              }
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl">{ecosystem.icon}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                ecosystem.tier === 'FREE' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {ecosystem.tier}
              </span>
            </div>
            <h3 className="font-bold text-white text-xl mb-2">{ecosystem.name}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{ecosystem.description}</p>
            {ecosystem.tier === 'PREMIUM' && (
              <div className="mt-4 text-center">
                <span className="text-sm text-amber-400 font-medium">Disponibil cu upgrade</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center max-w-md mx-auto">
        <button 
          onClick={() => setStep(3)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all hover:scale-105"
        >
          ← Înapoi
        </button>
        <button 
          onClick={handleCompleteSignup} 
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Se creează contul...</span>
            </div>
          ) : (
            '🎉 Finalizează contul'
          )}
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-pulse">
          <span className="text-5xl">🎉</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Bine ai venit în PorVerse!</h1>
        <p className="text-xl text-white/80">
          Contul tău a fost creat cu succes. În câteva secunde vei fi redirecționat către dashboard.
        </p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-4">Ecosistemele tale active:</h3>
        <div className="flex justify-center space-x-6">
          <div className="flex items-center space-x-3 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
            <span className="text-2xl">🌿</span>
            <span className="font-semibold text-white">PorHealth</span>
          </div>
          <div className="flex items-center space-x-3 px-4 py-3 bg-pink-500/20 border border-pink-500/30 rounded-xl">
            <span className="text-2xl">👶</span>
            <span className="font-semibold text-white">PorKids</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/30"></div>
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
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
              {step > 1 && step < 5 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/60">Pas {step-1}/3</span>
                  <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 py-16 px-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
}