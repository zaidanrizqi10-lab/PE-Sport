import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { AssignmentsAndScheduleView } from './components/AssignmentsAndScheduleView';
import { CommunityAndParentView } from './components/CommunityAndParentView';
import { DashboardView } from './components/DashboardView';
import { MovementEncyclopediaView } from './components/MovementEncyclopediaView';
import { RaporPdfModal } from './components/RaporPdfModal';
import { WeeklyInputView } from './components/WeeklyInputView';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_COACH_PRAISES,
  INITIAL_FORUM_POSTS,
  INITIAL_PARENT_MESSAGES,
  INITIAL_REMINDERS,
  INITIAL_STUDENTS,
} from './data/initialData';
import {
  ClassName,
  CoachPraise,
  FitnessAssignment,
  ForumPost,
  ParentConsultationMessage,
  ReminderSchedule,
  Role,
  Student,
  WeeklyRecord,
} from './types/fitness';

type NavTab =
  | 'dashboard'
  | 'input'
  | 'movements'
  | 'assignments'
  | 'community';

const STORAGE_KEY = 'fitsiswa_pjok_state_v1';

interface PersistedState {
  students: Student[];
  assignments: FitnessAssignment[];
  reminders: ReminderSchedule[];
  praises: CoachPraise[];
  posts: ForumPost[];
  parentMessages: ParentConsultationMessage[];
}

