"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { Button } from "@/components/ui/button"
import { Coffee, User, Settings, LogOut, Shield, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  className?: string
}

export function Header({ className = "" }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isScrolledToWhite, setIsScrolledToWhite] = useState(false)
  const { address, isConnected } = useAccount()
  const { handleLogOut } = useDynamicContext()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll detection for landing page
  useEffect(() => {
    if (pathname !== '/') return // Only apply on landing page

    const handleScroll = () => {
      // Get the height of the hero section (should be 100vh on desktop, 80vh on mobile)
      const heroHeight = window.innerWidth >= 768 ? window.innerHeight : window.innerHeight * 0.8
      const scrolled = window.scrollY > heroHeight - 100 // Start transition 100px before white section
      setIsScrolledToWhite(scrolled)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Fetch user data when connected
  useEffect(() => {
    const fetchUser = async () => {
      if (!address || !isConnected) {
        setUser(null)
        return
      }

      try {
        const response = await fetch(`/api/user/${address}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data.user || data)
        }
      } catch (error) {
        console.error("Header: Error fetching user:", error)
      }
    }

    if (mounted && isConnected && address) {
      fetchUser()
    }
  }, [mounted, isConnected, address])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyUserLink = async () => {
    if (!user?.slug || typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/u/${user.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      
      // Reset the checkmark after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Determine header positioning classes based on route and screen size
  const getHeaderClasses = () => {
    const baseClasses = pathname === '/' || pathname === '/dashboard' || pathname === '/onboarding'
      ? 'md:sticky md:top-0 relative z-40'
      : 'sticky top-0 z-40'

    // Dynamic background based on scroll position for landing page
    if (pathname === '/' && isScrolledToWhite) {
      return `${baseClasses} border-b border-gray-200 bg-white/95 backdrop-blur-3xl supports-[backdrop-filter]:bg-white/95 transition-all duration-300`
    }
    
    return `${baseClasses} border-b border-white/10 bg-white/5 backdrop-blur-3xl supports-[backdrop-filter]:bg-white/5 transition-all duration-300`
  }
  
  return (
    <header className={`${getHeaderClasses()} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 h-20 flex items-center z-10">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-3 group hover:opacity-80 transition-opacity duration-200 touch-manipulation active:scale-95"
          style={{ minHeight: '48px', minWidth: '48px' }}
          onClick={(e) => {
            console.log('Logo clicked', e);
            e.preventDefault();
            window.location.href = '/';
          }}
          onTouchStart={(e) => {
            console.log('Logo touch start', e);
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none"></div>
            <div className="relative p-2.5 bg-gradient-to-br from-white to-gray-200 rounded-xl shadow-lg">
              <Coffee className="h-6 w-6 text-[#2d3748]" />
            </div>
          </div>
          <div className="text-left">
            <h1 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              pathname === '/' && isScrolledToWhite ? 'text-gray-900' : 'text-white'
            }`}>CryptoCoffee</h1>
            <p className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
              pathname === '/' && isScrolledToWhite ? 'text-gray-600' : 'text-gray-300'
            }`}>Crypto Donations</p>
          </div>
        </Link>

        {/* Spacer to push content to the right */}
        <div className="flex-1"></div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2 mr-4">
          <Link 
            href="/dashboard" 
            className="touch-manipulation" 
            onClick={(e) => {
              console.log('Dashboard clicked', e);
              e.preventDefault();
              window.location.href = '/dashboard';
            }}
            onTouchStart={() => console.log('Dashboard touch start')}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-300 px-4 py-2 rounded-xl font-medium active:scale-95 backdrop-blur-sm border h-10 ${
                pathname === '/' && isScrolledToWhite 
                  ? 'text-gray-900 hover:text-gray-900 hover:bg-gray-100 bg-gray-50 border-gray-200'
                  : 'text-white hover:text-white hover:bg-white/20 bg-white/10 border-white/20'
              }`}
            >
              Dashboard
            </Button>
          </Link>
          <Link 
            href={isConnected && user?.slug ? `/u/${user.slug}` : "/onboarding"}
            className="touch-manipulation" 
            onClick={(e) => {
              console.log('View Page clicked', e);
              e.preventDefault();
              const destination = isConnected && user?.slug ? `/u/${user.slug}` : "/onboarding";
              window.location.href = destination;
            }}
            onTouchStart={() => console.log('View Page touch start')}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-300 px-4 py-2 rounded-xl font-medium active:scale-95 backdrop-blur-sm border h-10 ${
                pathname === '/' && isScrolledToWhite 
                  ? 'text-gray-900 hover:text-gray-900 hover:bg-gray-100 bg-gray-50 border-gray-200'
                  : 'text-white hover:text-white hover:bg-white/20 bg-white/10 border-white/20'
              }`}
            >
              Your Page
            </Button>
          </Link>
          <Link 
            href="/onboarding" 
            className="touch-manipulation" 
            onClick={(e) => {
              console.log('Get Started clicked', e);
              e.preventDefault();
              window.location.href = '/onboarding';
            }}
            onTouchStart={() => console.log('Get Started touch start')}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-300 px-4 py-2 rounded-xl font-medium active:scale-95 backdrop-blur-sm border h-10 ${
                pathname === '/' && isScrolledToWhite 
                  ? 'text-gray-900 hover:text-gray-900 hover:bg-gray-100 bg-gray-50 border-gray-200'
                  : 'text-white hover:text-white hover:bg-white/20 bg-white/10 border-white/20'
              }`}
            >
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {!mounted ? (
            // Show loading state during SSR
            <div className="w-32 h-10 bg-white/10 rounded-xl animate-pulse"></div>
          ) : isConnected && address ? (
            <div className="flex items-center gap-3">
              {/* Connected Wallet Badge */}
              <div className={`hidden sm:flex items-center gap-2 backdrop-blur-sm rounded-xl px-4 py-2 border transition-all duration-300 ${
                pathname === '/' && isScrolledToWhite 
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white/10 border-white/20'
              }`}>
                <Shield className="h-4 w-4 text-green-400" />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  pathname === '/' && isScrolledToWhite ? 'text-gray-900' : 'text-white'
                }`}>Connected</span>
                <code className={`text-xs px-2 py-1 rounded font-mono transition-all duration-300 ${
                  pathname === '/' && isScrolledToWhite 
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-black/30 text-gray-300'
                }`}>
                  {formatAddress(address)}
                </code>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-12 w-12 rounded-xl hover:bg-white/10 transition-all duration-200 group touch-manipulation"
                    style={{ minHeight: '48px', minWidth: '48px' }}
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/20 group-hover:border-white/40 transition-colors duration-200">
                      <AvatarImage 
                        src={user?.avatar || undefined} 
                        alt={user?.displayName || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-white to-gray-200 text-[#2d3748] font-bold text-sm">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-64 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" 
                  align="end" 
                  forceMount
                >
                  <div className="flex flex-col space-y-2 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage 
                          src={user?.avatar || undefined} 
                          alt={user?.displayName || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white font-bold">
                          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : address.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a202c] truncate">
                          {user?.displayName || "Anonymous User"}
                        </p>
                        <p className="text-xs text-[#718096] font-mono">
                          {formatAddress(address)}
                        </p>
                      </div>
                    </div>
                    
                    {user?.slug && (
                      <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] p-3 rounded-lg">
                        <p className="text-xs text-[#718096] font-medium mb-1">Your Page</p>
                        <p className="text-xs font-mono text-[#2d3748] truncate">
                          cryptocoffee.app/u/{user.slug}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator className="bg-[#e2e8f0]" />
                  
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/dashboard" 
                      className="cursor-pointer flex items-center px-4 py-3 hover:bg-[#f8fafc] transition-colors duration-200"
                    >
                      <User className="mr-3 h-4 w-4 text-[#4a5568]" />
                      <span className="font-medium text-[#1a202c]">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/onboarding" 
                      className="cursor-pointer flex items-center px-4 py-3 hover:bg-[#f8fafc] transition-colors duration-200"
                    >
                      <Settings className="mr-3 h-4 w-4 text-[#4a5568]" />
                      <span className="font-medium text-[#1a202c]">Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {user?.slug && (
                    <DropdownMenuItem asChild>
                      <Link 
                        href={`/u/${user.slug}`} 
                        className="cursor-pointer flex items-center px-4 py-3 hover:bg-[#f8fafc] transition-colors duration-200"
                      >
                        <ExternalLink className="mr-3 h-4 w-4 text-[#4a5568]" />
                        <span className="font-medium text-[#1a202c]">View Page</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator className="bg-[#e2e8f0]" />
                  
                  <DropdownMenuItem 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-4 py-3 transition-colors duration-200"
                    onClick={handleLogOut}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex justify-center">
              <DynamicWidget />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/20 px-4 py-4 bg-white/10 backdrop-blur-sm">
        <nav className="flex flex-col space-y-3">
          <div className="flex space-x-2">
            <Link 
              href="/dashboard" 
              className="flex-1 touch-manipulation" 
              onClick={(e) => {
                console.log('Mobile Dashboard clicked', e);
                e.preventDefault();
                window.location.href = '/dashboard';
              }}
              onTouchStart={() => console.log('Mobile Dashboard touch start')}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-white hover:text-white hover:bg-white/20 transition-all duration-200 px-4 py-3 rounded-xl font-medium text-sm min-h-[48px] touch-manipulation active:scale-95 bg-white/10 backdrop-blur-sm border border-white/20"
              >
                Dashboard
              </Button>
            </Link>
            <Link 
              href="/onboarding" 
              className="flex-1 touch-manipulation" 
              onClick={(e) => {
                console.log('Mobile Get Started clicked', e);
                e.preventDefault();
                window.location.href = '/onboarding';
              }}
              onTouchStart={() => console.log('Mobile Get Started touch start')}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-white hover:text-white hover:bg-white/20 transition-all duration-200 px-4 py-3 rounded-xl font-medium text-sm min-h-[48px] touch-manipulation active:scale-95 bg-white/10 backdrop-blur-sm border border-white/20"
              >
                Get Started
              </Button>
            </Link>
          </div>
          
          {isConnected && address && user?.slug && (
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 shadow-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 font-medium mb-1">Your Link</p>
                <code className="text-xs bg-black/40 px-2 py-1 rounded font-mono text-gray-200 border border-white/20 block truncate">
                  cryptocoffee.app/u/{user.slug}
                </code>
              </div>
              <button
                onClick={copyUserLink}
                className={`p-2 rounded-lg transition-all duration-200 shrink-0 flex items-center justify-center ${
                  isCopied 
                    ? 'bg-green-500/20 hover:bg-green-500/30' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                disabled={!user?.slug}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
} 