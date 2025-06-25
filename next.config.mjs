/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip linting during builds for faster development
  // Can still run `npm run lint` manually for code quality checks
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/android-64',
      'node_modules/@esbuild/android-arm64',
      'node_modules/@esbuild/android-arm',
      'node_modules/@esbuild/android-x64',
      'node_modules/@esbuild/darwin-arm64',
      'node_modules/@esbuild/darwin-x64',
      'node_modules/@esbuild/freebsd-arm64',
      'node_modules/@esbuild/freebsd-x64',
      'node_modules/@esbuild/linux-arm',
      'node_modules/@esbuild/linux-arm64',
      'node_modules/@esbuild/linux-ia32',
      'node_modules/@esbuild/linux-loong64',
      'node_modules/@esbuild/linux-mips64el',
      'node_modules/@esbuild/linux-ppc64',
      'node_modules/@esbuild/linux-riscv64',
      'node_modules/@esbuild/linux-s390x',
      'node_modules/@esbuild/linux-x64',
      'node_modules/@esbuild/netbsd-x64',
      'node_modules/@esbuild/openbsd-x64',
      'node_modules/@esbuild/sunos-x64',
      'node_modules/@esbuild/win32-arm64',
      'node_modules/@esbuild/win32-ia32',
      'node_modules/@esbuild/win32-x64',
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore React Native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }
    
    return config
  },
}

export default nextConfig
