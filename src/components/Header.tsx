import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { DesktopNav } from "./NavLinks";

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
      <Link href="/signup" className="btn-primary px-4 py-2 text-[13px]">
        회원가입
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 h-[var(--header-h)] border-b border-line/80 bg-ivory/90 backdrop-blur-md">
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Link href="/" className="group flex flex-col leading-none" aria-label={`${site.name} 홈`}>
          <span className="font-[family-name:var(--font-serif)] text-lg font-bold tracking-tight text-navy lg:text-xl">
            {site.name}
          </span>
          <span className="eyebrow mt-1 text-[9px] text-gold-deep lg:text-[10px]">{site.nameEn}</span>
        </Link>

        <DesktopNav />

        <div className="hidden items-center gap-5 text-[13px] lg:flex">{accountLinks}</div>

        <MobileMenu account={accountLinks} />
      </div>
    </header>
  );
}
