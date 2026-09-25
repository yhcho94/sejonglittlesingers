import Link from "next/link";
import { linkGuardians } from "@/app/actions/singers";
import { SubmitButton } from "@/components/form";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { findGuardianCandidates } from "@/lib/guardian-match";
import { listGuardianOptions, listSingers } from "@/lib/singers-data";
import { MigrationNotice, SingerTabs } from "../SingerTabs";

// 기존 단원과 새로 가입한 보호자 회원 연결: 명부의 보호자 연락처와 회원 연락처가 같은 짝을 후보로 보여 주고,
// 관리자가 확인해 체크한 것만 연결합니다. (가입 때 휴대폰 번호를 인증하지 않으므로 자동 연결하지 않음)
export default async function GuardianLinkPage({ searchParams }: PageProps<"/admin/singers/link">) {
  await requireAdmin("singers");
  const { linked } = await searchParams;
  const [{ singers, error }, profiles] = await Promise.all([listSingers(), listGuardianOptions()]);
  const { candidates, unlinked, noPhone, noMatch } = findGuardianCandidates(
    singers.filter((s) => s.status !== "left"),
    profiles,
  );

  return (
    <>
      <SingerTabs active="link" />
      {error ? (
        <MigrationNotice />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-soft">
            단원 명부의 <strong className="text-ink">보호자 연락처</strong>와 홈페이지에 가입한 회원의{" "}
            <strong className="text-ink">연락처</strong>가 같은 경우를 연결 후보로 보여 줍니다. 가입 때 휴대폰 번호를 인증하지
            않으므로, 이름·자녀를 확인한 뒤 맞는 것만 체크해 연결해 주세요. 연결하면 보호자 마이페이지에 자녀가 나타나고
            초상권 동의·이름 게시를 직접 바꿀 수 있습니다.
          </p>
          {linked !== undefined && (
            <p className="mb-4 rounded-sm bg-green-50 px-4 py-3 text-sm text-green-800">
              {Number(linked) > 0 ? `${linked}명을 연결했습니다.` : "연결된 단원이 없습니다. 선택 항목과 연락처를 확인해 주세요."}
            </p>
          )}

          <div className="mb-6 grid gap-3 sm:grid-cols-4">
            {[
              { label: "보호자 미연결 단원", value: unlinked.length },
              { label: "연결 후보", value: candidates.length },
              { label: "가입 회원 중 같은 번호 없음", value: noMatch.length },
              { label: "명부에 보호자 연락처 없음", value: noPhone.length },
            ].map((s) => (
              <div key={s.label} className="card py-3">
                <p className="text-xs text-ink-soft">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-navy">{s.value}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 text-lg font-semibold text-navy">연결 후보 ({candidates.length})</h2>
          {candidates.length === 0 ? (
            <p className="card text-sm text-ink-soft">
              연결 후보가 없습니다. 보호자가 가입할 때 명부에 적힌 휴대폰 번호와 같은 번호를 넣었는지 확인해 주세요.
            </p>
          ) : (
            <form action={linkGuardians}>
              <div className="card overflow-x-auto p-0">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-line bg-cream text-ink-soft">
                    <tr>
                      <th className="px-3 py-3 font-medium">연결</th>
                      <th className="px-3 py-3 font-medium">단원 (반)</th>
                      <th className="px-3 py-3 font-medium">명부의 보호자</th>
                      <th className="px-3 py-3 font-medium">가입 회원</th>
                      <th className="px-3 py-3 font-medium">확인</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {candidates.map(({ singer: s, profile: p, nameMatches, ambiguous }) => (
                      <tr key={`${s.id}:${p.id}`} className="align-top">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            name="pair"
                            value={`${s.id}:${p.id}`}
                            defaultChecked={nameMatches && !ambiguous}
                            aria-label={`${s.name} - ${p.guardian_name} 연결`}
                          />
                        </td>
                        <td className="px-3 py-3 font-medium">
                          <Link href={`/admin/singers/${s.id}`} className="hover:underline">{s.name}</Link>
                          <span className="ml-1 text-xs font-normal text-ink-soft">{s.class_name ?? ""}</span>
                        </td>
                        <td className="px-3 py-3">
                          {s.guardian_name ?? "-"}
                          <br />
                          <span className="text-ink-soft">{s.guardian_phone}</span>
                        </td>
                        <td className="px-3 py-3">
                          {p.guardian_name}
                          <br />
                          <span className="text-ink-soft">
                            {p.phone} · {p.email} · 가입 {formatDate(p.created_at)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {ambiguous ? (
                            <span className="text-red-700">같은 번호 회원이 여럿 — 한 명만 선택</span>
                          ) : nameMatches ? (
                            <span className="text-green-800">번호·이름 일치</span>
                          ) : (
                            <span className="text-amber-800">번호만 일치 — 이름 확인</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                번호와 이름이 모두 같은 후보는 미리 체크되어 있습니다. 형제·자매는 같은 보호자에게 각각 연결됩니다. 단원 한
                명에는 보호자 계정 하나만 연결됩니다.
              </p>
              <div className="mt-4">
                <SubmitButton className="btn-primary" pendingText="연결 중...">선택한 연결 승인</SubmitButton>
              </div>
            </form>
          )}

          {noPhone.length + noMatch.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium text-navy">
                후보가 없는 미연결 단원 ({noPhone.length + noMatch.length}) — 수동 연결
              </summary>
              <p className="mt-2 text-xs text-ink-soft">
                단원 이름을 눌러 &lsquo;수정&rsquo;에서 &lsquo;홈페이지 가입 회원과 연결&rsquo;을 직접 고르거나, 명부의 보호자
                연락처를 고친 뒤 이 화면에서 다시 확인하세요.
              </p>
              <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
                {[...noMatch, ...noPhone].map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/singers/${s.id}/edit`} className="hover:underline">{s.name}</Link>
                    <span className="ml-1 text-xs text-ink-soft">
                      {s.class_name ?? ""} · {s.guardian_phone ? "같은 번호 가입자 없음" : "연락처 없음"}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </>
  );
}
