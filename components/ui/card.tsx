// components/ui/card.tsx
import React from 'react'

export function Card({ children, className = '', ...props }: any) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '', ...props }: any) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: any) {
  return (
    <div className={`p-4 pb-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }: any) {
  return (
    <h3 className={`font-semibold text-lg ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }: any) {
  return (
    <p className={`text-gray-600 text-sm ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardFooter({ children, className = '', ...props }: any) {
  return (
    <div className={`p-4 pt-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
