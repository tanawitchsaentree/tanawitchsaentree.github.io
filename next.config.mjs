/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for production build (GitHub Pages)
  // Dev mode uses normal Next.js server so HMR works properly
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
