import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-ink-soft md:grid-cols-2">
        <div>
          <p className="text-base font-bold text-navy">{site.name}</p>
          <p className="mt-1">{site.nameEn}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <p>주소: {site.contact.address}</p>
          <p>
            전화: {site.contact.phone} · 이메일: {site.contact.email}
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
