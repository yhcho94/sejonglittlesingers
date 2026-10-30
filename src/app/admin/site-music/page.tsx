import { deleteMusicTrack, moveMusicTrack, updateMusicTrack } from "@/app/actions/site-music";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/form";
import { requireAdmin } from "@/lib/auth";
import { getSiteMusic } from "@/lib/content";
import { musicFileUrl } from "@/lib/site-music";
import { MusicSettingsForm } from "./MusicSettingsForm";
import { MusicUploader } from "./MusicUploader";

// 최상위 관리자: 홈페이지 배경음악 켜기·음량 · 플레이리스트 (곡 올리기 · 순서 · 사용 여부 · 삭제)
export default async function SiteMusicPage() {
  await requireAdmin("members");
  const { settings, tracks } = await getSiteMusic();
  const playing = tracks.filter((t) => t.is_active).length;

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-navy">배경음악</h1>
      <p className="mb-6 text-sm text-ink-soft">
        켜 두면 홈페이지 방문자에게 플레이리스트 순서대로 음악이 나옵니다. 브라우저 정책상 소리 있는 자동 재생은 막혀 있어,
        방문자가 화면을 처음 누르는(터치·클릭) 순간 재생이 시작됩니다. 방문자가 음악 버튼으로 끄면 그 기기에서는 다시 켜기 전까지
        나오지 않습니다.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 font-bold text-navy">설정</h2>
          <MusicSettingsForm settings={settings} />
          {settings.enabled && playing === 0 && (
            <p className="mt-3 text-xs text-red-700">재생할 곡이 없습니다. 오른쪽에서 음악 파일을 올려 주세요.</p>
          )}
        </section>
        <section className="card">
          <h2 className="mb-4 font-bold text-navy">곡 올리기</h2>
          <MusicUploader />
          <p className="mt-3 text-xs text-ink-soft">
            홈페이지에서 누구나 듣게 되므로 합창단 공연 녹음 등 <strong>저작권 문제가 없는 음원</strong>만 올려 주세요.
          </p>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-bold text-navy">
          플레이리스트 {tracks.length}곡 <span className="text-sm font-normal text-ink-soft">위에서부터 차례로 재생 · 마지막 곡 다음엔 처음으로</span>
        </h2>
        {tracks.length === 0 ? (
          <p className="card text-center text-sm text-ink-soft">아직 곡이 없습니다.</p>
        ) : (
          <ol className="space-y-3">
            {tracks.map((t, i) => (
              <li key={t.id} className={`card flex flex-wrap items-center gap-3 py-3 ${t.is_active ? "" : "opacity-60"}`}>
                <span className="w-6 text-center font-bold text-navy">{i + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <form action={moveMusicTrack}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button disabled={i === 0} aria-label={`${t.title} 위로`} className="px-1 text-xs text-navy disabled:opacity-30">
                      ▲
                    </button>
                  </form>
                  <form action={moveMusicTrack}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      disabled={i === tracks.length - 1}
                      aria-label={`${t.title} 아래로`}
                      className="px-1 text-xs text-navy disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </form>
                </div>
                <form action={updateMusicTrack} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <input
                    name="title"
                    required
                    maxLength={100}
                    defaultValue={t.title}
                    aria-label="곡명"
                    className="input min-w-40 flex-1 px-2 py-1 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" name="is_active" defaultChecked={t.is_active} />
                    재생
                  </label>
                  <SubmitButton className="text-xs text-navy underline" pendingText="...">
                    저장
                  </SubmitButton>
                </form>
                <audio controls preload="none" src={musicFileUrl(t.file_path)} className="h-9 max-w-full" />
                <form action={deleteMusicTrack}>
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton message={`'${t.title}'을(를) 플레이리스트와 저장소에서 삭제할까요?`} className="text-xs text-red-700 underline">
                    삭제
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
