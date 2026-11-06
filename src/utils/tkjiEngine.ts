import {
  BmiCategory,
  Gender,
  Student,
  TkjiEvaluation,
  TkjiPredicate,
  WeeklyRecord,
} from '../types/fitness';

/**
 * Standar Penilaian TKJI (Tes Kebugaran Jasmani Indonesia)
 * Jenjang SMP / Usia 13–15 Tahun (Depdiknas & Kemenpora RI)
 */

export function calculateBmi(heightCm: number, weightKg: number): {
  bmi: number;
  category: BmiCategory;
} {
  const heightM = Math.max(1.1, heightCm / 100);
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  // Klasifikasi IMT/U Remaja SMP (12-15 tahun) Kemenkes RI
  let category: BmiCategory = 'Normal';
  if (bmi < 14.8) {
    category = 'Sangat Kurus';
  } else if (bmi < 16.5) {
    category = 'Kurus';
  } else if (bmi <= 22.8) {
    category = 'Normal';
  } else if (bmi <= 26.2) {
    category = 'Gemuk';
  } else {
    category = 'Obesitas';
  }

  return { bmi, category };
}

export function calculateVo2Max(cooperMeters: number): {
  vo2Max: number;
  category: string;
} {
  // Rumus Cooper 12-Minute Run: VO2max = (Jarak(m) - 504.9) / 44.73
  const raw = (cooperMeters - 504.9) / 44.73;
  const vo2Max = Math.max(18.5, Number(raw.toFixed(1)));

  let category = 'Sedang';
  if (vo2Max >= 46) category = 'Sangat Baik';
  else if (vo2Max >= 39) category = 'Baik';
  else if (vo2Max >= 32) category = 'Sedang';
  else category = 'Perlu Peningkatan';

  return { vo2Max, category };
}

export function scoreSprint50m(seconds: number, gender: Gender): number {
  if (gender === 'Putra') {
    if (seconds <= 6.7) return 5;
    if (seconds <= 7.6) return 4;
    if (seconds <= 8.7) return 3;
    if (seconds <= 10.3) return 2;
    return 1;
  } else {
    if (seconds <= 7.7) return 5;
    if (seconds <= 8.7) return 4;
    if (seconds <= 9.9) return 3;
    if (seconds <= 11.9) return 2;
    return 1;
  }
}

export function scorePushUp(reps: number, gender: Gender): number {
  if (gender === 'Putra') {
    if (reps >= 38) return 5;
    if (reps >= 28) return 4;
    if (reps >= 19) return 3;
    if (reps >= 8) return 2;
    return 1;
  } else {
    if (reps >= 28) return 5;
    if (reps >= 20) return 4;
    if (reps >= 12) return 3;
    if (reps >= 5) return 2;
    return 1;
  }
}

export function scoreSitUp(reps: number, gender: Gender): number {
  if (gender === 'Putra') {
    if (reps >= 38) return 5;
    if (reps >= 28) return 4;
    if (reps >= 19) return 3;
    if (reps >= 8) return 2;
    return 1;
  } else {
    if (reps >= 28) return 5;
    if (reps >= 19) return 4;
    if (reps >= 10) return 3;
    if (reps >= 4) return 2;
    return 1;
  }
}

export function scoreVerticalJump(cm: number, gender: Gender): number {
  if (gender === 'Putra') {
    if (cm >= 66) return 5;
    if (cm >= 53) return 4;
    if (cm >= 42) return 3;
    if (cm >= 31) return 2;
    return 1;
  } else {
    if (cm >= 50) return 5;
    if (cm >= 39) return 4;
    if (cm >= 30) return 3;
    if (cm >= 21) return 2;
    return 1;
  }
}

export function scoreCooper12Min(meters: number, gender: Gender): number {
  if (gender === 'Putra') {
    if (meters >= 2400) return 5;
    if (meters >= 2050) return 4;
    if (meters >= 1700) return 3;
    if (meters >= 1350) return 2;
    return 1;
  } else {
    if (meters >= 2000) return 5;
    if (meters >= 1700) return 4;
    if (meters >= 1400) return 3;
    if (meters >= 1100) return 2;
    return 1;
  }
}

export function classifyTotalTkji(totalScore: number): TkjiPredicate {
  if (totalScore >= 22) return 'Baik Sekali';
  if (totalScore >= 18) return 'Baik';
  if (totalScore >= 14) return 'Sedang';
  if (totalScore >= 10) return 'Kurang';
  return 'Kurang Sekali';
}

function clamp100(val: number): number {
  return Math.max(15, Math.min(100, Math.round(val)));
}

