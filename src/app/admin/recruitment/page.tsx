import { requireAdmin } from "@/lib/auth";
import { getRecruitment, listAuditionSongs } from "@/lib/content";
import { AuditionSongsForm } from "./AuditionSongsForm";
import { RecruitmentForm } from "./RecruitmentForm";

export default async function AdminRecruitmentPage() {
  await requireAdmin("recruitment");
  const [data, songs] = await Promise.all([getRecruitment(), listAuditionSongs()]);
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">입단 안내 관리</h1>
      <div className="card max-w-3xl">
        <RecruitmentForm data={data} />
      </div>

      <h2 id="audition-songs" className="mt-10 mb-2 text-xl font-bold text-navy">오디션 지정곡 (최대 5곡)</h2>
      <p className="mb-4 text-sm text-ink-soft">
        &lsquo;입단 안내&rsquo; 화면과 입단 신청서의 동영상 안내에 표시됩니다. 곡마다 반주 링크나 반주 음원 파일 중 하나 이상을
        넣어 주세요.
      </p>
      <div className="card max-w-3xl">
        <AuditionSongsForm songs={songs} />
      </div>
    </>
  );
}
