import { useState, useRef, useEffect } from 'react';
import { STATUS_CFG, PRIORITY_CFG } from '../../utils/constants';
import Modal from '../ui/Modal';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const EMPTY = {
  title: '', description: '', status: 'todo', priority: 'medium',
  tags: '', dueDate: '', assignee: '', sprint: '',
};

export default function TaskModal({ open, task, onClose, onSave }) {
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [mdPreview, setMdPreview] = useState(false);
  const titleRef = useRef(null);

  // Populate form when task changes
  useEffect(() => {
    if (!open) return;
    setError('');
    setMdPreview(false);
    if (task?._id) {
      setForm({
        ...task,
        tags:    task.tags?.join(', ') || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ ...EMPTY, ...(task || {}) }); // may have pre-set status
    }
    // Focus title after render
    setTimeout(() => titleRef.current?.focus(), 80);
  }, [open, task]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }

    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        tags:    form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task?._id ? 'Edit Task' : '+ New Task'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input ref={titleRef} className="input" value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?" maxLength={120} />
          </div>

          {/* Description with MD toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="label mb-0">Description</span>
              <button type="button"
                className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.07] text-slate-500 hover:text-white hover:border-accent/40 transition-all"
                onClick={() => setMdPreview((v) => !v)}>
                {mdPreview ? '✎ Edit' : '👁 Preview'}
              </button>
            </div>
            {mdPreview
              ? (
                <div className="min-h-[100px] p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                  {form.description
                    ? <MarkdownRenderer content={form.description} />
                    : <p className="text-slate-600 text-sm italic">Nothing to preview yet…</p>
                  }
                </div>
              )
              : (
                <textarea className="input font-mono text-xs resize-y" rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder={'Supports **Markdown**, `inline code`, and\n```bash\ncode blocks\n```'}
                  maxLength={5000} />
              )
            }
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input bg-gray-800 text-white" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {Object.entries(STATUS_CFG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input bg-gray-800 text-white" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Sprint */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assignee</label>
              <input className="input" value={form.assignee}
                onChange={(e) => set('assignee', e.target.value)}
                placeholder="Engineer name" />
            </div>
            <div>
              <label className="label">Sprint</label>
              <input className="input" value={form.sprint}
                onChange={(e) => set('sprint', e.target.value)}
                placeholder="Sprint 12" />
            </div>
          </div>

          {/* Tags + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tags <span className="normal-case font-normal text-slate-600">(comma-separated)</span></label>
              <input className="input" value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="devops, aws, k8s" />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </span>
            ) : (
              task?._id ? 'Update Task' : 'Create Task'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}