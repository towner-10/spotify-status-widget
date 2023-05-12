const canvas = require('@napi-rs/canvas');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // Fixes @napi-rs/canvas on server-side
        if (isServer) {
            config.externals.push("@napi-rs/canvas");
            config.module.rules.push({
                test: /\.node$/,
                use: 'node-loader',
            });
        }
        return config;
    },
}

module.exports = nextConfig
