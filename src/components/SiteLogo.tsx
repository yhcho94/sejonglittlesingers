import Image from "next/image";
import circleLogo from "../../public/images/logo-circle.png";
import { logoPublicUrl, type SiteLogo as SiteLogoValue } from "@/lib/site-logo";
import { LogoBadge } from "./LogoMark";

// 머리글·바닥글 로고: 관리자 → 로고에서 고른 것 (원형 · 예전 무지개 음표 · 직접 올린 로고)
const SIZES = {
  header: {
    box: "h-12 max-[379px]:h-8 lg:h-[3.75rem]",
    upload: "max-w-28 lg:max-w-36",
    sizes: "(min-width: 1024px) 60px, 48px",
    classic: {
      markClassName: "h-auto w-10 max-[379px]:w-8 lg:w-14",
      sinceClassName: "mt-0.5 text-[6.5px] text-ink-soft max-[379px]:text-[6px] max-[379px]:tracking-normal lg:text-[8px]",
    },
  },
  footer: {
    box: "h-[72px]",
    upload: "max-w-40",
    sizes: "72px",
    classic: { markClassName: "h-auto w-[72px]", sinceClassName: "mt-1 text-[9px] text-white/60", textColor: "#e8d6b0" },
  },
} as const;

export function SiteLogo({ logo, variant, priority = false }: { logo: SiteLogoValue; variant: keyof typeof SIZES; priority?: boolean }) {
  const s = SIZES[variant];
  if (logo.kind === "classic") return <LogoBadge {...s.classic} />;
  if (logo.kind === "upload") {
    return (
      // 관리자가 올린 파일 (크기·비율이 제각각이라 높이만 맞춤)
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoPublicUrl(logo.path)} alt="" className={`${s.box} ${s.upload} w-auto shrink-0 object-contain`} />
    );
  }
  return <Image src={circleLogo} alt="" sizes={s.sizes} priority={priority} className={`${s.box} w-auto shrink-0`} />;
}
