import { useState } from 'react';
import { motion } from 'framer-motion';
import { STATUS_CFG, PRIORITY_CFG, PRIORITY_LEFT_BORDER } from '../../utils/constants';
import MarkdownRenderer from '../ui/MarkdownRenderer';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const s = STATUS_CFG[task.status]    || STATUS_CFG.todo;
  const p = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
  const borderClass = PRIORITY_LEFT_BORDER[task.priority] || 'border-l-slate-600';
  const overdue = task.isOverdue;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -8  }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`glass rounded-2xl p-4 border-l-2 ${borderClass} relative overflow-hidden
        ${overdue ? 'shadow-[0_0_0_1px_rgba(239,68,68,.3),0_0_20px_rgba(239,68,68,.06)]' : ''}
        hover:border-white/[0.13] hover:shadow-xl transition-shadow`}
    >
      {/* Top glint line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg,transparent,${p.color},transparent)`, opacity: 0.5 }} />

      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] animate-pulse" />
          Overdue — Slack alert triggered
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <button
          className="status-chip text-[11px]"
          style={{
            color:      s.color,
            background: `${s.color}15`,
            border:     `1px solid ${s.color}40`,
            boxShadow:  `0 0 10px ${s.glow}`,
          }}
          onClick={() => onStatusChange(task._id, s.next)}
          title="Click to advance status"
        >
          {s.icon} {s.label}
        </button>

        <div className="flex items-center gap-1">
          <button className="btn-icon text-sm" onClick={() => onEdit(task)} title="Edit task">✎</button>
          <button className="btn-icon text-sm hover:!text-red-400 hover:!bg-red-500/10"
            onClick={() => onDelete(task._id)} title="Delete task">✕</button>
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-bold leading-snug mb-1.5
        ${task.status === 'deployed' ? 'line-through text-slate-600' : 'text-white'}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <div className="mb-3">
          {expanded
            ? <MarkdownRenderer content={task.description} />
            : (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {task.description.replace(/[#*`>_\[\]]/g, '').slice(0, 110)}
                {task.description.length > 110 ? '…' : ''}
              </p>
            )
          }
          {task.description.length > 80 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10px] text-slate-600 hover:text-accent-400 transition-colors mt-1"
            >
              {expanded ? '▲ collapse' : '▼ expand'}
            </button>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {/* Priority */}
        <span className="priority-pill text-[10px]"
          style={{ color: p.color, borderColor: p.border, background: `${p.color}10` }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
          {p.label}
        </span>

        {/* Assignee */}
        {task.assignee && task.assignee !== 'Unassigned' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.07] text-slate-400">
            {task.assignee}
          </span>
        )}

        {/* Sprint */}
        {task.sprint && task.sprint !== 'Backlog' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-400">
            {task.sprint}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={`text-[10px] font-mono ${overdue ? 'text-red-400' : 'text-slate-600'}`}>
            {overdue ? '⚠ ' : '📅 '}
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent-400 font-mono">
              #{t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
