"use client";

import { useActionState } from "react";
import { saveAlbum } from "@/app/actions/gallery";
import { FormMessage, SubmitButton } from "@/components/form";
import type { GalleryAlbum } from "@/lib/gallery-shared";

export function AlbumForm({ album }: { album?: GalleryAlbum }) {
  const [state, action] = useActionState(saveAlbum, undefined);
  return (
    <form action={action} className="space-y-4">
      {album && <input type="hidden" name="id" value={album.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor="title" className="label">앨범 제목 *</label>
          <input id="title" name="title" required maxLength={200} defaultValue={album?.title} placeholder="예: 제4회 정기연주회" className="input" />
        </div>
        <div>
          <label htmlFor="taken_on" className="label">날짜</label>
          <input id="taken_on" name="taken_on" type="date" defaultValue={album?.taken_on ?? ""} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">설명</label>
        <textarea id="description" name="description" rows={3} maxLength={2000} defaultValue={album?.description ?? ""} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={album?.is_published ?? false} />
        홈페이지에 공개 (사진을 모두 올리고 확인한 뒤 체크하세요)
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">
        {album ? "앨범 정보 저장" : "앨범 만들기"}
      </SubmitButton>
    </form>
  );
}
