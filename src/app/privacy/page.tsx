import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 초안입니다. 게시 전 합창단 운영 주체의 확인과 법률 검토를 거쳐야 합니다.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy Policy" title="개인정보처리방침" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-6 rounded-sm border border-dashed border-gold bg-gold-soft p-4 text-sm">
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
              <li>
                단원 명부(단원, 관리자 입력): 이름, 생년월일, 성별, 학교, 학년, 반, 파트, 기수, 입단·퇴단일, 사진, 보호자
                이름·연락처, 단원 소개 화면 이름 공개 동의 여부
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
                    승인된 경우: 단원 활동 종료(퇴단) 후 1년
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
            <p className="font-medium">가. 처리 위탁</p>
            <p>합창단은 홈페이지 운영을 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm [&_td]:border [&_td]:border-line [&_td]:p-2 [&_th]:border [&_th]:border-line [&_th]:bg-cream [&_th]:p-2 [&_th]:text-left">
                <thead>
                  <tr>
                    <th>수탁자</th>
                    <th>위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vercel Inc.</td>
                    <td>홈페이지 호스팅, 서버 기능(회원가입·신청서 접수 처리 등) 실행</td>
                  </tr>
                  <tr>
                    <td>Supabase <Placeholder>계약 법인명 확인 필요 (Supabase Pte. Ltd. 또는 Supabase, Inc.)</Placeholder></td>
                    <td>회원 인증, 데이터베이스 및 첨부파일(사진) 저장·관리</td>
                  </tr>
                  <tr>
                    <td>Google LLC</td>
                    <td>회원가입 인증·비밀번호 재설정 이메일 발송</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 이 개인정보처리방침을 통하여 공개하겠습니다.
            </p>

            <p className="mt-5 font-medium">나. 국외 이전</p>
            <p>
              합창단은 정보주체와의 계약(회원가입 및 입단 신청)의 체결 및 이행을 위하여 개인정보의 처리위탁·보관이
              필요하므로, 「개인정보 보호법」 제28조의8 제1항 제3호에 따라 다음 사항을 공개하고 개인정보를 국외로
              이전합니다. 개인정보는 국외에서 조회되는 경우를 포함하여 아래 수탁자에게 이전될 수 있습니다.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm [&_td]:border [&_td]:border-line [&_td]:p-2 [&_td]:align-top [&_th]:border [&_th]:border-line [&_th]:bg-cream [&_th]:p-2 [&_th]:text-left">
                <thead>
                  <tr>
                    <th>이전받는 자 (연락처)</th>
                    <th>이전 국가</th>
                    <th>이전 시기 및 방법</th>
                    <th>이전 항목</th>
                    <th>이용 목적</th>
                    <th>보유·이용 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vercel Inc. (privacy@vercel.com)</td>
                    <td>
                      미국 등. 서버 실행 위치는 대한민국(서울)으로 설정하였으나, 운영 기록 등이 국외에서 처리될 수 있음
                    </td>
                    <td>홈페이지 이용 시 정보통신망을 통해 암호화 전송(HTTPS)</td>
                    <td>이용 과정에서 전송되는 입력 정보, IP 주소, 접속 기록</td>
                    <td>홈페이지 호스팅 및 서버 기능 실행</td>
                    <td>
                      위탁계약 종료 시까지 (접속 기록은 1시간 후 자동 삭제)
                    </td>
                  </tr>
                  <tr>
                    <td>Supabase (privacy@supabase.com)</td>
                    <td>
                      운영 법인 소재국 <Placeholder>싱가포르 또는 미국 확인 필요</Placeholder>. 데이터 저장 위치는
                      대한민국(서울 리전)이며, 운영 법인이 국외에서 접근할 수 있음
                    </td>
                    <td>서비스 이용 시 정보통신망을 통해 암호화 전송(HTTPS)</td>
                    <td>
                      보호자: 이름, 연락처, 이메일, 비밀번호(암호화) / 단원: 이름, 생년월일, 학교, 학년, 주소, 음악 경력, 지원
                      동기, 사진(선택) / 접속 기록
                    </td>
                    <td>회원 인증, 데이터 저장·관리</td>
                    <td>이 방침 3.에서 정한 보유 기간 또는 위탁계약 종료 시까지 (접속 기록은 1일 후 자동 삭제)</td>
                  </tr>
                  <tr>
                    <td>Google LLC (googlekrsupport@google.com)</td>
                    <td>미국</td>
                    <td>인증 이메일 발송 시 정보통신망을 통해 암호화 전송</td>
                    <td>이메일 주소, 인증 이메일 내용</td>
                    <td>회원가입 인증·비밀번호 재설정 이메일 발송</td>
                    <td>발송 기록(보낸편지함)은 매월 1회 삭제하며, 삭제된 메일은 휴지통에서 30일 이내 완전 삭제</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              정보주체는 개인정보의 국외 이전을 거부할 수 있으며, 개인정보 보호책임자(아래 11. 참조) 또는 이메일(
              {site.contact.email})로 요청하시거나 회원 탈퇴를 통해 거부할 수 있습니다. 다만 위 국외 이전은 홈페이지 운영과
              회원가입·입단 신청 처리에 반드시 필요하므로, 거부하시는 경우 회원가입 및 입단 신청 등 서비스 이용이 불가능합니다.
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
              <li>입단 신청·단원 사진은 비공개 저장소에 보관하며 관리자만 열람 (위치정보 등 사진 부가정보는 제거 후 저장)</li>
              <li>공개 &lsquo;단원 소개&rsquo; 화면에는 반별·학년별 인원만 표시하고, 이름은 보호자가 동의한 경우에만 게시</li>
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
