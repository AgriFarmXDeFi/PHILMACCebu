export type StudentStatus =
  | 'pending'
  | 'payment_review'
  | 'active'
  | 'basic_course'
  | 'next_course_qualified'
  | 'final_course_qualified'
  | 'challenge_training'
  | 'challenge_profirm'
  | 'completed'
  | 'awarded';

export type CourseStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export type ChallengeStatus = 'not_started' | 'active' | 'submitted' | 'passed' | 'failed' | 'expired';

export type AwardStatus = 'not_qualified' | 'pending_review' | 'approved' | 'paid' | 'rejected';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  facebook: string;
  address: string;
  experience: string;
  preferredSchedule: string;
  referralCode: string;
  sponsorCode?: string;
  sponsorId?: string;
  paymentMethod: string;
  paymentReference: string;
  status: StudentStatus;
  registeredAt: string;
  approvedAt?: string;
  directReferrals: string[];
  secondLevelReferrals: string[];
  basicCourseStatus: CourseStatus;
  nextCourseStatus: CourseStatus;
  finalCourseStatus: CourseStatus;
  challengeTrainingStatus: ChallengeStatus;
  challengeProfirmStatus: ChallengeStatus;
  certificateIssued: boolean;
  certificateNumber?: string;
  certificateDate?: string;
  awardStatus: AwardStatus;
  awardReference?: string;
  basicCourseProgress: number;
  nextCourseProgress: number;
  finalCourseProgress: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'pdf' | 'quiz';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  requiredForUnlock: string;
}

export interface ChallengeLog {
  day: number;
  journalEntry: string;
  marketAnalysis: string;
  riskNotes: string;
  screenshotUrl?: string;
  submittedAt: string;
  approved: boolean;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  facebook: string;
  address: string;
  experience: string;
  preferredSchedule: string;
  sponsorCode: string;
  paymentMethod: string;
  paymentReference: string;
  paymentProofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  adminNotes?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'converted';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
}
