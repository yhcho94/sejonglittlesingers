import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Notice } from "@/lib/types";

export function NoticeList({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) {
    return <p className="py-10 text-center text-ink-soft">등록된 공지사항이 없습니다.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {notices.map((notice) => (
        <li key={notice.id}>
          <Link
            href={`/notices/${notice.id}`}
            className="flex items-center justify-between gap-4 py-4 hover:text-navy"
          >
            <span className="flex min-w-0 items-center gap-2">
              {notice.is_pinned && (
                <span className="shrink-0 rounded bg-gold-soft px-2 py-0.5 text-xs font-medium text-ink">
                  중요
                </span>
              )}
              <span className="truncate">{notice.title}</span>
            </span>
            <time className="shrink-0 text-sm text-ink-soft">{formatDate(notice.created_at)}</time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
