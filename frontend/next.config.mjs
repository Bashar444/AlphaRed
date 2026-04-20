/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://168.144.94.193:4000/api/:path*',
            },
            {
                source: '/uploads/:path*',
                destination: 'http://168.144.94.193:4000/uploads/:path*',
            },
        ];
    },
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: '168.144.94.193' },
            { protocol: 'https', hostname: 'alphared.vercel.app' },
        ],
    },
};

export default nextConfig;
