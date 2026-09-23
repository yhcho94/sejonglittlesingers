import { requireAdmin } from "@/lib/auth";
import { SingerTabs } from "../SingerTabs";
import { ImportForm } from "./ImportForm";

export default async function ImportSingersPage() {
  await requireAdmin();
  return (
    <>
      <SingerTabs active="import" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="card">
          <p className="eyebrow text-gold-deep">Step 1</p>
          <h2 className="mt-2 font-bold text-navy">양식 내려받기</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            기존 명단을 양식에 옮겨 적습니다. 이름·생년월일만 필수이고, 학년은 생년월일로 자동 계산됩니다. 두 번째 시트에 작성
            안내가 있습니다.
          </p>
          <a href="/admin/singers/import/template" className="btn-outline mt-4" download>
            등록 양식 (.xlsx)
          </a>
        </section>
        <section className="card">
          <p className="eyebrow text-gold-deep">Step 2</p>
          <h2 className="mt-2 mb-4 font-bold text-navy">작성한 파일 올리기</h2>
          <ImportForm />
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            한 줄이라도 오류가 있으면 아무것도 등록하지 않고 오류 줄을 알려 드립니다. 사진은 등록 후 단원별 수정 화면에서
            올려 주세요. 올린 파일은 서버에 저장하지 않으며, PC 의 파일도 등록 후 삭제해 주세요.
          </p>
        </section>
      </div>
    </>
  );
}
