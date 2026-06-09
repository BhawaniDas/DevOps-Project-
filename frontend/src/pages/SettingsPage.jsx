import { useAuth }  from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      {children || <span className="text-sm font-mono text-white">{value}</span>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { dark, toggle }  = useTheme();

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <h1 className="text-lg font-bold text-white mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <Card title="👤 Profile">
          <Row label="Name"  value={user?.name}  />
          <Row label="Email" value={user?.email} />
          <Row label="Role"  value={user?.role}  />
        </Card>

        <Card title="🎨 Appearance">
          <Row label="Theme">
            <button
              onClick={toggle}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-300
                hover:text-white hover:border-accent/40 transition-all">
              {dark ? '☀ Light Mode' : '🌙 Dark Mode'}
            </button>
          </Row>
        </Card>

        <Card title="🔔 Notifications">
          <Row label="Slack Webhooks"    ><span className="text-xs font-semibold text-emerald-400">Active</span></Row>
          <Row label="Overdue Worker"    ><span className="text-xs font-semibold text-emerald-400">Running (60s)</span></Row>
          <Row label="Email Digest"      ><span className="text-xs text-slate-600">Disabled</span></Row>
          <Row label="PagerDuty"         ><span className="text-xs text-slate-600">Not configured</span></Row>
        </Card>

        <Card title="⚙ Infrastructure">
          <Row label="API Version"     value="v3.0.0"     />
          <Row label="Auth"            value="JWT (7d)"   />
          <Row label="Database"        value="MongoDB 7"  />
          <Row label="Reverse Proxy"   value="Nginx 1.27" />
          <Row label="Container"       value="Docker Alpine" />
          {!isAdmin && (
            <p className="mt-3 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2">
              ⚠ Admin access required to modify settings.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
