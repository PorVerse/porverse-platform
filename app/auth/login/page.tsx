// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email && formData.password) {
        localStorage.setItem('porverse_auth', JSON.stringify({
          user: {
            id: 'user_123',
            email: formData.email,
            name: formData.email.split('@')[0],
            subscription: 'free',
            ecosystems: ['por-health', 'por-kids']
          },
          token: 'mock_jwt_token_' + Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        router.push('/dashboard');
      } else {
        throw new Error('Email și parola sunt obligatorii');
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('porverse_auth', JSON.stringify({
        user: {
          id: 'user_social_123',
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
      setError('Eroare la autentificarea cu ' + provider);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex">
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

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
              <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🧠</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                PorVerse
              </span>
            </Link>
            
            <h1 className="text-3xl font-black text-white mb-2">Bine ai revenit!</h1>
            <p className="text-white/70">
              Continuă-ți transformarea cu PorVerse
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-300 animate-pulse">
                <span className="text-xl">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email
                </label>
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
                    placeholder="adresa@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  Parolă
                </label>
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
                    placeholder="Introdu parola"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-500 bg-white/10 border border-white/20 rounded focus:ring-indigo-500 focus:ring-2"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-white/70">Ține-mă conectat</span>
                </label>

                <Link href="/auth/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Am uitat parola
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-105 disabled:hover:scale-100 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Se conectează...</span>
                  </div>
                ) : (
                  '🚀 Conectează-te'
                )}
              </button>
            </form>

            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-sm text-white/60 font-medium">sau continuă cu</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group"
              >
                <div className="text-center">
                  <span className="text-xl group-hover:scale-110 transition-transform block">🔍</span>
                  <span className="text-xs text-white/70 font-medium">Google</span>
                </div>
              </button>
              
              <button
                onClick={() => handleSocialLogin('microsoft')}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group"
              >
                <div className="text-center">
                  <span className="text-xl group-hover:scale-110 transition-transform block">🪟</span>
                  <span className="text-xs text-white/70 font-medium">Microsoft</span>
                </div>
              </button>
              
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group"
              >
                <div className="text-center">
                  <span className="text-xl group-hover:scale-110 transition-transform block">🍎</span>
                  <span className="text-xs text-white/70 font-medium">Apple</span>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">
                Nu ai cont încă?{' '}
                <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                  Creează cont gratuit
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
              ← Înapoi la homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits & Preview */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Ecosistemele tale te așteaptă
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <span className="text-3xl">🌿</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">PorHealth</div>
                  <div className="text-sm text-white/70">AI nutrition planner și workout optimizer</div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                  FREE
                </span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <span className="text-3xl">👶</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">PorKids</div>
                  <div className="text-sm text-white/70">Homework scanner și family dashboard</div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                  FREE
                </span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <span className="text-3xl">🧠</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">PorMind</div>
                  <div className="text-sm text-white/70">Financial planning și investment AI</div>
                </div>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-bold">
                  PREMIUM
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 text-center">
              <p className="text-white/90 mb-4">Upgrade pentru acces complet la toate ecosistemele</p>
              <Link 
                href="/pricing" 
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold text-white transition-all hover:scale-105"
              >
                <span>🎯</span>
                <span>Vezi prețurile</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <span className="text-3xl">👨‍💻</span>
              <div>
                <div className="text-white/90 italic mb-3">
                  "PorVerse mi-a transformat complet rutina zilnică. În 2 luni am optimizat sănătatea și productivitatea."
                </div>
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-white">Alex Popescu</div>
                  <div className="text-sm text-white/60">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}