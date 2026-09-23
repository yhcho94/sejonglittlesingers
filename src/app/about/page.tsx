import type { Metadata } from "next";
import Link from "next/link";
import { OrgChart } from "@/components/OrgChart";
import { PageHeader } from "@/components/PageHeader";
import { mailHref, mapHref, site, smsHref } from "@/lib/site";
import { conductor, organization, staffGroups, type BioSection, type StaffMember } from "@/lib/staff";

export const metadata: Metadata = {
  title: "합창단 소개",
  description:
    "세종리틀싱어즈는 2023년 창단된 세종시 어린이 합창단으로, 음악을 통해 아이들의 감성과 협동심을 키우는 전문 합창 교육단체입니다.",
};

// 아래 수치와 문구는 합창단이 제공한 소개 글을 그대로 옮긴 것입니다.
const STATS = [
  { value: "2023", label: "창단" },
  { value: "150", unit: "명", label: "단원 (2026년 4기)" },
  { value: "3", unit: "개 반", label: "울림반 · 화음반 · 선율반" },
  { value: "11", unit: "명", label: "전문 강사진 · 운영진" },
  { value: "20", unit: "회", label: "연간 공연 (내외)" },
];

const CONCERTS = ["1학기 기획연주회", "2학기 정기연주회", "향상 음악회", "전국 음악 콩쿠르"];

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 md:mb-14">
      <p className="eyebrow text-gold-deep">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold text-navy md:text-4xl">{title}</h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="합창단 소개"
        description="‘즐거운 합창’이라는 모토 아래, 아이들이 음악을 자연스럽게 즐기며 성장하는 합창단입니다."
      />

      {/* 인사 · 이야기 */}
      <section className="section-y">
        <div className="container-page grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow text-gold-deep">Our Story</p>
            <p className="mt-4 font-[family-name:var(--font-serif)] text-2xl font-bold leading-snug text-navy md:text-[2rem] md:leading-snug">
              세종리틀싱어즈는 2023년 창단된 세종시 어린이 합창단으로, 음악을 통해 아이들의 감성과 협동심을 키우는 전문 합창
              교육단체입니다.
            </p>
            <span className="gold-rule mt-8" />
          </div>
          <div className="space-y-5 leading-relaxed text-ink-soft md:col-span-7 md:pt-10 md:text-lg md:leading-relaxed">
            <p>
              창단 당시 25명으로 출발해 꾸준한 성장을 이어왔으며, 2026년에는 4기를 맞아 초등부까지 확대된 총 150명의
              단원이 함께하는 세종시 대표 어린이 합창단으로 자리매김하고 있습니다.
            </p>
            <p>
              특히 지휘자, 부지휘자, 반주자, 이론 강사, 사무국장 등 총 11명의 전문 강사진과 운영진이 함께하며, 12년 경력의
              어린이 합창 전문가인 단장이 직접 수업을 이끌어 더욱 탄탄한 교육 시스템을 갖추고 있습니다.
            </p>
            <p>
              세종리틀싱어즈는 앞으로도 세종시를 대표하는 어린이 합창단으로서 지역 문화예술 발전에 기여하며 성장해 나갈
              것입니다.
            </p>
          </div>
        </div>

        <div className="container-page mt-14 md:mt-20">
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col-reverse items-center bg-white px-3 py-8 text-center ${
                  i === STATS.length - 1 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <dt className="mt-2 text-xs text-ink-soft">{s.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-4xl font-semibold text-navy">
                  {s.value}
                  {s.unit && (
                    <span className="ml-0.5 font-[family-name:var(--font-sans)] text-sm font-medium text-ink-soft">
                      {s.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 반 구성 · 활동 */}
      <section className="section-y bg-ivory">
        <div className="container-page">
          <Heading eyebrow="Program" title="수업과 활동" />
          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
            <div className="bg-white p-8 md:p-10">
              <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-navy">수업 · 반 구성</p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                수업은 울림반·화음반·선율반의 3개 반으로 나누어 진행되며, ‘즐거운 합창’이라는 모토 아래 아이들이 음악을
                자연스럽게 즐기며 성장할 수 있도록 체계적인 합창 교육을 제공합니다.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {organization.classes.map((c) => (
                  <li
                    key={c.name}
                    className="border px-4 py-1.5 text-sm font-medium"
                    style={{ color: c.color, borderColor: c.color }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 md:p-10">
              <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-navy">공연 · 초청 무대</p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                세종시에서 가장 활발한 활동을 펼치는 어린이 합창단으로, 연 20회 내외의 공연 및 주요 문화·공공 행사에
                초청되어 다양한 무대를 경험하고 있습니다.
              </p>
              <Link href="/concerts#history" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy">
                공연 이력 보기 <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="bg-white p-8 md:p-10">
              <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-navy">앨범 · 뮤직비디오</p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                매년 창작곡을 바탕으로 앨범(연 2회)과 뮤직비디오(연 6편)를 제작합니다.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10">
              <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-navy">주최 음악회 · 연 4회</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-ink-soft">
                {CONCERTS.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-gold" aria-hidden>
                      —
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                합창뿐 아니라 독창까지 아우르는 무대 경험을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 조직도 */}
      <section className="section-y">
        <div className="container-page">
          <Heading eyebrow="Organization" title={`${organization.year} 조직도`} />
          <OrgChart />
        </div>
      </section>

      {/* 지휘자 · 강사진 */}
      <section className="section-y bg-ivory">
        <div className="container-page">
          <Heading eyebrow="Conductor & Faculty" title="지휘자 · 강사진" />

          <article className="border border-line bg-white">
            <div className="flex flex-wrap items-end justify-between gap-4 bg-navy px-6 py-7 text-white md:px-10 md:py-9">
              <div>
                <p className="eyebrow text-gold">{conductor.role}</p>
                <h3 className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-bold md:text-4xl">
                  {conductor.name}
                </h3>
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
            <div className="grid gap-x-12 gap-y-8 p-6 md:grid-cols-2 md:p-10">
              {conductor.sections.map((section) => (
                <BioList key={section.title} section={section} />
              ))}
            </div>
          </article>

          {staffGroups.map((group) => (
            <div key={group.title} className="mt-14">
              <h3 className="flex items-center gap-4 font-[family-name:var(--font-serif)] text-xl font-bold text-navy">
                {group.title}
                <span className="h-px flex-1 bg-line" />
              </h3>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member) => (
                  <article key={member.name} className="border border-line bg-white p-6 md:p-7">
                    <StaffHeading member={member} />
                    <div className="mt-5 space-y-6">
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

      {/* 공식 채널 · 문의 */}
      <section className="section-y">
        <div className="container-page grid gap-14 md:grid-cols-2 md:gap-12">
          <div>
            <Heading eyebrow="Channels" title="공식 채널" />
            <div className="grid gap-px overflow-hidden border border-line bg-line">
              {[
                { href: site.links.youtube, name: "유튜브", sub: "@세종리틀싱어즈 · 공식 유튜브 채널" },
                { href: site.links.cafe, name: "네이버 카페", sub: "cafe.naver.com/sejonglittlesingers" },
              ].map((ch) => (
                <a
                  key={ch.name}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 bg-white p-6 transition hover:bg-ivory"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{ch.name}</span>
                    <span className="mt-1 block text-sm text-ink-soft">{ch.sub}</span>
                  </span>
                  <span className="text-gold-deep" aria-hidden>
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <Heading eyebrow="Contact" title="오시는 길 · 문의" />
            <dl className="divide-y divide-line border-y border-line">
              <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr]">
                <dt className="text-sm text-ink-soft">연습 장소</dt>
                <dd>
                  {site.contact.address}
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 whitespace-nowrap text-sm text-gold-deep underline underline-offset-4"
                  >
                    지도 보기
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr]">
                <dt className="text-sm text-ink-soft">입단·공연 문의</dt>
                <dd>
                  단장{" "}
                  <a href={smsHref} className="font-medium text-navy hover:underline">
                    {site.contact.phone}
                  </a>
                  <span className="block text-sm text-ink-soft">문자 메시지로 보내 주세요</span>
                </dd>
              </div>
              <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr]">
                <dt className="text-sm text-ink-soft">이메일</dt>
                <dd>
                  <a href={mailHref} className="hover:underline">
                    {site.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
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
        <h4 className="mt-1 font-[family-name:var(--font-serif)] text-xl font-bold">{member.name}</h4>
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
      <h5 className="border-b border-line pb-2 text-xs font-bold tracking-wider text-gold-deep">{section.title}</h5>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
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
