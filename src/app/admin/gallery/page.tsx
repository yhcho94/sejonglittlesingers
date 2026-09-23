import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAlbums } from "@/lib/gallery";
import { ConsentReminder } from "./ConsentReminder";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const albums = await listAlbums();
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy">사진 갤러리</h1>
        <Link href="/admin/gallery/new" className="btn-primary">
          새 앨범
        </Link>
      </div>
      <ConsentReminder />
      {albums.length === 0 ? (
        <p className="card text-center text-sm text-ink-soft">앨범이 없습니다. &lsquo;새 앨범&rsquo;으로 시작하세요.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/gallery/${a.id}`} className="block border border-line bg-white hover:border-navy">
                <div className="aspect-[4/3] bg-cream">
                  {a.cover && (
                    // eslint-disable-next-line @next/next/no-img-element -- 이미 줄인 공개 미리보기 사진
                    <img src={a.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium">
                    {!a.is_published && <span className="mr-2 text-xs text-ink-soft">[비공개]</span>}
                    {a.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {a.taken_on ?? "날짜 없음"} · 사진 {a.count}장
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
