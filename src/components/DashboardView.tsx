import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  MessageSquare,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  CHART_METRICS,
  ChartMetricKey,
  GrowthAnthropometryChart,
  ProgressTrendChart,
  SixPillarRadarChart,
} from './Charts';
import { MovementPostureDiagram } from './MovementPostureDiagram';
import {
  BmiCategory,
  ClassName,
  Gender,
  Role,
  Student,
  TkjiPredicate,
} from '../types/fitness';
import {
  calculateProgressDelta,
  evaluateRecord,
  getFirstRecord,
  getLatestRecord,
  getPredicateBadgeStyle,
} from '../utils/tkjiEngine';

interface DashboardViewProps {
  role: Role;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onOpenRapor: (student: Student) => void;
  onNavigateToInput: (studentId?: string) => void;
  onNavigateToConsultation?: () => void;
}

const PREDICATE_ORDER: TkjiPredicate[] = [
  'Baik Sekali',
  'Baik',
  'Sedang',
  'Kurang',
  'Kurang Sekali',
];

const PREDICATE_BAR_COLOR: Record<TkjiPredicate, string> = {
  'Baik Sekali': 'bg-emerald-600',
  Baik: 'bg-teal-600',
  Sedang: 'bg-amber-500',
  Kurang: 'bg-orange-500',
  'Kurang Sekali': 'bg-rose-600',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  role,
  students,
  selectedStudentId,
  onSelectStudent,
  onOpenRapor,
  onNavigateToInput,
  onNavigateToConsultation,
}) => {
  const [classFilter, setClassFilter] = useState<'Semua' | ClassName>('Semua');
  const [genderFilter, setGenderFilter] = useState<'Semua' | Gender>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMetric, setChartMetric] = useState<ChartMetricKey>('totalScore');
  const [heroImgError, setHeroImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== 'Semua' && s.className !== classFilter) return false;
      if (genderFilter !== 'Semua' && s.gender !== genderFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, classFilter, genderFilter, searchQuery]);

  // Aggregate Class KPIs
  const classAnalytics = useMemo(() => {
    const scope =
      classFilter === 'Semua'
        ? students
        : students.filter((s) => s.className === classFilter);

    const totalCount = scope.length;
    const putraCount = scope.filter((s) => s.gender === 'Putra').length;
    const putriCount = scope.filter((s) => s.gender === 'Putri').length;

    let sumScore = 0;
    let sumFirstScore = 0;
    let sumVo2 = 0;

    const predicateCounts: Record<TkjiPredicate, number> = {
      'Baik Sekali': 0,
      Baik: 0,
      Sedang: 0,
      Kurang: 0,
      'Kurang Sekali': 0,
    };

    const bmiCounts: Record<BmiCategory, number> = {
      'Sangat Kurus': 0,
      Kurus: 0,
      Normal: 0,
      Gemuk: 0,
      Obesitas: 0,
    };

    const enriched = scope.map((s) => {
      const latest = evaluateRecord(getLatestRecord(s), s.gender);
      const first = evaluateRecord(getFirstRecord(s), s.gender);
      const delta = calculateProgressDelta(s);

      sumScore += latest.totalScore;
      sumFirstScore += first.totalScore;
      sumVo2 += latest.vo2Max;
      predicateCounts[latest.predicate] += 1;
      bmiCounts[latest.bmiCategory] += 1;

      return { student: s, latest, first, delta };
    });

    const avgScore =
      totalCount > 0 ? Number((sumScore / totalCount).toFixed(1)) : 0;
    const avgFirstScore =
      totalCount > 0 ? Number((sumFirstScore / totalCount).toFixed(1)) : 0;
    const avgScoreDelta = Number((avgScore - avgFirstScore).toFixed(1));
    const avgVo2 =
      totalCount > 0 ? Number((sumVo2 / totalCount).toFixed(1)) : 0;
    const normalBmiPct =
      totalCount > 0
        ? Math.round((bmiCounts.Normal / totalCount) * 100)
        : 0;

    const topImprovers = [...enriched]
      .sort((a, b) => b.delta.percentDelta - a.delta.percentDelta)
      .slice(0, 3);

    const atRiskStudents = enriched
      .filter(
        (item) =>
          item.latest.predicate === 'Kurang' ||
          item.latest.predicate === 'Kurang Sekali' ||
          item.latest.bmiCategory === 'Kurus' ||
          item.latest.bmiCategory === 'Gemuk' ||
          item.latest.bmiCategory === 'Obesitas'
      )
      .sort((a, b) => a.latest.totalScore - b.latest.totalScore);

    return {
      totalCount,
      putraCount,
      putriCount,
      avgScore,
      avgScoreDelta,
      avgVo2,
      normalBmiPct,
      predicateCounts,
      bmiCounts,
      topImprovers,
      atRiskStudents,
    };
  }, [students, classFilter]);

  const activeStudent = useMemo(() => {
    return (
      students.find((s) => s.id === selectedStudentId) || students[0]
    );
  }, [students, selectedStudentId]);

  const activeLatest = evaluateRecord(
    getLatestRecord(activeStudent),
    activeStudent.gender
  );
  const activeDelta = calculateProgressDelta(activeStudent);

  const activeMetricConfig =
    CHART_METRICS.find((m) => m.key === chartMetric) || CHART_METRICS[0];
  const linkedMovementKey = activeMetricConfig.movementKey || 'cooper12Min';

  const scrollToProgressSection = (studentId: string) => {
    onSelectStudent(studentId);
    const el = document.getElementById('student-progress-inspector');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Contextual Hero Split for Guru PJOK */}
      {role === 'guru' && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  SMP Global Mandiri Jakarta · Semester Ganjil 2026/2027
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight text-balance">
                  Dasbor Analitik Kebugaran & Penilaian TKJI Siswa SMP
                </h1>
                <p className="text-sm text-slate-600 mt-2.5 max-w-2xl leading-relaxed">
                  Pantau perkembangan 5 butir Tes Kebugaran Jasmani Indonesia (TKJI),
                  estimasi VO2Max metode Cooper, dan indeks massa tubuh remaja secara terstruktur.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!avatarImgError ? (
                    <img
                      src="/src/assets/images/avatar_guru_zaidan_1793955715851.jpg"
                      alt="Zaidan Rizqi, S.Pd."
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarImgError(true)}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                      ZR
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Zaidan Rizqi, S.Pd.
                    </div>
                    <div className="text-xs text-slate-500">
                      Guru Mata Pelajaran PJOK · Kelas 8-A & 8-B
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigateToInput()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Input Data Mingguan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 min-h-[210px] bg-slate-100 relative">
              {!heroImgError ? (
                <img
                  src="/src/assets/images/hero_school_track_1793955715995.jpg"
                  alt="Lintasan Atletik SMP Global Mandiri Jakarta"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-emerald-950 text-white">
                  <Activity className="w-10 h-10 text-emerald-400 mb-2" />
                  <span className="text-sm font-bold">
                    Lintasan Atletik SMP Global Mandiri
                  </span>
                  <span className="text-xs text-emerald-200 mt-1">
                    Standar Uji TKJI Usia 12–15 Tahun
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Role Header for Siswa or Orang Tua */}
      {role !== 'guru' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                {role === 'siswa'
                  ? `Portal Siswa · NIS ${activeStudent.nis} · Kelas ${activeStudent.className}`
                  : `Portal Orang Tua / Wali · ${activeStudent.parentName} (${activeStudent.parentRelation})`}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1 text-balance">
                {role === 'siswa'
                  ? `Progres Kebugaran Jasmani: ${activeStudent.name}`
                  : `Pemantauan Tumbuh Kembang & Kebugaran: ${activeStudent.name}`}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                SMP Global Mandiri Jakarta · Pembina PJOK: Zaidan Rizqi, S.Pd. · Predikat Terkini:{' '}
                <strong className="text-emerald-700">{activeLatest.predicate}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Allow switching active student profile in demo */}
              <select
                aria-label="Pilih Profil Siswa"
                value={activeStudent.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className} · {s.gender})
                  </option>
                ))}
              </select>

              {role === 'orang_tua' && onNavigateToConsultation && (
                <button
                  type="button"
                  onClick={onNavigateToConsultation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Konsultasi Guru PJOK</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenRapor(activeStudent)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Unduh Rapor PDF</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Full-Width 4-Column KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'guru' ? (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Jumlah Siswa Terdata</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {classAnalytics.totalCount} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 font-mono-tabular">
                {classAnalytics.putraCount} Putra · {classAnalytics.putriCount} Putri
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Rata-rata Skor TKJI</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {classAnalytics.avgScore}
                </span>
                <span className="text-xs text-slate-500 font-mono-tabular">/ 25</span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1.5 font-mono-tabular">
                {classAnalytics.avgScoreDelta >= 0
                  ? `+${classAnalytics.avgScoreDelta}`
                  : classAnalytics.avgScoreDelta}{' '}
                poin sejak Minggu ke-1
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Rata-rata Estimasi VO2Max</span>
                <HeartPulse className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {classAnalytics.avgVo2}
                </span>
                <span className="text-xs text-slate-500 font-mono-tabular">
                  mL/kg/min
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Metode Lari Cooper 12 Menit
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Distribusi Kategori BMI</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-emerald-700">
                  {classAnalytics.normalBmiPct}% Normal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 font-mono-tabular">
                {classAnalytics.bmiCounts.Normal} Ideal ·{' '}
                {classAnalytics.bmiCounts.Kurus + classAnalytics.bmiCounts['Sangat Kurus']}{' '}
                Kurus ·{' '}
                {classAnalytics.bmiCounts.Gemuk + classAnalytics.bmiCounts.Obesitas}{' '}
                Gemuk
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Skor TKJI Terkini</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {activeLatest.totalScore} / 25
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1.5">
                Predikat: {activeLatest.predicate} (
                {activeDelta.scoreDelta >= 0
                  ? `+${activeDelta.scoreDelta}`
                  : activeDelta.scoreDelta}{' '}
                poin)
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Estimasi VO2Max</span>
                <HeartPulse className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {activeLatest.vo2Max}
                </span>
                <span className="text-xs text-slate-500 font-mono-tabular">
                  mL/kg/min
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Kapasitas Aerobik: {activeLatest.vo2Category}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Antropometri & BMI</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                  {activeLatest.bmi} kg/m²
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 font-mono-tabular">
                {getLatestRecord(activeStudent).heightCm} cm ·{' '}
                {getLatestRecord(activeStudent).weightKg} kg ·{' '}
                {activeLatest.bmiCategory}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Kemajuan Keseluruhan</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl font-extrabold text-emerald-700">
                  {activeDelta.percentDelta >= 0
                    ? `+${activeDelta.percentDelta}%`
                    : `${activeDelta.percentDelta}%`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Dari Minggu ke-1 s/d Minggu ke-{getLatestRecord(activeStudent).week}
              </p>
            </div>
          </>
        )}
      </section>

      {/* Guru Analytics: Fitness Distribution + Top Improvers & At-Risk */}
      {role === 'guru' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Distribusi Tingkat Kebugaran & BMI */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Proporsi Klasifikasi TKJI SMP
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    Distribusi Tingkat Kebugaran Kelas
                  </h2>
                </div>
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3.5">
                {PREDICATE_ORDER.map((pred) => {
                  const count = classAnalytics.predicateCounts[pred];
                  const pct =
                    classAnalytics.totalCount > 0
                      ? Math.round((count / classAnalytics.totalCount) * 100)
                      : 0;
                  return (
                    <div key={pred}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">{pred}</span>
                        <span className="font-mono-tabular text-slate-600">
                          <strong>{count}</strong> siswa ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${PREDICATE_BAR_COLOR[pred]} rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ringkasan BMI Kemenkes */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900 mb-2">
                Sebaran Indeks Massa Tubuh (IMT/U Kemenkes RI)
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(
                  [
                    ['Kurus', classAnalytics.bmiCounts.Kurus + classAnalytics.bmiCounts['Sangat Kurus']],
                    ['Normal', classAnalytics.bmiCounts.Normal],
                    ['Gemuk', classAnalytics.bmiCounts.Gemuk],
                    ['Obesitas', classAnalytics.bmiCounts.Obesitas],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="py-2 px-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="font-mono-tabular text-base font-extrabold text-slate-900">
                      {val}
                    </div>
                    <div className="text-[11px] font-medium text-slate-600">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Improvers & At-Risk Students */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-6">
            {/* Peningkatan Tertinggi */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Apresiasi Progres Terbaik
                  </p>
                  <h3 className="text-base font-bold text-slate-900">
                    Peningkatan Tertinggi (Top Improvers)
                  </h3>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="divide-y divide-slate-100">
                {classAnalytics.topImprovers.map(({ student, latest, delta }) => (
                  <div
                    key={student.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Kelas {student.className} · {student.gender} · Skor{' '}
                        <span className="font-mono-tabular font-semibold text-slate-700">
                          {latest.totalScore}/25
                        </span>{' '}
                        ({latest.predicate})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                        +{delta.percentDelta}% (+{delta.scoreDelta} pt)
                      </span>
                      <button
                        type="button"
                        onClick={() => scrollToProgressSection(student.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-md transition-colors whitespace-nowrap"
                      >
                        Grafik
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Siswa Membutuhkan Bimbingan Khusus (At-Risk) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-amber-700">
                    Prioritas Pembinaan Khusus
                  </p>
                  <h3 className="text-base font-bold text-slate-900">
                    Membutuhkan Bimbingan Khusus (At-Risk)
                  </h3>
                </div>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>

              {classAnalytics.atRiskStudents.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  Seluruh siswa pada kelas ini berada dalam kategori kebugaran dan BMI yang baik.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {classAnalytics.atRiskStudents.map(({ student, latest }) => (
                    <div
                      key={student.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          Kelas {student.className} · TKJI:{' '}
                          <span className="font-semibold text-amber-800">
                            {latest.predicate} ({latest.totalScore}/25)
                          </span>{' '}
                          · BMI:{' '}
                          <span className="font-mono-tabular">
                            {latest.bmi} ({latest.bmiCategory})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onNavigateToInput(student.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
                        >
                          Evaluasi
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRapor(student)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          Rapor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Guru Student Directory Table */}
      {role === 'guru' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Basis Data Siswa SMP Global Mandiri Jakarta
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                Direktori Kebugaran Siswa
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau NIS..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600 w-52"
                />
              </div>

              {/* Class Filter Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Semua', '8-A', '8-B'] as const).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      classFilter === cls
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
                  </button>
                ))}
              </div>

              {/* Gender Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Semua', 'Putra', 'Putri'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      genderFilter === g
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2.5 pr-3 font-semibold">Siswa & NIS</th>
                  <th className="py-2.5 px-3 font-semibold">Kelas</th>
                  <th className="py-2.5 px-3 font-semibold text-right">TB / BB</th>
                  <th className="py-2.5 px-3 font-semibold text-right">BMI</th>
                  <th className="py-2.5 px-3 font-semibold text-right">VO2Max</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Skor TKJI</th>
                  <th className="py-2.5 px-3 font-semibold">Predikat</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Kemajuan</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Tidak ada siswa yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => {
                    const rec = getLatestRecord(stu);
                    const ev = evaluateRecord(rec, stu.gender);
                    const delta = calculateProgressDelta(stu);
                    const badge = getPredicateBadgeStyle(ev.predicate);
                    const isSelected = stu.id === activeStudent.id;

                    return (
                      <tr
                        key={stu.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 pr-3">
                          <div className="font-bold text-slate-900">{stu.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono-tabular">
                            NIS {stu.nis} · {stu.gender}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {stu.className}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-700">
                          {rec.heightCm} cm / {rec.weightKg} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular">
                          <span className="font-semibold text-slate-900">{ev.bmi}</span>{' '}
                          <span className="text-slate-500">({ev.bmiCategory})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-slate-800">
                          {ev.vo2Max}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular font-extrabold text-slate-900">
                          {ev.totalScore} / 25
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {ev.predicate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-emerald-700">
                          {delta.percentDelta >= 0
                            ? `+${delta.percentDelta}%`
                            : `${delta.percentDelta}%`}
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => scrollToProgressSection(stu.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-md transition-colors whitespace-nowrap"
                            >
                              Grafik
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigateToInput(stu.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                            >
                              Input
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenRapor(stu)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors whitespace-nowrap"
                            >
                              Rapor PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Visualisasi Grafik Kemajuan Siswa & Peta Radar 6 Pilar */}
      <section id="student-progress-inspector" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-700">
              Analisis Longitudinal Minggu ke-1 s/d Minggu ke-{getLatestRecord(activeStudent).week}
            </p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Grafik Kemajuan & Peta Radar 6 Pilar: {activeStudent.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {role === 'guru' && (
              <select
                aria-label="Pilih Siswa untuk Grafik"
                value={activeStudent.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Kelas {s.className} ({s.gender})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => onOpenRapor(activeStudent)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor Rapor PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Trend Chart + 6-Pillar Spider Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7">
            <ProgressTrendChart
              student={activeStudent}
              selectedMetric={chartMetric}
              onSelectMetric={setChartMetric}
            />
          </div>
          <div className="lg:col-span-5">
            <SixPillarRadarChart student={activeStudent} />
          </div>
        </div>

        {/* Parent Portal Growth Anthropometry Chart */}
        {role === 'orang_tua' && (
          <GrowthAnthropometryChart student={activeStudent} />
        )}

        {/* Kolom Contoh Gerakan di Bawah Grafik (Requirement 1c) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Panduan Teknik & Standar SMP untuk Parameter Terpilih ({activeMetricConfig.label})
            </h3>
            <span className="text-xs text-slate-500">
              Otomatis menyesuaikan parameter grafik yang sedang diperiksa
            </span>
          </div>
          <MovementPostureDiagram
            movementKey={linkedMovementKey}
            genderFilter={activeStudent.gender}
            compact
          />
        </div>

        {/* Tabel Riwayat Rekaman Mingguan Lengkap */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500">
              Log Evaluasi Periodik · {activeStudent.name} (Kelas {activeStudent.className})
            </p>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Rekaman Mingguan & Catatan Guru PJOK
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 pr-3 font-semibold">Pekan</th>
                  <th className="py-2 px-2 font-semibold">Tanggal</th>
                  <th className="py-2 px-2 font-semibold text-right">TB/BB (BMI)</th>
                  <th className="py-2 px-2 font-semibold text-right">Sprint 50m</th>
                  <th className="py-2 px-2 font-semibold text-right">Push-Up</th>
                  <th className="py-2 px-2 font-semibold text-right">Sit-Up</th>
                  <th className="py-2 px-2 font-semibold text-right">V. Jump</th>
                  <th className="py-2 px-2 font-semibold text-right">Cooper 12m</th>
                  <th className="py-2 px-2 font-semibold text-right">VO2Max</th>
                  <th className="py-2 px-2 font-semibold text-right">Skor TKJI</th>
                  <th className="py-2 pl-3 font-semibold">Catatan Evaluasi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...activeStudent.records].reverse().map((rec) => {
                  const ev = evaluateRecord(rec, activeStudent.gender);
                  return (
                    <tr key={rec.week} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-bold text-slate-900 whitespace-nowrap">
                        Minggu ke-{rec.week}
                      </td>
                      <td className="py-2.5 px-2 font-mono-tabular text-slate-500 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-700 whitespace-nowrap">
                        {rec.heightCm}/{rec.weightKg} ({ev.bmi})
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-800">
                        {rec.sprint50mSec}s{' '}
                        <span className="text-emerald-700">({ev.sprintScore})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-800">
                        {rec.pushUpReps}{' '}
                        <span className="text-emerald-700">({ev.pushUpScore})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-800">
                        {rec.sitUpReps}{' '}
                        <span className="text-emerald-700">({ev.sitUpScore})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-800">
                        {rec.verticalJumpCm}cm{' '}
                        <span className="text-emerald-700">({ev.verticalJumpScore})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular text-slate-800">
                        {rec.cooper12MinMeters}m{' '}
                        <span className="text-emerald-700">({ev.cooperScore})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular font-semibold text-slate-900">
                        {ev.vo2Max}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular font-extrabold text-emerald-700 whitespace-nowrap">
                        {ev.totalScore}/25 · {ev.predicate}
                      </td>
                      <td className="py-2.5 pl-3 text-slate-600 max-w-xs">
                        {rec.teacherNote}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
