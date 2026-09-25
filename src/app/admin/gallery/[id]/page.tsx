import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAlbum, deleteGalleryPhoto, setAlbumCover, updatePhotoCaption } from "@/app/actions/gallery";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { galleryUrl, getAlbum } from "@/lib/gallery";
import { AlbumForm } from "../AlbumForm";
import { ConsentReminder } from "../ConsentReminder";
import { PhotoUploader } from "../PhotoUploader";

export default async function AdminAlbumPage({ params }: PageProps<"/admin/gallery/[id]">) {
  await requireAdmin("gallery");
  const data = await getAlbum(Number((await params).id));
  if (!data) notFound();
  const { album, photos } = data;
  const coverId = album.cover_photo_id ?? photos[0]?.id;

  return (
    <>
      <Link href="/admin/gallery" className="text-sm text-ink-soft hover:underline">
        ← 사진 갤러리
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">{album.title}</h1>
        <div className="flex gap-2">
          {album.is_published && (
            <Link href={`/gallery/${album.id}`} className="btn-outline" target="_blank">
              공개 화면 보기 ↗
            </Link>
          )}
          <form action={deleteAlbum}>
            <input type="hidden" name="id" value={album.id} />
            <ConfirmButton message={`'${album.title}' 앨범과 사진 ${photos.length}장을 모두 삭제할까요?`} className="btn-danger">
              앨범 삭제
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card">
          <h2 className="mb-4 font-bold text-navy">앨범 정보</h2>
          <AlbumForm album={album} />
        </section>
        <section className="card">
          <h2 className="mb-4 font-bold text-navy">사진 올리기</h2>
          <ConsentReminder />
          <PhotoUploader albumId={album.id} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-bold text-navy">
          사진 {photos.length}장 <span className="text-sm font-normal text-ink-soft">올린 순서대로 표시됩니다</span>
        </h2>
        {photos.length === 0 ? (
          <p className="card text-center text-sm text-ink-soft">아직 사진이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <li key={p.id} className="border border-line bg-white">
                <div className="relative aspect-[4/3] bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 이미 줄인 공개 미리보기 사진 */}
                  <img src={galleryUrl(p.thumb_path)} alt={p.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
                  {p.id === coverId && (
                    <span className="absolute top-2 left-2 rounded-sm bg-navy px-2 py-0.5 text-xs text-white">대표 사진</span>
                  )}
                </div>
                <div className="space-y-2 p-2">
                  <form action={updatePhotoCaption} className="flex gap-1">
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      name="caption"
                      defaultValue={p.caption ?? ""}
                      maxLength={300}
                      placeholder="설명 (선택)"
                      aria-label="사진 설명"
                      className="input px-2 py-1 text-xs"
                    />
                    <button className="shrink-0 text-xs text-navy underline">저장</button>
                  </form>
                  <div className="flex justify-between text-xs">
                    {p.id !== coverId ? (
                      <form action={setAlbumCover}>
                        <input type="hidden" name="album_id" value={album.id} />
                        <input type="hidden" name="photo_id" value={p.id} />
                        <button className="text-ink-soft underline hover:text-navy">대표로 지정</button>
                      </form>
                    ) : (
                      <span />
                    )}
                    <form action={deleteGalleryPhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message="이 사진을 삭제할까요?" className="text-red-700 underline">
                        삭제
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
