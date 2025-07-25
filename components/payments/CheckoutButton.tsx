// components/payments/CheckoutButton.tsx
'use client'

import { useState } from 'react'
import { Loader2, CreditCard, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CheckoutButtonProps {
  plan: {
    id: string
    name: string
    type: 'free' | 'upgrade' | 'premium' | 'bundle'
    price?: number
    currency?: string
  }
  billingCycle: 'monthly' | 'yearly'
  className?: string
  children?: React.ReactNode
}

export default function CheckoutButton({
  plan,
  billingCycle,
  className = "",
  children
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      // Handle FREE plans - redirect to signup/dashboard
      if (plan.type === 'free' || plan.price === 0) {
        const response = await fetch('/api/auth/free-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            planType: plan.type
          })
        })

        const data = await response.json()

        if (response.ok) {
          window.location.href = data.redirect || '/dashboard?welcome=true'
        } else {
          // User needs to signup first
          window.location.href = `/auth/signup?plan=${plan.id}`
        }
        return
      }

      // Handle PAID plans - create checkout session
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          planType: plan.type,
          price: plan.price,
          currency: plan.currency,
          billingCycle,
          paymentMethod: 'stripe' // Default to Stripe
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to payment provider
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Eroare la procesarea comenzii')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (plan.type === 'free') {
      return '🚀 Începe GRATUIT'
    }
    if (plan.type === 'upgrade') {
      return '⚡ Upgrade Premium'
    }
    if (plan.type === 'bundle') {
      return '🔮 Unlock Bundle'
    }
    return '🚀 Începe Transformarea'
  }

  const getButtonStyle = () => {
    if (plan.type === 'free') {
      return 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
    }
    if (plan.type === 'upgrade') {
      return 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
    }
    if (plan.type === 'bundle') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    }
    return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
  }

  if (children) {
    return (
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Se procesează...</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed ${getButtonStyle()} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Se procesează...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <span>{getButtonText()}</span>
          {plan.price && plan.price > 0 && (
            <span className="text-sm opacity-90">
              {plan.currency === 'RON' ? '' : '$'}{plan.price}/{billingCycle === 'yearly' ? 'an' : 'lună'}
            </span>
          )}
        </div>
      )}
    </button>
  )
}