import type { Metadata } from "next";
import Image from "next/image";
import { InstallButton } from "@/components/InstallButton";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "홈 화면에 앱 설치" };

const GUIDES = [
  {
    id: "android",
    title: "안드로이드 (크롬)",
    steps: [
      "크롬으로 홈페이지에 접속합니다.",
      "위의 '홈 화면에 앱 설치' 버튼을 누르거나, 오른쪽 위 ⋮ 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 누릅니다.",
      "'설치'를 누르면 홈 화면에 아이콘이 생깁니다.",
    ],
  },
  {
    id: "samsung",
    title: "삼성 인터넷",
    steps: [
      "삼성 인터넷으로 홈페이지에 접속합니다.",
      "아래쪽 ≡ 메뉴에서 '현재 페이지 추가' → '홈 화면'을 누릅니다.",
    ],
  },
  {
    id: "iphone",
    title: "아이폰 · 아이패드 (사파리)",
    steps: [
      "사파리(Safari)로 홈페이지에 접속합니다.",
      "화면 아래(아이패드는 위)의 공유 버튼(네모에 위쪽 화살표)을 누릅니다.",
      "목록을 내려 '홈 화면에 추가'를 누른 뒤 '추가'를 누릅니다.",
    ],
  },
  {
    id: "pc",
    title: "PC (크롬 · 엣지)",
    steps: [
      "주소창 오른쪽의 설치 아이콘(모니터에 아래 화살표)을 누르거나, 위의 '홈 화면에 앱 설치' 버튼을 누릅니다.",
      "'설치'를 누르면 바탕화면·시작 메뉴에 아이콘이 생깁니다.",
    ],
  },
];

export default function InstallPage() {
  return (
    <>
      <PageHeader title="홈 화면에 앱 설치" description="앱처럼 아이콘을 눌러 바로 접속할 수 있습니다." />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="card flex flex-wrap items-center gap-5">
          <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl" />
          <div className="min-w-[10rem] flex-1">
            <p className="text-lg font-bold text-navy">{site.name}</p>
            <p className="text-sm text-ink-soft">별도 앱 다운로드 없이 홈 화면에 추가됩니다.</p>
          </div>
          <InstallButton className="btn-primary w-full sm:w-auto" />
        </div>

        <p className="rounded-lg bg-gold-soft px-4 py-3 text-sm">
          카카오톡 등 앱 안에서 열린 화면에서는 설치할 수 없습니다. 오른쪽 위 메뉴에서{" "}
          <strong>&apos;다른 브라우저로 열기&apos;</strong>를 누른 뒤 진행해 주세요.
        </p>

        {GUIDES.map((guide) => (
          <section key={guide.id} id={guide.id} className="card scroll-mt-24">
            <h2 className="mb-3 text-lg font-bold text-navy">{guide.title}</h2>
            <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
