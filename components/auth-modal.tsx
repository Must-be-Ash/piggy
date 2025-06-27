"use client"

import { DynamicWidget } from "@dynamic-labs/sdk-react-core"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface AuthModalProps {
  title?: string
  description?: string
  className?: string
}

export function AuthModal({ 
  title = "Connect Your Wallet", 
  description = "Connect your wallet to get started with PiggyBanks",
  className = ""
}: AuthModalProps) {
  return (
    <Card className={`w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#EC9AA6] rounded-full shadow-lg">
            <Wallet className="h-8 w-8 text-black" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[#1a202c]">{title}</CardTitle>
        <CardDescription className="text-[#718096]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <DynamicWidget />
      </CardContent>
    </Card>
  )
} 