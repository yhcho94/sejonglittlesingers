import type { Metadata } from "next";
import { NoticeList } from "@/components/NoticeList";
import { PageHeader } from "@/components/PageHeader";
import { listPublishedNotices } from "@/lib/notices";

export const metadata: Metadata = {
  title: "공지사항",
  description: "세종리틀싱어즈 공지사항입니다.",
  alternates: { canonical: "/notices" },
};

export default async function NoticesPage() {
  const notices = await listPublishedNotices();
  return (
    <>
      <PageHeader eyebrow="Notice" title="공지사항" />
      <div className="mx-auto max-w-4xl px-4 py-7">
        <div className="card">
          <NoticeList notices={notices} />
        </div>
      </div>
    </>
  );
}
