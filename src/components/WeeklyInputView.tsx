import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Layers, User } from 'lucide-react';
import { MovementPostureDiagram } from './MovementPostureDiagram';
import { ClassName, MovementKey, Student, WeeklyRecord } from '../types/fitness';
import {
  calculateBmi,
  calculateVo2Max,
  classifyTotalTkji,
  evaluateRecord,
  getLatestRecord,
  scoreCooper12Min,
  scorePushUp,
  scoreSitUp,
  scoreSprint50m,
  scoreVerticalJump,
} from '../utils/tkjiEngine';

interface WeeklyInputViewProps {
  students: Student[];
  initialStudentId?: string;
  onSaveStudentRecord: (studentId: string, record: WeeklyRecord) => void;
  onSaveBatchRecords: (
    updates: { studentId: string; record: WeeklyRecord }[]
  ) => void;
}

export const WeeklyInputView: React.FC<WeeklyInputViewProps> = ({
  students,
  initialStudentId,
  onSaveStudentRecord,
  onSaveBatchRecords,
}) => {
  const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || 'stu-1'
  );
  const [focusedMovement, setFocusedMovement] =
    useState<MovementKey>('sprint50m');

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];
  const latestRec = getLatestRecord(selectedStudent);

  // Single student form state
  const [weekNum, setWeekNum] = useState<number>(latestRec.week + 1);
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [heightCm, setHeightCm] = useState<number>(latestRec.heightCm);
  const [weightKg, setWeightKg] = useState<number>(latestRec.weightKg);
  const [sprint50mSec, setSprint50mSec] = useState<number>(
    latestRec.sprint50mSec
  );
  const [pushUpReps, setPushUpReps] = useState<number>(latestRec.pushUpReps);
  const [sitUpReps, setSitUpReps] = useState<number>(latestRec.sitUpReps);
  const [verticalJumpCm, setVerticalJumpCm] = useState<number>(
    latestRec.verticalJumpCm
  );
  const [cooper12MinMeters, setCooper12MinMeters] = useState<number>(
    latestRec.cooper12MinMeters
  );
  const [agilityIndex, setAgilityIndex] = useState<number>(
    latestRec.agilityIndex
  );
  const [teacherNote, setTeacherNote] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    const stu = students.find((s) => s.id === selectedStudentId);
    if (!stu) return;
    const rec = getLatestRecord(stu);
    setWeekNum(rec.week + 1);
    setHeightCm(rec.heightCm);
    setWeightKg(rec.weightKg);
    setSprint50mSec(rec.sprint50mSec);
    setPushUpReps(rec.pushUpReps);
    setSitUpReps(rec.sitUpReps);
    setVerticalJumpCm(rec.verticalJumpCm);
    setCooper12MinMeters(rec.cooper12MinMeters);
    setAgilityIndex(rec.agilityIndex);
    setTeacherNote('');
  }, [selectedStudentId, students]);

  // Live calculations for Single Mode
  const { bmi, category: bmiCategory } = calculateBmi(heightCm, weightKg);
  const { vo2Max, category: vo2Category } = calculateVo2Max(cooper12MinMeters);
  const sprintScore = scoreSprint50m(sprint50mSec, selectedStudent.gender);
  const pushUpScore = scorePushUp(pushUpReps, selectedStudent.gender);
  const sitUpScore = scoreSitUp(sitUpReps, selectedStudent.gender);
  const verticalJumpScore = scoreVerticalJump(
    verticalJumpCm,
    selectedStudent.gender
  );
  const cooperScore = scoreCooper12Min(
    cooper12MinMeters,
    selectedStudent.gender
  );
  const totalTkji =
    sprintScore + pushUpScore + sitUpScore + verticalJumpScore + cooperScore;
  const predicate = classifyTotalTkji(totalTkji);

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: WeeklyRecord = {
      week: weekNum,
      date: recordDate,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      sprint50mSec: Number(sprint50mSec),
      pushUpReps: Number(pushUpReps),
      sitUpReps: Number(sitUpReps),
      verticalJumpCm: Number(verticalJumpCm),
      cooper12MinMeters: Number(cooper12MinMeters),
      agilityIndex: Number(agilityIndex),
      teacherNote:
        teacherNote.trim() ||
        `Evaluasi Minggu ke-${weekNum}: Skor TKJI ${totalTkji}/25 (${predicate}).`,
    };
    onSaveStudentRecord(selectedStudent.id, newRecord);
    setSavedNotice(
      `Data Minggu ke-${weekNum} untuk ${selectedStudent.name} berhasil disimpan (Skor TKJI ${totalTkji}/25 · ${predicate}).`
    );
  };

  // Batch Mode State
  const [batchClass, setBatchClass] = useState<ClassName>('8-A');
  const [batchWeek, setBatchWeek] = useState<number>(7);
  const [batchDate, setBatchDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [batchRows, setBatchRows] = useState<
    Record<
      string,
      {
        heightCm: number;
        weightKg: number;
        sprint50mSec: number;
        pushUpReps: number;
        sitUpReps: number;
        verticalJumpCm: number;
        cooper12MinMeters: number;
      }
    >
  >({});

  const classStudents = students.filter((s) => s.className === batchClass);

  useEffect(() => {
    const initialMap: Record<
      string,
      {
        heightCm: number;
        weightKg: number;
        sprint50mSec: number;
        pushUpReps: number;
        sitUpReps: number;
        verticalJumpCm: number;
        cooper12MinMeters: number;
      }
    > = {};
    students.forEach((s) => {
      const r = getLatestRecord(s);
      initialMap[s.id] = {
        heightCm: r.heightCm,
        weightKg: r.weightKg,
        sprint50mSec: r.sprint50mSec,
        pushUpReps: r.pushUpReps,
        sitUpReps: r.sitUpReps,
        verticalJumpCm: r.verticalJumpCm,
        cooper12MinMeters: r.cooper12MinMeters,
      };
    });
    setBatchRows(initialMap);
  }, [students]);

  const updateBatchField = (
    studentId: string,
    field: keyof (typeof batchRows)[string],
    val: number
  ) => {
    setBatchRows((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val,
      },
    }));
  };

  const handleSaveBatch = () => {
    const updates = classStudents.map((stu) => {
      const row = batchRows[stu.id] || getLatestRecord(stu);
      const prevRec = getLatestRecord(stu);
      const draftRec: WeeklyRecord = {
        week: batchWeek,
        date: batchDate,
        heightCm: Number(row.heightCm),
        weightKg: Number(row.weightKg),
        sprint50mSec: Number(row.sprint50mSec),
        pushUpReps: Number(row.pushUpReps),
        sitUpReps: Number(row.sitUpReps),
        verticalJumpCm: Number(row.verticalJumpCm),
        cooper12MinMeters: Number(row.cooper12MinMeters),
        agilityIndex: prevRec.agilityIndex,
        teacherNote: `Input massal kelas ${batchClass} Minggu ke-${batchWeek}.`,
      };
      return { studentId: stu.id, record: draftRec };
    });

    onSaveBatchRecords(updates);
    setSavedNotice(
      `Berhasil menyimpan nilai Minggu ke-${batchWeek} untuk ${updates.length} siswa Kelas ${batchClass}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Pengukuran Antropometri & 5 Butir Tes Standar TKJI SMP
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Input Data Mingguan Kebugaran Fisik
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Kalkulasi otomatis BMI Kemenkes RI, Skor TKJI Putra/Putri (5–25), Predikat, dan Estimasi VO2Max.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setInputMode('single');
              setSavedNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              inputMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mode Per Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('batch');
              setSavedNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              inputMode === 'batch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mode Batch Input Cepat</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center gap-3 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {inputMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Detailed Form */}
          <form
            onSubmit={handleSaveSingle}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6"
          >
            {/* Student & Week Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
              <div className="sm:col-span-1">
                <label
                  htmlFor="select-stu-input"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Pilih Siswa
                </label>
                <select
                  id="select-stu-input"
                  value={selectedStudent.id}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className} · {s.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="input-week-num"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Pekan Evaluasi
                </label>
                <input
                  id="input-week-num"
                  type="number"
                  min={1}
                  max={24}
                  value={weekNum}
                  onChange={(e) => setWeekNum(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono-tabular font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="input-date"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Tanggal Pengukuran
                </label>
                <input
                  id="input-date"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-tabular font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Antropometri (TB, BB, BMI Otomatis) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  1. Data Antropometri & Indeks Massa Tubuh (BMI)
                </h2>
                <span className="text-xs font-mono-tabular font-bold text-emerald-700">
                  BMI: {bmi} kg/m² · {bmiCategory}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="input-tb"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Tinggi Badan (cm)
                  </label>
                  <input
                    id="input-tb"
                    type="number"
                    step="0.5"
                    min={110}
                    max={200}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="input-bb"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Berat Badan (kg)
                  </label>
                  <input
                    id="input-bb"
                    type="number"
                    step="0.5"
                    min={25}
                    max={130}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 flex flex-col justify-center">
                  <span className="text-[11px] text-slate-500">
                    Kategori Kemenkes RI
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5">
                    {bmiCategory} ({bmi})
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Butir Tes TKJI */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  2. Lima Butir Tes Standar TKJI ({selectedStudent.gender} · Usia {selectedStudent.age} Thn)
                </h2>
                <span className="text-xs text-slate-500">
                  Klik kolom untuk melihat panduan postur
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sprint 50m */}
                <div
                  onClick={() => setFocusedMovement('sprint50m')}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    focusedMovement === 'sprint50m'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="input-sprint"
                      className="text-xs font-bold text-slate-900"
                    >
                      Sprint 50 Meter (detik)
                    </label>
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      Skor {sprintScore}/5
                    </span>
                  </div>
                  <input
                    id="input-sprint"
                    type="number"
                    step="0.1"
                    min={5.0}
                    max={18.0}
                    value={sprint50mSec}
                    onFocus={() => setFocusedMovement('sprint50m')}
                    onChange={(e) => setSprint50mSec(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Push-Up 60s */}
                <div
                  onClick={() => setFocusedMovement('pushUp')}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    focusedMovement === 'pushUp'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="input-pushup"
                      className="text-xs font-bold text-slate-900"
                    >
                      Push-Up 60 Detik (repetisi)
                    </label>
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      Skor {pushUpScore}/5
                    </span>
                  </div>
                  <input
                    id="input-pushup"
                    type="number"
                    min={0}
                    max={80}
                    value={pushUpReps}
                    onFocus={() => setFocusedMovement('pushUp')}
                    onChange={(e) => setPushUpReps(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Sit-Up 60s */}
                <div
                  onClick={() => setFocusedMovement('sitUp')}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    focusedMovement === 'sitUp'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="input-situp"
                      className="text-xs font-bold text-slate-900"
                    >
                      Sit-Up 60 Detik (repetisi)
                    </label>
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      Skor {sitUpScore}/5
                    </span>
                  </div>
                  <input
                    id="input-situp"
                    type="number"
                    min={0}
                    max={80}
                    value={sitUpReps}
                    onFocus={() => setFocusedMovement('sitUp')}
                    onChange={(e) => setSitUpReps(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Vertical Jump */}
                <div
                  onClick={() => setFocusedMovement('verticalJump')}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    focusedMovement === 'verticalJump'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="input-vjump"
                      className="text-xs font-bold text-slate-900"
                    >
                      Vertical Jump (cm)
                    </label>
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      Skor {verticalJumpScore}/5
                    </span>
                  </div>
                  <input
                    id="input-vjump"
                    type="number"
                    min={10}
                    max={110}
                    value={verticalJumpCm}
                    onFocus={() => setFocusedMovement('verticalJump')}
                    onChange={(e) => setVerticalJumpCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Cooper 12 Menit */}
                <div
                  onClick={() => setFocusedMovement('cooper12Min')}
                  className={`sm:col-span-2 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    focusedMovement === 'cooper12Min'
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="input-cooper"
                      className="text-xs font-bold text-slate-900"
                    >
                      Lari 12 Menit / Cooper Test (meter)
                    </label>
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700">
                      Skor {cooperScore}/5 · VO2Max {vo2Max} mL/kg/min ({vo2Category})
                    </span>
                  </div>
                  <input
                    id="input-cooper"
                    type="number"
                    step="10"
                    min={600}
                    max={3600}
                    value={cooper12MinMeters}
                    onFocus={() => setFocusedMovement('cooper12Min')}
                    onChange={(e) =>
                      setCooper12MinMeters(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm font-mono-tabular font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Teacher Note */}
            <div>
              <label
                htmlFor="input-teacher-note"
                className="block text-xs font-bold text-slate-800 mb-1.5"
              >
                Catatan Evaluasi Guru PJOK
              </label>
              <textarea
                id="input-teacher-note"
                rows={2}
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Tuliskan observasi postur, teknik pernapasan, atau target latihan siswa..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Live Total Score Summary & Submit */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">
                  Total Skor TKJI Otomatis
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                    {totalTkji} / 25
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    ({predicate})
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Simpan Rekam Mingguan</span>
              </button>
            </div>
          </form>

          {/* Right 5 Cols: Automatic Visual Movement Guide (Requirement 1a) */}
          <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Panduan Visual Gerakan Aktif
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    ['sprint50m', 'Sprint'],
                    ['pushUp', 'Push-Up'],
                    ['sitUp', 'Sit-Up'],
                    ['verticalJump', 'Jump'],
                    ['cooper12Min', 'Cooper'],
                  ] as [MovementKey, string][]
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFocusedMovement(k)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      focusedMovement === k
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <MovementPostureDiagram
              movementKey={focusedMovement}
              genderFilter={selectedStudent.gender}
            />
          </div>
        </div>
      ) : (
        /* Batch Class Input Mode */
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['8-A', '8-B'] as ClassName[]).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setBatchClass(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      batchClass === cls
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kelas {cls}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="batch-week" className="font-bold text-slate-700">
                  Pekan ke:
                </label>
                <input
                  id="batch-week"
                  type="number"
                  min={1}
                  max={24}
                  value={batchWeek}
                  onChange={(e) => setBatchWeek(Number(e.target.value))}
                  className="w-16 px-2.5 py-1.5 font-mono-tabular font-bold bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="batch-date" className="font-bold text-slate-700">
                  Tanggal:
                </label>
                <input
                  id="batch-date"
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="px-2.5 py-1.5 font-mono-tabular font-semibold bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBatch}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Simpan Semua Nilai Kelas {batchClass}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 pr-3 font-semibold">Nama Siswa</th>
                  <th className="py-2 px-2 font-semibold">TB (cm)</th>
                  <th className="py-2 px-2 font-semibold">BB (kg)</th>
                  <th className="py-2 px-2 font-semibold">Sprint 50m (dtk)</th>
                  <th className="py-2 px-2 font-semibold">Push-Up</th>
                  <th className="py-2 px-2 font-semibold">Sit-Up</th>
                  <th className="py-2 px-2 font-semibold">V. Jump (cm)</th>
                  <th className="py-2 px-2 font-semibold">Cooper (m)</th>
                  <th className="py-2 pl-2 font-semibold text-right">
                    Skor & Predikat Otomatis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu) => {
                  const row = batchRows[stu.id] || getLatestRecord(stu);
                  const previewEval = evaluateRecord(
                    {
                      ...getLatestRecord(stu),
                      ...row,
                    },
                    stu.gender
                  );

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="py-2 pr-3">
                        <div className="font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {stu.gender} · BMI {previewEval.bmi} ({previewEval.bmiCategory})
                        </div>
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          step="0.5"
                          value={row.heightCm}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'heightCm',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          step="0.5"
                          value={row.weightKg}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'weightKg',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          step="0.1"
                          value={row.sprint50mSec}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'sprint50mSec',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          value={row.pushUpReps}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'pushUpReps',
                              Number(e.target.value)
                            )
                          }
                          className="w-14 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          value={row.sitUpReps}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'sitUpReps',
                              Number(e.target.value)
                            )
                          }
                          className="w-14 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          value={row.verticalJumpCm}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'verticalJumpCm',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-1.5">
                        <input
                          type="number"
                          step="10"
                          value={row.cooper12MinMeters}
                          onChange={(e) =>
                            updateBatchField(
                              stu.id,
                              'cooper12MinMeters',
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 font-mono-tabular font-semibold border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="py-2 pl-2 text-right font-mono-tabular">
                        <div className="font-extrabold text-emerald-700">
                          {previewEval.totalScore}/25 · {previewEval.predicate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          VO2Max {previewEval.vo2Max}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
