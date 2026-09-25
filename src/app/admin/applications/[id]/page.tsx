import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteApplication } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Application, Profile } from "@/lib/types";
import { AUDITION_EMAIL, CLASS_OPTIONS } from "@/lib/application-fields";
import { ReviewForm } from "./ReviewForm";

type Detail = Application & {
  guardian: Pick<Profile, "guardian_name" | "phone" | "email"> | null;
};

export default async function AdminApplicationDetail({
  params,
}: PageProps<"/admin/applications/[id]">) {
  await requireAdmin("applications");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id)) notFound();

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("*, guardian:profiles!applications_guardian_id_fkey(guardian_name, phone, email)")
    .eq("id", id)
    .maybeSingle<Detail>();
  if (!app) notFound();

  // 비공개 사진은 짧은 시간(5분)만 유효한 링크로 표시
  let photoUrl: string | null = null;
  if (app.photo_path) {
    const { data } = await supabase.storage
      .from("application-photos")
      .createSignedUrl(app.photo_path, 300);
    photoUrl = data?.signedUrl ?? null;
  }

  // 승인된 신청이면 단원 명부 등록 여부 확인 (0005 미실행이면 무시)
  const { data: singer } =
    app.status === "approved"
      ? await supabase.from("singers").select("id").eq("application_id", app.id).maybeSingle()
      : { data: null };

  const cls = CLASS_OPTIONS.find((c) => c.name === app.desired_class);
  const rows: [string, string | null | undefined][] = [
    ["생년월일", app.child_birthdate],
    ["성별", app.gender],
    ["소속 기관", app.school],
    ["원하는 반", cls ? `${cls.name} (${cls.day})` : app.desired_class],
    ["사는 동", app.neighborhood],
    ["가입경로", app.join_source ? `${app.join_source}${app.join_source_detail ? ` (${app.join_source_detail})` : ""}` : null],
    ["소개해 준 사람", app.referrer],
    ["특이사항", app.notes],
  ];
  // 예전 신청서 항목 (값이 있을 때만 표시)
  const legacy: [string, string | null][] = [
    ["학년", app.grade],
    ["주소", app.address],
    ["음악 경력", app.experience],
    ["지원 동기", app.motivation],
  ];
  for (const row of legacy) if (row[1]) rows.push(row);

  return (
    <>
      <Link href="/admin/applications" className="text-sm text-ink-soft hover:underline">
        ← 신청 목록
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-navy">
          {app.child_name} <StatusBadge status={app.status} />
        </h1>
        <form action={deleteApplication}>
          <input type="hidden" name="id" value={app.id} />
          <ConfirmButton message="이 신청서와 첨부 사진을 영구 삭제할까요?" className="btn-danger text-sm">
            신청서 삭제
          </ConfirmButton>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-navy">단원 정보</h2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[8rem_1fr]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className="whitespace-pre-wrap">{value || "-"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-ink-soft">신청일시 {formatDateTime(app.created_at)}</p>
          <p className="text-sm text-ink-soft">
            동의: 개인정보 {app.consent_privacy ? "O" : "X"} · 법정대리인 {app.consent_guardian ? "O" : "X"}
            {app.photo_path && <> · 사진 {app.consent_photo ? "O" : "X"}</>}
          </p>
          <p className="text-sm text-ink-soft">
            초상권(선택): ① 공식 채널 {app.consent_media_channels ? "O" : "X"} · ② 언론·홍보물{" "}
            {app.consent_media_press ? "O" : "X"} · ③ 이름 표시 {app.consent_media_name ? "O" : "X"}
          </p>
        </section>

        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-3 font-bold text-navy">보호자</h2>
            <p>{app.guardian?.guardian_name}</p>
            <p className="text-sm text-ink-soft">{app.guardian?.phone}</p>
            <p className="text-sm text-ink-soft">{app.guardian?.email}</p>
          </section>
          <section className="card">
            <h2 className="mb-2 font-bold text-navy">오디션 동영상</h2>
            <p className="text-sm text-ink-soft">
              {AUDITION_EMAIL} 메일함에서 제목 &lsquo;[입단 오디션] {app.child_name} ({app.child_birthdate})&rsquo; 을 찾아 확인하세요.
              심사 결과를 정한 날부터 30일 이내에 메일을 삭제해 주세요.
            </p>
          </section>
          {photoUrl && (
            <section className="card">
              <h2 className="mb-3 font-bold text-navy">사진 (예전 신청서)</h2>
              {/* eslint-disable-next-line @next/next/no-img-element -- 만료되는 서명 URL 이라 이미지 최적화를 거치지 않음 */}
              <img src={photoUrl} alt={`${app.child_name} 신청 사진`} className="w-full rounded-sm" />
            </section>
          )}
        </div>
      </div>

      {app.status === "approved" && (
        <section className="card mt-6 flex flex-wrap items-center justify-between gap-3 border-gold/50 bg-gold-soft/40">
          <p className="text-sm">
            {singer ? "단원 명부에 등록된 신청입니다." : "승인된 신청입니다. 단원 명부에 등록하면 반·사진 관리와 명부 조회를 할 수 있습니다."}
          </p>
          {singer ? (
            <Link href={`/admin/singers/${singer.id}`} className="btn-outline">
              단원 정보 보기
            </Link>
          ) : (
            <Link href={`/admin/singers/new?application=${app.id}`} className="btn-primary">
              단원으로 등록
            </Link>
          )}
        </section>
      )}

      <section className="card mt-6">
        <ReviewForm id={app.id} status={app.status} note={app.admin_note} />
      </section>
    </>
  );
}
