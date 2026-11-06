import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { MovementKey, Student } from '../types/fitness';
import { evaluateRecord } from '../utils/tkjiEngine';

export type ChartMetricKey =
  | 'totalScore'
  | 'vo2Max'
  | 'sprint50mSec'
  | 'pushUpReps'
  | 'sitUpReps'
  | 'verticalJumpCm'
  | 'cooper12MinMeters'
  | 'bmi';

interface MetricConfig {
  key: ChartMetricKey;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
  movementKey?: MovementKey;
  targetPutra: number;
  targetPutri: number;
  minDomain: number;
  maxDomain: number;
}

export const CHART_METRICS: MetricConfig[] = [
  {
    key: 'totalScore',
    label: 'Total Skor TKJI',
    unit: 'poin',
    targetPutra: 18,
    targetPutri: 18,
    minDomain: 5,
    maxDomain: 25,
  },
  {
    key: 'vo2Max',
    label: 'Estimasi VO2Max',
    unit: 'mL/kg/m',
    movementKey: 'cooper12Min',
    targetPutra: 39,
    targetPutri: 35,
    minDomain: 22,
    maxDomain: 52,
  },
  {
    key: 'sprint50mSec',
    label: 'Sprint 50m',
    unit: 'detik',
    lowerIsBetter: true,
    movementKey: 'sprint50m',
    targetPutra: 7.6,
    targetPutri: 8.7,
    minDomain: 6.2,
    maxDomain: 12.0,
  },
  {
    key: 'pushUpReps',
    label: 'Push-Up 60s',
    unit: 'rep',
    movementKey: 'pushUp',
    targetPutra: 28,
    targetPutri: 20,
    minDomain: 0,
    maxDomain: 42,
  },
  {
    key: 'sitUpReps',
    label: 'Sit-Up 60s',
    unit: 'rep',
    movementKey: 'sitUp',
    targetPutra: 28,
    targetPutri: 19,
    minDomain: 0,
    maxDomain: 42,
  },
  {
    key: 'verticalJumpCm',
    label: 'Vertical Jump',
    unit: 'cm',
    movementKey: 'verticalJump',
    targetPutra: 53,
    targetPutri: 39,
    minDomain: 18,
    maxDomain: 70,
  },
  {
    key: 'cooper12MinMeters',
    label: 'Cooper 12 Menit',
    unit: 'm',
    movementKey: 'cooper12Min',
    targetPutra: 2050,
    targetPutri: 1700,
    minDomain: 1000,
    maxDomain: 2600,
  },
  {
    key: 'bmi',
    label: 'Indeks Massa Tubuh (BMI)',
    unit: 'kg/m²',
    targetPutra: 19.5,
    targetPutri: 19.5,
    minDomain: 14,
    maxDomain: 28,
  },
];

interface ProgressTrendChartProps {
  student: Student;
  selectedMetric: ChartMetricKey;
  onSelectMetric: (metric: ChartMetricKey) => void;
}

