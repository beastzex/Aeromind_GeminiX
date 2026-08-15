'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '@/styles/animations';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Leg } from '@/types';
import { Identity } from '@/lib/tripStore';

import { scanBoardingPassApi } from '@/services/api';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (leg: Leg) => void;
  who?: Identity | null;
}

export function ScannerModal({ isOpen, onClose, onScanSuccess, who }: ScannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setErrorMsg(null);
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const data = await scanBoardingPassApi(file, who);

      if (data.success && data.leg) {
        onScanSuccess(data.leg);
        handleClose();
      } else {
        throw new Error('Failed to parse boarding pass image.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      setErrorMsg(
        message && !message.includes('parse boarding pass')
          ? message
          : 'Could not read boarding pass clearly. Using manual entry fallback.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsScanning(false);
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg p-6 rounded-card border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 stroke-[1.5]" />
              <h2 className="text-lg font-semibold tracking-tight">Multimodal Document Scanner</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-pill hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Viewfinder / Upload Area */}
          <div className="space-y-4">
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-48 rounded-card border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 cursor-pointer bg-gray-50 dark:bg-gray-900/50 transition-colors p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2 stroke-[1.5]" />
                <span className="text-sm font-semibold">Take photo or upload boarding pass</span>
                <span className="text-xs text-gray-500 mt-1">Supports PNG, JPG, PDF documents</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-56 rounded-card border border-gray-300 dark:border-gray-700 overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Boarding pass preview" className="w-full h-full object-cover" />

                {/* Animated Vision Scanning Shimmer */}
                {isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                )}

                {/* Scanner Target Brackets */}
                <div className="absolute inset-4 border-2 border-dashed border-white/80 rounded-lg pointer-events-none" />
              </div>
            )}

            {/* Error / Fallback Alert */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-card border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-pill border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleRunScan}
                disabled={isScanning || (!file && !previewUrl)}
                className="flex-1 py-2.5 rounded-pill bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini Vision Parsing…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                    <span>Process Boarding Pass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
