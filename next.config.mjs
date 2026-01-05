/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nemas.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'nemas.tos-ap-southeast-3.bytepluses.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
