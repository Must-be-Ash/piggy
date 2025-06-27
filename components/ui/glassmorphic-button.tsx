"use client"

import { motion } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface GlassmorphicButtonProps {
  children: React.ReactNode
  variant?: "default" | "accent"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

const GlassmorphicButton = forwardRef<HTMLButtonElement, GlassmorphicButtonProps>(
  ({ children, variant = "default", size = "md", className, onClick, disabled, type = "button" }, ref) => {
    const sizeClasses = {
      sm: "px-6 py-2 text-sm",
      md: "px-8 py-3 text-base",
      lg: "px-12 py-4 text-lg"
    }

    const variantClasses = {
      default: "from-white/60 to-white/40 border-white/70 text-white hover:from-white/80 hover:to-white/60",
      accent: "from-[#ffd6e0] to-[#ffb3c6] border-[#EC9AA6] text-black hover:from-[#EC9AA6] hover:to-[#EC9AA6]/90"
    }

    return (
      <motion.button
        ref={ref}
        initial={{ 
          scale: 1,
          filter: "brightness(1) saturate(1)",
        }}
        whileHover={{
          scale: 1.03,
          filter: "brightness(1.15) saturate(1.3) contrast(1.05)",
          rotateX: 3,
          rotateY: 2,
          z: 30,
          boxShadow: variant === "accent" 
            ? "0 20px 50px rgba(0, 0, 0, 0.25), 0 35px 100px rgba(236, 154, 166, 0.6), 0 12px 30px rgba(236, 154, 166, 0.5), 0 0 0 1px rgba(236, 154, 166, 0.4), inset 0 4px 0 rgba(255, 255, 255, 0.7), inset 0 -4px 0 rgba(0, 0, 0, 0.25), inset 0 0 0 2px rgba(255, 255, 255, 0.4)"
            : "0 20px 50px rgba(0, 0, 0, 0.3), 0 35px 100px rgba(255, 255, 255, 0.4), 0 12px 30px rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 4px 0 rgba(255, 255, 255, 0.7), inset 0 -4px 0 rgba(0, 0, 0, 0.25), inset 0 0 0 2px rgba(255, 255, 255, 0.4)",
        }}
        whileTap={{
          scale: 0.98,
          filter: "brightness(0.95) saturate(1.1)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.8,
          duration: 0.6,
        }}
        className={cn(
          // Base styles
          "relative font-semibold rounded-2xl border backdrop-blur-xl overflow-hidden group",
          "transform-gpu will-change-transform",
          // 3D perspective
          "transform-style-preserve-3d",
          // Gradient background
          `bg-gradient-to-br ${variantClasses[variant]}`,
          // Enhanced glass effect
          "shadow-xl",
          // Continuous gentle shimmer effect - more visible
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:translate-x-[-100%] before:animate-gentle-shimmer before:z-20",
          // Enhanced shimmer on hover
          "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-1000 after:ease-in-out after:z-30 after:opacity-0 hover:after:opacity-100",
          // Size
          sizeClasses[size],
          // Smooth transitions
          "transition-all duration-200 ease-out",
          className
        )}
        style={{
          boxShadow: variant === "accent" 
            ? "0 8px 25px rgba(0, 0, 0, 0.15), 0 12px 40px rgba(236, 154, 166, 0.4), 0 4px 12px rgba(236, 154, 166, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2)"
            : "0 8px 25px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
          transform: "translateZ(0) perspective(1000px)",
        }}
         onClick={onClick}
         disabled={disabled}
         type={type}
       >
        {/* Additional gentle shimmer for accent variant - more visible */}
        {variant === "accent" && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#EC9AA6]/35 to-transparent translate-x-[-100%] animate-gentle-shimmer-accent z-10" />
        )}
        
        {/* Content wrapper for proper layering */}
        <span className="relative z-40 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    )
  }
)

GlassmorphicButton.displayName = "GlassmorphicButton"

export { GlassmorphicButton } 