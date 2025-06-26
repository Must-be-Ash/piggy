'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonShimmerProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
}

export function ButtonShimmer({
  children,
  className,
  duration = 2.5,
  onClick,
  size = 'default',
}: ButtonShimmerProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-sm',
        'overflow-hidden cursor-pointer transition-all duration-300',
        'bg-white/15 backdrop-blur-sm text-white border border-white/30',
        'hover:bg-white/25 hover:scale-105 hover:border-white/40',
        'shadow-lg shadow-black/20',
        'before:absolute before:inset-0 before:bg-gradient-to-r',
        'before:from-transparent before:via-white/40 before:to-transparent',
        'before:translate-x-[-100%] before:animate-shimmer',
        'after:absolute after:inset-0 after:bg-gradient-to-r',
        'after:from-transparent after:via-white/20 after:to-transparent',
        'after:translate-x-[-100%] after:animate-shimmer',
        'after:animation-delay-1000',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        animationDelay: '0.5s',
      }}
    >
      <span className="relative z-10 font-semibold">{children}</span>
    </motion.button>
  );
} 