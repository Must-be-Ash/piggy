"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, Wallet, Shield, Zap } from "lucide-react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Remove automatic redirect - let users stay on homepage if they want

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Accept Crypto Tips in
            <span className="text-purple-600"> Any Token</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your personalized donation page and receive support from your community in their favorite
            cryptocurrency across multiple blockchains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!mounted ? (
              // Show default state during SSR to prevent hydration mismatch
              <>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Start My Page
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4"
                  onClick={() => router.push("/u/demo")}
                >
                  View Demo
                </Button>
              </>
            ) : !isConnected ? (
              <>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                  onClick={() => setShowAuthModal(true)}
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Start My Page
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4"
                  onClick={() => router.push("/u/demo")}
                >
                  View Demo
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4"
                  onClick={() => router.push("/onboarding")}
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Setup/Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CryptoCoffee?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The easiest way to accept cryptocurrency donations with maximum flexibility and security.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Wallet className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Any Token, Any Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Accept donations in any ERC-20 token across Ethereum, Base, Polygon, Arbitrum, Optimism, and BSC.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Instant Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect your wallet and your donation page is live instantly. No KYC, no waiting, no custodial holds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Non-Custodial</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Donations go directly to your wallet. We never hold your funds or have access to your private keys.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your crypto wallet to create your account instantly</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize Page</h3>
              <p className="text-gray-600">Add your bio, avatar, and customize your donation page</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Receive</h3>
              <p className="text-gray-600">Share your unique link and start receiving crypto donations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Get Started</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <AuthModal 
                title="Connect Your Wallet"
                description="Connect your wallet to create your crypto donation page"
                className="shadow-none border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
