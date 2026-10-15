import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
const variants: Record<Variant, string> = {
  primary: 'bg-gold text-on-gold hover:bg-gold-hi',
  outline: 'border border-line-strong text-fg hover:border-gold hover:text-gold',
  ghost: 'text-muted hover:text-fg',
};
const sizes: Record<Size, string> = { sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-base' };
export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra?: string) => cn(base, variants[variant], sizes[size], extra);

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ variant, size, className, type = 'button', ...p }, ref) => <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...p} />,
);
Button.displayName = 'Button';

export function ButtonLink({ variant, size, className, to, ...p }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link to={to} className={buttonClass(variant, size, className)} {...p} />;
}

export function ExternalLink({ className, children, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-1 hover:text-gold transition-colors', className)} {...p}>
      {children}
      <ArrowUpRight size={14} aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export const Tag = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center rounded-sm border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted', className)}>{children}</span>
);

export function Chip({ active, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full border px-3 text-sm transition-colors cursor-pointer',
        active ? 'border-gold bg-gold text-on-gold' : 'border-line text-muted hover:border-line-strong hover:text-fg',
        className,
      )}
      {...p}
    />
  );
}

const fieldBase =
  'w-full rounded-md border border-line-strong bg-surface px-3.5 text-fg placeholder:text-subtle transition-colors focus:border-gold focus:outline-none aria-[invalid=true]:border-danger';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...p} />
));
Input.displayName = 'Input';
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, 'min-h-32 py-3', className)} {...p} />
));
Textarea.displayName = 'Textarea';

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-subtle">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
