"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ButtonShimmer } from "@/components/ui/button-shimmer"
import { GlassmorphicButton } from "@/components/ui/glassmorphic-button"

export default function CryptoTipLanding() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const forwardVideoRef = useRef<HTMLVideoElement>(null)
  const backwardVideoRef = useRef<HTMLVideoElement>(null)
  const [isPlayingBackward, setIsPlayingBackward] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const forwardVideo = forwardVideoRef.current
    const backwardVideo = backwardVideoRef.current
    if (!forwardVideo || !backwardVideo) return

    const handleForwardVideoEnd = () => {
      // Seamlessly switch to backward video
      forwardVideo.style.opacity = '0'
      backwardVideo.style.opacity = '1'
      backwardVideo.play()
      setIsPlayingBackward(true)
    }

    const handleBackwardVideoEnd = () => {
      // Seamlessly switch to forward video
      backwardVideo.style.opacity = '0'
      forwardVideo.style.opacity = '1'
      forwardVideo.play()
      setIsPlayingBackward(false)
    }

    const handleForwardLoadedMetadata = () => {
      if (!isPlayingBackward) {
        forwardVideo.play()
      }
    }

    const handleBackwardLoadedMetadata = () => {
      // Backward video starts hidden and ready
      backwardVideo.style.opacity = '0'
    }

    forwardVideo.addEventListener('ended', handleForwardVideoEnd)
    backwardVideo.addEventListener('ended', handleBackwardVideoEnd)
    forwardVideo.addEventListener('loadedmetadata', handleForwardLoadedMetadata)
    backwardVideo.addEventListener('loadedmetadata', handleBackwardLoadedMetadata)
    
    return () => {
      forwardVideo.removeEventListener('ended', handleForwardVideoEnd)
      backwardVideo.removeEventListener('ended', handleBackwardVideoEnd)
      forwardVideo.removeEventListener('loadedmetadata', handleForwardLoadedMetadata)
      backwardVideo.removeEventListener('loadedmetadata', handleBackwardLoadedMetadata)
    }
  }, [isPlayingBackward])

  const handleGetStarted = () => {
    if (!mounted) return
    
    if (isConnected) {
      router.push("/dashboard")
    } else {
      router.push("/onboarding")
    }
  }
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[80vh] lg:h-screen flex items-center overflow-hidden">
        {/* Background - Video for desktop, Image for mobile */}
        <div className="absolute inset-0 z-0">
          {/* Desktop Videos */}
          <div className="hidden md:block relative w-full h-full">
            {/* Forward Video */}
            <video 
              ref={forwardVideoRef}
              autoPlay 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: 1 }}
            >
              <source src="/piggy.mp4" type="video/mp4" />
            </video>
            {/* Backward Video */}
            <video 
              ref={backwardVideoRef}
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: 0 }}
            >
              <source src="/piggyback.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Mobile Image */}
          <div className="block md:hidden w-full h-full bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `url('/mobile.png')`
          }} />
          {/* Dark atmospheric overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          {/* Additional texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-8 flex items-center min-h-[80vh] lg:min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl -mt-16 lg:mt-0"
          >
            <h1 className="text-6xl lg:text-8xl font-pp-editorial font-medium text-white leading-[0.9] mb-2 tracking-tight">
              Get Tips In<br />
              <span className="font-semibold mt-3 lg:mt-2 block">Any Tokens</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl lg:text-2xl text-white/70 max-w-2xl leading-relaxed font-cormorant font-light mb-12"
            >
              receive donations and tips from people<br />
              all around the world on any EVM chain
            </motion.p>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <ButtonShimmer
                size="lg"
                className="font-pp-editorial font-light shadow-2xl shadow-white/10"
                onClick={handleGetStarted}
                duration={3}
              >
                Get Started
              </ButtonShimmer>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-[#fdf8f3]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/piggy.png"
                  alt="Save and Collect Tips"
                  width={200}
                  height={200}
                  className="mx-auto rounded-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Save & Collect</h3>
              <p className="text-lg text-[#6b7280] font-medium">Receive and save tips from your supporters in a secure, non-custodial way</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/tipper.png"
                  alt="Multi-Chain Support"
                  width={200}
                  height={200}
                  className="mx-auto rounded-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Multi-Chain Support</h3>
              <p className="text-lg text-[#6b7280] font-medium">Accept tips on any EVM network including Ethereum, Base, Polygon, and more</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/tip.png"
                  alt="Any Token Support"
                  width={200}
                  height={200}
                  className="mx-auto rounded-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Any Token</h3>
              <p className="text-lg text-[#6b7280] font-medium">Get tipped in any cryptocurrency token your supporters have in their wallet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 lg:py-16 pb-24 lg:pb-32 bg-[#fdf8f3]">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-black mb-8">Start receiving tips today</h2>
            <p className="text-xl text-[#6b7280] mb-12 max-w-2xl mx-auto">
              Join thousands of creators already earning crypto tips from their community
            </p>
            <GlassmorphicButton
              variant="accent"
              size="lg"
              onClick={handleGetStarted}
            >
              Get Started
            </GlassmorphicButton>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
