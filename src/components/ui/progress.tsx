import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('h-2 w-full rounded-full bg-slate-100', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

