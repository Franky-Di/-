import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

type AlertVariant = NonNullable<AlertProps['variant']>;

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  const variants: Record<AlertVariant, string> = {
    default: 'bg-slate-50 text-slate-900 border-slate-200',
    destructive: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-lg border px-4 py-3 text-sm',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mb-1 text-sm font-semibold leading-none', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-sm text-inherit leading-relaxed', className)}
      {...props}
    />
  );
}

