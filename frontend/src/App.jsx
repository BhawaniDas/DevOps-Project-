import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage      from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import KanbanPage    from './pages/KanbanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage     from './pages/UsersPage';
import SettingsPage  from './pages/SettingsPage';
import Sidebar       from './components/layout/Sidebar';

const PAGES = {
  dashboard: DashboardPage,
  kanban:    KanbanPage,
  analytics: AnalyticsPage,
  users:     UsersPage,
  settings:  SettingsPage,
};

export default function App() {
  const { user, isAdmin } = useAuth();
  const [view,      setView]      = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <AuthPage />;

  // Guard: non-admin can't access users page
  const safeView = (v) => {
    if (v === 'users' && !isAdmin) return;
    setView(v);
  };

  const PageComponent = PAGES[view] || DashboardPage;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Ambient orbs — subtle depth, fixed in background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-32 -left-24 bg-accent/[0.08] blur-[110px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -right-20 bg-emerald-600/[0.06] blur-[90px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/3 bg-amber-500/[0.05] blur-[80px]" />
      </div>

      <Sidebar
        activeView={view}
        setView={safeView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <PageComponent />
      </main>
    </div>
  );
}
