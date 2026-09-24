"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MobileNavLinks } from "./NavLinks";
import { SocialLinks } from "./SocialLinks";

// 모바일 전체 화면 메뉴. 페이지를 이동하면 자동으로 닫힙니다.
export function MobileMenu({ account }: { account: React.ReactNode }) {
  const pathname = usePathname();
  return <MobileMenuInner key={pathname} account={account} />;
}

function MobileMenuInner({ account }: { account: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // 메뉴가 열려 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        className="-mr-2 flex h-11 w-11 items-center justify-center text-navy"
      >
        <span className="relative block h-3.5 w-6" aria-hidden>
          <span className={`absolute left-0 h-px w-6 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-px w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-px w-6 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>

      {/* 헤더의 흐림 효과 안에 갇히지 않도록 body 에 직접 그립니다 */}
      {open &&
        createPortal(
          <div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-ivory px-6 pb-7 pt-4"
          >
            <MobileNavLinks onNavigate={() => setOpen(false)} />
            <SocialLinks
              showLabel
              className="mt-6 flex-wrap gap-x-5 gap-y-3 text-sm text-ink-soft"
              itemClassName="hover:text-navy"
            />
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm" onClick={() => setOpen(false)}>
              {account}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
