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
      // Clerk is for admin only — /account, /account/orders and
      // /account/settings dead-ended every real customer at a sign-in wall
      // for an account system that doesn't exist (guest checkout only,
      // replaced by reference+email lookup). /account/wishlist is the one
      // part of this area that actually works without signing in, so it's
      // deliberately not redirected here.
      { source: "/account", destination: "/orders/lookup", permanent: true },
      { source: "/account/orders", destination: "/orders/lookup", permanent: true },
      { source: "/account/settings", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
