export type Role = 'guru' | 'siswa' | 'orang_tua';

export type Gender = 'Putra' | 'Putri';

export type ClassName = '8-A' | '8-B';

export type TkjiPredicate =
  | 'Baik Sekali'
  | 'Baik'
  | 'Sedang'
  | 'Kurang'
  | 'Kurang Sekali';

export type BmiCategory =
  | 'Sangat Kurus'
  | 'Kurus'
  | 'Normal'
  | 'Gemuk'
  | 'Obesitas';

export type MovementKey =
  | 'sprint50m'
  | 'pushUp'
  | 'sitUp'
  | 'verticalJump'
  | 'cooper12Min'
  | 'plank'
  | 'shuttleRun';

export interface WeeklyRecord {
  week: number;
  date: string;
  heightCm: number;
  weightKg: number;
  sprint50mSec: number;
  pushUpReps: number;
  sitUpReps: number;
  verticalJumpCm: number;
  cooper12MinMeters: number;
  agilityIndex: number; // 0-100 composite agility score from shuttle run / coordination
  teacherNote: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  className: ClassName;
  gender: Gender;
  age: number;
  parentName: string;
  parentRelation: string;
  records: WeeklyRecord[];
}

export interface TkjiEvaluation {
  bmi: number;
  bmiCategory: BmiCategory;
  vo2Max: number;
  vo2Category: string;
  sprintScore: number;
  pushUpScore: number;
  sitUpScore: number;
  verticalJumpScore: number;
  cooperScore: number;
  totalScore: number;
  predicate: TkjiPredicate;
  pillars: {
    kardio: number;
    kekuatanInti: number;
    kekuatanLengan: number;
    dayaLedak: number;
    kecepatan: number;
    kelincahan: number;
  };
}

export type ForumCategory =
  | 'Pengumuman Resmi'
  | 'Tips Latihan & Nutrisi'
  | 'Tantangan Mingguan'
  | 'Tanya Guru';

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: Role;
  authorContext: string;
  category: ForumCategory;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  likes: number;
  likedByMe?: boolean;
  replies: ForumReply[];
}

export interface ReminderSchedule {
  id: string;
  label: string;
  time: string;
  activity: string;
  enabled: boolean;
}

export interface CoachPraise {
  id: string;
  studentId: string;
  studentName: string;
  className: ClassName;
  title: string;
  message: string;
  date: string;
  category: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  className: ClassName;
  submittedAt: string;
  achievementSummary: string;
  rpeLevel: number; // 1-10 effort
  studentNotes: string;
  score?: number;
  teacherFeedback?: string;
}

export interface FitnessAssignment {
  id: string;
  title: string;
  description: string;
  movementKey: MovementKey;
  targetMetric: string;
  className: 'Semua Kelas' | ClassName;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export interface ParentConsultationMessage {
  id: string;
  studentId: string;
  senderRole: 'orang_tua' | 'guru';
  senderName: string;
  topic: string;
  message: string;
  timestamp: string;
  nutritionTag?: string;
}
