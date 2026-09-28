import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// 홈 화면(바탕화면)에 앱처럼 설치할 때 쓰는 정보
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#121a3a",
    // 아이콘 파일을 바꿀 때는 이름도 바꿔야 이미 설치한 휴대폰이 새 아이콘을 받아 갑니다 (주소 기준으로 캐시)
    icons: [
      { src: "/icons/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/logo-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/logo-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
