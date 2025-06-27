"use client"

import { useConfig } from 'wagmi'
import { useToast } from './use-toast'
import { authenticatedFetch } from '@/lib/wallet-auth'

export function useAuthenticatedApi() {
  const wagmiConfig = useConfig()
  const { toast } = useToast()

  const updateUser = async (address: string, updateData: Record<string, any>) => {
    try {
      const response = await authenticatedFetch(
        `/api/get-user?address=${address}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        },
        wagmiConfig
      )

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
    try {
      const response = await authenticatedFetch(
        `/api/get-user?address=${address}`,
        {
          method: "DELETE",
        },
        wagmiConfig
      )

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