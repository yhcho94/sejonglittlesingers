import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNotice } from "@/lib/notices";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/notices/[id]">): Promise<Metadata> {
  const { id } = await params;
  const notice = await getPublishedNotice(Number(id));
  return { title: notice?.title ?? "공지사항" };
}

export default async function NoticeDetailPage({ params }: PageProps<"/notices/[id]">) {
  const { id } = await params;
  const notice = await getPublishedNotice(Number(id));
  if (!notice) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/notices" className="text-sm text-ink-soft hover:underline">
        ← 공지사항 목록
      </Link>
      <article className="card mt-4">
        <h1 className="text-2xl font-bold text-navy">{notice.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{formatDateTime(notice.created_at)}</p>
        <hr className="my-6 border-line" />
        {/* 본문은 일반 텍스트로만 표시 (HTML 삽입 방지) */}
        <div className="whitespace-pre-wrap leading-relaxed">{notice.body}</div>
      </article>
    </div>
  );
}
