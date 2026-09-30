import type { Metadata } from "next";
import { FacultyCard, FacultyHead } from "@/components/FacultyCards";
import { PageHeader } from "@/components/PageHeader";
import { getFacultyRows } from "@/lib/content";
import { buildFaculty } from "@/lib/faculty";

export const metadata: Metadata = {
  title: "강사진 소개",
  description: "세종리틀싱어즈를 이끄는 지휘자와 부지휘자·반주자·보컬트레이너·이론선생님을 소개합니다.",
  alternates: { canonical: "/faculty" },
};

// 약력·사진은 관리자 → 강사진 소개, 선생님 본인은 마이페이지 → 강사 프로필에서 수정 (비운 항목은 표시 안 함)
export default async function FacultyPage() {
  const { conductor, groups } = buildFaculty(await getFacultyRows());
  return (
    <>
      <PageHeader
        eyebrow="Conductor & Faculty"
        title="강사진 소개"
        description="지휘자와 반별 전문 강사진이 아이들의 노래를 함께 가꿉니다."
      />

      <section className="section-y bg-ivory">
        <div className="container-page">
          {conductor && <FacultyHead member={conductor} />}

          {groups.map((group) => (
            <div key={group.title} className="mt-7">
              <h2 className="flex items-center gap-4 font-[family-name:var(--font-serif)] text-xl font-semibold text-navy">
                {group.title}
                <span className="h-px flex-1 bg-line" />
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {group.members.map((member) => (
                  <FacultyCard key={member.name} member={member} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
