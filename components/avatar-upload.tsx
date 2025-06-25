"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PutBlobResult } from '@vercel/blob'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange?: (url: string | null) => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function AvatarUpload({ 
  currentAvatar, 
  onAvatarChange, 
  size = "lg",
  disabled = false 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null)
  const inputFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update preview when currentAvatar prop changes
  useEffect(() => {
    setPreviewUrl(currentAvatar || null)
  }, [currentAvatar])

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, WebP)",
          variant: "destructive"
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }

      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Upload file
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    
    try {
      const response = await fetch(
        `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const blob = (await response.json()) as PutBlobResult
      
      setPreviewUrl(blob.url)
      onAvatarChange?.(blob.url)
      
      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated successfully."
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive"
      })
      
      // Reset preview on error
      setPreviewUrl(currentAvatar || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setPreviewUrl(null)
    onAvatarChange?.(null)
    
    // Reset file input
    if (inputFileRef.current) {
      inputFileRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    inputFileRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
          <AvatarImage 
            src={previewUrl || undefined} 
            alt="Profile picture" 
            className="object-cover"
          />
          <AvatarFallback className="bg-[#f7fafc] text-[#4a5568]">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
          onClick={!disabled ? triggerFileSelect : undefined}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : previewUrl ? "Change" : "Upload"}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={disabled || uploading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={inputFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <p className="text-xs text-[#718096] text-center max-w-xs">
        Upload a profile picture (JPEG, PNG, WebP). Max 5MB.
      </p>
    </div>
  )
} 