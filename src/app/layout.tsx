import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Serif_KR } from "next/font/google";
// 본문 글꼴: 프리텐다드 (SIL OFL, 글자 범위별로 나눠 필요한 부분만 내려받음)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";
import { REVEAL_BOOT_SCRIPT, RevealObserver } from "@/components/Reveal";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["500", "600", "700"],
  preload: false,
});

// 영문 장식 글꼴 (SEJONG LITTLE SINGERS 등)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | 세종시 어린이 합창단`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // iOS 홈 화면에 추가했을 때의 이름과 상단바
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  openGraph: {
    title: `${site.name} | 세종시 어린이 합창단`,
    description: site.description,
    siteName: site.name,
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: `${site.name} 공연 모습` }],
  },
  // 검색엔진 사이트 소유 확인 코드 (Vercel 환경변수에 넣으면 <meta> 로 표시)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#121a3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // js-reveal 클래스는 화면을 그리기 전에 스크립트가 붙이므로 서버 HTML 과 달라도 경고하지 않습니다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${notoSerifKr.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <RevealObserver />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
