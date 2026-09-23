import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 초안입니다. 게시 전 합창단 운영 주체의 확인과 법률 검토를 거쳐야 합니다.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="개인정보처리방침" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-6 rounded-lg border border-dashed border-gold bg-gold-soft p-4 text-sm">
          이 문서는 <strong>초안</strong>입니다. 표시된 항목(보유 기간, 국외 이전, 시행일)을 채우고 법률 검토를 거친 뒤
          확정해 주세요.
        </p>

        <article className="card space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc">
          <p>
            {site.name}(이하 &quot;합창단&quot;)은 「개인정보 보호법」에 따라 정보주체의
            개인정보를 보호하고 관련 고충을 원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2>1. 개인정보의 처리 목적</h2>
            <ul>
              <li>회원 관리: 보호자 회원 식별, 본인 확인, 부정 이용 방지</li>
              <li>입단 신청 처리: 신청 접수, 심사, 결과 안내</li>
              <li>합창단 운영: 연습·공연 일정 등 운영 관련 안내</li>
            </ul>
          </section>

          <section>
            <h2>2. 처리하는 개인정보 항목</h2>
            <ul>
              <li>회원가입(보호자, 필수): 이름, 연락처, 이메일, 비밀번호(암호화 저장)</li>
              <li>
                입단 신청(단원, 필수): 이름, 생년월일 / (선택): 학교, 학년, 주소, 음악 경력, 지원 동기, 사진
              </li>
              <li>자동 수집: 서비스 이용 과정에서 접속 기록, 로그인 유지를 위한 쿠키</li>
            </ul>
          </section>

          <section>
            <h2>3. 개인정보의 처리 및 보유 기간</h2>
            <ul>
              <li>
                회원 정보: 회원 탈퇴 시까지 <Placeholder>세부 기간 확인 필요</Placeholder>
              </li>
              <li>
                입단 신청 정보
                <ul className="mt-1">
                  <li>심사 대기 중 신청을 취소한 경우: 즉시 파기</li>
                  <li>
                    반려된 경우: 사진과 선택 항목(학교·학년·주소·음악 경력·지원 동기)은 반려 즉시 파기하고, 결과 안내를 위한
                    최소 정보(단원 이름·생년월일·심사 결과)는 반려 후 5일 이내에 파기
                  </li>
                  <li>
                    승인된 경우: 단원 활동 종료 후 <Placeholder>보유 기간 확인 필요</Placeholder>
                  </li>
                </ul>
              </li>
              <li>관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</li>
            </ul>
          </section>

          <section>
            <h2>4. 만 14세 미만 아동의 개인정보 처리</h2>
            <p>
              합창단은 만 14세 미만 아동의 개인정보를 처리하기 위하여 그 법정대리인의 동의를 받습니다. 회원가입과 입단
              신청은 법정대리인(보호자) 명의로만 진행되며, 신청 시 법정대리인 동의를 확인합니다.
            </p>
          </section>

          <section>
            <h2>5. 개인정보의 제3자 제공</h2>
            <p>합창단은 정보주체의 동의 또는 법률의 특별한 규정이 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.</p>
          </section>

          <section>
            <h2>6. 개인정보 처리의 위탁 및 국외 이전</h2>
            <p>합창단은 홈페이지 운영을 위하여 다음과 같이 개인정보 처리 업무를 위탁합니다.</p>
            <ul>
              <li>Supabase Inc.: 회원 인증, 데이터베이스 및 파일 저장 (데이터 저장 위치: 대한민국 서울 리전)</li>
              <li>Vercel Inc.: 웹사이트 호스팅 및 요청 처리</li>
            </ul>
            <p className="mt-2">
              <Placeholder>국외 이전 해당 여부, 이전 국가, 이전 일시·방법, 보유 기간 등 법정 고지 항목 확인 필요</Placeholder>
            </p>
          </section>

          <section>
            <h2>7. 개인정보의 파기</h2>
            <p>
              보유 기간이 끝났거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로
              삭제합니다.
            </p>
          </section>

          <section>
            <h2>8. 정보주체와 법정대리인의 권리·의무 및 행사 방법</h2>
            <p>
              정보주체와 법정대리인은 언제든지 개인정보 열람, 정정·삭제, 처리 정지 및 동의 철회를 요구할 수 있습니다. 아래
              개인정보 보호책임자에게 서면, 전화, 이메일로 요청하시면 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h2>9. 개인정보의 안전성 확보 조치</h2>
            <ul>
              <li>비밀번호 암호화 저장, 전 구간 암호화 통신(HTTPS)</li>
              <li>데이터베이스 접근 통제: 본인 정보는 본인만, 전체 정보는 지정된 관리자만 열람</li>
              <li>입단 신청 사진은 비공개 저장소에 보관하며 관리자만 열람</li>
              <li>개인정보 취급자 최소화</li>
            </ul>
          </section>

          <section>
            <h2>10. 쿠키의 사용</h2>
            <p>
              홈페이지는 로그인 상태를 유지하기 위한 필수 쿠키만 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나,
              이 경우 로그인이 필요한 서비스를 이용할 수 없습니다.
            </p>
          </section>

          <section>
            <h2>11. 개인정보 보호책임자</h2>
            <ul>
              <li>성명: {site.privacyOfficer.name}</li>
              <li>연락처: {site.privacyOfficer.contact}</li>
            </ul>
          </section>

          <section>
            <h2>12. 권익침해 구제 방법</h2>
            <ul>
              <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청: 1301 (www.spo.go.kr)</li>
              <li>경찰청: 182 (ecrm.police.go.kr)</li>
            </ul>
          </section>

          <section>
            <h2>13. 시행일</h2>
            <p>
              이 개인정보처리방침은 <Placeholder>시행일 입력 필요</Placeholder>부터 적용됩니다.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
