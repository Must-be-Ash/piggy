import { Snout } from "@/components/ui/snout"

interface LoadingStateProps {
  title?: string
  description?: string
  showProgress?: boolean
  showSkeleton?: boolean
}

export function LoadingState({ 
  title = "Loading...", 
  description = "Please wait while we prepare your experience...",
  showProgress = true,
  showSkeleton = true
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Snout icon with animation */}
        <div className="relative mb-8">
          <div className="w-16 h-16 mx-auto animate-pulse">
            <Snout className="w-full h-full text-[#2d3748]" />
          </div>
        </div>

        {/* Loading text with improved typography */}
        <div className="space-y-4 mb-8">
          <h3 className="text-2xl font-bold text-[#1a202c] tracking-tight">{title}</h3>
          <p className="text-[#718096] leading-relaxed">{description}</p>
        </div>

        {/* Progress indicator */}
        {showProgress && (
          <div className="space-y-3 mb-8">
            <div className="flex justify-center">
              <div className="w-48 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2d3748] to-[#4a5568] rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
            <p className="text-xs text-[#a0aec0] font-medium">Setting up your workspace...</p>
          </div>
        )}

        {/* Skeleton cards preview */}
        {showSkeleton && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-[#f1f5f9] rounded w-1/3"></div>
                  <div className="h-3 bg-[#f1f5f9] rounded w-16"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-[#f1f5f9] rounded w-1/4"></div>
                  <div className="h-8 bg-[#f1f5f9] rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-[#f1f5f9] rounded w-1/3"></div>
                  <div className="h-16 bg-[#f1f5f9] rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 