import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AlbumForm } from "../AlbumForm";

export default async function NewAlbumPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/gallery" className="text-sm text-ink-soft hover:underline">
        ← 사진 갤러리
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold text-navy">새 앨범</h1>
      <div className="card">
        <AlbumForm />
      </div>
      <p className="mt-4 text-sm text-ink-soft">앨범을 만든 뒤 다음 화면에서 사진을 올립니다.</p>
    </>
  );
}
