"use client"

import { useGetAccessToken } from '@coinbase/cdp-hooks'
import { useToast } from './use-toast'
import { useState, useEffect } from 'react'

export function useCdpAuthenticatedApi() {
  const [mounted, setMounted] = useState(false)
  const { getAccessToken } = useGetAccessToken()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateUser = async (address: string, updateData: Record<string, any>) => {
    if (!mounted) {
      throw new Error('Component not mounted yet')
    }

    try {
      // Get CDP access token
      const accessToken = await getAccessToken()

      if (!accessToken) {
        throw new Error('Not authenticated - please sign in')
      }

      const response = await fetch(`/api/get-user?address=${address}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Update user error:', error)

      // Show user-friendly error message
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      })

      throw error
    }
  }

  const deleteUser = async (address: string) => {
    if (!mounted) {
      throw new Error('Component not mounted yet')
    }

    try {
      // Get CDP access token
      const accessToken = await getAccessToken()

      if (!accessToken) {
        throw new Error('Not authenticated - please sign in')
      }

      const response = await fetch(`/api/get-user?address=${address}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Delete user error:', error)

      // Show user-friendly error message
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete your account. Please try again.",
        variant: "destructive",
      })

      throw error
    }
  }

  return {
    updateUser,
    deleteUser,
  }
}
