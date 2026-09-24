import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 text-center">
      <p className="text-5xl font-bold text-navy">404</p>
      <p className="mt-4 text-ink-soft">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="btn-primary mt-6">홈으로</Link>
    </div>
  );
}
