import { MovementKey } from '../types/fitness';

export interface MovementNormRow {
  score: number;
  predicate: string;
  putra: string;
  putri: string;
}

export interface MovementGuide {
  key: MovementKey;
  title: string;
  tkjiCode: string;
  pillarLabel: string;
  unit: string;
  primaryAngleLabel: string;
  secondaryAngleLabel: string;
  phase1Label: string;
  phase2Label: string;
  summary: string;
  steps: string[];
  mistakesToAvoid: string[];
  normsSmp: MovementNormRow[];
}

export const MOVEMENT_GUIDES: Record<MovementKey, MovementGuide> = {
  sprint50m: {
    key: 'sprint50m',
    title: 'Lari Cepat / Sprint 50 Meter',
    tkjiCode: 'Butir Tes 1 · Kecepatan Maksimal',
    pillarLabel: 'Kecepatan & Akselerasi',
    unit: 'detik',
    primaryAngleLabel: 'Sudut Dorong Badan 45° saat Start',
    secondaryAngleLabel: 'Sudut Lutut Ayun 90°',
    phase1Label: 'Fase Start Berdiri & Tolakan Awal',
    phase2Label: 'Fase Lari Kecepatan Penuh',
    summary:
      'Mengukur kecepatan lari jarak pendek 50 meter pada lintasan lurus dengan start berdiri dan pencatatan waktu hingga dada melewati garis finis.',
    steps: [
      'Berdiri di belakang garis start dengan salah satu kaki di depan dan lutut sedikit ditekuk.',
      'Condongkan badan ke depan membentuk sudut dorong sekitar 45° saat aba-aba "Siap".',
      'Saat aba-aba "Ya" atau bunyi peluit, tolakkan kaki belakang sekuat tenaga dan ayunkan lengan 90° secara ritmis.',
      'Pertahankan pandangan lurus ke depan dan jangan mengurangi kecepatan sebelum melewati garis finis.',
    ],
    mistakesToAvoid: [
      'Mengangkat badan terlalu tegak tepat pada 5 meter pertama setelah start.',
      'Menoleh ke kanan/kiri atau melompat saat mendekati pita finis.',
      'Lengan terayun menyilang di depan dada alih-alih bergerak sejajar arah lari.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≤ 6,7 detik', putri: '≤ 7,7 detik' },
      { score: 4, predicate: 'Baik', putra: '6,8 – 7,6 detik', putri: '7,8 – 8,7 detik' },
      { score: 3, predicate: 'Sedang', putra: '7,7 – 8,7 detik', putri: '8,8 – 9,9 detik' },
      { score: 2, predicate: 'Kurang', putra: '8,8 – 10,3 detik', putri: '10,0 – 11,9 detik' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≥ 10,4 detik', putri: '≥ 12,0 detik' },
    ],
  },
  pushUp: {
    key: 'pushUp',
    title: 'Push-Up / Angkat Tubuh 60 Detik',
    tkjiCode: 'Butir Tes 2 · Kekuatan Otot Lengan & Bahu',
    pillarLabel: 'Kekuatan Lengan & Dada',
    unit: 'repetisi',
    primaryAngleLabel: 'Sudut Siku 90° saat Turun',
    secondaryAngleLabel: 'Garis Punggung–Pinggul Lurus 180°',
    phase1Label: 'Fase Lengan Lurus (Posisi Awal)',
    phase2Label: 'Fase Turun Siku 90° (Eksekusi)',
    summary:
      'Mengukur daya tahan dan kekuatan otot lengan, bahu, serta dada selama 60 detik dengan postur tubuh lurus dari kepala hingga tumit.',
    steps: [
      'Ambil posisi telungkup dengan kedua telapak tangan menumpu lantai selebar bahu, jari menghadap ke depan.',
      'Luruskan tubuh dari kepala, punggung, pinggul, hingga pergelangan kaki membentuk garis lurus 180°.',
      'Tekuk siku perlahan hingga sudut lengan atas dan lengan bawah membentuk 90° dan dada mendekati lantai.',
      'Dorong kembali ke posisi awal hingga kedua siku lurus sempurna sambil menghembuskan napas.',
    ],
    mistakesToAvoid: [
      'Pinggul turun melengkung ke bawah atau terangkat terlalu tinggi menyerupai huruf V.',
      'Siku terbuka melebar ke samping lebih dari 60° yang membebani sendi bahu.',
      'Gerakan setengah-setengah (siku tidak mencapai sudut 90° saat turun).',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≥ 38 repetisi', putri: '≥ 28 repetisi' },
      { score: 4, predicate: 'Baik', putra: '28 – 37 repetisi', putri: '20 – 27 repetisi' },
      { score: 3, predicate: 'Sedang', putra: '19 – 27 repetisi', putri: '12 – 19 repetisi' },
      { score: 2, predicate: 'Kurang', putra: '8 – 18 repetisi', putri: '5 – 11 repetisi' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≤ 7 repetisi', putri: '≤ 4 repetisi' },
    ],
  },
  sitUp: {
    key: 'sitUp',
    title: 'Baring Duduk / Sit-Up 60 Detik',
    tkjiCode: 'Butir Tes 3 · Kekuatan & Daya Tahan Otot Perut',
    pillarLabel: 'Kekuatan Inti (Core)',
    unit: 'repetisi',
    primaryAngleLabel: 'Sudut Tekuk Lutut 90°',
    secondaryAngleLabel: 'Sudut Badan Naik 75°–85°',
    phase1Label: 'Fase Berbaring (Bahu Menyentuh Matras)',
    phase2Label: 'Fase Duduk (Siku Menyentuh Paha)',
    summary:
      'Mengukur kekuatan dan daya tahan otot perut (rektus abdominis) selama 60 detik dengan lutut ditekuk 90° dan telapak kaki menapak penuh.',
    steps: [
      'Berbaring terlentang di atas matras, tekuk kedua lutut membentuk sudut 90° dengan telapak kaki rata di lantai.',
      'Letakkan ujung jari di samping pelipis atau silangkan lengan di depan dada (hindari mengaitkan jari di belakang leher).',
      'Angkat tubuh bagian atas menggunakan kontraksi otot perut hingga kedua siku menyentuh paha.',
      'Turunkan badan kembali secara terkontrol sampai kedua tulang belikat menyentuh matras.',
    ],
    mistakesToAvoid: [
      'Menarik leher atau kepala ke depan menggunakan kedua tangan saat merasa lelah.',
      'Menghentakkan punggung atau mengangkat pinggul/telapak kaki dari matras.',
      'Tidak menurunkan bahu hingga menyentuh matras sebelum mengulang gerakan berikutnya.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≥ 38 repetisi', putri: '≥ 28 repetisi' },
      { score: 4, predicate: 'Baik', putra: '28 – 37 repetisi', putri: '19 – 27 repetisi' },
      { score: 3, predicate: 'Sedang', putra: '19 – 27 repetisi', putri: '10 – 18 repetisi' },
      { score: 2, predicate: 'Kurang', putra: '8 – 18 repetisi', putri: '4 – 9 repetisi' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≤ 7 repetisi', putri: '≤ 3 repetisi' },
    ],
  },
  verticalJump: {
    key: 'verticalJump',
    title: 'Loncat Tegak / Vertical Jump',
    tkjiCode: 'Butir Tes 4 · Daya Ledak Otot Tungkai',
    pillarLabel: 'Daya Ledak (Power)',
    unit: 'cm',
    primaryAngleLabel: 'Sudut Awalan Lutut 90°–100°',
    secondaryAngleLabel: 'Ekstensi Penuh Tubuh 180° di Puncak',
    phase1Label: 'Fase Awalan Tekuk Lutut 95°',
    phase2Label: 'Fase Raihan Puncak Vertikal',
    summary:
      'Mengukur daya ledak (eksplosif power) otot tungkai dengan menghitung selisih tinggi raihan loncatan maksimal dikurangi tinggi raihan berdiri.',
    steps: [
      'Berdiri menyamping dekat papan skala meteran, angkat satu lengan lurus ke atas untuk mencatat tinggi raihan awal.',
      'Tekuk kedua lutut membentuk sudut sekitar 90°–100° sambil mengayunkan kedua lengan ke belakang.',
      'Tolakkan kedua kaki secara bersamaan sekuat tenaga ke arah vertikal sambil mengayunkan lengan ke atas.',
      'Sentuh papan skala setinggi mungkin pada titik puncak loncatan, lalu mendarat dengan kedua lutut mengeper.',
    ],
    mistakesToAvoid: [
      'Mengambil langkah awalan atau melompat sebelum tolakan vertikal dilakukan.',
      'Menekuk lutut secara berlebihan (> 120°) sehingga kehilangan daya pegas otot.',
      'Mendarat dengan lutut kaku yang berisiko mencederai pergelangan kaki.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≥ 66 cm', putri: '≥ 50 cm' },
      { score: 4, predicate: 'Baik', putra: '53 – 65 cm', putri: '39 – 49 cm' },
      { score: 3, predicate: 'Sedang', putra: '42 – 52 cm', putri: '30 – 38 cm' },
      { score: 2, predicate: 'Kurang', putra: '31 – 41 cm', putri: '21 – 29 cm' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≤ 30 cm', putri: '≤ 20 cm' },
    ],
  },
  cooper12Min: {
    key: 'cooper12Min',
    title: 'Lari 12 Menit / Cooper Test',
    tkjiCode: 'Butir Tes 5 · Daya Tahan Kardiorespirasi & VO2Max',
    pillarLabel: 'Daya Tahan Kardio',
    unit: 'meter',
    primaryAngleLabel: 'Kecondongan Tubuh Ritmis 85°',
    secondaryAngleLabel: 'Sudut Siku Ayun 90° Rileks',
    phase1Label: 'Fase Ritme Langkah Stabil (Pacing)',
    phase2Label: 'Fase Dorongan Akhir & Pemulihan Napas',
    summary:
      'Mengukur kapasitas aerobik maksimal (VO2Max) dan daya tahan jantung-paru melalui jarak tempuh lari konstan selama 12 menit penuh.',
    steps: [
      'Lakukan pemanasan dinamis 5–7 menit sebelum memulai lari agar detak jantung beradaptasi.',
      'Atur kecepatan lari yang stabil sejak menit pertama (hindari sprint habis-habisan di awal).',
      'Jaga postur tubuh tegak rileks sedikit condong ke depan (85°), bahu turun, dan siku ditekuk 90°.',
      'Atur pola napas ritmis (misal 2 langkah tarik napas, 2 langkah hembuskan) hingga waktu 12 menit selesai.',
    ],
    mistakesToAvoid: [
      'Berlari terlalu cepat pada 2 menit pertama sehingga kehabisan tenaga di pertengahan tes.',
      'Langsung duduk atau berhenti mendadak setelah bel 12 menit berbunyi (wajib jalan pendinginan 3 menit).',
      'Mendarat dengan tumit keras (overstriding) yang mempercepat kelelahan betis.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≥ 2.400 m', putri: '≥ 2.000 m' },
      { score: 4, predicate: 'Baik', putra: '2.050 – 2.399 m', putri: '1.700 – 1.999 m' },
      { score: 3, predicate: 'Sedang', putra: '1.700 – 2.049 m', putri: '1.400 – 1.699 m' },
      { score: 2, predicate: 'Kurang', putra: '1.350 – 1.699 m', putri: '1.100 – 1.399 m' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≤ 1.349 m', putri: '≤ 1.099 m' },
    ],
  },
  plank: {
    key: 'plank',
    title: 'Forearm Plank Isometrik',
    tkjiCode: 'Latihan Pendukung · Stabilitas Inti & Postur',
    pillarLabel: 'Stabilitas Inti & Punggung',
    unit: 'detik',
    primaryAngleLabel: 'Kelurusan Tulang Belakang 180°',
    secondaryAngleLabel: 'Sudut Lengan Bawah–Lantai 90°',
    phase1Label: 'Fase Penjajaran Bahu & Siku 90°',
    phase2Label: 'Fase Tahan Isometrik Lurus 180°',
    summary:
      'Latihan penguatan otot inti (core) dan stabilisator tulang belakang untuk mendukung performa Sit-Up, Push-Up, dan postur remaja SMP.',
    steps: [
      'Bertumpu pada kedua lengan bawah dengan posisi siku tepat di bawah bahu membentuk sudut 90°.',
      'Aktifkan otot perut dan bokong sehingga kepala, bahu, pinggul, dan tumit membentuk garis lurus 180°.',
      'Arahkan pandangan ke matras di antara kedua tangan agar leher tetap netral.',
      'Tahan posisi selama durasi target sambil bernapas teratur tanpa menahan napas.',
    ],
    mistakesToAvoid: [
      'Pinggul melorot ke bawah yang menyebabkan nyeri pada punggung bawah.',
      'Mengangkat bokong terlalu tinggi atau menengadahkan kepala ke depan.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≥ 90 detik', putri: '≥ 75 detik' },
      { score: 4, predicate: 'Baik', putra: '65 – 89 detik', putri: '55 – 74 detik' },
      { score: 3, predicate: 'Sedang', putra: '45 – 64 detik', putri: '35 – 54 detik' },
      { score: 2, predicate: 'Kurang', putra: '25 – 44 detik', putri: '20 – 34 detik' },
      { score: 1, predicate: 'Kurang Sekali', putra: '< 25 detik', putri: '< 20 detik' },
    ],
  },
  shuttleRun: {
    key: 'shuttleRun',
    title: 'Lari Bolak-Balik / Shuttle Run 4 × 10m',
    tkjiCode: 'Latihan Pendukung · Kelincahan & Perubahan Arah',
    pillarLabel: 'Kelincahan (Agility)',
    unit: 'detik',
    primaryAngleLabel: 'Sudut Rendah Titik Berat 60° saat Berbalik',
    secondaryAngleLabel: 'Sudut Lutut Pengereman 95°',
    phase1Label: 'Fase Akselerasi Lurus',
    phase2Label: 'Fase Pengereman & Putaran Balik',
    summary:
      'Latihan kelincahan mengubah arah gerak tubuh secara cepat dan seimbang pada lintasan bolak-balik sejauh 4 × 10 meter.',
    steps: [
      'Mulai dari garis start dan berlari cepat menuju garis batas sejauh 10 meter.',
      'Rendahkan pusat gravitasi tubuh dengan menekuk lutut sekitar 95° sebelum menyentuh garis batas.',
      'Sentuh garis atau pindahkan balok dengan satu tangan, lalu putar badan secepat mungkin.',
      'Ulangi hingga genap 4 lintasan (total 40 meter) dengan keseimbangan terjaga.',
    ],
    mistakesToAvoid: [
      'Berbalik arah dengan posisi badan terlalu tegak sehingga kehilangan keseimbangan.',
      'Melempar balok atau tidak menyentuh garis batas sebelum berbalik.',
    ],
    normsSmp: [
      { score: 5, predicate: 'Baik Sekali', putra: '≤ 10,2 detik', putri: '≤ 11,2 detik' },
      { score: 4, predicate: 'Baik', putra: '10,3 – 11,4 detik', putri: '11,3 – 12,4 detik' },
      { score: 3, predicate: 'Sedang', putra: '11,5 – 12,8 detik', putri: '12,5 – 13,8 detik' },
      { score: 2, predicate: 'Kurang', putra: '12,9 – 14,2 detik', putri: '13,9 – 15,2 detik' },
      { score: 1, predicate: 'Kurang Sekali', putra: '≥ 14,3 detik', putri: '≥ 15,3 detik' },
    ],
  },
};

export const ALL_MOVEMENT_KEYS: MovementKey[] = [
  'sprint50m',
  'pushUp',
  'sitUp',
  'verticalJump',
  'cooper12Min',
  'plank',
  'shuttleRun',
];
