import { useState } from 'react';

// ── Area Chart ────────────────────────────────────────────────────────────────
export function AreaChart({ data = [], width = 340, height = 120 }) {
  const [hov, setHov] = useState(null);
  if (!data.length) return null;

  const max  = Math.max(...data.map((d) => d.count), 1);
  const padX = 28;
  const padY = 24;
  const pts  = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (width - padX * 2),
    y: height - padY - (d.count / max) * (height - padY * 2),
    ...d,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${pts.at(-1).x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity=".4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"  />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {[0, .25, .5, .75, 1].map((f, i) => (
        <line key={i} x1={padX} y1={height - padY - f * (height - padY * 2)}
          x2={width - padX} y2={height - padY - f * (height - padY * 2)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}

      <path d={area} fill="url(#ag)" />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

      {pts.map((p) => (
        <text key={p.label} x={p.x} y={height - 6}
          textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.3)" fontFamily="Outfit,sans-serif">
          {p.label}
        </text>
      ))}

      {pts.map((p, i) => (
        <g key={i} onMouseEnter={() => setHov(p)} onMouseLeave={() => setHov(null)}>
          <circle cx={p.x} cy={p.y} r="10" fill="transparent" style={{ cursor: 'crosshair' }} />
          <circle cx={p.x} cy={p.y} r={hov === p ? 5 : 3.5}
            fill={hov === p ? '#a5b4fc' : '#6366f1'}
            stroke={hov === p ? 'rgba(165,180,252,.4)' : 'transparent'}
            strokeWidth="6"
            style={{ transition: 'r .15s, fill .15s' }}
          />
          {hov === p && (
            <g>
              <rect x={p.x - 22} y={p.y - 30} width="44" height="18" rx="4"
                fill="rgba(8,12,30,.95)" stroke="rgba(99,102,241,.5)" strokeWidth="1" />
              <text x={p.x} y={p.y - 17} textAnchor="middle" fontSize="10"
                fill="#e0e7ff" fontWeight="700" fontFamily="Outfit,sans-serif">{p.count}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
const SLICES = [
  { key: 'critical', label: 'Critical', color: '#ef4444' },
  { key: 'high',     label: 'High',     color: '#f97316' },
  { key: 'medium',   label: 'Medium',   color: '#3b82f6' },
  { key: 'low',      label: 'Low',      color: '#64748b' },
];

export function DonutChart({ data = {}, size = 160 }) {
  const [hov, setHov] = useState(null);
  const vals  = SLICES.map((s) => data[s.key] || 0);
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.38, inn = size * 0.24;

  let angle = -Math.PI / 2;
  const slices = vals.map((v, i) => {
    const sweep = (v / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    return { path: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)} Z`, ...SLICES[i], value: v };
  });

  return (
    <div className="flex items-center gap-5 justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hov !== null && hov !== i ? 0.3 : 1}
            style={{ cursor: 'pointer', transition: 'opacity .2s' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
        ))}
        <circle cx={cx} cy={cy} r={inn} fill="#0a0f1e" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="17" fontWeight="800"
          fill={hov !== null ? slices[hov].color : '#e0e7ff'} fontFamily="Outfit,sans-serif">
          {hov !== null ? slices[hov].value : total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,.35)" fontFamily="Outfit,sans-serif">
          {hov !== null ? slices[hov].label.toUpperCase() : 'TOTAL'}
        </text>
      </svg>

      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs cursor-default transition-opacity"
            style={{ opacity: hov !== null && hov !== i ? 0.35 : 1 }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
            <span className="text-slate-400 flex-1">{s.label}</span>
            <span className="font-mono font-semibold text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
