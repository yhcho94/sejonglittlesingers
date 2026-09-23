import type { Metadata } from "next";
import { NoticeList } from "@/components/NoticeList";
import { PageHeader } from "@/components/PageHeader";
import { listPublishedNotices } from "@/lib/notices";

export const metadata: Metadata = { title: "공지사항" };

export default async function NoticesPage() {
  const notices = await listPublishedNotices();
  return (
    <>
      <PageHeader title="공지사항" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="card">
          <NoticeList notices={notices} />
        </div>
      </div>
    </>
  );
}
