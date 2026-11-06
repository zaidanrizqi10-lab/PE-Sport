import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Compass, Eye, RotateCcw } from 'lucide-react';
import { MOVEMENT_GUIDES } from '../data/movementGuides';
import { Gender, MovementKey } from '../types/fitness';

interface MovementPostureDiagramProps {
  movementKey: MovementKey;
  genderFilter?: Gender | 'Semua';
  compact?: boolean;
  onSelectMovement?: (key: MovementKey) => void;
}

export const MovementPostureDiagram: React.FC<MovementPostureDiagramProps> = ({
  movementKey,
  genderFilter = 'Semua',
  compact = false,
}) => {
  const [phase, setPhase] = useState<1 | 2>(2);
  const [showMistakeOverlay, setShowMistakeOverlay] = useState(false);

  const guide = MOVEMENT_GUIDES[movementKey];

  const renderBiomechanicalSvg = () => {
    const strokePerson = showMistakeOverlay ? '#DC2626' : '#0F172A';
    const jointFill = showMistakeOverlay ? '#FCA5A5' : '#10B981';
    const angleColor = showMistakeOverlay ? '#DC2626' : '#059669';

    switch (movementKey) {
      case 'pushUp': {
        // Phase 1: High plank (straight arms), Phase 2: Elbow 90 deg lowered
        const isLowered = phase === 2;
        const mistakeSag = showMistakeOverlay;
        const hipY = mistakeSag ? 142 : isLowered ? 124 : 96;
        const shoulderY = isLowered ? 116 : 82;
        const headY = isLowered ? 106 : 70;
        const elbowX = isLowered ? 226 : 236;
        const elbowY = isLowered ? 136 : 118;

        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            {/* Coordinate grid */}
            <defs>
              <pattern id="grid-pushup" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-pushup)" rx="8" />
            {/* Floor line */}
            <line x1="24" y1="158" x2="336" y2="158" stroke="#94A3B8" strokeWidth="2" />

            {/* 180 deg spine alignment reference line */}
            <line
              x1="72"
              y1="152"
              x2="245"
              y2={shoulderY}
              stroke={angleColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Legs & Torso */}
            <polyline
              points={`72,154 122,${isLowered ? 138 : 122} 175,${hipY} 242,${shoulderY}`}
              fill="none"
              stroke={strokePerson}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Arm */}
            <polyline
              points={`242,${shoulderY} ${elbowX},${elbowY} 246,155`}
              fill="none"
              stroke={strokePerson}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Head */}
            <circle cx="268" cy={headY} r="12" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />

            {/* Joints */}
            {[
              [72, 154],
              [122, isLowered ? 138 : 122],
              [175, hipY],
              [242, shoulderY],
              [elbowX, elbowY],
              [246, 155],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill={jointFill} stroke="#0F172A" strokeWidth="1.5" />
            ))}

            {/* Elbow 90 deg angle arc */}
            {isLowered && !mistakeSag && (
              <g>
                <path
                  d="M 235 123 A 14 14 0 0 0 237 146"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.2"
                />
                <rect x="184" y="128" width="36" height="18" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="202" y="140" textAnchor="middle" fontSize="10" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  90°
                </text>
              </g>
            )}

            {/* Spine 180 deg label */}
            <rect x="122" y="68" width="96" height="18" rx="4" fill={mistakeSag ? '#FEF2F2' : '#ECFDF5'} stroke={angleColor} strokeWidth="1" />
            <text x="170" y="80" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={mistakeSag ? '#991B1B' : '#065F46'} className="font-mono-tabular">
              {mistakeSag ? 'Pinggul Turun!' : 'Punggung 180°'}
            </text>
          </svg>
        );
      }

      case 'sitUp': {
        // Phase 1: Supine lying down, knee 90 deg. Phase 2: Sitting up torso 80 deg, elbows near thighs
        const isUp = phase === 2;
        const shoulderX = isUp ? 168 : 88;
        const shoulderY = isUp ? 92 : 146;
        const headX = isUp ? 178 : 66;
        const headY = isUp ? 72 : 144;
        const elbowX = isUp ? 202 : 95;
        const elbowY = isUp ? 98 : 126;

        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            <defs>
              <pattern id="grid-situp" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-situp)" rx="8" />
            {/* Mat */}
            <rect x="34" y="156" width="292" height="7" rx="3.5" fill="#CBD5E1" />

            {/* Torso + Bent Legs (Knee 90 deg) */}
            <polyline
              points={`${shoulderX},${shoulderY} 148,152 216,104 268,153`}
              fill="none"
              stroke={strokePerson}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Arm to temple (or pulling neck if mistake) */}
            <polyline
              points={
                showMistakeOverlay
                  ? `${shoulderX},${shoulderY} ${elbowX - 10},${elbowY + 12} ${headX - 4},${headY + 12}`
                  : `${shoulderX},${shoulderY} ${elbowX},${elbowY} ${headX + 4},${headY + 4}`
              }
              fill="none"
              stroke={strokePerson}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Head */}
            <circle cx={headX} cy={headY} r="12" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />

            {/* Knee 90 deg angle arc */}
            <path d="M 204 113 A 16 16 0 0 1 228 114" fill="none" stroke="#059669" strokeWidth="2.2" />
            <rect x="198" y="75" width="44" height="18" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
            <text x="220" y="87" textAnchor="middle" fontSize="10" fontWeight="700" fill="#065F46" className="font-mono-tabular">
              Lutut 90°
            </text>

            {/* Mistake vs Correct Hand Callout */}
            <rect
              x="44"
              y="42"
              width="124"
              height="19"
              rx="4"
              fill={showMistakeOverlay ? '#FEF2F2' : '#ECFDF5'}
              stroke={angleColor}
              strokeWidth="1"
            />
            <text
              x="106"
              y="55"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill={showMistakeOverlay ? '#991B1B' : '#065F46'}
            >
              {showMistakeOverlay ? 'Jangan Tarik Leher!' : 'Jari di Pelipis · Kaki Rata'}
            </text>

            {[
              [shoulderX, shoulderY],
              [148, 152],
              [216, 104],
              [268, 153],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill={jointFill} stroke="#0F172A" strokeWidth="1.5" />
            ))}
          </svg>
        );
      }

      case 'sprint50m': {
        // Phase 1: Standing start leaning forward 45 deg. Phase 2: Full sprint stride with 90 deg knee drive
        const isDrive = phase === 2;
        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            <defs>
              <pattern id="grid-sprint" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-sprint)" rx="8" />
            <line x1="24" y1="160" x2="336" y2="160" stroke="#94A3B8" strokeWidth="2" />

            {!isDrive ? (
              <g>
                {/* Start line */}
                <line x1="160" y1="152" x2="160" y2="168" stroke="#059669" strokeWidth="2.5" />
                {/* 45 deg lean reference */}
                <line x1="145" y1="112" x2="215" y2="48" stroke={angleColor} strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Back leg pushing */}
                <polyline points="92,156 122,134 145,112" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Front leg bent */}
                <polyline points="145,112 174,132 162,157" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Leaning torso */}
                <line x1="145" y1="112" x2="195" y2="66" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" />
                {/* Arms ready */}
                <polyline points="195,66 172,84 152,78" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="195,66 218,86 232,72" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="212" cy="52" r="12" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />

                <rect x="224" y="42" width="96" height="19" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="272" y="55" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  Condong 45°
                </text>
              </g>
            ) : (
              <g>
                {/* Full sprint stride */}
                <polyline points="104,146 138,128 164,104" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="164,104 206,102 204,138" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="164" y1="104" x2={showMistakeOverlay ? 162 : 186} y2="56" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" />
                {/* 90 deg arm swing */}
                <polyline points="184,60 158,76 144,58" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="184,60 208,78 224,62" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={showMistakeOverlay ? 164 : 196} cy="40" r="12" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />

                {/* 90 deg knee drive box */}
                <rect x="218" y="88" width="92" height="19" rx="4" fill={showMistakeOverlay ? '#FEF2F2' : '#ECFDF5'} stroke={angleColor} strokeWidth="1" />
                <text x="264" y="101" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={showMistakeOverlay ? '#991B1B' : '#065F46'} className="font-mono-tabular">
                  {showMistakeOverlay ? 'Badan Terlalu Tegak' : 'Angkat Lutut 90°'}
                </text>
              </g>
            )}
          </svg>
        );
      }

      case 'verticalJump': {
        // Phase 1: Countermovement squat 95 deg knee. Phase 2: Full vertical reach
        const isJump = phase === 2;
        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            <defs>
              <pattern id="grid-jump" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-jump)" rx="8" />
            <line x1="24" y1="164" x2="336" y2="164" stroke="#94A3B8" strokeWidth="2" />

            {/* Vertical measurement scale board on right */}
            <rect x="250" y="18" width="16" height="146" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
            {[30, 50, 70, 90, 110, 130].map((y) => (
              <line key={y} x1="250" y1={y} x2="260" y2={y} stroke="#475569" strokeWidth="1.2" />
            ))}

            {!isJump ? (
              <g>
                {/* Squat 95 deg */}
                <polyline points="154,160 182,130 148,104 176,64" fill="none" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="176,64 142,88 122,96" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="184" cy="48" r="11" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />
                <rect x="52" y="114" width="84" height="19" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="94" y="127" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  Lutut 95°
                </text>
              </g>
            ) : (
              <g>
                {/* Airborne vertical reach */}
                <line x1="176" y1="142" x2="176" y2="96" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" />
                <line x1="176" y1="96" x2="176" y2="54" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" />
                {/* Reaching arm touching board */}
                <polyline points="176,56 212,34 248,28" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="176" cy="38" r="11" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />
                {/* Delta jump height bracket */}
                <line x1="274" y1="28" x2="274" y2="96" stroke="#059669" strokeWidth="2" />
                <rect x="280" y="52" width="66" height="20" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="313" y="65" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  Selisih (cm)
                </text>
              </g>
            )}
          </svg>
        );
      }

      case 'plank': {
        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            <defs>
              <pattern id="grid-plank" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-plank)" rx="8" />
            <line x1="24" y1="158" x2="336" y2="158" stroke="#94A3B8" strokeWidth="2" />

            {/* Alignment 180 deg line */}
            <line x1="74" y1="152" x2="255" y2="106" stroke={angleColor} strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Body */}
            <polyline
              points={`74,154 168,${showMistakeOverlay ? 138 : 128} 252,106`}
              fill="none"
              stroke={strokePerson}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Forearm 90 deg support */}
            <polyline
              points="252,106 252,153 284,153"
              fill="none"
              stroke={strokePerson}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="274" cy="96" r="11" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />

            {/* 90 deg elbow indicator */}
            <rect x="258" y="124" width="64" height="18" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
            <text x="290" y="136" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
              Siku 90°
            </text>

            {/* 180 deg spine indicator */}
            <rect x="114" y="82" width="108" height="18" rx="4" fill={showMistakeOverlay ? '#FEF2F2' : '#ECFDF5'} stroke={angleColor} strokeWidth="1" />
            <text x="168" y="94" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={showMistakeOverlay ? '#991B1B' : '#065F46'} className="font-mono-tabular">
              {showMistakeOverlay ? 'Pinggul Melorot!' : 'Garis Lurus 180°'}
            </text>
          </svg>
        );
      }

      case 'cooper12Min':
      case 'shuttleRun':
      default: {
        const isShuttle = movementKey === 'shuttleRun';
        return (
          <svg viewBox="0 0 360 190" className="w-full h-44 select-none">
            <defs>
              <pattern id="grid-run" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="360" height="190" fill="url(#grid-run)" rx="8" />
            <line x1="24" y1="160" x2="336" y2="160" stroke="#94A3B8" strokeWidth="2" />

            {isShuttle ? (
              <g>
                {/* Cones at 0m and 10m */}
                <polygon points="62,160 72,136 82,160" fill="#059669" />
                <polygon points="282,160 292,136 302,160" fill="#059669" />
                {/* Low center of gravity turn */}
                <polyline points="148,156 172,132 194,114 222,136 244,156" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="194" y1="114" x2="212" y2="74" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" />
                <polyline points="212,74 238,104 268,142" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="222" cy="60" r="11" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />
                <rect x="118" y="44" width="128" height="19" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="182" y="57" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  Lutut 95° · Titik Berat Rendah
                </text>
              </g>
            ) : (
              <g>
                {/* Rhythmic endurance running posture (85 deg slight lean, 90 deg relaxed elbows) */}
                <line x1="172" y1="108" x2="184" y2="48" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 4" />
                <polyline points="132,152 156,128 172,108" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="172,108 198,124 190,156" fill="none" stroke={strokePerson} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="172" y1="108" x2="182" y2="60" stroke={strokePerson} strokeWidth="6" strokeLinecap="round" />
                <polyline points="182,64 162,84 180,92" fill="none" stroke={strokePerson} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="188" cy="44" r="11" fill="#FFFFFF" stroke={strokePerson} strokeWidth="4.5" />
                <rect x="206" y="42" width="124" height="19" rx="4" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                <text x="268" y="55" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#065F46" className="font-mono-tabular">
                  Postur 85° · Siku Rileks 90°
                </text>
                <rect x="40" y="76" width="108" height="19" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <text x="94" y="89" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#334155" className="font-mono-tabular">
                  Napas 2:2 Ritmis
                </text>
              </g>
            )}
          </svg>
        );
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-emerald-700">{guide.tkjiCode}</p>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">{guide.title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPhase(phase === 1 ? 2 : 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{phase === 1 ? 'Lihat Fase Puncak' : 'Lihat Fase Awal'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMistakeOverlay(!showMistakeOverlay)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showMistakeOverlay
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showMistakeOverlay ? 'Mode Postur Benar' : 'Cek Kesalahan'}</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Biomechanical Posture Canvas */}
      <div className="mb-3">
        {renderBiomechanicalSvg()}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
            <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {phase === 1 ? guide.phase1Label : guide.phase2Label}
          </span>
          <span className="font-mono-tabular text-emerald-700 font-semibold">
            {guide.primaryAngleLabel}
          </span>
        </div>
      </div>

      {/* Key Angle & Mistake Highlights */}
      <div className="grid grid-cols-1 gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-start gap-2 text-xs text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Acuan Postur: </span>
            <span>
              {guide.primaryAngleLabel} · {guide.secondaryAngleLabel}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-700">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Hindari: </span>
            <span>{guide.mistakesToAvoid[0]}</span>
          </div>
        </div>
      </div>

      {/* Target Norma SMP Putra & Putri */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900">
            Target Norma TKJI SMP (Usia 12–15 Tahun)
          </span>
          <span className="text-xs text-slate-500">Satuan: {guide.unit}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="py-1.5 pr-2 font-semibold">Predikat</th>
                {(genderFilter === 'Semua' || genderFilter === 'Putra') && (
                  <th className="py-1.5 px-2 font-semibold text-right">Putra</th>
                )}
                {(genderFilter === 'Semua' || genderFilter === 'Putri') && (
                  <th className="py-1.5 pl-2 font-semibold text-right">Putri</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-tabular">
              {(compact ? guide.normsSmp.slice(0, 3) : guide.normsSmp).map((row) => (
                <tr key={row.score} className="hover:bg-slate-50">
                  <td className="py-1.5 pr-2 font-sans font-medium text-slate-800">
                    {row.score} · {row.predicate}
                  </td>
                  {(genderFilter === 'Semua' || genderFilter === 'Putra') && (
                    <td className="py-1.5 px-2 text-right text-slate-700">{row.putra}</td>
                  )}
                  {(genderFilter === 'Semua' || genderFilter === 'Putri') && (
                    <td className="py-1.5 pl-2 text-right text-slate-700">{row.putri}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs font-bold text-slate-900 mb-2">
              Langkah Pelaksanaan Bertahap
            </h5>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
              {guide.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 mb-2">
              Poin Kritis yang Harus Dihindari
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {guide.mistakesToAvoid.map((m, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-rose-600 font-bold">×</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
