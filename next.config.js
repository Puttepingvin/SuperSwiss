/** @type {import('next').NextConfig} */
const nextConfig = {
    headers: () => [
      {
        source : "/:page*",
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-caches',
          },
        ],
      },
    ],
  }


module.exports = nextConfig
