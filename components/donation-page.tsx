"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { Header } from "@/components/header"
import { DonateButton } from "@/components/donate-button"
import { CopyLinkButton, ShareButton } from "@/components/copy-link-button"

interface User {
  id: string
  address: string
  displayName: string
  bio?: string
  slug: string
  createdAt: string
}

interface DonationPageProps {
  user: User
}

export function DonationPage({ user }: DonationPageProps) {
  const { address } = useAccount()
  const isOwnPage = address && user.address ? address.toLowerCase() === user.address.toLowerCase() : false
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    setPageUrl(`${window.location.origin}/u/${user.slug}`)
  }, [user.slug])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <Header />

      {/* Profile Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{user.displayName.charAt(0).toUpperCase()}</span>
              </div>
              <CardTitle className="text-3xl">{user.displayName}</CardTitle>
              {user.bio && <CardDescription className="text-lg mt-2">{user.bio}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>Wallet:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/address/${user.address}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {!isOwnPage ? (
                <DonateButton
                  recipientAddress={user.address}
                  recipientName={user.displayName}
                  variant="heart"
                  size="lg"
                  className="text-lg px-8 py-4"
                />
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">This is your donation page!</p>
                    <p className="text-blue-600 text-sm mt-1">
                      Share the link below to start receiving crypto donations from your supporters.
                    </p>
                  </div>
                  
                  {/* Sharing Options */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <CopyLinkButton url={pageUrl} />
                    <ShareButton platform="twitter" url={pageUrl} text={`Support ${user.displayName} with crypto donations!`} />
                    <ShareButton platform="telegram" url={pageUrl} text={`Check out ${user.displayName}'s donation page`} />
                    <ShareButton platform="whatsapp" url={pageUrl} text={`Support ${user.displayName} with crypto`} />
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Powered by <span className="font-semibold">CryptoCoffee</span> • Accept donations in any token across
                  multiple blockchains
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
