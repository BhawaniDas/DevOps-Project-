import { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import { STATUS_CFG } from '../utils/constants';
import { AreaChart, DonutChart } from '../components/charts/Charts';
import { ChartSkeleton } from '../components/ui/Skeletons';

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([taskService.getStats(), taskService.getAll({ limit: 200 })])
      .then(([s, t]) => { setStats(s); setTasks(t.tasks); })
      .finally(() => setLoading(false));
  }, []);

  const SPRINTS = ['Sprint 12', 'Sprint 13', 'Sprint 14'];

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-6">
      <h1 className="text-lg font-bold text-white">Analytics</h1>

      {/* Wide area chart */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-bold text-white">Completion Trend — Last 7 Days</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-500 font-mono">Daily</span>
        </div>
        {loading ? <ChartSkeleton height={180} /> : <AreaChart data={stats?.weeklyCompletions} width={900} height={180} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Donut */}
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-bold text-white mb-4">Priority Distribution</div>
          {loading ? <ChartSkeleton height={140} /> : <DonutChart data={stats?.byPriority} size={170} />}
        </div>

        {/* Pipeline status bars */}
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-bold text-white mb-4">Pipeline Status</div>
          <div className="space-y-3">
            {Object.entries(STATUS_CFG).map(([k, v]) => {
              const count = stats?.byStatus?.[k] || 0;
              const pct   = stats?.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs w-24 flex-shrink-0" style={{ color: v.color }}>{v.icon} {v.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: v.color, boxShadow: `0 0 6px ${v.glow}` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Completion ring */}
          <div className="flex justify-center mt-5 pt-4 border-t border-white/[0.06]">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="9" />
              <circle cx="55" cy="55" r="44" fill="none" stroke="#10b981" strokeWidth="9"
                strokeDasharray={`${2 * Math.PI * 44 * (stats?.completionRate || 0) / 100} ${2 * Math.PI * 44}`}
                strokeLinecap="round" transform="rotate(-90 55 55)"
                style={{ filter: 'drop-shadow(0 0 5px #10b981)', transition: 'stroke-dasharray 1s ease' }} />
              <text x="55" y="51" textAnchor="middle" fontSize="18" fontWeight="800" fill="#e0e7ff" fontFamily="Outfit,sans-serif">
                {stats?.completionRate || 0}%
              </text>
              <text x="55" y="66" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,.35)" fontFamily="Outfit,sans-serif">
                DEPLOYED
              </text>
            </svg>
          </div>
        </div>

        {/* Sprint velocity */}
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-bold text-white mb-4">Sprint Velocity</div>
          <div className="space-y-4">
            {SPRINTS.map((sp) => {
              const spTasks = tasks.filter((t) => t.sprint === sp);
              const done    = spTasks.filter((t) => t.status === 'deployed').length;
              const total   = spTasks.length || 1;
              const pct     = Math.round((done / total) * 100);
              return (
                <div key={sp}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-semibold">{sp}</span>
                    <span className="text-slate-500 font-mono">{done}/{spTasks.length || 0} deployed</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,.4)' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overdue stat */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Overdue tasks</span>
              <span className={`text-sm font-bold font-mono ${stats?.overdue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {stats?.overdue || 0}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">Total tasks</span>
              <span className="text-sm font-bold font-mono text-white">{stats?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
