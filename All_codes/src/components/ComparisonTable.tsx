'use client';

import { RebookingOption } from '@/types';
import { Check, Star, Leaf } from 'lucide-react';

interface ComparisonTableProps {
  options: RebookingOption[];
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
}

export function ComparisonTable({
  options,
  selectedOptionId,
  onSelectOption,
}: ComparisonTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 text-xs font-manrope">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 font-manrope font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
            <th className="p-3">Select</th>
            <th className="p-3">Flight & Carrier</th>
            <th className="p-3">Arrival (PST)</th>
            <th className="p-3">Fare Delta</th>
            <th className="p-3">CO₂ Impact</th>
            <th className="p-3">Comfort</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 dark:divide-white/10">
          {options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;

            return (
              <tr
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-medium'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <td className="p-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-neutral-400 dark:border-neutral-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2]" />}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-black dark:text-white">{opt.flightNo}</div>
                  <div className="text-[10px] text-neutral-500">{opt.carrier}</div>
                </td>
                <td className="p-3">{opt.arrival}</td>
                <td className="p-3">
                  {opt.price === 0 ? (
                    <span className="font-semibold text-black dark:text-white">Included (Free)</span>
                  ) : (
                    `+$${opt.price}`
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-neutral-500" />
                    <span>{opt.carbonKg} kg</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="w-3 h-3 stroke-[1.5]" />
                    <span>{opt.comfortScore}/10</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
