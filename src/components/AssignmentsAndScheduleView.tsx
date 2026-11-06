import React, { useState } from 'react';
import {
  Award,
  Bell,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  Send,
  Star,
} from 'lucide-react';
import { MovementPostureDiagram } from './MovementPostureDiagram';
import { ALL_MOVEMENT_KEYS, MOVEMENT_GUIDES } from '../data/movementGuides';
import {
  ClassName,
  CoachPraise,
  FitnessAssignment,
  MovementKey,
  ReminderSchedule,
  Role,
  Student,
} from '../types/fitness';
import { formatDueCountdown, playNotificationChime } from '../utils/tkjiEngine';

interface AssignmentsAndScheduleViewProps {
  role: Role;
  students: Student[];
  activeStudent: Student;
  assignments: FitnessAssignment[];
  reminders: ReminderSchedule[];
  praises: CoachPraise[];
  onCreateAssignment: (assignment: FitnessAssignment) => void;
  onSubmitAssignment: (
    assignmentId: string,
    submission: {
      studentId: string;
      studentName: string;
      className: ClassName;
      achievementSummary: string;
      rpeLevel: number;
      studentNotes: string;
    }
  ) => void;
  onGradeSubmission: (
    assignmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => void;
  onToggleReminder: (reminderId: string) => void;
  onUpdateReminderTime: (reminderId: string, newTime: string) => void;
  onAddPraise: (praise: CoachPraise) => void;
  onTriggerPushBanner: (title: string, body: string) => void;
}

export const AssignmentsAndScheduleView: React.FC<
  AssignmentsAndScheduleViewProps
> = ({
  role,
  students,
  activeStudent,
  assignments,
  reminders,
  praises,
  onCreateAssignment,
  onSubmitAssignment,
  onGradeSubmission,
  onToggleReminder,
  onUpdateReminderTime,
  onAddPraise,
  onTriggerPushBanner,
}) => {
  const [expandedGuideTaskId, setExpandedGuideTaskId] = useState<string | null>(
    assignments[0]?.id || null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New assignment state (Guru)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMovement, setNewMovement] = useState<MovementKey>('plank');
  const [newTarget, setNewTarget] = useState('3 Set × 45 Detik Postur Lurus 180°');
  const [newClass, setNewClass] = useState<'Semua Kelas' | ClassName>('Semua Kelas');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });

  // Student submission state per task
  const [subDrafts, setSubDrafts] = useState<
    Record<string, { summary: string; rpe: number; notes: string }>
  >({});

  // Teacher grading state per submission
  const [gradeDrafts, setGradeDrafts] = useState<
    Record<string, { score: number; feedback: string }>
  >({});

  // New Coach Praise state (Guru)
  const [praiseStudentId, setPraiseStudentId] = useState<string>(
    students[0]?.id || 'stu-1'
  );
  const [praiseTitle, setPraiseTitle] = useState('');
  const [praiseMsg, setPraiseMsg] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const created: FitnessAssignment = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      movementKey: newMovement,
      targetMetric: newTarget.trim() || 'Sesuai standar SMP',
      className: newClass,
      dueDate: newDueDate,
      createdAt: new Date().toISOString().slice(0, 10),
      submissions: [],
    };
    onCreateAssignment(created);
    setExpandedGuideTaskId(created.id);
    setNewTitle('');
    setNewDesc('');
    setShowCreateForm(false);
  };

  const handleStudentSubmit = (taskId: string) => {
    const draft = subDrafts[taskId] || {
      summary: '',
      rpe: 7,
      notes: '',
    };
    if (!draft.summary.trim()) return;
    onSubmitAssignment(taskId, {
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      className: activeStudent.className,
      achievementSummary: draft.summary.trim(),
      rpeLevel: draft.rpe,
      studentNotes:
        draft.notes.trim() || 'Dilaksanakan sesuai panduan postur FitSiswa.',
    });
    setSubDrafts((prev) => ({
      ...prev,
      [taskId]: { summary: '', rpe: 7, notes: '' },
    }));
  };

  const handleTestPushNotification = () => {
    // 1. Play synthesized Web Audio API chime
    playNotificationChime();

    // 2. Find active reminder or fallback message
    const activeRem = reminders.find((r) => r.enabled) || reminders[0];
    const notifTitle = `Pengingat Latihan PJOK · ${activeRem.time} WIB`;
    const notifBody = `${activeRem.label}: ${activeRem.activity}`;

    // 3. Trigger in-app banner immediately
    onTriggerPushBanner(notifTitle, notifBody);

    // 4. Trigger Browser Web Notification API if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(notifTitle, { body: notifBody });
        } catch {
          // Ignore iframe restriction
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              new Notification(notifTitle, { body: notifBody });
            } catch {
              // Ignore
            }
          }
        });
      }
    }
  };

  const handleCreatePraise = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === praiseStudentId);
    if (!stu || !praiseTitle.trim() || !praiseMsg.trim()) return;

    onAddPraise({
      id: `praise-${Date.now()}`,
      studentId: stu.id,
      studentName: stu.name,
      className: stu.className,
      title: praiseTitle.trim(),
      message: praiseMsg.trim(),
      date: 'Baru saja',
      category: 'Apresiasi Pelatih',
    });
    setPraiseTitle('');
    setPraiseMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Latihan Mandiri Terstruktur & Pengingat Harian
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Manajemen Tugas Latihan & Jadwal Pengingat
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Dilengkapi hitung mundur tenggat waktu otomatis, panduan postur vektor pada setiap tugas, dan pengingat audio harian.
          </p>
        </div>

        {role === 'guru' && (
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreateForm ? 'Tutup Formulir' : 'Buat Tugas Latihan'}</span>
          </button>
        )}
      </div>

      {/* Create Assignment Form (Guru PJOK) */}
      {role === 'guru' && showCreateForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white border border-emerald-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900">
            Tambah Tantangan Latihan Fisik Rumah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Tantangan Latihan
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Latihan Daya Ledak Tungkai & Vertical Jump"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Panduan Gerakan Terkait
              </label>
              <select
                value={newMovement}
                onChange={(e) => setNewMovement(e.target.value as MovementKey)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg"
              >
                {ALL_MOVEMENT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {MOVEMENT_GUIDES[k].title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instruksi Pelaksanaan
            </label>
            <textarea
              rows={2}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Jelaskan jumlah set, repetisi, dan hal postur yang wajib diperhatikan siswa..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Capaian
              </label>
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Kelas
              </label>
              <select
                value={newClass}
                onChange={(e) =>
                  setNewClass(e.target.value as 'Semua Kelas' | ClassName)
                }
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Semua Kelas">Semua Kelas (8-A & 8-B)</option>
                <option value="8-A">Kelas 8-A</option>
                <option value="8-B">Kelas 8-B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Tenggat (Countdown Otomatis)
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono-tabular bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Terbitkan Tugas Latihan
            </button>
          </div>
        </form>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Assignments List with Countdown & Embedded Movement Guides */}
        <div className="lg:col-span-7 space-y-5">
          {assignments.map((task) => {
            const countdown = formatDueCountdown(task.dueDate);
            const isGuideOpen = expandedGuideTaskId === task.id;
            const mySubmission = task.submissions.find(
              (s) => s.studentId === activeStudent.id
            );
            const draft = subDrafts[task.id] || {
              summary: '',
              rpe: 7,
              notes: '',
            };

            return (
              <article
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                {/* Top Metadata Line (Zero-Pill Rule: clean unboxed text with separators) */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {task.className}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{MOVEMENT_GUIDES[task.movementKey].title}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono-tabular">
                      Tenggat {task.dueDate}
                    </span>
                  </div>

                  {/* Dual-Coded Countdown Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono-tabular font-bold ${
                      countdown.urgency === 'today'
                        ? 'text-amber-700'
                        : countdown.urgency === 'overdue'
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{countdown.label}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {task.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {task.description}
                  </p>
                  <p className="text-xs font-semibold text-emerald-800 mt-2 font-mono-tabular">
                    Target Capaian: {task.targetMetric}
                  </p>
                </div>

                {/* Toggle Button for Kolom Contoh Gerakan di Kartu Tugas (Requirement 1b) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Contoh Postur & Poin yang Harus Dihindari
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGuideTaskId(isGuideOpen ? null : task.id)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {isGuideOpen
                        ? 'Tutup Contoh Gerakan'
                        : 'Lihat Contoh Gerakan'}
                    </span>
                  </button>
                </div>

                {isGuideOpen && (
                  <MovementPostureDiagram
                    movementKey={task.movementKey}
                    genderFilter={
                      role === 'guru' ? 'Semua' : activeStudent.gender
                    }
                    compact
                  />
                )}

                {/* Student Submission Section */}
                {role === 'siswa' && (
                  <div className="pt-3 border-t border-slate-100">
                    {mySubmission ? (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Laporan Latihan Terkirim ({mySubmission.submittedAt})
                          </span>
                          {mySubmission.score !== undefined ? (
                            <span className="font-mono-tabular font-extrabold text-emerald-800">
                              Nilai Guru: {mySubmission.score}/100
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold">
                              Menunggu Penilaian Guru
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 font-semibold font-mono-tabular">
                          Capaian: {mySubmission.achievementSummary} (RPE{' '}
                          {mySubmission.rpeLevel}/10)
                        </p>
                        <p className="text-slate-600">
                          Catatan: “{mySubmission.studentNotes}”
                        </p>
                        {mySubmission.teacherFeedback && (
                          <p className="text-emerald-900 font-medium pt-1">
                            Umpan Balik Pak Zaidan: “{mySubmission.teacherFeedback}”
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-slate-900">
                          Unggah Catatan Pelaksanaan Latihan ({activeStudent.name})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Hasil / Capaian Latihan
                            </label>
                            <input
                              type="text"
                              value={draft.summary}
                              onChange={(e) =>
                                setSubDrafts((p) => ({
                                  ...p,
                                  [task.id]: {
                                    ...draft,
                                    summary: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Contoh: 32 repetisi Sit-Up & Plank 50 detik"
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Tingkat Usaha (RPE 1–10)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={draft.rpe}
                              onChange={(e) =>
                                setSubDrafts((p) => ({
                                  ...p,
                                  [task.id]: {
                                    ...draft,
                                    rpe: Number(e.target.value),
                                  },
                                }))
                              }
                              className="w-full px-3 py-1.5 text-xs font-mono-tabular bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={draft.notes}
                            onChange={(e) =>
                              setSubDrafts((p) => ({
                                ...p,
                                [task.id]: {
                                  ...draft,
                                  notes: e.target.value,
                                },
                              }))
                            }
                            placeholder="Catatan postur atau kendala selama latihan di rumah..."
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleStudentSubmit(task.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Laporan Latihan</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Parent View of Child's Submission Status */}
                {role === 'orang_tua' && (
                  <div className="pt-3 border-t border-slate-100 text-xs">
                    {mySubmission ? (
                      <div className="flex items-center justify-between text-emerald-800 font-semibold">
                        <span>
                          Status {activeStudent.name}: Sudah Mengumpulkan ({mySubmission.achievementSummary})
                        </span>
                        {mySubmission.score !== undefined && (
                          <span className="font-mono-tabular">
                            Nilai: {mySubmission.score}/100
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        Status {activeStudent.name}: Belum mengumpulkan laporan latihan mandiri ini.
                      </span>
                    )}
                  </div>
                )}

                {/* Guru PJOK Grading Section */}
                {role === 'guru' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        Kiriman Siswa ({task.submissions.length} masuk)
                      </span>
                    </div>

                    {task.submissions.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Belum ada siswa yang mengirimkan laporan untuk tugas ini.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl px-4">
                        {task.submissions.map((sub) => {
                          const key = `${task.id}-${sub.studentId}`;
                          const gDraft = gradeDrafts[key] || {
                            score: sub.score ?? 90,
                            feedback:
                              sub.teacherFeedback ||
                              'Postur baik, pertahankan konsistensi latihan!',
                          };

                          return (
                            <div key={sub.id} className="py-3 space-y-2 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <strong className="text-slate-900">
                                    {sub.studentName}
                                  </strong>{' '}
                                  <span className="text-slate-500">
                                    (Kelas {sub.className}) · {sub.submittedAt}
                                  </span>
                                </div>
                                <span className="font-mono-tabular font-bold text-emerald-700">
                                  {sub.achievementSummary} · RPE {sub.rpeLevel}/10
                                </span>
                              </div>
                              <p className="text-slate-600">
                                Catatan siswa: “{sub.studentNotes}”
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <label className="text-[11px] font-semibold text-slate-700">
                                  Skor (0–100):
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={gDraft.score}
                                  onChange={(e) =>
                                    setGradeDrafts((p) => ({
                                      ...p,
                                      [key]: {
                                        ...gDraft,
                                        score: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  className="w-16 px-2 py-1 font-mono-tabular font-bold border border-slate-300 rounded-md"
                                />
                                <input
                                  type="text"
                                  value={gDraft.feedback}
                                  onChange={(e) =>
                                    setGradeDrafts((p) => ({
                                      ...p,
                                      [key]: {
                                        ...gDraft,
                                        feedback: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Umpan balik pembinaan..."
                                  className="flex-1 min-w-[180px] px-2.5 py-1 border border-slate-300 rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    onGradeSubmission(
                                      task.id,
                                      sub.studentId,
                                      gDraft.score,
                                      gDraft.feedback
                                    )
                                  }
                                  className="px-3 py-1 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors whitespace-nowrap"
                                >
                                  {sub.score !== undefined
                                    ? 'Perbarui Nilai'
                                    : 'Simpan Nilai'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Right 5 Cols: Daily Reminder Schedules + Web Audio Push Test + Coach Praise */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pengingat Jadwal Latihan Harian */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-emerald-700">
                  Disiplin Rutinitas Fisik Harian
                </p>
                <h2 className="text-base font-bold text-slate-900">
                  Pengingat Jadwal Latihan Harian
                </h2>
              </div>
              <CalendarClock className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>

            <div className="divide-y divide-slate-100">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        aria-label={`Jam ${rem.label}`}
                        value={rem.time}
                        onChange={(e) =>
                          onUpdateReminderTime(rem.id, e.target.value)
                        }
                        className="font-mono-tabular text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        {rem.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rem.activity}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={rem.enabled}
                    onClick={() => onToggleReminder(rem.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      rem.enabled
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {rem.enabled ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Lonceng audio sintetis & notifikasi layar
              </span>
              <button
                type="button"
                onClick={handleTestPushNotification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Uji Notifikasi Push</span>
              </button>
            </div>
          </section>

          {/* Feed Pesan Motivasi & Penghargaan Pelatih (Coach Praise) */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">
                  Apresiasi Guru PJOK · Zaidan Rizqi, S.Pd.
                </p>
                <h2 className="text-base font-bold text-slate-900">
                  Penghargaan & Motivasi Pelatih (Coach Praise)
                </h2>
              </div>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>

            {role === 'guru' && (
              <form
                onSubmit={handleCreatePraise}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
              >
                <div className="text-xs font-bold text-slate-800">
                  Kirim Apresiasi Baru ke Siswa
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={praiseStudentId}
                    onChange={(e) => setPraiseStudentId(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={praiseTitle}
                    onChange={(e) => setPraiseTitle(e.target.value)}
                    placeholder="Judul apresiasi..."
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={praiseMsg}
                    onChange={(e) => setPraiseMsg(e.target.value)}
                    placeholder="Tulis pesan motivasi untuk siswa..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
                  >
                    Kirim
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100">
              {praises.map((p) => (
                <div key={p.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      {p.studentName} · Kelas {p.className}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono-tabular">
                      {p.date}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{p.title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    “{p.message}”
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