export const ProgressTrendChart: React.FC<ProgressTrendChartProps> = ({
  student,
  selectedMetric,
  onSelectMetric,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const metricCfg =
    CHART_METRICS.find((m) => m.key === selectedMetric) || CHART_METRICS[0];

  const points = student.records.map((rec) => {
    const evalRes = evaluateRecord(rec, student.gender);
    let value = 0;
    switch (selectedMetric) {
      case 'totalScore':
        value = evalRes.totalScore;
        break;
      case 'vo2Max':
        value = evalRes.vo2Max;
        break;
      case 'bmi':
        value = evalRes.bmi;
        break;
      default:
        value = rec[selectedMetric];
    }
    return {
      week: rec.week,
      date: rec.date,
      value,
      evalRes,
      note: rec.teacherNote,
    };
  });

  const firstVal = points[0]?.value ?? 0;
  const latestVal = points[points.length - 1]?.value ?? 0;
  const rawDiff = Number((latestVal - firstVal).toFixed(1));
  const pctChange =
    firstVal !== 0
      ? Number((((latestVal - firstVal) / firstVal) * 100).toFixed(1))
      : 0;

  const isImproved = metricCfg.lowerIsBetter ? rawDiff < 0 : rawDiff > 0;

  // SVG dimensions
  const width = 680;
  const height = 240;
  const padL = 46;
  const padR = 24;
  const padT = 22;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const targetVal =
    student.gender === 'Putra' ? metricCfg.targetPutra : metricCfg.targetPutri;

  const allVals = [...points.map((p) => p.value), targetVal];
  const minVal = Math.min(metricCfg.minDomain, ...allVals);
  const maxVal = Math.max(metricCfg.maxDomain, ...allVals);
  const span = Math.max(1, maxVal - minVal);

  const getX = (idx: number) => {
    if (points.length <= 1) return padL + plotW / 2;
    return padL + (idx / (points.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    // For sprint50m (lowerIsBetter), higher on chart = faster (lower seconds)
    if (metricCfg.lowerIsBetter) {
      return padT + ((val - minVal) / span) * plotH;
    }
    return padT + plotH - ((val - minVal) / span) * plotH;
  };

  const coords = points.map((p, i) => ({
    ...p,
    x: getX(i),
    y: getY(p.value),
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
          padT + plotH
        ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const targetY = getY(targetVal);
  const activePoint =
    hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Kurva Perkembangan Mingguan · {student.name} ({student.className} · {student.gender})
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-lg font-bold text-slate-900">{metricCfg.label}</h3>
            <span className="font-mono-tabular text-2xl font-extrabold text-emerald-700">
              {latestVal} {metricCfg.unit}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold font-mono-tabular ${
                isImproved ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isImproved ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {rawDiff > 0 ? `+${rawDiff}` : rawDiff} {metricCfg.unit} (
              {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`})
            </span>
          </div>
        </div>

        {/* Interactive Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {CHART_METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelectMetric(m.key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedMetric === m.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label.replace('Estimasi ', '').replace('Indeks Massa Tubuh ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line & Area Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[480px] h-60 select-none"
        >
          <defs>
            <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
            const y = padT + t * plotH;
            const gridVal = metricCfg.lowerIsBetter
              ? minVal + t * span
              : maxVal - t * span;
            return (
              <g key={idx}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748B"
                  className="font-mono-tabular"
                >
                  {selectedMetric === 'cooper12MinMeters'
                    ? Math.round(gridVal)
                    : Number(gridVal.toFixed(1))}
                </text>
              </g>
            );
          })}

          {/* Target Standard Reference Line */}
          <line
            x1={padL}
            y1={targetY}
            x2={width - padR}
            y2={targetY}
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <text
            x={width - padR}
            y={targetY - 5}
            textAnchor="end"
            fontSize="10"
            fontWeight="600"
            fill="#059669"
            className="font-mono-tabular"
          >
            Target Baik SMP ({student.gender}): {targetVal} {metricCfg.unit}
          </text>

          {/* Area & Line */}
          <path d={areaPath} fill="url(#emeraldAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes & X-Axis Labels */}
          {coords.map((pt, idx) => {
            const isActive =
              hoveredIdx === idx ||
              (hoveredIdx === null && idx === coords.length - 1);
            return (
              <g
                key={pt.week}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(idx)}
              >
                {/* Vertical guide on hover */}
                {isActive && (
                  <line
                    x1={pt.x}
                    y1={padT}
                    x2={pt.x}
                    y2={padT + plotH}
                    stroke="#10B981"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6.5 : 4.5}
                  fill={isActive ? '#059669' : '#FFFFFF'}
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isActive ? '700' : '500'}
                  fill={isActive ? '#0F172A' : '#64748B'}
                >
                  Mgg {pt.week}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Point Readout Bar */}
      {activePoint && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-slate-900">
              Minggu ke-{activePoint.week}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-slate-500">
              {activePoint.date}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular font-bold text-emerald-700">
              {activePoint.value} {metricCfg.unit}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700">
              Skor TKJI Total: <strong className="font-mono-tabular">{activePoint.evalRes.totalScore}/25</strong> ({activePoint.evalRes.predicate})
            </span>
          </div>
          <p className="text-slate-600 italic truncate max-w-md">
            “{activePoint.note}”
          </p>
        </div>
      )}
    </div>
  );
};

interface SixPillarRadarChartProps {
  student: Student;
}

export const SixPillarRadarChart: React.FC<SixPillarRadarChartProps> = ({
  student,
}) => {
  const [selectedAxis, setSelectedAxis] = useState<number>(0);

  const firstRec = student.records[0];
  const latestRec = student.records[student.records.length - 1];
  const firstEval = evaluateRecord(firstRec, student.gender);
  const latestEval = evaluateRecord(latestRec, student.gender);

  const axes = [
    {
      label: 'Kardio',
      current: latestEval.pillars.kardio,
      baseline: firstEval.pillars.kardio,
      detail: `Cooper ${latestRec.cooper12MinMeters}m (VO2Max ${latestEval.vo2Max})`,
    },
    {
      label: 'Kekuatan Inti',
      current: latestEval.pillars.kekuatanInti,
      baseline: firstEval.pillars.kekuatanInti,
      detail: `Sit-Up ${latestRec.sitUpReps} rep/mnt`,
    },
    {
      label: 'Kekuatan Lengan',
      current: latestEval.pillars.kekuatanLengan,
      baseline: firstEval.pillars.kekuatanLengan,
      detail: `Push-Up ${latestRec.pushUpReps} rep/mnt`,
    },
    {
      label: 'Daya Ledak',
      current: latestEval.pillars.dayaLedak,
      baseline: firstEval.pillars.dayaLedak,
      detail: `Vertical Jump ${latestRec.verticalJumpCm} cm`,
    },
    {
      label: 'Kecepatan',
      current: latestEval.pillars.kecepatan,
      baseline: firstEval.pillars.kecepatan,
      detail: `Sprint 50m ${latestRec.sprint50mSec} detik`,
    },
    {
      label: 'Kelincahan',
      current: latestEval.pillars.kelincahan,
      baseline: firstEval.pillars.kelincahan,
      detail: `Indeks Shuttle ${latestRec.agilityIndex}/100`,
    },
  ];

  const cx = 165;
  const cy = 145;
  const radius = 92;

  const getPoint = (axisIdx: number, value100: number) => {
    const angle = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 6;
    const r = (value100 / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const baselinePolygon = axes
    .map((a, i) => {
      const p = getPoint(i, a.baseline);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  const currentPolygon = axes
    .map((a, i) => {
      const p = getPoint(i, a.current);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  const activeAxis = axes[selectedAxis];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Profil Keseimbangan Fisik
        </p>
        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
          Peta Radar 6 Pilar Kebugaran
        </h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 inline-block" />
            Minggu ke-1
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="w-3 h-1 bg-emerald-600 inline-block rounded-xs" />
            Minggu ke-{latestRec.week} (Terbaru)
          </span>
        </div>
      </div>

      <div className="my-2 flex justify-center">
        <svg viewBox="0 0 330 290" className="w-full max-w-[320px] h-64 select-none">
          {/* Concentric Hexagons */}
          {[25, 50, 75, 100].map((ring) => {
            const pts = axes
              .map((_, i) => {
                const p = getPoint(i, ring);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(' ');
            return (
              <polygon
                key={ring}
                points={pts}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis Spokes & Labels */}
          {axes.map((axis, i) => {
            const outer = getPoint(i, 100);
            const labelPos = getPoint(i, 122);
            const currentPt = getPoint(i, axis.current);
            const isSel = selectedAxis === i;
            return (
              <g
                key={axis.label}
                className="cursor-pointer"
                onClick={() => setSelectedAxis(i)}
                onMouseEnter={() => setSelectedAxis(i)}
              >
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isSel ? '#059669' : '#CBD5E1'}
                  strokeWidth={isSel ? '1.5' : '1'}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y + 3}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={isSel ? '700' : '600'}
                  fill={isSel ? '#059669' : '#334155'}
                >
                  {axis.label}
                </text>
                <circle
                  cx={currentPt.x}
                  cy={currentPt.y}
                  r={isSel ? 5.5 : 4}
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Baseline Polygon */}
          <polygon
            points={baselinePolygon}
            fill="rgba(148, 163, 184, 0.14)"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Current Polygon */}
          <polygon
            points={currentPolygon}
            fill="rgba(16, 185, 129, 0.22)"
            stroke="#059669"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* Selected Pillar Breakdown */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-900">{activeAxis.label}: </span>
          <span className="text-slate-600">{activeAxis.detail}</span>
        </div>
        <div className="font-mono-tabular font-bold text-emerald-700">
          {activeAxis.current}/100{' '}
          <span className="text-slate-400 font-normal">
            (Awal {activeAxis.baseline})
          </span>
        </div>
      </div>
    </div>
  );
};

interface GrowthAnthropometryChartProps {
  student: Student;
}

export const GrowthAnthropometryChart: React.FC<GrowthAnthropometryChartProps> = ({
  student,
}) => {
  const width = 560;
  const height = 190;
  const padL = 42;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const data = student.records.map((r) => {
    const ev = evaluateRecord(r, student.gender);
    return {
      week: r.week,
      heightCm: r.heightCm,
      weightKg: r.weightKg,
      bmi: ev.bmi,
      bmiCategory: ev.bmiCategory,
    };
  });

  const minBmi = 14;
  const maxBmi = 27;

  const getX = (i: number) =>
    data.length <= 1 ? padL + plotW / 2 : padL + (i / (data.length - 1)) * plotW;
  const getY = (bmi: number) =>
    padT + plotH - ((bmi - minBmi) / (maxBmi - minBmi)) * plotH;

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.bmi)}`)
    .join(' ');

  const normalTopY = getY(22.8);
  const normalBottomY = getY(16.5);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Pemantauan Antropometri Remaja (Kemenkes RI)
          </p>
          <h4 className="text-base font-bold text-slate-900">
            Grafik Tumbuh Kembang (TB / BB / BMI)
          </h4>
        </div>
        <span className="text-xs font-mono-tabular font-semibold text-emerald-700">
          Zona Ideal BMI: 16.5 – 22.8 kg/m²
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
        {/* Ideal BMI band */}
        <rect
          x={padL}
          y={normalTopY}
          width={plotW}
          height={normalBottomY - normalTopY}
          fill="#ECFDF5"
        />
        <text
          x={padL + 6}
          y={normalTopY + 12}
          fontSize="9.5"
          fontWeight="600"
          fill="#059669"
        >
          Rentang BMI Normal Remaja SMP
        </text>

        {[15, 18, 21, 24, 27].map((val) => {
          const y = getY(val);
          return (
            <g key={val}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#64748B" className="font-mono-tabular">
                {val}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke="#059669" strokeWidth="2.5" />

        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.bmi);
          return (
            <g key={d.week}>
              <circle cx={x} cy={y} r="4.5" fill="#059669" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0F172A" className="font-mono-tabular">
                {d.bmi}
              </text>
              <text x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748B">
                Mgg {d.week}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">Tinggi Badan</span>
          <strong className="font-mono-tabular text-sm text-slate-900">
            {data[data.length - 1].heightCm} cm
          </strong>
          <span className="text-emerald-700 font-mono-tabular ml-1">
            (+{(data[data.length - 1].heightCm - data[0].heightCm).toFixed(1)})
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Berat Badan</span>
          <strong className="font-mono-tabular text-sm text-slate-900">
            {data[data.length - 1].weightKg} kg
          </strong>
          <span className="text-slate-500 font-mono-tabular ml-1">
            (Awal {data[0].weightKg})
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Status IMT / BMI</span>
          <strong className="font-mono-tabular text-sm text-emerald-700">
            {data[data.length - 1].bmi} · {data[data.length - 1].bmiCategory}
          </strong>
        </div>
      </div>
    </div>
  );
};
