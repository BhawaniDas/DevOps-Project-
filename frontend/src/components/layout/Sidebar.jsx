import { motion } from 'framer-motion';
import { useAuth }  from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NAV_ITEMS } from '../../utils/constants';

export default function Sidebar({ activeView, setView, collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <motion.aside
      className="relative flex flex-col h-screen glass border-r border-white/[0.07] z-50 flex-shrink-0"
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07] flex-shrink-0 overflow-hidden whitespace-nowrap">
        <span className="text-accent text-2xl flex-shrink-0" style={{ textShadow: '0 0 10px rgba(99,102,241,.6)' }}>⬡</span>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-black text-white tracking-tight">
            TaskDash
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const active = activeView === item.id;
          return (
            <button key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap w-full text-left
                ${active
                  ? 'bg-accent/15 text-accent-400 border border-accent/25 shadow-[0_0_16px_rgba(99,102,241,.1)]'
                  : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                }`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
              {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.07] flex-shrink-0 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all w-full text-left whitespace-nowrap"
        >
          <span className="flex-shrink-0 w-5 text-center text-base">{dark ? '☀' : '🌙'}</span>
          {!collapsed && <span className="text-xs font-semibold">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User chip */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}>
              {(user.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
            </div>
            <button className="btn-icon text-sm flex-shrink-0" onClick={logout} title="Sign out">⏻</button>
          </div>
        )}
        {collapsed && (
          <button className="btn-icon mx-auto flex" onClick={logout} title="Sign out">⏻</button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-800 border border-white/[0.08] text-slate-500 hover:text-white hover:bg-accent hover:shadow-[0_0_10px_rgba(99,102,241,.4)] flex items-center justify-center text-xs transition-all z-60"
      >
        {collapsed ? '›' : '‹'}
      </button>
    </motion.aside>
  );
}
