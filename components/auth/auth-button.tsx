"use client"

import { ButtonHTMLAttributes, useState } from "react"

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AuthButton({
  children,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative inline-block"
      style={{
        minWidth: '128px',
      }}
    >
      {/* Background layer (::before) */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          zIndex: 1,
        }}
      />

      {/* Inner layer (::after) */}
      <div
        className="absolute rounded-[18px] pointer-events-none transition-all duration-200"
        style={{
          top: '2px',
          left: '2px',
          right: '2px',
          bottom: '3px',
          background: disabled
            ? 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
            : isPressed
            ? 'linear-gradient(145deg, #5a5a5a 0%, #4a4a4a 50%, #3a3a3a 100%)'
            : isHovered
            ? 'linear-gradient(145deg, #7a7a7a 0%, #6a6a6a 50%, #5a5a5a 100%)'
            : 'linear-gradient(145deg, #6a6a6a 0%, #5a5a5a 50%, #4a4a4a 100%)',
          boxShadow: disabled
            ? 'inset 0 1px 2px rgba(0,0,0,0.3)'
            : isPressed
            ? 'inset 0 1px 2px rgba(0,0,0,0.3)'
            : isHovered
            ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)'
            : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.3)',
          transform: disabled ? 'translateY(2px)' : isPressed ? 'translateY(2px)' : isHovered ? 'translateY(0.25px)' : 'translateY(-1px)',
          zIndex: 2,
        }}
      />

      {/* Button */}
      <button
        {...props}
        disabled={disabled}
        className={`relative inline-flex items-center justify-center gap-1 px-3 py-[12px] rounded-[20px] font-medium bg-transparent border-none min-w-full text-xs transition-all duration-200 ${disabled ? 'cursor-not-allowed text-white/40' : 'cursor-pointer text-white'} ${className}`}
        style={{
          zIndex: 10,
          transform: disabled ? 'translateY(2px)' : isPressed ? 'translateY(2px)' : isHovered ? 'translateY(0.25px)' : 'translateY(-1px)',
        }}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => {
          setIsPressed(false)
          setIsHovered(false)
        }}
      >
        {children}
      </button>
    </div>
  )
}