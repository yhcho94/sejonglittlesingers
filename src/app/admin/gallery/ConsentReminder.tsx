import Link from "next/link";

// 갤러리는 공개 화면이므로 초상권 동의 확인 안내
export function ConsentReminder() {
  return (
    <p className="mb-6 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
      갤러리는 누구나 볼 수 있는 공개 화면입니다. 초상권 <strong>&lsquo;① 공식 채널 게시&rsquo;에 동의한 단원만</strong> 나온
      사진을 올려 주세요. 동의하지 않은 단원은{" "}
      <Link href="/admin/singers/photos" className="underline">
        사진 명부
      </Link>
      에 &lsquo;게시 미동의&rsquo;로 표시됩니다.
    </p>
  );
}