export function evaluateRecord(
  record: WeeklyRecord,
  gender: Gender
): TkjiEvaluation {
  const { bmi, category: bmiCategory } = calculateBmi(
    record.heightCm,
    record.weightKg
  );
  const { vo2Max, category: vo2Category } = calculateVo2Max(
    record.cooper12MinMeters
  );

  const sprintScore = scoreSprint50m(record.sprint50mSec, gender);
  const pushUpScore = scorePushUp(record.pushUpReps, gender);
  const sitUpScore = scoreSitUp(record.sitUpReps, gender);
  const verticalJumpScore = scoreVerticalJump(record.verticalJumpCm, gender);
  const cooperScore = scoreCooper12Min(record.cooper12MinMeters, gender);

  const totalScore =
    sprintScore + pushUpScore + sitUpScore + verticalJumpScore + cooperScore;
  const predicate = classifyTotalTkji(totalScore);

  // Normalized 0-100 pillar values for Spider Radar Chart
  const maxCooper = gender === 'Putra' ? 2600 : 2200;
  const maxSitUp = gender === 'Putra' ? 42 : 32;
  const maxPushUp = gender === 'Putra' ? 42 : 32;
  const maxJump = gender === 'Putra' ? 70 : 54;
  const bestSprint = gender === 'Putra' ? 6.4 : 7.4;
  const worstSprint = gender === 'Putra' ? 11.2 : 12.8;

  const kardio = clamp100((record.cooper12MinMeters / maxCooper) * 100);
  const kekuatanInti = clamp100((record.sitUpReps / maxSitUp) * 100);
  const kekuatanLengan = clamp100((record.pushUpReps / maxPushUp) * 100);
  const dayaLedak = clamp100((record.verticalJumpCm / maxJump) * 100);
  const kecepatan = clamp100(
    ((worstSprint - record.sprint50mSec) / (worstSprint - bestSprint)) * 100
  );
  const kelincahan = clamp100(record.agilityIndex);

  return {
    bmi,
    bmiCategory,
    vo2Max,
    vo2Category,
    sprintScore,
    pushUpScore,
    sitUpScore,
    verticalJumpScore,
    cooperScore,
    totalScore,
    predicate,
    pillars: {
      kardio,
      kekuatanInti,
      kekuatanLengan,
      dayaLedak,
      kecepatan,
      kelincahan,
    },
  };
}

export function getLatestRecord(student: Student): WeeklyRecord {
  return student.records[student.records.length - 1];
}

export function getFirstRecord(student: Student): WeeklyRecord {
  return student.records[0];
}

export function calculateProgressDelta(student: Student): {
  scoreDelta: number;
  percentDelta: number;
  vo2Delta: number;
} {
  const first = evaluateRecord(getFirstRecord(student), student.gender);
  const latest = evaluateRecord(getLatestRecord(student), student.gender);
  const scoreDelta = latest.totalScore - first.totalScore;
  const percentDelta = Number(
    (((latest.totalScore - first.totalScore) / Math.max(1, first.totalScore)) * 100).toFixed(1)
  );
  const vo2Delta = Number((latest.vo2Max - first.vo2Max).toFixed(1));
  return { scoreDelta, percentDelta, vo2Delta };
}

export function getPredicateBadgeStyle(predicate: TkjiPredicate): {
  bg: string;
  text: string;
  border: string;
  shortCode: string;
} {
  switch (predicate) {
    case 'Baik Sekali':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        shortCode: 'BS',
      };
    case 'Baik':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        shortCode: 'B',
      };
    case 'Sedang':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        shortCode: 'S',
      };
    case 'Kurang':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200',
        shortCode: 'K',
      };
    case 'Kurang Sekali':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        shortCode: 'KS',
      };
  }
}

/**
 * Menghitung mundur tenggat waktu tugas otomatis relatif terhadap hari ini
 */
export function formatDueCountdown(dueDateStr: string): {
  label: string;
  urgency: 'today' | 'soon' | 'normal' | 'overdue';
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const dueStart = new Date(y, (m || 1) - 1, d || 1);
  const diffDays = Math.round(
    (dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      label: `Terlewat ${Math.abs(diffDays)} hari`,
      urgency: 'overdue',
    };
  }
  if (diffDays === 0) {
    const hoursLeft = Math.max(1, 23 - now.getHours());
    return {
      label: `Tenggat Hari Ini! (${hoursLeft} jam lagi)`,
      urgency: 'today',
    };
  }
  if (diffDays <= 2) {
    return {
      label: `Sisa ${diffDays} hari`,
      urgency: 'soon',
    };
  }
  return {
    label: `Sisa ${diffDays} hari`,
    urgency: 'normal',
  };
}

/**
 * Lonceng Audio Sintetis (Web Audio API Chime) untuk Uji Notifikasi Push
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);

      gain.gain.setValueAtTime(0.001, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.11 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.48);
    });
  } catch {
    // Ignore audio context restriction if browser blocks autoplay
  }
}
