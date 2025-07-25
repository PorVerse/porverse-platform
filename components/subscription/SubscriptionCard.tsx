// components/subscription/SubscriptionCard.tsx
'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { usePayments } from '@/hooks/usePayments'
import { usePricing } from '@/hooks/usePricing'

export default function SubscriptionCard() {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const { 
    subscriptionStatus, 
    hasActiveSubscription, 
    getCurrentPlan, 
    getExpiryDate,
    isExpiringSoon,
    isInTrial,
    getTrialEndDate
  } = useSubscription()
  
  const { 
    cancelSubscription, 
    openCustomerPortal, 
    loading 
  } = usePayments()
  
  const { formatPrice, selectedTier } = usePricing()

  if (!subscriptionStatus) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const planName = getCurrentPlan()
  const expiryDate = getExpiryDate()
  const trialEndDate = getTrialEndDate()

  const planDisplayNames = {
    free: 'Free Plan',
    individual: 'Individual Plan',
    dual: 'Dual Pack',
    trinity: 'Trinity Pack',
    complete: 'Complete Pack'
  }

  const planIcons = {
    free: '🆓',
    individual: '⭐',
    dual: '💎',
    trinity: '🔮',
    complete: '👑'
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{planIcons[planName as keyof typeof planIcons]}</span>
          <div>
            <h3 className="text-xl font-bold text-white">
              {planDisplayNames[planName as keyof typeof planDisplayNames]}
            </h3>
            <p className="text-white/70 text-sm">
              {hasActiveSubscription() ? 'Active Subscription' : 'No Active Subscription'}
            </p>
          </div>
        </div>
        
        {hasActiveSubscription() && (
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isInTrial() 
                ? 'bg-blue-500/20 text-blue-300' 
                : isExpiringSoon() 
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-green-500/20 text-green-300'
            }`}>
              {isInTrial() ? '🎁 Trial Active' : '✅ Active'}
            </div>
          </div>
        )}
      </div>

      {/* Subscription Details */}
      {hasActiveSubscription() && (
        <div className="space-y-4 mb-6">
          {isInTrial() && trialEndDate && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">🎁 Trial Period Active</h4>
              <p className="text-white/80 text-sm">
                Your free trial ends on {new Date(trialEndDate).toLocaleDateString()}
              </p>
              <p className="text-blue-300 text-sm mt-1">
                No charges until trial expires
              </p>
            </div>
          )}

          {expiryDate && (
            <div className={`rounded-lg p-4 ${
              isExpiringSoon() 
                ? 'bg-yellow-500/10 border border-yellow-500/30' 
                : 'bg-white/5 border border-white/10'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Next billing date:</span>
                <span className={`font-semibold ${
                  isExpiringSoon() ? 'text-yellow-300' : 'text-white'
                }`}>
                  {new Date(expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Accessible Ecosystems */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">🌟 Your Access</h4>
            <div className="grid grid-cols-2 gap-2">
              {subscriptionStatus.ecosystems?.map((ecosystem: any) => (
                <div 
                  key={ecosystem.ecosystem}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    ecosystem.access_level === 'premium' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <span className="text-xs">
                    {ecosystem.access_level === 'premium' ? '✅' : '🔒'}
                  </span>
                  <span className="text-sm font-medium">
                    {ecosystem.ecosystem.replace('por-', '').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Vault Access */}
          {subscriptionStatus.quantumVault && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔮</span>
                <h4 className="font-semibold text-purple-300">Quantum Vault Unlocked</h4>
              </div>
              <p className="text-white/80 text-sm">
                Access to Future Self, Identity Simulator, and advanced AI features
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {hasActiveSubscription() ? (
          <>
            <button
              onClick={openCustomerPortal}
              disabled={loading}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Loading...' : '⚙️ Manage Billing'}
            </button>
            
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-3 border border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            🚀 Upgrade Now
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Cancel Subscription</h3>
            <p className="text-white/80 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Keep Subscription
              </button>
              
              <button
                onClick={async () => {
                  await cancelSubscription(false)
                  setShowCancelConfirm(false)
                }}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// components/subscription/EcosystemAccess.tsx
'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

interface EcosystemAccessProps {
  ecosystem: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function EcosystemAccess({ 
  ecosystem, 
  children, 
  fallback 
}: EcosystemAccessProps) {
  const { hasEcosystemAccess } = useSubscription()
  const router = useRouter()

  const hasAccess = hasEcosystemAccess(ecosystem)

  if (!hasAccess) {
    return fallback || (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-bold text-white mb-2">Premium Access Required</h3>
        <p className="text-white/70 mb-6">
          Upgrade to access {ecosystem.replace('por-', '').toUpperCase()} features and AI capabilities
        </p>
        
        <button
          onClick={() => router.push('/pricing')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
        >
          🚀 Upgrade Now
        </button>
      </div>
    )
  }

  return <>{children}</>
}

// components/subscription/QuantumVaultAccess.tsx
'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

interface QuantumVaultAccessProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function QuantumVaultAccess({ 
  children, 
  fallback 
}: QuantumVaultAccessProps) {
  const { hasQuantumVault } = useSubscription()
  const router = useRouter()

  if (!hasQuantumVault()) {
    return fallback || (
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-2xl font-bold text-white mb-2">Quantum Vault Locked</h3>
          <p className="text-white/70 mb-4">
            Unlock the Quantum Vault with Trinity Pack or Complete Pack
          </p>
          <p className="text-purple-300 text-sm mb-6">
            ✨ Future Self AI • 🎭 Identity Simulator • 🗺️ Reverse Roadmap • 🪞 Mirror Conversations
          </p>
          
          <button
            onClick={() => router.push('/pricing#trinity')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            🔓 Unlock Quantum Vault
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// components/subscription/TrialBanner.tsx
'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

export default function TrialBanner() {
  const { isInTrial, getTrialEndDate } = useSubscription()
  const router = useRouter()

  if (!isInTrial()) return null

  const trialEndDate = getTrialEndDate()
  const daysLeft = trialEndDate 
    ? Math.ceil((new Date(trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <h4 className="font-semibold text-blue-300">Free Trial Active</h4>
            <p className="text-white/80 text-sm">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Trial ending soon'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/pricing')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 text-sm"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  )
}

// components/subscription/UsageProgress.tsx
'use client'

import { useSubscription } from '@/hooks/useSubscription'

export default function UsageProgress() {
  const { subscriptionStatus, getCurrentPlan } = useSubscription()
  
  // Mock usage data - in real app, this would come from usage tracking
  const usageData = {
    aiRequests: { used: 150, limit: getCurrentPlan() === 'free' ? 50 : 1000 },
    storageGB: { used: 2.3, limit: getCurrentPlan() === 'free' ? 1 : 50 },
    ecosystems: { used: subscriptionStatus?.ecosystems?.length || 0, limit: getCurrentPlan() === 'free' ? 1 : 6 }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400 bg-red-500/20'
    if (percentage >= 75) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📊 Usage Overview</h3>
      
      <div className="space-y-4">
        {Object.entries(usageData).map(([key, data]) => {
          const percentage = getUsagePercentage(data.used, data.limit)
          const colorClass = getUsageColor(percentage)
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 capitalize">
                  {key === 'aiRequests' ? 'AI Requests' : key === 'storageGB' ? 'Storage' : 'Ecosystems'}
                </span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${colorClass}`}>
                  {data.used} / {data.limit} {key === 'storageGB' ? 'GB' : ''}
                </span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    percentage >= 90 ? 'bg-red-500' : 
                    percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {getCurrentPlan() === 'free' && (
        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <p className="text-indigo-300 text-sm font-medium">
            💡 Upgrade for unlimited AI requests and more storage
          </p>
        </div>
      )}
    </div>
  )
}