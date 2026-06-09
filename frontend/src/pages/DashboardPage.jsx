import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks';
import taskService from '../services/taskService';
import { STATUS_CFG, PRIORITY_CFG } from '../utils/constants';
import KpiCard from '../components/ui/KpiCard';
import { KpiSkeleton, TaskCardSkeleton, ChartSkeleton } from '../components/ui/Skeletons';
import { AreaChart, DonutChart } from '../components/charts/Charts';
import TaskCard from '../components/task/TaskCard';
import TaskModal from '../components/task/TaskModal';
import Topbar from '../components/layout/Topbar';
import ToastStack from '../components/ui/Toast';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { toasts, toast } = useToast();

  const [tasks,      setTasks]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [tasksLoad,  setTasksLoad]  = useState(true);
  const [statsLoad,  setStatsLoad]  = useState(true);
  const [apiStatus,  setApiStatus]  = useState('checking');
  const [modal,      setModal]      = useState({ open: false, task: null });
  const [filter,     setFilter]     = useState({ status: '', priority: '', search: '' });
  const [seeding,    setSeeding]    = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoad(true);
      setStats(await taskService.getStats());
      setApiStatus('connected');
    } catch { setApiStatus('error'); }
    finally { setStatsLoad(false); }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setTasksLoad(true);
      const params = {};
      if (filter.status)   params.status   = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.search)   params.search   = filter.search;
      params.limit = 100;
      const data = await taskService.getAll(params);
      setTasks(data.tasks);
    } catch (err) { toast(err.message, 'error'); }
    finally { setTasksLoad(false); }
  }, [filter, toast]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSave = async (payload) => {
    if (modal.task?._id) {
      const updated = await taskService.update(modal.task._id, payload);
      setTasks((t) => t.map((x) => x._id === updated._id ? updated : x));
      toast('Task updated ✓');
    } else {
      const created = await taskService.create(payload);
      setTasks((t) => [created, ...t]);
      toast('Task created ✓');
    }
    loadStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskService.remove(id);
    setTasks((t) => t.filter((x) => x._id !== id));
    toast('Task deleted', 'info');
    loadStats();
  };

  const handleStatusChange = async (id, status) => {
    const updated = await taskService.patch(id, { status });
    setTasks((t) => t.map((x) => x._id === id ? updated : x));
    loadStats();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await taskService.seed();
      toast('14 DevOps tasks seeded 🌱');
      loadTasks(); loadStats();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSeeding(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Dashboard"
        apiStatus={apiStatus}
        onNewTask={() => setModal({ open: true, task: null })}
        filter={filter}
        setFilter={setFilter}
      />

      <div className="flex-1 overflow-y-auto p-7 space-y-6">

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {statsLoad
            ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
            : <>
                <KpiCard label="Total Tasks"  value={stats?.total}                     icon="⊞" color="#6366f1" delay={0}   />
                <KpiCard label="In Progress"  value={stats?.byStatus?.['in-progress']} icon="◑" color="#f59e0b" delay={80}  />
                <KpiCard label="Deployed"     value={stats?.byStatus?.deployed}        icon="●" color="#10b981" delay={160} />
                <KpiCard label="Overdue"      value={stats?.overdue}                   icon="⚠" color="#ef4444" delay={240}
                  sub={stats?.overdue > 0 ? 'Slack alerts fired' : 'All on track'} />
                <KpiCard label="Completion"   value={stats?.completionRate}            icon="◎" color="#8b5cf6" delay={320} suffix="%" />
              </>
          }
        </div>

        {/* ── Analytics row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="glass rounded-2xl p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Weekly Completions</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.05] text-slate-500 font-mono">Last 7 days</span>
            </div>
            {statsLoad ? <ChartSkeleton /> : <AreaChart data={stats?.weeklyCompletions} width={320} height={120} />}
          </div>

          {/* Donut chart */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Priority Breakdown</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.05] text-slate-500 font-mono">{stats?.total || 0} tasks</span>
            </div>
            {statsLoad ? <ChartSkeleton height={130} /> : <DonutChart data={stats?.byPriority} size={145} />}
          </div>

          {/* Activity feed */}
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-bold text-white mb-4">Recent Activity</div>
            <div className="space-y-0">
              {statsLoad
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-white/[0.04]">
                      <div className="skeleton w-2 h-2 rounded-full flex-shrink-0" />
                      <div className="skeleton h-3 rounded flex-1" />
                    </div>
                  ))
                : stats?.recentActivity?.map((t) => (
                    <div key={t._id} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: STATUS_CFG[t.status]?.color, boxShadow: `0 0 5px ${STATUS_CFG[t.status]?.glow}` }} />
                      <span className="text-xs text-slate-400 flex-1 truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <select className="input w-auto text-sm py-1.5" value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <select className="input w-auto text-sm py-1.5" value={filter.priority}
            onChange={(e) => setFilter((f) => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          {isAdmin && (
            <button className="btn text-xs py-1.5 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25
              hover:bg-emerald-500/20 hover:shadow-[0_0_12px_rgba(16,185,129,.2)] transition-all"
              onClick={handleSeed} disabled={seeding}>
              {seeding ? '⟳ Seeding…' : '🌱 Seed Demo Data'}
            </button>
          )}

          {(filter.status || filter.priority || filter.search) && (
            <button className="text-xs text-slate-600 hover:text-white transition-colors"
              onClick={() => setFilter({ status: '', priority: '', search: '' })}>
              ✕ Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-slate-600 font-mono">{tasks.length} tasks</span>
        </div>

        {/* ── Task Grid ───────────────────────────────────────────────────── */}
        {tasksLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState isAdmin={isAdmin} onNew={() => setModal({ open: true, task: null })} onSeed={handleSeed} />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {tasks.map((task, i) => (
                <TaskCard key={task._id} task={task} index={i}
                  onEdit={(t) => setModal({ open: true, task: t })}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <TaskModal
        open={modal.open}
        task={modal.task}
        onClose={() => setModal({ open: false, task: null })}
        onSave={handleSave}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

function EmptyState({ isAdmin, onNew, onSeed }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      {/* Animated planet */}
      <div className="relative w-28 h-28 mb-2">
        <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-spin-slow" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-accent to-purple-600
          shadow-[0_0_40px_rgba(99,102,241,.35)] animate-pulse-slow flex items-center justify-center">
          <span className="text-3xl opacity-50">⬡</span>
        </div>
        <div className="absolute w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,.5)]"
          style={{ top: 8, left: '50%', transform: 'translateX(-50%)' }} />
      </div>
      <h3 className="text-xl font-bold text-white">No tasks yet</h3>
      <p className="text-slate-500 text-sm max-w-xs">
        {isAdmin
          ? 'Create your first task or seed demo data to populate the board.'
          : 'Create your first task to get started.'}
      </p>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={onNew}>+ Create Task</button>
        {isAdmin && (
          <button className="btn text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
            onClick={onSeed}>🌱 Seed Demo Data</button>
        )}
      </div>
    </div>
  );
}