export default function App() {
  const [role, setRole] = useState<Role>('guru');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu-1');
  const [inputTargetStudentId, setInputTargetStudentId] = useState<
    string | undefined
  >(undefined);
  const [raporStudentId, setRaporStudentId] = useState<string | null>(null);
  const [communityDefaultSubTab, setCommunityDefaultSubTab] = useState<
    'forum' | 'parent' | undefined
  >(undefined);

  // Push Notification In-App Banner State
  const [pushBanner, setPushBanner] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // Load persisted state or fallback to seed data
  const [appState, setAppState] = useState<PersistedState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.students && parsed.students.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return {
      students: INITIAL_STUDENTS,
      assignments: INITIAL_ASSIGNMENTS,
      reminders: INITIAL_REMINDERS,
      praises: INITIAL_COACH_PRAISES,
      posts: INITIAL_FORUM_POSTS,
      parentMessages: INITIAL_PARENT_MESSAGES,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore storage quota errors
    }
  }, [appState]);

  useEffect(() => {
    if (!pushBanner) return;
    const timer = window.setTimeout(() => {
      setPushBanner(null);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [pushBanner]);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setCommunityDefaultSubTab(undefined);
    if (newRole !== 'guru' && activeTab === 'input') {
      setActiveTab('dashboard');
    }
  };

  const activeStudent =
    appState.students.find((s) => s.id === selectedStudentId) ||
    appState.students[0];

  const raporStudent = raporStudentId
    ? appState.students.find((s) => s.id === raporStudentId) || null
    : null;

  // Handlers for Weekly Fitness Records
  const handleSaveStudentRecord = (
    studentId: string,
    record: WeeklyRecord
  ) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((stu) => {
        if (stu.id !== studentId) return stu;
        const existingIdx = stu.records.findIndex(
          (r) => r.week === record.week
        );
        const updatedRecords =
          existingIdx >= 0
            ? stu.records.map((r, i) => (i === existingIdx ? record : r))
            : [...stu.records, record].sort((a, b) => a.week - b.week);
        return { ...stu, records: updatedRecords };
      }),
    }));
  };

  const handleSaveBatchRecords = (
    updates: { studentId: string; record: WeeklyRecord }[]
  ) => {
    setAppState((prev) => {
      const updateMap = new Map(updates.map((u) => [u.studentId, u.record]));
      return {
        ...prev,
        students: prev.students.map((stu) => {
          const rec = updateMap.get(stu.id);
          if (!rec) return stu;
          const existingIdx = stu.records.findIndex(
            (r) => r.week === rec.week
          );
          const updatedRecords =
            existingIdx >= 0
              ? stu.records.map((r, i) => (i === existingIdx ? rec : r))
              : [...stu.records, rec].sort((a, b) => a.week - b.week);
          return { ...stu, records: updatedRecords };
        }),
      };
    });
  };

  const handleUpdateTeacherNoteFromRapor = (
    studentId: string,
    newNote: string
  ) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((stu) => {
        if (stu.id !== studentId || stu.records.length === 0) return stu;
        const updated = [...stu.records];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          teacherNote: newNote,
        };
        return { ...stu, records: updated };
      }),
    }));
  };

  // Handlers for Assignments & Schedules
  const handleCreateAssignment = (assignment: FitnessAssignment) => {
    setAppState((prev) => ({
      ...prev,
      assignments: [assignment, ...prev.assignments],
    }));
  };

  const handleSubmitAssignment = (
    assignmentId: string,
    submission: {
      studentId: string;
      studentName: string;
      className: ClassName;
      achievementSummary: string;
      rpeLevel: number;
      studentNotes: string;
    }
  ) => {
    setAppState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((task) => {
        if (task.id !== assignmentId) return task;
        const filtered = task.submissions.filter(
          (s) => s.studentId !== submission.studentId
        );
        return {
          ...task,
          submissions: [
            ...filtered,
            {
              id: `sub-${Date.now()}`,
              ...submission,
              submittedAt: 'Baru saja',
            },
          ],
        };
      }),
    }));
  };

  const handleGradeSubmission = (
    assignmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => {
    setAppState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((task) => {
        if (task.id !== assignmentId) return task;
        return {
          ...task,
          submissions: task.submissions.map((sub) =>
            sub.studentId === studentId
              ? { ...sub, score, teacherFeedback: feedback }
              : sub
          ),
        };
      }),
    }));
  };

  const handleToggleReminder = (reminderId: string) => {
    setAppState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === reminderId ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  };

  const handleUpdateReminderTime = (reminderId: string, newTime: string) => {
    setAppState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === reminderId ? { ...r, time: newTime } : r
      ),
    }));
  };

  const handleAddPraise = (praise: CoachPraise) => {
    setAppState((prev) => ({
      ...prev,
      praises: [praise, ...prev.praises],
    }));
  };

  // Handlers for Forum & Parent Consultation
  const handleAddPost = (post: ForumPost) => {
    setAppState((prev) => ({
      ...prev,
      posts: [post, ...prev.posts],
    }));
  };

  const handleToggleLikePost = (postId: string) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }),
    }));
  };

  const handleTogglePinPost = (postId: string) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId ? { ...p, pinned: !p.pinned } : p
      ),
    }));
  };

  const handleAddReply = (postId: string, content: string) => {
    const authorName =
      role === 'guru'
        ? 'Zaidan Rizqi, S.Pd.'
        : role === 'orang_tua'
        ? activeStudent.parentName
        : activeStudent.name;

    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `rep-${Date.now()}`,
                  authorName,
                  authorRole: role,
                  content,
                  createdAt: 'Baru saja',
                },
              ],
            }
          : p
      ),
    }));
  };

  const handleSendParentMessage = (msg: ParentConsultationMessage) => {
    setAppState((prev) => ({
      ...prev,
      parentMessages: [...prev.parentMessages, msg],
    }));
  };

  const handleResetDemoData = () => {
    const fresh: PersistedState = {
      students: INITIAL_STUDENTS,
      assignments: INITIAL_ASSIGNMENTS,
      reminders: INITIAL_REMINDERS,
      praises: INITIAL_COACH_PRAISES,
      posts: INITIAL_FORUM_POSTS,
      parentMessages: INITIAL_PARENT_MESSAGES,
    };
    setAppState(fresh);
    localStorage.removeItem(STORAGE_KEY);
    setPushBanner({
      title: 'Data Demo Dipulihkan',
      body: 'Seluruh data kelas 8-A & 8-B telah dikembalikan ke kondisi awal.',
    });
  };

  const navItems: { id: NavTab; label: string }[] =
    role === 'guru'
      ? [
          { id: 'dashboard', label: 'Dasbor' },
          { id: 'input', label: 'Input Data' },
          { id: 'movements', label: 'Contoh Gerakan' },
          { id: 'assignments', label: 'Tugas & Jadwal' },
          { id: 'community', label: 'Forum & Wali' },
        ]
      : [
          { id: 'dashboard', label: 'Ringkasan' },
          { id: 'movements', label: 'Contoh Gerakan' },
          { id: 'assignments', label: 'Tugas & Jadwal' },
          {
            id: 'community',
            label: role === 'orang_tua' ? 'Konsultasi & Forum' : 'Forum Kelas',
          },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus:outline-none"
          >
            FitSiswa <span className="text-emerald-600">PJOK</span>
          </button>

          {/* Zone 2: 4-5 Concise Single-Line Text Navigation Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-6 text-sm font-semibold"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCommunityDefaultSubTab(undefined);
                    setActiveTab(item.id);
                  }}
                  className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Role Switcher (Guru PJOK, Siswa, Orang Tua) */}
          <div
            role="group"
            aria-label="Pengalih Peran Pengguna"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0"
          >
            {(
              [
                ['guru', 'Guru PJOK'],
                ['siswa', 'Siswa'],
                ['orang_tua', 'Orang Tua'],
              ] as [Role, string][]
            ).map(([rKey, rLabel]) => {
              const active = role === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleRoleChange(rKey)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {rLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto bg-white">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCommunityDefaultSubTab(undefined);
                  setActiveTab(item.id);
                }}
                className={`text-xs font-semibold pb-1 border-b-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* In-App Push Notification Toast Banner */}
      {pushBanner && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white border border-emerald-500 rounded-xl p-4 shadow-lg flex items-start gap-3"
        >
          <BellRing className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-400">
              {pushBanner.title}
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {pushBanner.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPushBanner(null)}
            aria-label="Tutup Notifikasi"
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            role={role}
            students={appState.students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenRapor={(stu) => setRaporStudentId(stu.id)}
            onNavigateToInput={(stuId) => {
              if (stuId) setInputTargetStudentId(stuId);
              setActiveTab('input');
            }}
            onNavigateToConsultation={() => {
              setCommunityDefaultSubTab('parent');
              setActiveTab('community');
            }}
          />
        )}

        {activeTab === 'input' && role === 'guru' && (
          <WeeklyInputView
            students={appState.students}
            initialStudentId={inputTargetStudentId || selectedStudentId}
            onSaveStudentRecord={handleSaveStudentRecord}
            onSaveBatchRecords={handleSaveBatchRecords}
          />
        )}

        {activeTab === 'movements' && <MovementEncyclopediaView />}

        {activeTab === 'assignments' && (
          <AssignmentsAndScheduleView
            role={role}
            students={appState.students}
            activeStudent={activeStudent}
            assignments={appState.assignments}
            reminders={appState.reminders}
            praises={appState.praises}
            onCreateAssignment={handleCreateAssignment}
            onSubmitAssignment={handleSubmitAssignment}
            onGradeSubmission={handleGradeSubmission}
            onToggleReminder={handleToggleReminder}
            onUpdateReminderTime={handleUpdateReminderTime}
            onAddPraise={handleAddPraise}
            onTriggerPushBanner={(title, body) =>
              setPushBanner({ title, body })
            }
          />
        )}

        {activeTab === 'community' && (
          <CommunityAndParentView
            role={role}
            students={appState.students}
            activeStudent={activeStudent}
            posts={appState.posts}
            parentMessages={appState.parentMessages}
            defaultSubTab={communityDefaultSubTab}
            onAddPost={handleAddPost}
            onToggleLikePost={handleToggleLikePost}
            onTogglePinPost={handleTogglePinPost}
            onAddReply={handleAddReply}
            onSendParentMessage={handleSendParentMessage}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            FitSiswa PJOK · SMP Global Mandiri Jakarta · Penilaian TKJI Usia 12–15 Tahun (Depdiknas / Kemenpora RI)
          </span>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            Pulihkan Data Demo
          </button>
        </div>
      </footer>

      {/* Official Rapor PDF Export & Print Modal */}
      {raporStudent && (
        <RaporPdfModal
          student={raporStudent}
          onClose={() => setRaporStudentId(null)}
          onUpdateTeacherNote={handleUpdateTeacherNoteFromRapor}
        />
      )}
    </div>
  );
}
