import { useState, useEffect, useCallback, useRef } from 'react';

// ── Toast notifications ───────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return { toasts, toast: add };
}

// ── Animated number count-up ──────────────────────────────────────────────────
export function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let frame = 0;
    const steps  = 40;
    const handle = setInterval(() => {
      frame++;
      setVal(Math.min(Math.round((target / steps) * frame), target));
      if (frame >= steps) clearInterval(handle);
    }, duration / steps);
    return () => clearInterval(handle);
  }, [target, duration]);
  return val;
}

// ── Click-outside detector ────────────────────────────────────────────────────
export function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
}

// ── Debounced value ───────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
