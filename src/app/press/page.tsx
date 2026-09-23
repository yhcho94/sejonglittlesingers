import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { listPublishedPress, pressSource } from "@/lib/content";

export const metadata: Metadata = { title: "보도자료" };

export default async function PressPage() {
  const items = await listPublishedPress();

  return (
    <>
      <PageHeader title="보도자료" description="언론에 소개된 세종리틀싱어즈의 소식입니다." />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {items.length === 0 ? (
          <p className="card text-center text-ink-soft">등록된 보도자료가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 px-5 py-4 transition hover:bg-cream/60 sm:flex-row sm:items-center sm:gap-5 sm:px-6"
                >
                  <time className="w-24 shrink-0 text-sm tabular-nums text-ink-soft">
                    {item.published_on ? item.published_on.replaceAll("-", ".") : ""}
                  </time>
                  <span className="min-w-0 flex-1 font-medium group-hover:text-navy">{item.title}</span>
                  <span className="shrink-0 text-sm text-ink-soft">
                    {pressSource(item)} <span aria-hidden>↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-soft">기사를 누르면 해당 언론사 페이지가 새 창으로 열립니다.</p>
      </div>
    </>
  );
}
