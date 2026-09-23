import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // 엑셀 파일 생성·읽기 (Node 전용 라이브러리라 번들에 넣지 않음)
  serverExternalPackages: ["exceljs"],
  // 엑셀 일괄 등록 파일(최대 2MB)을 서버 액션으로 받기 위해 기본 1MB 에서 조금 늘림
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
