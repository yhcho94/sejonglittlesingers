export type UserRole = "member" | "admin";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  guardian_name: string;
  phone: string;
  email: string;
  role: UserRole;
  created_at: string;
  // 0020: 관리자 권한 (없으면 예전 DB)
  is_super?: boolean;
  admin_perms?: string[];
  admin_requested_at?: string | null;
  admin_request_note?: string | null;
  // 0021: 회원 구분 (parent 학부모 · teacher 선생님 · staff 홈페이지 관리자)
  member_type?: MemberType;
  affiliation?: string | null;
  // 0022: 운영진 역할, 학부모 대표(반)
  staff_role?: string | null;
  parent_rep_class?: string | null;
  // 0023: 학부모 대표/부대표, 운영진 담당 반·조직도 게시
  parent_rep_title?: string | null;
  staff_class?: string | null;
  org_visible?: boolean;
};

export type MemberType = "parent" | "teacher" | "staff";

export type Notice = {
  id: number;
  title: string;
  body: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: number;
  guardian_id: string;
  child_name: string;
  child_birthdate: string;
  school: string | null;
  grade: string | null;
  address: string | null;
  experience: string | null;
  motivation: string | null;
  photo_path: string | null;
  consent_privacy: boolean;
  consent_guardian: boolean;
  consent_photo: boolean;
  consent_media_channels?: boolean;
  consent_media_press?: boolean;
  consent_media_name?: boolean;
  // 0024: 단원 소개 이름·반 게시 동의 (null: 항목이 생기기 전 신청)
  consent_name_listing?: boolean | null;
  join_source?: string | null;
  join_source_detail?: string | null;
  gender?: string | null;
  desired_class?: string | null;
  neighborhood?: string | null;
  referrer?: string | null;
  notes?: string | null;
  status: ApplicationStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "심사 대기",
  approved: "승인",
  rejected: "반려",
};

// 서버 액션 결과 (폼에 표시)
export type FormState = { error?: string; success?: string } | undefined;

export type Recruitment = {
  is_open: boolean;
  period: string | null;
  target: string | null;
  schedule: string | null;
  place: string | null;
  fee: string | null;
  audition: string | null;
  classes: string | null;
  notes: string | null;
  updated_at: string;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
};

export type Concert = {
  id: number;
  title: string;
  starts_at: string;
  venue: string | null;
  description: string | null;
  ticket_url: string | null;
  video_url: string | null;
  is_published: boolean;
  time_tbd?: boolean; // 시각 미정 (0009 실행 전에는 없음)
};

export type Press = {
  id: number;
  title: string;
  media: string | null;
  url: string;
  published_on: string | null;
  is_published: boolean;
};
