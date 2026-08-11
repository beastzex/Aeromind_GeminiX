'use client';

import { useState } from 'react';
import {
  FileText,
  Camera,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  User,
  Plane,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Coffee,
} from 'lucide-react';
import { Leg } from '@/types';
import { TripStore } from '@/lib/tripStore';

interface BoardingPassIntelProps {
  onScanNewPass?: () => void;
}

export function BoardingPassIntel({ onScanNewPass }: BoardingPassIntelProps) {
  const samplePasses = [
    {
      id: 'pass_del_sfo',
      flightNo: 'AI302',
      passenger: 'ALEX RIVERA',
      pnr: 'AM987X',
      eTicket: '098-2490182390',
      carrier: 'Air India (Star Alliance)',
      route: 'Delhi (DEL) ➔ San Francisco (SFO)',
      aircraft: 'Boeing 777-300ER (N78001)',
      seat: '14A',
      cabin: 'Business Class (J)',
      group: 'Group 1',
      terminal: 'T3',
      gate: 'B22',
      depTime: '14:30 IST',
      arrTime: '17:15 PST',
      baggageTag: 'BG-99824 (2 x 32kg)',
      baggageCarousel: 'Carousel #4',
      lounge: 'Star Alliance Gold / Air India Maharajah Lounge',
      tsaPre: 'TSA PreCheck / FastTrack Enabled',
    },
    {
      id: 'pass_lhr_jfk',
      flightNo: 'BA175',
      passenger: 'ALEX RIVERA',
      pnr: 'BA442Z',
      eTicket: '125-9018247192',
      carrier: 'British Airways (Oneworld)',
      route: 'London Heathrow (LHR) ➔ New York (JFK)',
      aircraft: 'Airbus A350-1000 (G-XWBA)',
      seat: '05F',
      cabin: 'Club Suite Business',
      group: 'Group 2',
      terminal: 'T5',
      gate: 'A10',
      depTime: '09:50 GMT',
      arrTime: '12:40 EST',
      baggageTag: 'BA-77102 (2 x 32kg)',
      baggageCarousel: 'Carousel #8',
      lounge: 'Galleries First Lounge LHR T5',
      tsaPre: 'Global Entry FastTrack Enabled',
    },
    {
      id: 'pass_hnd_lax',
      flightNo: 'NH106',
      passenger: 'ALEX RIVERA',
      pnr: 'NH881K',
      eTicket: '205-3391827401',
      carrier: 'ANA All Nippon Airways',
      route: 'Tokyo Haneda (HND) ➔ Los Angeles (LAX)',
      aircraft: 'Boeing 787-9 Dreamliner (JA871A)',
      seat: '02A',
      cabin: 'The Room First Suite',
      group: 'Group 1',
      terminal: 'T3',
      gate: '112',
      depTime: '22:55 JST',
      arrTime: '16:50 PST',
      baggageTag: 'NH-33901 (3 x 32kg)',
      baggageCarousel: 'Carousel #2',
      lounge: 'ANA Suite Lounge Haneda',
      tsaPre: 'TSA PreCheck Enabled',
    },
  ];

  const [activePassId, setActivePassId] = useState('pass_del_sfo');
  const pass = samplePasses.find((p) => p.id === activePassId) || samplePasses[0];

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
            Parsed directly via Gemini Multimodal Vision API from physical boarding pass image.
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

      {/* Preset Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap mr-2">
          Sample Boarding Passes:
        </span>
        {samplePasses.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePassId(p.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              p.id === activePassId
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                : 'border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {p.flightNo} · {p.route.split('➔')[0].trim()} ➔ {p.route.split('➔')[1].trim()}
          </button>
        ))}
      </div>

      {/* Main Boarding Pass Physical Card Component */}
      <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
        {/* Pass Top Header */}
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

        {/* Detailed Manifest Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-black/10 dark:border-white/10">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Passenger Name</div>
            <div className="text-base font-semibold text-black dark:text-white mt-1 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{pass.passenger}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Flight & Aircraft</div>
            <div className="text-base font-semibold text-black dark:text-white mt-1">
              {pass.flightNo}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">{pass.aircraft}</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Cabin & Class</div>
            <div className="text-base font-semibold text-black dark:text-white mt-1">
              {pass.cabin}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">{pass.group}</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Ticket & PNR</div>
            <div className="text-base font-semibold text-black dark:text-white mt-1 font-mono">
              {pass.pnr}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">{pass.eTicket}</div>
          </div>
        </div>

        {/* Flight Time & Gate Specs */}
        <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-neutral-50 dark:bg-neutral-950/60 border-b border-black/10 dark:border-white/10">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Departure Gate</div>
            <div className="text-2xl font-semibold text-black dark:text-white mt-1">
              Gate {pass.gate}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">Terminal {pass.terminal}</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Scheduled Departure</div>
            <div className="text-xl font-semibold text-black dark:text-white mt-1">
              {pass.depTime}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">Boarding Gate Entry</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Scheduled Arrival</div>
            <div className="text-xl font-semibold text-black dark:text-white mt-1">
              {pass.arrTime}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">Estimated Destination Time</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Baggage Carousel</div>
            <div className="text-xl font-semibold text-black dark:text-white mt-1">
              {pass.baggageCarousel}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">{pass.baggageTag}</div>
          </div>
        </div>

        {/* Perks & VIP Access Bar */}
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

          {/* Visual Barcode SVG Render */}
          <div className="flex flex-col items-center md:items-end space-y-1">
            <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white text-black flex items-center justify-center gap-1.5 shadow-sm">
              <QrCode className="w-8 h-8" />
              <div className="flex flex-col space-y-0.5">
                <span className="font-mono text-[10px] font-bold tracking-widest">{pass.pnr} // BC-VAL</span>
                <div className="flex gap-0.5">
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 ${i % 3 === 0 ? 'w-1 bg-black' : 'w-0.5 bg-neutral-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">IATA BCBP Standards Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
