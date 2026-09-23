"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// PC 상단 메뉴: 현재 페이지에 금색 밑줄
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="주 메뉴">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-2 text-[15px] transition hover:text-navy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-transform after:duration-300 ${
              active ? "text-navy after:scale-x-100" : "text-ink/80 after:scale-x-0 hover:after:scale-x-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col" aria-label="주 메뉴">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className="flex items-center justify-between border-b border-line py-4 font-[family-name:var(--font-serif)] text-xl text-ink aria-[current=page]:text-gold-deep"
        >
          {item.label}
          <span className="text-sm text-gold" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </nav>
  );
}
