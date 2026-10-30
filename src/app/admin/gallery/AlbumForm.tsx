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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="venue" className="label">장소</label>
          <input id="venue" name="venue" maxLength={100} defaultValue={album?.venue ?? ""} placeholder="예: 세종문화예술회관" className="input" />
        </div>
        <div>
          <label htmlFor="post_url" className="label">블로그 글 주소 (선택)</label>
          <input
            id="post_url"
            name="post_url"
            type="url"
            inputMode="url"
            maxLength={500}
            defaultValue={album?.post_url ?? ""}
            placeholder="https://blog.naver.com/sejonglittlesingers/..."
            className="input"
          />
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
      <p className="-mt-2 text-xs text-ink-soft">
        공개하면 사진 갤러리의 &lsquo;공연·행사 사진첩&rsquo;과 첫 화면 &lsquo;무대 위의 순간들&rsquo;에 날짜순으로 나옵니다.
        블로그 글 주소를 넣으면 &lsquo;블로그 글 보기&rsquo; 링크가 함께 나옵니다.
      </p>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">
        {album ? "앨범 정보 저장" : "앨범 만들기"}
      </SubmitButton>
    </form>
  );
}
