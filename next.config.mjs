/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/request/parts",
        destination: "/request/repair",
        permanent: true
      },
      {
        source: "/:citySlug/shops",
        destination: "/:citySlug/services/sto-remont",
        permanent: true
      },
      {
        source: "/shop/:partnerSlug",
        destination: "/request/repair",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
