const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['cloudinary'],
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that shouldn't be bundled for the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    
    // Exclude server-only packages from client bundle
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push('cloudinary')
    }
    
    return config
  },
}

export default nextConfig
