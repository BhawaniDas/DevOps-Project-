// Reusable skeleton components for loading states
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function KpiSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-1/2 rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 120 }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className={`w-full rounded-xl`} style={{ height }} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 rounded" style={{ width: `${60 + i * 10}px` }} />
        </td>
      ))}
    </tr>
  );
}
