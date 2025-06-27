"use client"

import { useEffect, useState } from "react"
import { LoadingState } from "@/components/loading-state"

// Force dynamic rendering for any page that uses this wrapper
export const dynamic = 'force-dynamic'

interface WithWagmiProps {
  children: React.ReactNode
  loadingTitle?: string
  loadingDescription?: string
}

/**
 * Higher-order component that safely wraps pages using wagmi hooks
 * Prevents SSG issues by ensuring the component only renders after mount
 */
export function WithWagmi({ 
  children, 
  loadingTitle = "Loading...", 
  loadingDescription = "Preparing your experience..." 
}: WithWagmiProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <LoadingState 
        title={loadingTitle}
        description={loadingDescription}
        showProgress={true}
        showSkeleton={false}
      />
    )
  }

  return <>{children}</>
}

/**
 * HOC factory function to wrap page components
 */
export function withWagmi<T extends object>(
  Component: React.ComponentType<T>,
  loadingTitle?: string,
  loadingDescription?: string
) {
  const WrappedComponent = (props: T) => (
    <WithWagmi loadingTitle={loadingTitle} loadingDescription={loadingDescription}>
      <Component {...props} />
    </WithWagmi>
  )
  
  WrappedComponent.displayName = `withWagmi(${Component.displayName || Component.name})`
  return WrappedComponent
} 