import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks';
import taskService from '../services/taskService';
import { STATUS_CFG } from '../utils/constants';
import TaskCard from '../components/task/TaskCard';
import TaskModal from '../components/task/TaskModal';
import { TaskCardSkeleton } from '../components/ui/Skeletons';
import ToastStack from '../components/ui/Toast';
import Topbar from '../components/layout/Topbar';

export default function KanbanPage() {
  const { toasts, toast } = useToast();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState({ open: false, task: null });
  const [filter,  setFilter]  = useState({ status: '', priority: '', search: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (filter.search) params.search = filter.search;
      const data = await taskService.getAll(params);
      setTasks(data.tasks);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }, [filter.search, toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    if (modal.task?._id) {
      const u = await taskService.update(modal.task._id, payload);
      setTasks((t) => t.map((x) => x._id === u._id ? u : x));
      toast('Task updated ✓');
    } else {
      const c = await taskService.create(payload);
      setTasks((t) => [c, ...t]);
      toast('Task created ✓');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskService.remove(id);
    setTasks((t) => t.filter((x) => x._id !== id));
    toast('Deleted', 'info');
  };

  const handleStatusChange = async (id, status) => {
    const u = await taskService.patch(id, { status });
    setTasks((t) => t.map((x) => x._id === id ? u : x));
  };

  const grouped = Object.keys(STATUS_CFG).reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Kanban Board" apiStatus="connected"
        onNewTask={() => setModal({ open: true, task: null })}
        filter={filter} setFilter={setFilter} />

      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-4 h-full" style={{ minWidth: `${Object.keys(STATUS_CFG).length * 292}px` }}>
          {Object.entries(STATUS_CFG).map(([status, cfg]) => (
            <div key={status} className="glass rounded-2xl flex flex-col overflow-hidden flex-shrink-0 w-[280px]"
              style={{ borderTop: `2px solid ${cfg.color}` }}>
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] flex-shrink-0">
                <span style={{ color: cfg.color }} className="text-sm">{cfg.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-500">
                  {grouped[status]?.length || 0}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
                ) : (
                  <>
                    <AnimatePresence>
                      {grouped[status]?.map((task, i) => (
                        <TaskCard key={task._id} task={task} index={i}
                          onEdit={(t) => setModal({ open: true, task: t })}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                    {grouped[status]?.length === 0 && (
                      <div className="text-center text-xs text-slate-700 py-6">No tasks</div>
                    )}
                  </>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => setModal({ open: true, task: { status } })}
                className="m-3 py-2 text-xs text-slate-600 border border-dashed border-white/[0.07]
                  rounded-xl hover:border-accent/40 hover:text-accent-400 hover:bg-accent/5 transition-all">
                + Add Task
              </button>
            </div>
          ))}
        </div>
      </div>

      <TaskModal open={modal.open} task={modal.task}
        onClose={() => setModal({ open: false, task: null })}
        onSave={handleSave} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
