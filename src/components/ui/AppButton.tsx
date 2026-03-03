import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-info'
  | 'warning'
  | 'danger'
  | 'ghost-brand'

type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

function resolveVariantClass(variant: Variant): string {
  if (variant === 'primary') {
    return 'border border-brand-500 bg-brand-500 text-white hover:border-brand-600 hover:bg-brand-600'
  }
  if (variant === 'secondary') {
    return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
  }
  if (variant === 'outline-primary') {
    return 'border border-brand-500 bg-white text-brand-600 hover:bg-brand-50'
  }
  if (variant === 'outline-success') {
    return 'border border-success-300 bg-white text-success-700 hover:bg-success-50'
  }
  if (variant === 'outline-danger') {
    return 'border border-error-300 bg-white text-error-700 hover:bg-error-50'
  }
  if (variant === 'outline-info') {
    return 'border border-blue-light-300 bg-white text-blue-light-700 hover:bg-blue-light-50'
  }
  if (variant === 'warning') {
    return 'border border-warning-400 bg-warning-400 text-gray-900 hover:border-warning-500 hover:bg-warning-500'
  }
  if (variant === 'danger') {
    return 'border border-error-500 bg-error-500 text-white hover:bg-error-600'
  }
  if (variant === 'ghost-brand') {
    return 'border border-transparent bg-transparent text-brand-600 hover:text-brand-700'
  }
  return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
}

function resolveSizeClass(size: Size): string {
  if (size === 'sm') {
    return 'px-2.5 py-1.5 text-xs'
  }
  return 'px-3 py-2 text-sm'
}

export function AppButton({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        resolveSizeClass(size),
        resolveVariantClass(variant),
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

