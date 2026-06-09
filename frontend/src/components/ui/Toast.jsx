import { motion, AnimatePresence } from 'framer-motion';

const ICONS = { success: '✓', error: '⚠', info: 'ℹ' };
const STYLES = {
  success: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400',
  error:   'bg-red-500/15    border-red-500/35    text-red-400',
  info:    'bg-accent/15     border-accent/35     text-accent-400',
};

export default function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{    opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold backdrop-blur-xl shadow-xl max-w-xs ${STYLES[t.type] || STYLES.info}`}
          >
            <span>{ICONS[t.type]}</span>
            <span>{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
