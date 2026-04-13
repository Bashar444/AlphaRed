/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://168.144.94.193:4000/api/:path*',
            },
        ];
    },
};

export default nextConfig;
