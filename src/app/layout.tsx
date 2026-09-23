import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";
import { REVEAL_BOOT_SCRIPT, RevealObserver } from "@/components/Reveal";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: false,
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["500", "700"],
  preload: false,
});

// 영문 장식 글꼴 (SEJONG LITTLE SINGERS 등)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: site.name,
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
    siteName: site.name,
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: `${site.name} 공연 모습` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16224d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // js-reveal 클래스는 화면을 그리기 전에 스크립트가 붙이므로 서버 HTML 과 달라도 경고하지 않습니다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${notoSansKr.variable} ${notoSerifKr.variable} ${cormorant.variable} h-full antialiased`}
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
