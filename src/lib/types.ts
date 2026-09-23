export type UserRole = "member" | "admin";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  guardian_name: string;
  phone: string;
  email: string;
  role: UserRole;
  created_at: string;
};

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
