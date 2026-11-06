import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Check, Download, Printer, X } from 'lucide-react';
import { Student } from '../types/fitness';
import {
  calculateProgressDelta,
  evaluateRecord,
  getFirstRecord,
  getLatestRecord,
} from '../utils/tkjiEngine';

interface RaporPdfModalProps {
  student: Student;
  onClose: () => void;
  onUpdateTeacherNote?: (studentId: string, newNote: string) => void;
}

export const RaporPdfModal: React.FC<RaporPdfModalProps> = ({
  student,
  onClose,
  onUpdateTeacherNote,
}) => {
  const firstRec = getFirstRecord(student);
  const latestRec = getLatestRecord(student);
  const firstEval = evaluateRecord(firstRec, student.gender);
  const latestEval = evaluateRecord(latestRec, student.gender);
  const delta = calculateProgressDelta(student);

  const [coachingRemark, setCoachingRemark] = useState<string>(
    latestRec.teacherNote ||
      `Ananda ${student.name} menunjukkan perkembangan kebugaran jasmani yang positif dari Minggu ke-1 hingga Minggu ke-${latestRec.week} dengan predikat akhir ${latestEval.predicate}.`
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const calcPct = (awal: number, akhir: number, lowerIsBetter = false) => {
    if (awal === 0) return '0.0%';
    const diff = lowerIsBetter ? awal - akhir : akhir - awal;
    const pct = (diff / awal) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('rapor-pdf-sheet');
    if (!el) return;

    setIsExporting(true);
    setExportError(null);
    setExportDone(false);

    try {
      if (onUpdateTeacherNote) {
        onUpdateTeacherNote(student.id, coachingRemark);
      }

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Sanitize Tailwind v4 oklch() / oklab() tokens in cloned stylesheets so html2canvas parses cleanly
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/g, '#059669')
                .replace(/oklab\([^)]+\)/g, '#059669');
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);
      const finalWidth =
        imgHeight > pageHeight - margin * 2
          ? ((pageHeight - margin * 2) * canvas.width) / canvas.height
          : usableWidth;

      const xOffset = (pageWidth - finalWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, margin, finalWidth, finalHeight);

      const safeName = student.name.replace(/\s+/g, '_');
      pdf.save(`Rapor_TKJI_${safeName}_${student.className}.pdf`);
      setExportDone(true);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportError(
        'Gagal merender file PDF otomatis. Silakan gunakan tombol Cetak / Print PDF browser.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    if (onUpdateTeacherNote) {
      onUpdateTeacherNote(student.id, coachingRemark);
    }
    window.print();
  };

  const comparisonRows = [
    {
      no: 1,
      name: 'Lari Cepat (Sprint 50 Meter)',
      unit: 'detik',
      awalVal: `${firstRec.sprint50mSec.toFixed(1)} dtk (Skor ${firstEval.sprintScore})`,
      akhirVal: `${latestRec.sprint50mSec.toFixed(1)} dtk (Skor ${latestEval.sprintScore})`,
      pct: calcPct(firstRec.sprint50mSec, latestRec.sprint50mSec, true),
      akhirScore: latestEval.sprintScore,
    },
    {
      no: 2,
      name: 'Angkat Tubuh / Push-Up (60 Detik)',
      unit: 'repetisi',
      awalVal: `${firstRec.pushUpReps} rep (Skor ${firstEval.pushUpScore})`,
      akhirVal: `${latestRec.pushUpReps} rep (Skor ${latestEval.pushUpScore})`,
      pct: calcPct(firstRec.pushUpReps, latestRec.pushUpReps),
      akhirScore: latestEval.pushUpScore,
    },
    {
      no: 3,
      name: 'Baring Duduk / Sit-Up (60 Detik)',
      unit: 'repetisi',
      awalVal: `${firstRec.sitUpReps} rep (Skor ${firstEval.sitUpScore})`,
      akhirVal: `${latestRec.sitUpReps} rep (Skor ${latestEval.sitUpScore})`,
      pct: calcPct(firstRec.sitUpReps, latestRec.sitUpReps),
      akhirScore: latestEval.sitUpScore,
    },
    {
      no: 4,
      name: 'Loncat Tegak (Vertical Jump)',
      unit: 'cm',
      awalVal: `${firstRec.verticalJumpCm} cm (Skor ${firstEval.verticalJumpScore})`,
      akhirVal: `${latestRec.verticalJumpCm} cm (Skor ${latestEval.verticalJumpScore})`,
      pct: calcPct(firstRec.verticalJumpCm, latestRec.verticalJumpCm),
      akhirScore: latestEval.verticalJumpScore,
    },
    {
      no: 5,
      name: 'Lari 12 Menit (Cooper Test)',
      unit: 'meter',
      awalVal: `${firstRec.cooper12MinMeters} m (Skor ${firstEval.cooperScore})`,
      akhirVal: `${latestRec.cooper12MinMeters} m (Skor ${latestEval.cooperScore})`,
      pct: calcPct(firstRec.cooper12MinMeters, latestRec.cooper12MinMeters),
      akhirScore: latestEval.cooperScore,
    },
    {
      no: 6,
      name: 'Estimasi Kapasitas Aerobik (VO2Max)',
      unit: 'mL/kg/min',
      awalVal: `${firstEval.vo2Max} mL/kg/min`,
      akhirVal: `${latestEval.vo2Max} mL/kg/min`,
      pct: calcPct(firstEval.vo2Max, latestEval.vo2Max),
      akhirScore: null,
    },
  ];

  const scoreToLabel = (s: number | null) => {
    if (s === null) return latestEval.vo2Category;
    if (s === 5) return 'Baik Sekali';
    if (s === 4) return 'Baik';
    if (s === 3) return 'Sedang';
    if (s === 2) return 'Kurang';
    return 'Kurang Sekali';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-4 md:p-8 flex items-start justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full overflow-hidden shadow-xl">
        {/* Modal Action Toolbar (Hidden in print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau & Ekspor Rapor Kebugaran Jasmani (TKJI)
            </h3>
            <p className="text-xs text-slate-500">
              {student.name} · Kelas {student.className} · NIS {student.nis}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {exportDone ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isExporting
                  ? 'Menyusun PDF...'
                  : exportDone
                  ? 'File PDF Terunduh'
                  : 'Unduh File PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Rapor"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {exportError && (
          <div className="no-print px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
            {exportError}
          </div>
        )}

        {/* Editable Teacher Note Control before export */}
        <div className="no-print px-6 py-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="rapor-remark-input"
            className="text-xs font-semibold text-emerald-950 shrink-0"
          >
            Catatan Pembinaan Guru:
          </label>
          <input
            id="rapor-remark-input"
            type="text"
            value={coachingRemark}
            onChange={(e) => setCoachingRemark(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Official Printable A4 Rapor Sheet (100% explicit Hex colors for flawless html2canvas PDF capture) */}
        <div className="p-6 md:p-8 overflow-x-auto bg-slate-100">
          <div
            id="rapor-pdf-sheet"
            className="print-only-container mx-auto"
            style={{
              width: '760px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '32px 36px',
              border: '1px solid #cbd5e1',
              fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
            }}
          >
            {/* Kop Surat Sekolah */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '3px double #0f172a',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* School Shield Vector Emblem */}
                <svg width="52" height="56" viewBox="0 0 52 56">
                  <path
                    d="M26 3 L47 11 V27 C47 40 37 49 26 53 C15 49 5 40 5 27 V11 Z"
                    fill="#ecfdf5"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M26 12 L38 17 V27 C38 35 32 41 26 44 C20 41 14 35 14 27 V17 Z"
                    fill="#059669"
                  />
                  <text
                    x="26"
                    y="31"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    GM
                  </text>
                </svg>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#047857',
                      textTransform: 'uppercase',
                    }}
                  >
                    YAYASAN PENDIDIKAN GLOBAL MANDIRI · DINAS PENDIDIKAN DKI JAKARTA
                  </div>
                  <div
                    style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.2,
                      marginTop: '2px',
                    }}
                  >
                    SMP GLOBAL MANDIRI JAKARTA
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Jl. Raya Penggilingan No. 48, Cakung, Jakarta Timur 13940 · Telp. (021) 4802194
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0f172a',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #059669',
                    padding: '4px 10px',
                    borderRadius: '4px',
                  }}
                >
                  RAPOR KEBUGARAN TKJI
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                  Tahun Ajaran 2026/2027
                </div>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                LAPORAN HASIL EVALUASI TES KEBUGARAN JASMANI INDONESIA (TKJI)
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                Jenjang Sekolah Menengah Pertama (Usia 12–15 Tahun) · Standar Depdiknas / Kemenpora RI
              </div>
            </div>

            {/* Identitas Siswa & Antropometri */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'grid', rowGap: '4px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '115px' }}>
                    Nama Peserta Didik
                  </span>
                  <strong>: {student.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '115px' }}>
                    Nomor Induk (NIS)
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>: {student.nis}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '115px' }}>
                    Kelas / Jenis Kelamin
                  </span>
                  <strong>
                    : {student.className} / {student.gender} ({student.age} Tahun)
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', rowGap: '4px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '125px' }}>
                    Tinggi / Berat Badan
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>
                    : {latestRec.heightCm} cm / {latestRec.weightKg} kg
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '125px' }}>
                    Indeks Massa Tubuh
                  </span>
                  <strong style={{ fontFamily: 'monospace', color: '#047857' }}>
                    : {latestEval.bmi} kg/m² ({latestEval.bmiCategory})
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'inline-block', width: '125px' }}>
                    Periode Evaluasi
                  </span>
                  <strong>
                    : Minggu ke-1 s/d Minggu ke-{latestRec.week}
                  </strong>
                </div>
              </div>
            </div>

            {/* Tabel Komparasi Awal vs Akhir */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11.5px',
                marginBottom: '16px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#059669', color: '#ffffff' }}>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'center',
                      border: '1px solid #047857',
                      width: '36px',
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      border: '1px solid #047857',
                    }}
                  >
                    Komponen / Butir Tes TKJI
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #047857',
                    }}
                  >
                    Nilai Awal (Mgg 1)
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #047857',
                    }}
                  >
                    Nilai Akhir (Mgg {latestRec.week})
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      border: '1px solid #047857',
                    }}
                  >
                    Kemajuan
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'center',
                      border: '1px solid #047857',
                    }}
                  >
                    Klasifikasi
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.no}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'center',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                      }}
                    >
                      {row.no}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'right',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        color: '#475569',
                      }}
                    >
                      {row.awalVal}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'right',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {row.akhirVal}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'right',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#047857',
                      }}
                    >
                      {row.pct}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'center',
                        border: '1px solid #cbd5e1',
                        fontWeight: 600,
                      }}
                    >
                      {scoreToLabel(row.akhirScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 800 }}>
                  <td
                    colSpan={2}
                    style={{
                      padding: '9px 10px',
                      border: '1px solid #059669',
                      color: '#065f46',
                    }}
                  >
                    TOTAL SKOR AKUMULASI TKJI (5 BUTIR TES)
                  </td>
                  <td
                    style={{
                      padding: '9px 10px',
                      textAlign: 'right',
                      border: '1px solid #059669',
                      fontFamily: 'monospace',
                      color: '#334155',
                    }}
                  >
                    {firstEval.totalScore} / 25 ({firstEval.predicate})
                  </td>
                  <td
                    style={{
                      padding: '9px 10px',
                      textAlign: 'right',
                      border: '1px solid #059669',
                      fontFamily: 'monospace',
                      color: '#065f46',
                      fontSize: '13px',
                    }}
                  >
                    {latestEval.totalScore} / 25
                  </td>
                  <td
                    style={{
                      padding: '9px 10px',
                      textAlign: 'right',
                      border: '1px solid #059669',
                      fontFamily: 'monospace',
                      color: '#047857',
                    }}
                  >
                    {delta.scoreDelta >= 0 ? `+${delta.scoreDelta}` : delta.scoreDelta} poin (
                    {delta.percentDelta >= 0 ? `+${delta.percentDelta}%` : `${delta.percentDelta}%`})
                  </td>
                  <td
                    style={{
                      padding: '9px 10px',
                      textAlign: 'center',
                      border: '1px solid #059669',
                      color: '#065f46',
                      fontSize: '12.5px',
                    }}
                  >
                    {latestEval.predicate.toUpperCase()}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Catatan Pembinaan Guru PJOK */}
            <div
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '22px',
                backgroundColor: '#f8fafc',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '4px',
                }}
              >
                CATATAN & REKOMENDASI PEMBINAAN GURU PJOK:
              </div>
              <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.5 }}>
                {coachingRemark}
              </div>
            </div>

            {/* Lembar Tanda Tangan Resmi 3 Kolom */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                fontSize: '11.5px',
                textAlign: 'center',
                paddingTop: '6px',
              }}
            >
              <div>
                <div style={{ color: '#475569' }}>Mengetahui,</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  Orang Tua / Wali Murid
                </div>
                <div style={{ height: '54px' }} />
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0f172a',
                    textDecoration: 'underline',
                  }}
                >
                  {student.parentName}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  {student.parentRelation}
                </div>
              </div>

              <div>
                <div style={{ color: '#475569' }}>Mengetahui,</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  Kepala SMP Global Mandiri
                </div>
                <div style={{ height: '54px' }} />
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0f172a',
                    textDecoration: 'underline',
                  }}
                >
                  Drs. Hendra Wijaya, M.Pd.
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  NIP. 19710412 199802 1 003
                </div>
              </div>

              <div>
                <div style={{ color: '#475569' }}>Jakarta, {latestRec.date}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  Guru Mata Pelajaran PJOK
                </div>
                <div style={{ height: '54px' }} />
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0f172a',
                    textDecoration: 'underline',
                  }}
                >
                  Zaidan Rizqi, S.Pd.
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  NUPTK. 4829 7716 6213 0082
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
