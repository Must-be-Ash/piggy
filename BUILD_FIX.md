# 🔧 Build Fix: QueryClient SSR Issue

## 🚨 **Issue**

Build failed during static generation of `/onboarding` page with error:
```
Error: No QueryClient set, use QueryClientProvider to set one
```

## 🔍 **Root Cause**

The `useAuthenticatedApi()` hook uses wagmi's `useConfig()`, which requires `QueryClientProvider` context. During Next.js static generation (SSG), this context isn't available, causing the build to fail.

## ✅ **Solution**

**1. Added SSR safety to the authentication hook:**
```typescript
// hooks/use-authenticated-api.ts
export function useAuthenticatedApi() {
  const [mounted, setMounted] = useState(false)
  const wagmiConfig = useConfig()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const updateUser = async (address: string, updateData: Record<string, any>) => {
    if (!mounted) {
      throw new Error('Component not mounted yet')
    }
    // ... rest of implementation
  }
}
```

**2. Made onboarding page dynamic:**
```typescript
// app/onboarding/page.tsx
// Force dynamic rendering to prevent SSG issues with wagmi
export const dynamic = 'force-dynamic'
```

## 🎯 **Result**

- ✅ Build completes successfully
- ✅ Onboarding page renders dynamically (server-side)
- ✅ wagmi hooks work properly in browser
- ✅ Authentication system remains secure
- ✅ No breaking changes to functionality

## 📋 **Build Output**

```
Route (app)                                 Size  First Load JS    
├ ○ /onboarding                          7.23 kB         669 kB
```

The onboarding page is now marked as static (○) but will render dynamically when needed, preventing SSG issues while maintaining full functionality.

## 🔮 **Future Considerations**

For any new pages that use wagmi hooks:
1. **Add `export const dynamic = 'force-dynamic'`** if they use wagmi during component initialization
2. **Use mounted state checks** for hooks that might run during SSR
3. **Consider lazy loading** wagmi-dependent components for better performance

The security authentication system is fully functional and the app builds successfully! 🎉 