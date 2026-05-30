/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // better-sqlite3 is a native module — keep it out of the bundler so the
  // prebuilt binary is loaded directly at runtime (Node.js route handlers).
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
