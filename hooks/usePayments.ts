// hooks/usePayments.ts
import { useState } from 'react'

export const usePayments = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createStripeCheckout = async (planId: string, cycle = 'monthly') => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: cycle })
      })
      
      const data = await response.json()
      if (data.url) window.location.href = data.url
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createPayPalSubscription = async (planId: string, cycle = 'monthly') => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/paypal/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: cycle })
      })
      
      const data = await response.json()
      if (data.approval_url) window.location.href = data.approval_url
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createStripeCheckout,
    createPayPalSubscription
  }
}
