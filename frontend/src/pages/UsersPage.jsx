import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks';
import userService from '../services/userService';
import Modal from '../components/ui/Modal';
import { TableRowSkeleton } from '../components/ui/Skeletons';
import ToastStack from '../components/ui/Toast';

const ROLE_STYLE = {
  admin:  { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', border: 'rgba(139,92,246,.35)', icon: '👑' },
  member: { color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  border: 'rgba(59,130,246,.35)',  icon: '👤' },
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const { toasts, toast } = useToast();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [busy,    setBusy]    = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll({ limit: 100, search });
      setUsers(data.users || []);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setOp = (id, v) => setBusy((b) => ({ ...b, [id]: v }));

  const doConfirm = async () => {
    if (!confirm) return;
    const { type, user } = confirm;
    setOp(user._id, true);
    setConfirm(null);
    try {
      if (type === 'role') {
        const newRole = user.role === 'admin' ? 'member' : 'admin';
        await userService.updateRole(user._id, newRole);
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: newRole } : u));
        toast(`${user.name} is now ${newRole}`, 'success');
      } else if (type === 'status') {
        const newStatus = !user.isActive;
        await userService.updateStatus(user._id, newStatus);
        setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: newStatus } : u));
        toast(`${user.name} ${newStatus ? 'activated' : 'deactivated'}`, 'info');
      } else if (type === 'delete') {
        await userService.remove(user._id);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        toast(`${user.name} deleted`, 'info');
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setOp(user._id, false); }
  };

  const stats = [
    { label: 'Total Users', value: users.length,                          color: '#6366f1', icon: '👥' },
    { label: 'Active',      value: users.filter((u) => u.isActive).length, color: '#10b981', icon: '✓'  },
    { label: 'Admins',      value: users.filter((u) => u.role === 'admin').length, color: '#8b5cf6', icon: '👑' },
    { label: 'Inactive',    value: users.filter((u) => !u.isActive).length, color: '#f59e0b', icon: '⏸' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <ToastStack toasts={toasts} />

      {/* Confirm modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === 'delete' ? '🗑 Delete User' :
          confirm?.type === 'role'   ? '🔄 Change Role' :
          `${confirm?.user?.isActive ? '🔒 Deactivate' : '🔓 Activate'} User`
        }
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-4 text-sm text-slate-300 leading-relaxed">
          {confirm?.type === 'delete'  && <>Permanently delete <strong className="text-white">{confirm.user.name}</strong>? This cannot be undone.</>}
          {confirm?.type === 'role'    && <>Change <strong className="text-white">{confirm.user.name}</strong>'s role to <strong className="text-white">{confirm.user.role === 'admin' ? 'Member' : 'Admin'}</strong>?</>}
          {confirm?.type === 'status'  && <>{confirm.user.isActive ? 'Deactivate' : 'Activate'} account for <strong className="text-white">{confirm.user.name}</strong>?</>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
          <button className="btn-ghost text-sm" onClick={() => setConfirm(null)}>Cancel</button>
          <button
            className={confirm?.type === 'delete' ? 'btn-danger text-sm' : 'btn-primary text-sm'}
            onClick={doConfirm}>
            Confirm
          </button>
        </div>
      </Modal>

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage roles, access, and accounts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">⌕</span>
          <input className="input pl-9 text-sm" placeholder="Search by name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn-ghost text-sm" onClick={load}>⟳ Refresh</button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['User', 'Email', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}

              {!loading && users.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-600 py-10 text-sm">No users found</td></tr>
              )}

              {!loading && users.map((u) => {
                const isSelf = u._id === me?._id;
                const isOp   = busy[u._id];
                const rs     = ROLE_STYLE[u.role] || ROLE_STYLE.member;
                return (
                  <motion.tr key={u._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors
                      ${!u.isActive ? 'opacity-50' : ''}`}>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}>
                          {(u.name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">
                          {u.name}
                          {isSelf && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-400 font-bold">you</span>}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                        style={{ color: rs.color, background: rs.bg, borderColor: rs.border }}>
                        {rs.icon} {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-slate-600'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {isSelf
                        ? <span className="text-slate-700 text-xs">—</span>
                        : (
                          <div className="flex items-center gap-1.5">
                            <button disabled={isOp}
                              onClick={() => setConfirm({ type: 'role', user: u })}
                              className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition-all disabled:opacity-40
                                ${u.role === 'admin'
                                  ? 'text-amber-400 border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/20'
                                  : 'text-violet-400 border-violet-500/25 bg-violet-500/8 hover:bg-violet-500/20'
                                }`}>
                              {u.role === 'admin' ? '▼ Demote' : '▲ Promote'}
                            </button>
                            <button disabled={isOp}
                              onClick={() => setConfirm({ type: 'status', user: u })}
                              className="btn-icon text-sm" title={u.isActive ? 'Deactivate' : 'Activate'}>
                              {u.isActive ? '⏸' : '▶'}
                            </button>
                            <button disabled={isOp}
                              onClick={() => setConfirm({ type: 'delete', user: u })}
                              className="btn-icon text-sm hover:!text-red-400 hover:!bg-red-500/10" title="Delete">
                              ✕
                            </button>
                          </div>
                        )
                      }
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
