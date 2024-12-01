'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large' }) => (
  <div className={`border-4 border-green-500 border-t-transparent rounded-full animate-spin ${size === 'small' ? 'w-6 h-6' : 'w-16 h-16'}`}></div>
)

export const SuccessCheck: React.FC = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 bg-green-500 rounded-full animate-success-bg"></div>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 52 52">
      <path
        className="animate-success-check"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  </div>
)

export const Confetti: React.FC = () => (
  <div className="fixed inset-0 w-full h-full pointer-events-none z-50">
    {[...Array(100)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 rounded-full animate-confetti"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      ></div>
    ))}
  </div>
)

