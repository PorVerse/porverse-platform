// components/payments/StripeCheckout.tsx
'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface StripeCheckoutProps {
  planId: string
  planName: string
  price: number
  currency: string
  className?: string
  children?: React.ReactNode
}

export default function StripeCheckout({
  planId,
  planName,
  price,
  currency,
  className = "",
  children
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleStripeCheckout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          planName,
          price,
          currency,
          paymentMethod: 'stripe'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe checkout')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from Stripe')
      }

    } catch (error: any) {
      console.error('Stripe checkout error:', error)
      toast.error(error.message || 'Eroare la inițializarea plății cu cardul')
    } finally {
      setLoading(false)
    }
  }

  if (children) {
    return (
      <button
        onClick={handleStripeCheckout}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Stripe...</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleStripeCheckout}
      disabled={loading}
      className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Card...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>Card</span>
        </>
      )}
    </button>
  )
}