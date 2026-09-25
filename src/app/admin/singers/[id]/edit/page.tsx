import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSinger, listGuardianOptions, signedPhotoUrls } from "@/lib/singers-data";
import { SingerForm } from "../../SingerForm";

export default async function EditSingerPage({ params }: PageProps<"/admin/singers/[id]/edit">) {
  await requireAdmin("singers");
  const singer = await getSinger(Number((await params).id));
  if (!singer) notFound();
  const [guardians, photos] = await Promise.all([listGuardianOptions(), signedPhotoUrls([singer.photo_path], 600)]);

  return (
    <>
      <Link href={`/admin/singers/${singer.id}`} className="text-sm text-ink-soft hover:underline">
        ← {singer.name} 단원 정보
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold text-navy">단원 정보 수정</h1>
      <div className="card">
        <SingerForm
          initial={singer}
          guardians={guardians}
          photoUrl={singer.photo_path ? (photos.get(singer.photo_path) ?? null) : null}
        />
      </div>
    </>
  );
}
