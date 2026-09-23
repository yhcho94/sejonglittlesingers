import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { assistantConductors, conductor, type BioSection, type StaffMember } from "@/lib/staff";
import { mailHref, mapHref, site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "합창단 소개",
  description:
    "세종리틀싱어즈는 2023년 창단된 세종시 어린이 합창단으로, 음악을 통해 아이들의 감성과 협동심을 키우는 전문 합창 교육단체입니다.",
};

// 아래 수치와 문구는 합창단이 제공한 소개 글을 그대로 옮긴 것입니다.
const STATS = [
  { value: "2023", label: "창단" },
  { value: "150명", label: "단원 (2026년 4기)" },
  { value: "3개 반", label: "울림반 · 화음반 · 선율반" },
  { value: "11명", label: "전문 강사진 · 운영진" },
  { value: "연 20회", label: "내외 공연 · 초청 무대" },
];

const CLASSES = ["울림반", "화음반", "선율반"];

const CONCERTS = ["1학기 기획연주회", "2학기 정기연주회", "향상 음악회", "전국 음악 콩쿠르"];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="합창단 소개" description={site.nameEn} />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <p className="text-xl font-medium leading-relaxed text-navy md:text-2xl">
          세종리틀싱어즈는 2023년 창단된 세종시 어린이 합창단으로, 음악을 통해 아이들의 감성과 협동심을 키우는 전문
          합창 교육단체입니다.
        </p>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse bg-white px-4 py-6 text-center">
              <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
              <dd className="text-2xl font-bold text-navy">{s.value}</dd>
            </div>
          ))}
        </dl>

        <section className="card space-y-4 leading-relaxed">
          <h2 className="text-xl font-bold text-navy">합창단 이야기</h2>
          <p>
            창단 당시 25명으로 출발해 꾸준한 성장을 이어왔으며, 2026년에는 4기를 맞아 초등부까지 확대된 총 150명의
            단원이 함께하는 세종시 대표 어린이 합창단으로 자리매김하고 있습니다.
          </p>
          <p>
            특히 지휘자, 부지휘자, 반주자, 이론 강사, 사무국장 등 총 11명의 전문 강사진과 운영진이 함께하며, 12년
            경력의 어린이 합창 전문가인 단장이 직접 수업을 이끌어 더욱 탄탄한 교육 시스템을 갖추고 있습니다.
          </p>
          <p>
            세종리틀싱어즈는 앞으로도 세종시를 대표하는 어린이 합창단으로서 지역 문화예술 발전에 기여하며 성장해
            나갈 것입니다.
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">수업 · 반 구성</h2>
          <p className="mt-4 leading-relaxed">
            수업은 울림반·화음반·선율반의 3개 반으로 나누어 진행되며, ‘즐거운 합창’이라는 모토 아래 아이들이 음악을
            자연스럽게 즐기며 성장할 수 있도록 체계적인 합창 교육을 제공합니다.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <li key={c} className="rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-navy">
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">주요 활동</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-bold">공연 · 초청 무대</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                세종시에서 가장 활발한 활동을 펼치는 어린이 합창단으로, 연 20회 내외의 공연 및 주요 문화·공공 행사에
                초청되어 다양한 무대를 경험하고 있습니다.
              </p>
            </div>
            <div>
              <p className="font-bold">앨범 · 뮤직비디오</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                매년 창작곡을 바탕으로 앨범(연 2회)과 뮤직비디오(연 6편)를 제작합니다.
              </p>
            </div>
            <div>
              <p className="font-bold">주최 음악회 (연 4회)</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {CONCERTS.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                합창뿐 아니라 독창까지 아우르는 무대 경험을 제공합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">공식 채널</h2>
          <p className="mt-2 text-sm text-ink-soft">공연 영상과 소식은 공식 채널에서도 만나실 수 있습니다.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={site.links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line p-4 transition hover:border-navy"
            >
              <p className="font-bold">유튜브</p>
              <p className="mt-1 text-sm text-ink-soft">@세종리틀싱어즈 · 공식 유튜브 채널</p>
            </a>
            <a
              href={site.links.cafe}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line p-4 transition hover:border-navy"
            >
              <p className="font-bold">네이버 카페</p>
              <p className="mt-1 text-sm text-ink-soft">cafe.naver.com/sejonglittlesingers</p>
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-navy">지휘자 · 강사진</h2>

          <article className="card">
            <StaffHeading member={conductor} />
            <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {conductor.sections.map((section) => (
                <BioList key={section.title} section={section} />
              ))}
            </div>
          </article>

          <div className="grid gap-6 lg:grid-cols-3">
            {assistantConductors.map((member) => (
              <article key={member.name} className="card">
                <StaffHeading member={member} />
                <div className="mt-5 space-y-6">
                  {member.sections.map((section) => (
                    <BioList key={section.title} section={section} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">오시는 길 · 문의</h2>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-ink-soft">연습 장소</dt>
              <dd>
                {site.contact.address}{" "}
                <a href={mapHref} target="_blank" rel="noopener noreferrer" className="ml-1 text-sm text-navy underline">
                  지도 보기
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-ink-soft">전화</dt>
              <dd>
                <a href={telHref} className="hover:underline">{site.contact.phone}</a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-ink-soft">이메일</dt>
              <dd>
                <a href={mailHref} className="hover:underline">{site.contact.email}</a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}

function StaffHeading({ member }: { member: StaffMember }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-lg font-bold">{member.name}</h3>
      <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">{member.role}</span>
      {member.className && (
        <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-ink">{member.className}</span>
      )}
    </div>
  );
}

function BioList({ section }: { section: BioSection }) {
  return (
    <div>
      <h4 className="border-b border-line pb-2 text-sm font-bold tracking-wide text-gold">{section.title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {section.items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-ink-soft" aria-hidden>
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
