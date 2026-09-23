import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "합창단 소개" };

export default function AboutPage() {
  return (
    <>
      <PageHeader title="합창단 소개" description={site.nameEn} />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <section className="card">
          <h2 className="text-xl font-bold text-navy">인사말</h2>
          <p className="mt-4 leading-relaxed">
            <Placeholder>인사말 입력 필요</Placeholder>
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">연혁</h2>
          <p className="mt-4">
            <Placeholder>창단 연도 및 주요 연혁 입력 필요</Placeholder>
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">지휘자 · 반주자</h2>
          <p className="mt-4">
            <Placeholder>지휘자·반주자 소개 입력 필요 (공개 동의 받은 정보만 게재)</Placeholder>
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">오시는 길</h2>
          <p className="mt-4">주소: {site.contact.address}</p>
          <p className="mt-1">문의: {site.contact.phone}</p>
        </section>
      </div>
    </>
  );
}
