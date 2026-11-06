import React, { useState } from 'react';
import { BookOpen, Compass } from 'lucide-react';
import { MovementPostureDiagram } from './MovementPostureDiagram';
import { ALL_MOVEMENT_KEYS, MOVEMENT_GUIDES } from '../data/movementGuides';
import { Gender, MovementKey } from '../types/fitness';

export const MovementEncyclopediaView: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<MovementKey>('sprint50m');
  const [genderNormView, setGenderNormView] = useState<'Semua' | Gender>('Semua');

  const activeGuide = MOVEMENT_GUIDES[selectedKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Standar Depdiknas & Kemenpora RI · Jenjang SMP (Usia 12–15 Tahun)
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Kamus Contoh Gerakan & Panduan Postur TKJI
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Pelajari sudut postur tubuh yang benar, tahapan pelaksanaan, kesalahan yang harus dihindari,
            serta target capaian Putra dan Putri SMP sebelum melaksanakan tes maupun latihan mandiri.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['Semua', 'Putra', 'Putri'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderNormView(g)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                genderNormView === g
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g === 'Semua' ? 'Norma Putra & Putri' : `Norma ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Sandbox Layout: Left Movement Index + Right Interactive Posture Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="px-2 py-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Daftar Gerakan Standar ({ALL_MOVEMENT_KEYS.length})
            </span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>

          {ALL_MOVEMENT_KEYS.map((key, idx) => {
            const g = MOVEMENT_GUIDES[key];
            const isActive = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`w-full text-left px-3.5 py-3 rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-600 text-slate-900'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-emerald-700">
                  <span>0{idx + 1}. {g.pillarLabel}</span>
                  <span className="font-mono-tabular text-slate-500">{g.unit}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {g.title}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Compass className="w-4 h-4" />
              <span>{activeGuide.pillarLabel}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {activeGuide.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {activeGuide.summary}
            </p>
          </div>

          <MovementPostureDiagram
            movementKey={selectedKey}
            genderFilter={genderNormView}
          />
        </div>
      </div>
    </div>
  );
};
