import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks';

export default function KpiCard({ label, value, icon, color, suffix = '', sub, delay = 0 }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      className="glass rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden cursor-default"
      style={{ '--kc': color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: delay / 1000, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[30px] font-black leading-none text-white tracking-tight">
          {count}{suffix}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mt-1">{label}</div>
        {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
      </div>

      {/* Glow blob */}
      <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />
    </motion.div>
  );
}
