"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * 스크롤하면 [data-reveal] 요소가 부드럽게 나타나게 합니다.
 * - 자바스크립트가 없거나 실패해도 내용은 그대로 보입니다. (숨김은 <html class="js-reveal"> 일 때만)
 * - '동작 줄이기' 설정 사용자는 CSS 에서 효과를 끕니다.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

// <head> 에 넣는 한 줄: 화면을 그리기 전에 표시해 두어야 깜빡임이 없습니다.
export const REVEAL_BOOT_SCRIPT = "document.documentElement.classList.add('js-reveal')";
