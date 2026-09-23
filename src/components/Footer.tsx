import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { SocialLinks } from "@/components/SocialLinks";
import { NAV } from "@/lib/nav";
import { mailHref, mapHref, site, smsHref } from "@/lib/site";

export function Footer() {
  return (
    <footer data-print-hide className="bg-navy-dark text-white/75">
      <div className="container-page grid gap-12 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="font-[family-name:var(--font-serif)] text-2xl font-bold text-white">{site.name}</p>
          <p className="eyebrow mt-2 text-[10px] text-gold">{site.nameEn}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            음악을 통해 아이들의 감성과 협동심을 키우는 세종시 어린이 합창단
          </p>
          <SocialLinks
            showLabel
            className="mt-6 flex-wrap gap-2 text-xs"
            itemClassName="border border-white/30 px-3 py-2 text-white/85 hover:border-white hover:text-white"
          />
        </div>

        <nav className="md:col-span-3" aria-label="바로가기">
          <p className="eyebrow text-[10px] text-gold">Menu</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm md:grid-cols-1">
            {NAV.filter((item) => !item.topOnly).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4 text-sm md:col-span-4">
          <p className="eyebrow text-[10px] text-gold">Contact</p>
          <div>
            <p className="text-white/50">입단 · 공연 문의 (문자 메시지)</p>
            <a href={smsHref} className="mt-1 inline-block text-lg text-white hover:text-gold">
              단장 {site.contact.phone}
            </a>
          </div>
          <div>
            <p className="text-white/50">이메일</p>
            <a href={mailHref} className="mt-1 inline-block hover:text-white">
              {site.contact.email}
            </a>
          </div>
          <div>
            <p className="text-white/50">연습 장소</p>
            <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block hover:text-white">
              {site.contact.address}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="font-bold text-white/80 hover:text-white">
              개인정보처리방침
            </Link>
            <span>© {site.nameEn}</span>
          </div>
          <InstallButton className="btn-ghost-light self-start px-4 py-2 text-xs sm:self-auto" />
        </div>
      </div>
    </footer>
  );
}
