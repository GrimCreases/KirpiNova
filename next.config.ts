import type { NextConfig } from "next";

const storageOrigin=(()=>{try{return process.env.S3_ENDPOINT?new URL(process.env.S3_ENDPOINT).origin:""}catch{return""}})();
const connectSources=["'self'",storageOrigin].filter(Boolean).join(" ");
const scriptSources=process.env.NODE_ENV==="development"?"'self' 'unsafe-inline' 'unsafe-eval'":"'self' 'unsafe-inline'";
const contentSecurityPolicy=["default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'none'","form-action 'self'",`script-src ${scriptSources}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self' data:",`connect-src ${connectSources}`,"worker-src 'self' blob:","manifest-src 'self'"].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "X-DNS-Prefetch-Control", value: "off" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
};

export default nextConfig;