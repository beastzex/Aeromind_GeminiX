import type { NavigateFunction } from 'react-router-dom';

// react-router's useNavigate() only works inside components. The voice nav
// controller below is a module-level singleton (deliberately outside React,
// so it survives page navigation) and needs to call navigate() from there —
// this bridge is set once by a permanent component mounted alongside <Routes>.
let globalNavigate: NavigateFunction | null = null;

export function setGlobalNavigate(fn: NavigateFunction | null): void {
  globalNavigate = fn;
}

export function getGlobalNavigate(): NavigateFunction | null {
  return globalNavigate;
}
