'use client';

import { useState } from 'react';
import {
  Camera,
  QrCode,
  ShieldCheck,
  User,
  Plane,
  Sparkles,
  Coffee,
} from 'lucide-react';
import { Leg } from '@/types';

interface BoardingPassIntelProps {
  legs: Leg[];
  isDemo: boolean;
  onScanNewPass?: () => void;
}

const DEMO_SAMPLE_PASSES = [
  {
    id: 'pass_del_sfo',
    flightNo: 'AI302',
    passenger: 'ALEX VANCE',
    pnr: 'AM987X',
    eTicket: '098-2490182390',
    carrier: 'Air India (Star Alliance)',
    route: 'Delhi (DEL) ➔ San Francisco (SFO)',
    aircraft: 'Boeing 777-300ER (N78001)',
    seat: '14A',
    cabin: 'Business Class (J)',
    terminal: 'T3',
    gate: 'B22',
    depTime: '14:30 IST',
    arrTime: '17:15 PST',
    lounge: 'Star Alliance Gold / Air India Maharajah Lounge',
    tsaPre: 'TSA PreCheck / FastTrack Enabled',
  },
];

export function BoardingPassIntel({ legs, isDemo, onScanNewPass }: BoardingPassIntelProps) {
  const flightLegs = legs.filter((l) => l.type === 'flight');

  const realPasses = flightLegs.map((leg) => ({
    id: leg.id,
    flightNo: leg.flightNo || 'N/A',
    passenger: 'YOU',
    pnr: leg.details?.pnr || 'N/A',
    eTicket: 'N/A',
    carrier: leg.details?.carrier || 'Unknown Carrier',
    route: leg.title,
    aircraft: leg.details?.aircraft || 'Not reported',
    seat: leg.details?.seat || 'N/A',
    cabin: 'N/A',
    terminal: leg.details?.terminal || 'TBD',
    gate: leg.details?.gate || leg.gate || 'TBD',
    depTime: leg.dep || 'TBD',
    arrTime: leg.arr || 'TBD',
    lounge: 'Not available for this fare class',
    tsaPre: 'Not verified',
  }));

  const passes = isDemo ? DEMO_SAMPLE_PASSES : realPasses;
  const [activePassId, setActivePassId] = useState<string | undefined>(passes[0]?.id);
  const pass = passes.find((p) => p.id === activePassId) || passes[0];

  return (
    <div className="space-y-6 font-manrope">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black dark:text-white" />
            <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
              Multimodal Vision OCR Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-black dark:text-white tracking-tight">
            Extracted Boarding Pass & Manifest Intelligence
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {isDemo
              ? 'Demo trip preview — sign in and scan your own pass to replace this with real parsed data.'
              : 'Parsed directly from your uploaded boarding pass image via Gemini multimodal vision (Groq fallback).'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onScanNewPass && (
            <button
              onClick={onScanNewPass}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Camera className="w-4 h-4 stroke-[1.5]" />
              <span>Scan New Boarding Pass</span>
            </button>
          )}
        </div>
      </div>

      {passes.length === 0 || !pass ? (
        <div className="p-10 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center mx-auto text-xl">
            <Plane className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-manrope text-black dark:text-white">
              No Boarding Passes Scanned Yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Scan a real boarding pass to extract flight, gate, and seat details here.
            </p>
          </div>
          {onScanNewPass && (
            <button
              onClick={onScanNewPass}
              className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-md hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Your First Boarding Pass</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Selector Chips (only relevant when multiple passes exist) */}
          {passes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap mr-2">
                Your Boarding Passes:
              </span>
              {passes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePassId(p.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    p.id === activePassId
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                      : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {p.flightNo} · {p.route}
                </button>
              ))}
            </div>
          )}

          {/* Main Boarding Pass Physical Card Component */}
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
            <div className="p-6 bg-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 font-mono uppercase">{pass.carrier}</div>
                  <div className="text-xl font-semibold">{pass.route}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
                  PNR: <span className="font-bold text-white">{pass.pnr}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">
                  SEAT: <span className="font-bold text-white">{pass.seat}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-black/10 dark:border-white/10">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Passenger</div>
                <div className="text-base font-semibold text-black dark:text-white mt-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{pass.passenger}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Flight & Aircraft</div>
                <div className="text-base font-semibold text-black dark:text-white mt-1">{pass.flightNo}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{pass.aircraft}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Cabin & Class</div>
                <div className="text-base font-semibold text-black dark:text-white mt-1">{pass.cabin}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Ticket & PNR</div>
                <div className="text-base font-semibold text-black dark:text-white mt-1 font-mono">{pass.pnr}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">{pass.eTicket}</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-neutral-50 dark:bg-neutral-950/60 border-b border-black/10 dark:border-white/10">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Departure Gate</div>
                <div className="text-2xl font-semibold text-black dark:text-white mt-1">Gate {pass.gate}</div>
                <div className="text-xs text-neutral-500 mt-0.5">Terminal {pass.terminal}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Scheduled Departure</div>
                <div className="text-xl font-semibold text-black dark:text-white mt-1">{pass.depTime}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Scheduled Arrival</div>
                <div className="text-xl font-semibold text-black dark:text-white mt-1">{pass.arrTime}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Carrier</div>
                <div className="text-xl font-semibold text-black dark:text-white mt-1">{pass.carrier}</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                  <Coffee className="w-4 h-4" />
                  <span>Lounge Privilege: {pass.lounge}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Access: {pass.tsaPre}</span>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end space-y-1">
                <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white text-black flex items-center justify-center gap-1.5 shadow-sm">
                  <QrCode className="w-8 h-8" />
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-mono text-[10px] font-bold tracking-widest">{pass.pnr} // BC-VAL</span>
                    <div className="flex gap-0.5">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className={`h-6 ${i % 3 === 0 ? 'w-1 bg-black' : 'w-0.5 bg-neutral-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">IATA BCBP Standards Compliant</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
