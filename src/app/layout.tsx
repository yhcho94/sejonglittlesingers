import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: false,
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
    images: [{ url: "/images/hero.jpg", width: 960, height: 640, alt: site.name }],
  },
};

export const viewport: Viewport = {
  themeColor: "#23306b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
