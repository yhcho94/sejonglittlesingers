import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { site } from "@/lib/site";

const NAV = [
  { href: "/about", label: "합창단 소개" },
  { href: "/join", label: "입단 안내" },
  { href: "/concerts", label: "공연 일정" },
  { href: "/notices", label: "공지사항" },
];

export async function Header() {
  const current = await getCurrentUser();
  const isAdmin = current?.profile?.role === "admin";

  const accountLinks = current ? (
    <>
      {isAdmin && (
        <Link href="/admin" className="font-medium text-navy hover:underline">
          관리자
        </Link>
      )}
      <Link href="/mypage" className="hover:text-navy">
        마이페이지
      </Link>
      <form action={signOut}>
        <button type="submit" className="hover:text-navy">
          로그아웃
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className="hover:text-navy">
        로그인
      </Link>
      <Link href="/signup" className="btn-primary px-3 py-1.5 text-sm">
        회원가입
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-navy">{site.name}</span>
          <span className="hidden text-xs tracking-wide text-ink-soft sm:inline">
            {site.nameEn}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-navy">
              {item.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-line" />
          {accountLinks}
        </nav>

        {/* 모바일 메뉴 */}
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-line bg-white px-3 py-1.5 text-sm">
            메뉴
          </summary>
          <div className="absolute right-0 mt-2 flex w-48 flex-col gap-3 rounded-xl border border-line bg-white p-4 text-sm shadow-lg">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <hr className="border-line" />
            {accountLinks}
          </div>
        </details>
      </div>
    </header>
  );
}
