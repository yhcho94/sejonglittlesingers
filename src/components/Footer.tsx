import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { mailHref, mapHref, site, telHref } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-ink-soft md:grid-cols-2">
        <div>
          <p className="text-base font-bold text-navy">{site.name}</p>
          <p className="mt-1">{site.nameEn}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a href={site.links.cafe} target="_blank" rel="noopener noreferrer" className="hover:text-navy hover:underline">
              네이버 카페
            </a>
            <a href={site.links.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-navy hover:underline">
              유튜브
            </a>
          </div>
          <InstallButton className="btn-outline mt-4 px-3 py-1.5 text-sm" />
        </div>
        <div className="space-y-1 md:text-right">
          <p>
            주소:{" "}
            <a href={mapHref} target="_blank" rel="noopener noreferrer" className="hover:text-navy hover:underline">
              {site.contact.address}
            </a>
          </p>
          <p>
            전화:{" "}
            <a href={telHref} className="hover:text-navy hover:underline">
              {site.contact.phone}
            </a>{" "}
            · 이메일:{" "}
            <a href={mailHref} className="hover:text-navy hover:underline">
              {site.contact.email}
            </a>
          </p>
          <p className="pt-2">
            <Link href="/privacy" className="font-bold text-ink hover:underline">
              개인정보처리방침
            </Link>
          </p>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-ink-soft">
        © {site.nameEn}. All rights reserved.
      </p>
    </footer>
  );
}
