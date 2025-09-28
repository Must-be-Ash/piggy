'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'pink' | 'red' | 'small';
  type?: 'button' | 'submit' | 'reset';
}

export function ModernButton({
  children,
  onClick,
  disabled = false,
  className,
  variant = 'primary',
  type = 'button',
}: ModernButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative px-6 py-3 rounded-full font-medium text-white transition-all duration-200 border-0 cursor-pointer',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
        variant === 'primary' && [
          'bg-gradient-to-b from-[#4a4a4a] via-[#3a3a3a] to-[#2a2a2a]',
          'hover:from-[#5a5a5a] hover:via-[#4a4a4a] hover:to-[#3a3a3a]',
          'active:from-[#3a3a3a] active:via-[#2a2a2a] active:to-[#1a1a1a]',
          'hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'active:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)]'
        ],
        variant === 'pink' && [
          'bg-gradient-to-b from-[#EC9AA6] via-[#d1707e] to-[#c45a6b]',
          'hover:from-[#f0a5b0] hover:via-[#d9808a] hover:to-[#d06b7a]',
          'active:from-[#d1707e] active:via-[#c45a6b] active:to-[#b74a5c]',
          'hover:shadow-[0_12px_40px_rgba(236,154,166,0.4),0_4px_12px_rgba(236,154,166,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'active:shadow-[0_4px_16px_rgba(236,154,166,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)]'
        ],
        variant === 'red' && [
          'bg-gradient-to-b from-[#ff6b6b] via-[#ff5252] to-[#e53935]',
          'hover:from-[#ff7a7a] hover:via-[#ff6363] hover:to-[#f44336]',
          'active:from-[#ff5252] active:via-[#e53935] active:to-[#d32f2f]',
          'hover:shadow-[0_12px_40px_rgba(255,107,107,0.4),0_4px_12px_rgba(255,107,107,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
          'active:shadow-[0_4px_16px_rgba(255,107,107,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)]'
        ],
        variant === 'small' && [
          'px-4 py-2 text-sm',
          'bg-gradient-to-b from-[#4a4a4a] via-[#3a3a3a] to-[#2a2a2a]',
          'hover:from-[#5a5a5a] hover:via-[#4a4a4a] hover:to-[#3a3a3a]',
          'active:from-[#3a3a3a] active:via-[#2a2a2a] active:to-[#1a1a1a]',
          'hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'active:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)]'
        ],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        'hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
          : variant === 'pink' 
          ? 'linear-gradient(145deg, #EC9AA6 0%, #d1707e 50%, #c45a6b 100%)'
          : variant === 'red'
          ? 'linear-gradient(145deg, #ff6b6b 0%, #ff5252 50%, #e53935 100%)'
          : variant === 'small'
          ? 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
          : undefined,
      }}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none" />
      
      {/* Bottom shadow accent */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-1 bg-black/20 rounded-full blur-sm" />
    </button>
  );
}
