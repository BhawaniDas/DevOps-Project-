export const STATUS_CFG = {
  'todo':        { label: 'To Do',       color: '#94a3b8', glow: 'rgba(148,163,184,.25)', icon: '○', next: 'in-progress', tw: 'text-slate-400'  },
  'in-progress': { label: 'In Progress', color: '#f59e0b', glow: 'rgba(245,158,11,.25)',  icon: '◑', next: 'code-review', tw: 'text-amber-400'  },
  'code-review': { label: 'Code Review', color: '#a78bfa', glow: 'rgba(167,139,250,.25)', icon: '⧖', next: 'testing',     tw: 'text-violet-400' },
  'testing':     { label: 'Testing',     color: '#38bdf8', glow: 'rgba(56,189,248,.25)',  icon: '⚗', next: 'deployed',    tw: 'text-sky-400'    },
  'deployed':    { label: 'Deployed',    color: '#10b981', glow: 'rgba(16,185,129,.25)',  icon: '●', next: 'todo',        tw: 'text-emerald-400'},
  'failed':      { label: 'Failed',      color: '#ef4444', glow: 'rgba(239,68,68,.25)',   icon: '✕', next: 'todo',        tw: 'text-red-400'    },
};

export const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#475569', border: 'rgba(71,85,105,.4)'   },
  medium:   { label: 'Medium',   color: '#3b82f6', border: 'rgba(59,130,246,.4)'  },
  high:     { label: 'High',     color: '#f97316', border: 'rgba(249,115,22,.4)'  },
  critical: { label: 'Critical', color: '#ef4444', border: 'rgba(239,68,68,.4)'   },
};

export const PRIORITY_LEFT_BORDER = {
  low:      'border-l-slate-600',
  medium:   'border-l-blue-500',
  high:     'border-l-orange-500',
  critical: 'border-l-red-500',
};

export const NAV_ITEMS = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard'       },
  { id: 'kanban',    icon: '⊞', label: 'Kanban'          },
  { id: 'analytics', icon: '◈', label: 'Analytics'       },
  { id: 'users',     icon: '👥', label: 'Users',  adminOnly: true },
  { id: 'settings',  icon: '⚙', label: 'Settings'       },
];
