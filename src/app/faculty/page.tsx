import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { conductor, organization, staffGroups, type BioSection, type StaffMember } from "@/lib/staff";

export const metadata: Metadata = {
  title: "강사진 소개",
  description: "세종리틀싱어즈를 이끄는 지휘자와 부지휘자·반주자·보컬트레이너·이론선생님을 소개합니다.",
  alternates: { canonical: "/faculty" },
};

export default function FacultyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conductor & Faculty"
        title="강사진 소개"
        description="지휘자와 반별 전문 강사진이 아이들의 노래를 함께 가꿉니다."
      />

      <section className="section-y bg-ivory">
        <div className="container-page">
          <article className="border border-line bg-white">
            <div className="flex flex-wrap items-end justify-between gap-4 bg-navy px-4 py-5 text-white md:px-6 md:py-6">
              <div>
                <p className="eyebrow text-gold">{conductor.role}</p>
                <h2 className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold md:text-3xl">
                  {conductor.name}
                </h2>
              </div>
              {conductor.website && (
                <a
                  href={conductor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-light px-4 py-2 text-xs"
                >
                  개인 홈페이지 ↗
                </a>
              )}
            </div>
            <div className="grid gap-x-8 gap-y-4 p-4 md:grid-cols-2 md:p-6">
              {conductor.sections.map((section) => (
                <BioList key={section.title} section={section} />
              ))}
            </div>
          </article>

          {staffGroups.map((group) => (
            <div key={group.title} className="mt-7">
              <h2 className="flex items-center gap-4 font-[family-name:var(--font-serif)] text-xl font-semibold text-navy">
                {group.title}
                <span className="h-px flex-1 bg-line" />
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {group.members.map((member) => (
                  <article key={member.name} className="border border-line bg-white p-4 md:p-5">
                    <StaffHeading member={member} />
                    <div className="mt-3 space-y-4">
                      {member.sections.map((section) => (
                        <BioList key={section.title} section={section} />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}

function StaffHeading({ member }: { member: StaffMember }) {
  const color = organization.classes.find((c) => c.name === member.className)?.color;
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="text-xs text-ink-soft">{member.role}</p>
        <h3 className="mt-1 font-[family-name:var(--font-serif)] text-xl font-bold">{member.name}</h3>
      </div>
      {member.className && (
        <span className="border px-2.5 py-0.5 text-xs font-medium" style={{ color, borderColor: color }}>
          {member.className}
        </span>
      )}
    </div>
  );
}

function BioList({ section }: { section: BioSection }) {
  return (
    <div>
      <h4 className="border-b border-line pb-1.5 text-xs font-bold tracking-wider text-gold-deep">{section.title}</h4>
      <ul className="mt-2 space-y-1 text-sm leading-snug">
        {section.items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-gold" aria-hidden>
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
