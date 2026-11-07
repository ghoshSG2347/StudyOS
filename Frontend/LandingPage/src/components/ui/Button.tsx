import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  as?: 'button';
  children: ReactNode;
}

interface AnchorProps {
  variant?: Variant;
  size?: Size;
  as: 'a';
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base py-3.5',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-deep shadow-[0_1px_2px_rgba(41,48,71,0.12),0_4px_18px_-6px_rgba(98,104,201,0.45)]',
  secondary:
    'bg-transparent text-ink border border-line hover:border-ink/30 hover:bg-hover',
  ghost: 'bg-transparent text-ink hover:bg-hover',
  dark: 'bg-white text-ink-dark hover:bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.15),0_8px_24px_-8px_rgba(0,0,0,0.5)]',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 will-change-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none';

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const cls = cn(base, sizes[size], variants[variant], className);

  if (props.as === 'a') {
    if (props.href && props.href.startsWith('/')) {
      return (
        <Link to={props.href} onClick={props.onClick} title={props.title} className={cls}>
          {children}
        </Link>
      );
    }
    return (
      <a href={props.href} onClick={props.onClick} title={props.title} className={cls}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, as: _a, children: _c, ...rest } = props as ButtonProps;
  void _v;
  void _s;
  void _a;
  void _c;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-block', className)}
      data-magnetic
      style={{ ['--strength' as string]: String(strength) }}
      onMouseMove={(e) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const s = parseFloat(el.style.getPropertyValue('--strength')) || 0.25;
        el.style.transform = `translate(${x * s}px, ${y * s}px)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translate(0,0)';
      }}
      data-cursor-hover
    >
      {children}
    </span>
  );
}
