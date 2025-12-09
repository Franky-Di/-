import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', children, ...props },
  ref,
) {
  const variants: Record<ButtonProps['variant'], string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-900',
    ghost: 'text-slate-700 hover:bg-slate-100',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

