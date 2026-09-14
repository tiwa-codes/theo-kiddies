/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      // Old mockup account pages — customer accounts are out of scope
      // (guest checkout only); these now point at the real Clerk routes.
      { source: "/account/login", destination: "/sign-in", permanent: true },
      { source: "/account/register", destination: "/sign-up", permanent: true },
    ];
  },
};

export default nextConfig;
