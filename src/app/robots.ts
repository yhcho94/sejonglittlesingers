import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// 검색엔진 수집 규칙: 공개 페이지는 허용, 로그인·회원·관리자 화면은 제외
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/auth", "/mypage", "/apply", "/reset-password", "/withdrawn"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
