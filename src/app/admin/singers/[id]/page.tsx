import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSinger } from "@/app/actions/singers";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { joinSourceLabel } from "@/lib/join-source";
import { consentExpiresOn } from "@/lib/media-consent";
import { birthLabel, gradeCode, gradeLabel, singerAge } from "@/lib/singers";
import { getSinger, guardianMap, signedPhotoUrls, singersOfGuardian } from "@/lib/singers-data";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";
import { ConsentPill } from "../ConsentPill";
import { StatusPill } from "../StatusPill";

export default async function AdminSingerDetail({ params }: PageProps<"/admin/singers/[id]">) {
  await requireAdmin("singers");
  const singer = await getSinger(Number((await params).id));
  if (!singer) notFound();

  const [photos, guardians, siblings, application, consentLog] = await Promise.all([
    signedPhotoUrls([singer.photo_path], 300),
    guardianMap([singer.guardian_id]),
    singer.guardian_id ? singersOfGuardian(singer.guardian_id) : Promise.resolve([]),
    singer.application_id
      ? createClient().then((sb) =>
          sb
            .from("applications")
            .select("id, status, created_at")
            .eq("id", singer.application_id!)
            .maybeSingle<{ id: number; status: ApplicationStatus; created_at: string }>()
            .then((r) => r.data),
        )
      : Promise.resolve(null),
    createClient().then((sb) =>
      sb
        .from("media_consent_log")
        .select("id, channels, press, name, by_guardian, version, created_at")
        .eq("singer_id", singer.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<{ id: number; channels: boolean; press: boolean; name: boolean; by_guardian: boolean; version: string | null; created_at: string }[]>()
        .then((r) => r.data ?? []),
    ),
  ]);
  const photoUrl = singer.photo_path ? photos.get(singer.photo_path) : undefined;
  const guardian = singer.guardian_id ? guardians.get(singer.guardian_id) : undefined;
  const grade = gradeLabel(gradeCode(singer.birthdate, singer.grade_override));

  const rows: [string, React.ReactNode][] = [
    ["반", singer.class_name],
    ["학년", `${grade}${singer.grade_override !== null ? " (직접 지정)" : ""}`],
    [
      "생년월일",
      !singer.birthdate
        ? null
        : singer.birth_year_only
          ? `${birthLabel(singer)} (생일 미입력)`
          : `${singer.birthdate} (만 ${singerAge(singer)}세)`,
    ],
    ["가입경로", joinSourceLabel(singer.join_source, singer.join_source_detail) || null],
    ["단원 소개 이름", singer.name_hidden ? "숨김 (보호자 요청)" : singer.status === "active" ? "게시 중" : "게시 안 함 (활동 단원만 게시)"],
    ["성별", singer.gender],
    ["학교", singer.school],
    ["파트", singer.part],
    ["기수", singer.cohort ? `${singer.cohort}기` : null],
    ["입단일", singer.joined_on],
    ["퇴단일", singer.left_on],
    ["비고", singer.notes],
  ];

  return (
    <>
      <Link href="/admin/singers" className="text-sm text-ink-soft hover:underline">
        ← 단원 명부
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-navy">
          {singer.name} <StatusPill status={singer.status} />
        </h1>
        <div className="flex gap-2">
          <Link href={`/admin/singers/${singer.id}/edit`} className="btn-primary">
            수정
          </Link>
          <form action={deleteSinger}>
            <input type="hidden" name="id" value={singer.id} />
            <ConfirmButton
              message={`${singer.name} 단원 정보와 사진을 영구 삭제할까요? 퇴단한 경우에는 삭제 대신 상태를 '퇴단'으로 바꿀 수 있습니다.`}
              className="btn-danger"
            >
              삭제
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr_1fr]">
        <section className="card p-4 md:p-4">
          <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-cream text-sm text-ink-soft">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 만료되는 서명 URL 이라 이미지 최적화를 거치지 않음
              <img src={photoUrl} alt={`${singer.name} 사진`} className="h-full w-full object-cover" />
            ) : (
              "사진 없음"
            )}
          </div>
          <Link href={`/admin/singers/${singer.id}/edit`} className="btn-outline mt-3 w-full text-xs">
            {photoUrl ? "사진 바꾸기" : "사진 올리기"}
          </Link>
        </section>

        <section className="card">
          <h2 className="mb-4 font-bold text-navy">단원 정보</h2>
          <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2.5 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="whitespace-pre-wrap">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-4 font-bold text-navy">보호자 (부모님)</h2>
            {guardian ? (
              <>
                <p className="mb-3 text-xs font-medium text-gold-deep">홈페이지 가입 회원</p>
                <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2.5 text-sm">
                  <dt className="text-ink-soft">이름</dt>
                  <dd>{guardian.guardian_name}</dd>
                  <dt className="text-ink-soft">연락처</dt>
                  <dd>
                    <a href={`tel:${guardian.phone}`} className="hover:underline">
                      {guardian.phone}
                    </a>
                  </dd>
                  <dt className="text-ink-soft">이메일</dt>
                  <dd className="break-all">
                    <a href={`mailto:${guardian.email}`} className="hover:underline">
                      {guardian.email}
                    </a>
                  </dd>
                  <dt className="text-ink-soft">가입일</dt>
                  <dd>{formatDate(guardian.created_at)}</dd>
                </dl>
              </>
            ) : singer.guardian_name || singer.guardian_phone ? (
              <>
                <p className="mb-3 text-xs text-ink-soft">홈페이지 미가입 (직접 입력)</p>
                <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2.5 text-sm">
                  <dt className="text-ink-soft">이름</dt>
                  <dd>{singer.guardian_name || "-"}</dd>
                  <dt className="text-ink-soft">연락처</dt>
                  <dd>{singer.guardian_phone || "-"}</dd>
                </dl>
              </>
            ) : (
              <p className="text-sm text-ink-soft">보호자 정보가 없습니다. 수정 화면에서 가입 회원과 연결하거나 직접 입력하세요.</p>
            )}
            {guardian && (singer.guardian_name || singer.guardian_phone) && (
              <p className="mt-3 text-xs text-ink-soft">
                추가 입력: {singer.guardian_name} {singer.guardian_phone}
              </p>
            )}
          </section>

          {siblings.length > 1 && (
            <section className="card">
              <h2 className="mb-3 font-bold text-navy">같은 보호자의 단원</h2>
              <ul className="space-y-1.5 text-sm">
                {siblings
                  .filter((s) => s.id !== singer.id)
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <Link href={`/admin/singers/${s.id}`} className="text-navy hover:underline">
                        {s.name}
                      </Link>
                      <span className="text-ink-soft">{s.class_name ?? ""}</span>
                      <StatusPill status={s.status} />
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <section className="card">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-navy">
              초상권 동의 <ConsentPill singer={singer} />
            </h2>
            <ul className="space-y-1.5 text-sm">
              {[
                ["① 공식 채널 게시", singer.consent_media_channels],
                ["② 언론·홍보물", singer.consent_media_press],
                ["③ 게시물·영상 자막 이름 표시", singer.name_public],
              ].map(([label, on]) => (
                <li key={String(label)} className="flex justify-between gap-3">
                  <span className="text-ink-soft">{label}</span>
                  <span className={on ? "font-medium text-emerald-800" : "text-red-700"}>{on ? "동의" : "미동의"}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              {singer.consent_updated_at && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">유효기간</dt>
                  <dd>
                    {formatDate(singer.consent_updated_at)} ~ {formatDate(consentExpiresOn(singer.consent_updated_at)!)}
                  </dd>
                </div>
              )}
              {singer.consent_note && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">비고</dt>
                  <dd className="text-right">{singer.consent_note}</dd>
                </div>
              )}
            </dl>
            {consentLog.length > 0 && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-ink-soft">변경 기록 {consentLog.length}건</summary>
                <ul className="mt-2 space-y-1">
                  {consentLog.map((l) => (
                    <li key={l.id} className="flex flex-wrap gap-x-2 text-ink-soft">
                      <span className="tabular-nums">{formatDateTime(l.created_at)}</span>
                      <span>{l.by_guardian ? "보호자" : "관리자"}</span>
                      <span className="text-ink">
                        {[l.channels && "①", l.press && "②", l.name && "③"].filter(Boolean).join(" ") || "모두 미동의"}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          {application && (
            <section className="card">
              <h2 className="mb-3 font-bold text-navy">입단 신청서</h2>
              <p className="flex items-center gap-2 text-sm">
                <Link href={`/admin/applications/${application.id}`} className="text-navy hover:underline">
                  {formatDate(application.created_at)} 신청서 보기
                </Link>
                <StatusBadge status={application.status} />
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
