import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDisruptionLevel(score: number): { label: string; riskBand: 'low' | 'moderate' | 'high' } {
  if (score < 30) {
    return { label: 'On time', riskBand: 'low' };
  } else if (score < 60) {
    return { label: 'Watching', riskBand: 'moderate' };
  } else {
    return { label: 'Elevated risk', riskBand: 'high' };
  }
}
