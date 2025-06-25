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
  description = "Connect your wallet to get started with CryptoCoffee",
  className = ""
}: AuthModalProps) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Wallet className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <DynamicWidget />
      </CardContent>
    </Card>
  )
} 