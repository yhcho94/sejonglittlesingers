"use client";

import { useActionState, useState } from "react";
import { saveSinger } from "@/app/actions/singers";
import { FormMessage, SubmitButton } from "@/components/form";
import { MediaConsentFields } from "@/components/MediaConsentFields";
import { resizeImage } from "@/lib/image-resize";
import { JOIN_SOURCES } from "@/lib/join-source";
import { createClient } from "@/lib/supabase/client";
import { CLASS_NAMES, STATUS_LABEL, gradeCode, gradeLabel, type Singer } from "@/lib/singers";
import type { GuardianProfile } from "@/lib/singers-data";

type Initial = Partial<Singer> & { application_id?: number | null };

export function SingerForm({
  initial,
  guardians,
  photoUrl,
}: {
  initial: Initial;
  guardians: GuardianProfile[];
  photoUrl: string | null;
}) {
  const [state, action] = useActionState(saveSinger, undefined);
  const [photoPath, setPhotoPath] = useState(initial.photo_path ?? "");
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [birthdate, setBirthdate] = useState(initial.birthdate ?? "");
  const [yearOnly, setYearOnly] = useState(initial.birth_year_only ?? false);
  const [gradeOverride, setGradeOverride] = useState(
    initial.grade_override === null || initial.grade_override === undefined ? "" : String(initial.grade_override),
  );

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("JPG, PNG, WEBP 사진만 올릴 수 있습니다.");
      return;
    }
    setUploading(true);
    try {
      const { blob } = await resizeImage(file, 800);
      const path = `singers/${crypto.randomUUID()}.jpg`;
      const { error } = await createClient()
        .storage.from("singer-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      setPhotoPath(path);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setPhotoError("사진을 올리지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  }

  const autoGrade = birthdate ? gradeLabel(gradeCode(birthdate, null)) : "";

  return (
    <form action={action} className="space-y-8">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {initial.application_id && <input type="hidden" name="application_id" value={initial.application_id} />}
      <input type="hidden" name="photo_path" value={photoPath} />

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* 사진 */}
        <div>
          <p className="label">사진</p>
          <div className="flex aspect-[3/4] w-40 items-center justify-center overflow-hidden border border-line bg-cream text-xs text-ink-soft md:w-full">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- 비공개 저장소의 임시 링크·미리보기
              <img src={preview} alt="단원 사진" className="h-full w-full object-cover" />
            ) : (
              "사진 없음"
            )}
          </div>
          <label className="btn-outline mt-3 w-40 cursor-pointer text-xs md:w-full">
            {uploading ? "올리는 중..." : preview ? "사진 바꾸기" : "사진 올리기"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
          </label>
          {preview && (
            <button
              type="button"
              className="mt-2 w-40 text-xs text-red-700 underline md:w-full"
              onClick={() => {
                setPhotoPath("");
                setPreview(null);
              }}
            >
              사진 삭제
            </button>
          )}
          {photoError && <p className="mt-2 text-xs text-red-700">{photoError}</p>}
        </div>

        {/* 기본 정보 */}
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-bold text-navy">단원 정보</legend>
          <div>
            <label htmlFor="name" className="label">이름 *</label>
            <input id="name" name="name" required maxLength={50} defaultValue={initial.name} className="input" />
          </div>
          <div>
            <label htmlFor="birthdate" className="label">생년월일 *</label>
            {yearOnly ? (
              <select
                id="birthdate"
                name="birthdate"
                required
                value={birthdate ? `${birthdate.slice(0, 4)}-01-01` : ""}
                onChange={(e) => setBirthdate(e.target.value)}
                className="input"
              >
                <option value="">출생연도 선택</option>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 3 - i).map((y) => (
                  <option key={y} value={`${y}-01-01`}>
                    {y}년생
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="birthdate"
                name="birthdate"
                type="date"
                required
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="input"
              />
            )}
            <label className="mt-1.5 flex items-center gap-2 text-xs text-ink-soft">
              <input type="checkbox" name="birth_year_only" checked={yearOnly} onChange={(e) => setYearOnly(e.target.checked)} />
              생일은 모르고 출생연도만 알아요
            </label>
          </div>
          <div>
            <label htmlFor="class_name" className="label">반</label>
            <select id="class_name" name="class_name" defaultValue={initial.class_name ?? ""} className="input">
              <option value="">미지정</option>
              {CLASS_NAMES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label">상태</label>
            <select id="status" name="status" defaultValue={initial.status ?? "active"} className="input">
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="label">성별</label>
            <select id="gender" name="gender" defaultValue={initial.gender ?? ""} className="input">
              <option value="">선택 안 함</option>
              <option>여</option>
              <option>남</option>
            </select>
          </div>
          <div>
            <label htmlFor="school" className="label">학교</label>
            <input id="school" name="school" maxLength={100} defaultValue={initial.school ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="grade_override" className="label">학년</label>
            <select
              id="grade_override"
              name="grade_override"
              value={gradeOverride}
              onChange={(e) => setGradeOverride(e.target.value)}
              className="input"
            >
              <option value="">자동 (출생연도 기준{autoGrade ? `: ${autoGrade}` : ""})</option>
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i} value={i}>
                  {gradeLabel(i)} (직접 지정)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-soft">조기·유예 입학 등 예외일 때만 직접 지정하세요.</p>
          </div>
          <div>
            <label htmlFor="part" className="label">파트</label>
            <input id="part" name="part" maxLength={20} placeholder="예: 소프라노" defaultValue={initial.part ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="cohort" className="label">기수</label>
            <input id="cohort" name="cohort" type="number" min={1} max={99} defaultValue={initial.cohort ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="join_source" className="label">가입경로</label>
            <select id="join_source" name="join_source" defaultValue={initial.join_source ?? ""} className="input">
              <option value="">미입력</option>
              {JOIN_SOURCES.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="joined_on" className="label">입단일</label>
            <input id="joined_on" name="joined_on" type="date" defaultValue={initial.joined_on ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="left_on" className="label">퇴단일</label>
            <input id="left_on" name="left_on" type="date" defaultValue={initial.left_on ?? ""} className="input" />
          </div>
        </fieldset>
      </div>

      <fieldset className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <legend className="mb-2 pt-6 font-bold text-navy">보호자</legend>
        <div className="sm:col-span-2">
          <label htmlFor="guardian_id" className="label">홈페이지 가입 회원과 연결</label>
          <select id="guardian_id" name="guardian_id" defaultValue={initial.guardian_id ?? ""} className="input">
            <option value="">연결 안 함</option>
            {guardians.map((g) => (
              <option key={g.id} value={g.id}>
                {g.guardian_name} · {g.phone} · {g.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-soft">연결하면 보호자 정보를 회원 정보에서 가져옵니다.</p>
        </div>
        <div>
          <label htmlFor="guardian_name" className="label">보호자 이름 (가입하지 않은 경우)</label>
          <input id="guardian_name" name="guardian_name" maxLength={50} defaultValue={initial.guardian_name ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="guardian_phone" className="label">보호자 연락처 (가입하지 않은 경우)</label>
          <input id="guardian_phone" name="guardian_phone" type="tel" maxLength={20} defaultValue={initial.guardian_phone ?? ""} className="input" />
        </div>
      </fieldset>

      <div className="space-y-4 border-t border-line pt-6">
        <div>
          <label htmlFor="notes" className="label">비고</label>
          <textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={initial.notes ?? ""} className="input" />
        </div>
      </div>

      <fieldset className="space-y-3 border-t border-line pt-6">
        <legend className="mb-2 pt-6 font-bold text-navy">초상권(사진·영상) 이용 동의</legend>
        <p className="text-xs text-ink-soft">
          보호자에게 동의를 받은 항목만 체크하세요 (입단 신청서·종이 동의서 등). 보호자가 마이페이지에서 바꾸면 이곳에도
          반영되며, 모든 변경은 동의 기록에 남습니다.
        </p>
        <MediaConsentFields
          showNotice={false}
          defaults={{
            channels: initial.consent_media_channels ?? false,
            press: initial.consent_media_press ?? false,
            name: initial.name_public ?? false,
          }}
        />
      </fieldset>

      <FormMessage state={state} />
      <SubmitButton className="btn-primary px-8" pendingText="저장 중...">
        저장
      </SubmitButton>
    </form>
  );
}
