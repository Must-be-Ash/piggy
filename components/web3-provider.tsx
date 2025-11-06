"use client"

import { CDPHooksProvider } from "@coinbase/cdp-hooks"
import { CDPReactProvider } from "@coinbase/cdp-react"
import type React from "react"

const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  createAccountOnLogin: "evm-eoa" as const,
  debugging: process.env.NODE_ENV === "development",
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <CDPHooksProvider config={CDP_CONFIG}>
      <CDPReactProvider config={CDP_CONFIG}>
        {children}
      </CDPReactProvider>
    </CDPHooksProvider>
  )
}