import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { CopyLinkButton } from "./CopyLinkButton";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./NavLinks";
import { SocialLinks } from "./SocialLinks";

export async function Header() {
  const current = await getCurrentUser();
  const isAdmin = current?.profile?.role === "admin";

  const accountLinks = current ? (
    <>
      {isAdmin && (
        <Link href="/admin" className="font-medium text-gold-deep hover:text-navy">
          관리자
        </Link>
      )}
      <Link href="/mypage" className="text-ink-soft hover:text-navy">
        마이페이지
      </Link>
      <form action={signOut}>
        <button type="submit" className="text-ink-soft hover:text-navy">
          로그아웃
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className="text-ink-soft hover:text-navy">
        로그인
      </Link>
      <Link href="/signup" className="text-ink-soft hover:text-navy">
        회원가입
      </Link>
    </>
  );

  return (
    <>
      {/* PC 상단 보조 줄: 계정 · 공식 채널 · 주소 복사 */}
      <div data-print-hide className="hidden h-[var(--util-h)] border-b border-line/70 bg-ivory lg:block">
        <div className="container-page flex h-full items-center justify-end gap-6 text-xs">
          <div className="flex items-center gap-4">{accountLinks}</div>
          <span className="h-3 w-px bg-line" aria-hidden />
          <div className="flex items-center gap-3 text-ink-soft">
            <SocialLinks className="gap-3" itemClassName="hover:text-navy" showLabel />
            <span className="h-3 w-px bg-line" aria-hidden />
            <CopyLinkButton className="hover:text-navy" showLabel />
          </div>
        </div>
      </div>

      <header data-print-hide className="sticky top-0 z-30 h-[var(--header-h)] border-b border-line/80 bg-ivory/90 backdrop-blur-md">
        <div className="container-page flex h-full items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 flex-col leading-none whitespace-nowrap" aria-label={`${site.name} 홈`}>
            <span className="font-[family-name:var(--font-serif)] text-lg font-bold tracking-tight text-navy lg:text-xl">
              {site.name}
            </span>
            <span className="eyebrow mt-1 text-[8px] tracking-[0.2em] text-gold-deep sm:text-[9px] sm:tracking-[0.32em] lg:text-[10px]">
              {site.nameEn}
            </span>
          </Link>

          <DesktopNav />

          {/* 휴대폰·태블릿: 공식 채널 · 주소 복사 · 메뉴 */}
          <div className="flex items-center lg:hidden">
            <SocialLinks itemClassName="h-10 w-8 justify-center text-navy/80 hover:text-navy sm:w-10" />
            <CopyLinkButton className="h-10 w-8 justify-center text-navy/80 hover:text-navy max-[359px]:hidden sm:w-10" />
            <MobileMenu account={accountLinks} />
          </div>
        </div>
      </header>
    </>
  );
}
