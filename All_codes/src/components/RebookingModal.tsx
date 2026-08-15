'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '@/styles/animations';
import { RebookingProposal } from '@/types';
import { Identity } from '@/lib/tripStore';
import { ComparisonTable } from './ComparisonTable';
import { ShieldCheck, ChevronDown, ChevronUp, Loader2, CheckCircle2, X } from 'lucide-react';

import { processRebookingApi } from '@/services/api';

interface RebookingModalProps {
  isOpen: boolean;
  proposal: RebookingProposal | null;
  onClose: () => void;
  onApproveSuccess: (chosenFlightNo: string) => void;
  who?: Identity | null;
}

export function RebookingModal({
  isOpen,
  proposal,
  onClose,
  onApproveSuccess,
  who,
}: RebookingModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    proposal?.options[0]?.id || 'opt_1_ua868'
  );
  const [isExpandingDetails, setIsExpandingDetails] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (!isOpen || !proposal) return null;

  const selectedOption =
    proposal.options.find((o) => o.id === selectedOptionId) || proposal.options[0];

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const res = await processRebookingApi('approve', proposal.id, selectedOption.id, who);
      if (res.success) {
        onApproveSuccess(selectedOption.flightNo);
        onClose();
      }
    } catch {
      // Fallback
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-xl p-6 rounded-card border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-gray-900 dark:border-gray-100 flex items-center justify-center bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark">
                <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                  Human-in-the-Loop Gate
                </span>
                <h2 className="text-lg font-semibold tracking-tight">Consolidated Rebooking Proposal</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-pill hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Proposal Summary Card */}
          <div className="p-4 rounded-card border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 mb-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg-light dark:text-fg-dark">
                Ranked AI Recommendation ({proposal.rankScore}/100 Match)
              </span>
              <span className="px-2 py-0.5 rounded-pill border border-gray-900 dark:border-gray-100 font-mono text-[10px]">
                Pending Approval
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {proposal.summary}
            </p>

            {/* Affected Nodes Badge Group */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark">
                ✈️ Flight: {selectedOption.flightNo} ({selectedOption.departure})
              </span>
              {proposal.affectedLegNames.slice(1).map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Collapsible Comparison Table */}
          <div className="mb-4">
            <button
              onClick={() => setIsExpandingDetails(!isExpandingDetails)}
              className="flex items-center justify-between w-full p-2.5 rounded-card border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mb-2"
            >
              <span>Compare All Candidate Flights ({proposal.options.length})</span>
              {isExpandingDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isExpandingDetails && (
              <ComparisonTable
                options={proposal.options}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isApproving}
              className="flex-1 py-3 rounded-pill border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Decline / Keep Current
            </button>

            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 py-3 rounded-pill bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Changes…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
                  <span>One-Tap Approve Rebooking</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
