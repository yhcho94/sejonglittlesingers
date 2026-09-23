import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const linkError = params.error === "link";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold text-navy">로그인</h1>
      {linkError && (
        <p className="mb-4 rounded-sm bg-gold-soft px-3 py-2 text-sm">
          메일 링크를 처리하지 못했습니다. 링크가 만료되었거나 다른 브라우저에서 열렸을 수 있습니다.
          가입 인증 메일이었다면 인증은 완료되었을 수 있으니 로그인을 시도해 보세요.
        </p>
      )}
      <div className="card">
        <LoginForm next={next} />
      </div>
      <div className="mt-4 flex justify-between text-sm text-ink-soft">
        <Link href="/forgot-password" className="hover:underline">비밀번호 찾기</Link>
        <Link href="/signup" className="hover:underline">회원가입</Link>
      </div>
    </div>
  );
}
