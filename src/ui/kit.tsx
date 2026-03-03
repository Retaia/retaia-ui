/* eslint-disable react-hooks/static-components */
import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from 'react'

type ClassValue = string | false | null | undefined

function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ')
}

type PolymorphicProps<E extends ElementType> = {
  as?: E
  className?: string
  children?: ReactNode
  ref?: Ref<unknown>
}

type WithAs<E extends ElementType> = PolymorphicProps<E> & Omit<ComponentPropsWithoutRef<E>, keyof PolymorphicProps<E>>

function asElement<E extends ElementType>(as?: E) {
  return (as ?? 'div') as ElementType
}

const buttonVariantClass = {
  primary: 'bg-brand-500 text-white border border-brand-500 hover:bg-brand-600 hover:border-brand-600',
  secondary: 'bg-gray-200 text-gray-800 border border-gray-200 hover:bg-gray-300',
  info: 'bg-blue-light-500 text-white border border-blue-light-500 hover:bg-blue-light-600',
  warning: 'bg-warning-400 text-gray-900 border border-warning-400 hover:bg-warning-500',
  danger: 'bg-error-500 text-white border border-error-500 hover:bg-error-600',
  link: 'bg-transparent border-transparent text-brand-600 hover:text-brand-700 p-0',
  'outline-info': 'bg-white text-blue-light-700 border border-blue-light-300 hover:bg-blue-light-50',
  'outline-primary': 'bg-white text-brand-600 border border-brand-500 hover:bg-brand-50',
  'outline-secondary': 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100',
  'outline-success': 'bg-white text-success-700 border border-success-300 hover:bg-success-50',
  'outline-warning': 'bg-white text-warning-700 border border-warning-300 hover:bg-warning-50',
  'outline-danger': 'bg-white text-error-700 border border-error-300 hover:bg-error-50',
} as const

type ButtonVariant = keyof typeof buttonVariantClass

type ButtonBaseProps = {
  variant?: ButtonVariant
  size?: 'sm' | 'lg'
}

type ButtonAsButtonProps = ButtonBaseProps & Omit<ComponentPropsWithoutRef<'button'>, 'as'> & { as?: 'button' }
type ButtonAsAnchorProps = ButtonBaseProps & Omit<ComponentPropsWithoutRef<'a'>, 'as'> & { as: 'a' }
type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps

export function Button({ className, variant = 'primary', size, ...props }: ButtonProps) {
  const isAnchor = props.as === 'a'
  const commonClassName = cn(
    'inline-flex items-center justify-center gap-1 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'lg' ? 'px-4 py-2.5 text-base' : 'px-3 py-2 text-sm',
    buttonVariantClass[variant],
    className,
  )

  if (isAnchor) {
    const anchorProps = { ...props } as ButtonAsAnchorProps
    delete (anchorProps as { as?: 'a' }).as
    return <a className={commonClassName} {...anchorProps} />
  }

  const buttonProps = { ...props } as ButtonAsButtonProps
  delete (buttonProps as { as?: 'button' }).as
  const { type = 'button', ...restButtonProps } = buttonProps
  return (
    <button
      type={type}
      className={commonClassName}
      {...restButtonProps}
    />
  )
}

export function Container<E extends ElementType = 'div'>({ as, className, ...props }: WithAs<E>) {
  const Element = asElement(as)
  return <Element className={cn('mx-auto w-full max-w-6xl px-3', className)} {...props} />
}

type GridBreakpoint = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12
type ColProps<E extends ElementType = 'div'> = WithAs<E> & {
  xs?: GridBreakpoint
  md?: GridBreakpoint
  lg?: GridBreakpoint
  xl?: GridBreakpoint
}

function colClass(prefix: '' | 'md:' | 'lg:' | 'xl:', value?: GridBreakpoint) {
  if (!value) {
    return ''
  }
  const map: Record<GridBreakpoint, string> = {
    1: 'w-1/12',
    2: 'w-2/12',
    3: 'w-3/12',
    4: 'w-4/12',
    5: 'w-5/12',
    6: 'w-6/12',
    8: 'w-8/12',
    12: 'w-full',
  }
  const base = map[value]
  if (!prefix) {
    return base
  }
  return base
    .split(' ')
    .map((token) => `${prefix}${token}`)
    .join(' ')
}

export function Col<E extends ElementType = 'div'>({ as, className, xs = 12, md, lg, xl, ...props }: ColProps<E>) {
  const Element = asElement(as)
  return (
    <Element
      className={cn('w-full', colClass('', xs), colClass('md:', md), colClass('lg:', lg), colClass('xl:', xl), className)}
      {...props}
    />
  )
}

type RowProps<E extends ElementType = 'div'> = WithAs<E>

export function Row<E extends ElementType = 'div'>({ as, className, ...props }: RowProps<E>) {
  const Element = asElement(as)
  return <Element className={cn('flex flex-wrap', className)} {...props} />
}

type CardProps<E extends ElementType = 'div'> = WithAs<E>

function CardComponent<E extends ElementType = 'div'>({ as, className, ...props }: CardProps<E>) {
  const Element = asElement(as)
  return <Element className={cn('rounded-xl border border-gray-200 bg-white shadow-theme-sm', className)} {...props} />
}

function CardBody<E extends ElementType = 'div'>({ as, className, ...props }: WithAs<E>) {
  const Element = asElement(as)
  return <Element className={cn('p-4', className)} {...props} />
}

export const Card = Object.assign(CardComponent, { Body: CardBody })

type StackProps<E extends ElementType = 'div'> = WithAs<E> & {
  direction?: 'horizontal' | 'vertical'
  gap?: number
}

function gapClass(gap?: number) {
  if (!gap) {
    return ''
  }
  if (gap === 1) {
    return 'gap-1'
  }
  if (gap === 2) {
    return 'gap-2'
  }
  if (gap === 3) {
    return 'gap-3'
  }
  if (gap === 4) {
    return 'gap-4'
  }
  return 'gap-2'
}

export function Stack<E extends ElementType = 'div'>({ as, className, direction, gap, ...props }: StackProps<E>) {
  const Element = asElement(as)
  return <Element className={cn('flex', direction === 'horizontal' ? 'flex-row' : 'flex-col', gapClass(gap), className)} {...props} />
}

type AlertProps<E extends ElementType = 'div'> = WithAs<E> & {
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'secondary'
}

export function Alert<E extends ElementType = 'div'>({ as, className, variant = 'info', ...props }: AlertProps<E>) {
  const Element = asElement(as)
  const variantClass =
    variant === 'danger'
      ? 'border-error-300 bg-error-50 text-error-800'
      : variant === 'warning'
        ? 'border-warning-300 bg-warning-50 text-warning-800'
        : variant === 'success'
          ? 'border-success-300 bg-success-50 text-success-800'
          : variant === 'secondary'
            ? 'border-gray-300 bg-gray-100 text-gray-700'
          : variant === 'info'
            ? 'border-blue-light-300 bg-blue-light-50 text-blue-light-800'
          : 'border-blue-light-300 bg-blue-light-50 text-blue-light-800'
  return <Element className={cn('rounded-lg border p-3 text-sm', variantClass, className)} {...props} />
}

type FormRootProps<E extends ElementType = 'form'> = WithAs<E>

function FormRoot<E extends ElementType = 'form'>({ as, className, ...props }: FormRootProps<E>) {
  const Element = asElement(as ?? 'form')
  return <Element className={className} {...props} />
}

function FormLabel<E extends ElementType = 'label'>({ as, className, ...props }: WithAs<E>) {
  const Element = asElement(as ?? 'label')
  return <Element className={cn('mb-1 inline-block text-sm font-medium text-gray-700', className)} {...props} />
}

type FormControlAsInput = Omit<ComponentPropsWithoutRef<'input'>, 'as'> & { as?: 'input' }
type FormControlAsTextarea = Omit<ComponentPropsWithoutRef<'textarea'>, 'as'> & { as: 'textarea' }
type FormControlProps = FormControlAsInput | FormControlAsTextarea

function FormControl({ className, ...props }: FormControlProps) {
  if (props.as === 'textarea') {
    const textAreaProps = { ...props } as FormControlAsTextarea
    delete (textAreaProps as { as?: 'textarea' }).as
    return (
      <textarea
        className={cn('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100', className)}
        {...textAreaProps}
      />
    )
  }
  const inputProps = { ...props } as FormControlAsInput
  delete (inputProps as { as?: 'input' }).as
  return (
    <input
      className={cn('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100', className)}
      {...inputProps}
    />
  )
}

function FormSelect({ className, ...props }: ComponentPropsWithoutRef<'select'>) {
  return (
    <select
      className={cn('w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100', className)}
      {...props}
    />
  )
}

type FormCheckProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  type?: 'checkbox' | 'radio'
  label?: ReactNode
  className?: string
}

function FormCheck({ type = 'checkbox', className, label, id, ...props }: FormCheckProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-gray-700', className)} htmlFor={id}>
      <input id={id} type={type} className="h-4 w-4 accent-[var(--color-brand-500)]" {...props} />
      <span>{label}</span>
    </label>
  )
}

export const Form = Object.assign(FormRoot, {
  Label: FormLabel,
  Control: FormControl,
  Select: FormSelect,
  Check: FormCheck,
})

type BadgeProps<E extends ElementType = 'span'> = WithAs<E> & {
  bg?: 'secondary' | 'warning' | 'danger' | 'success'
}

export function Badge<E extends ElementType = 'span'>({ as, className, bg = 'secondary', ...props }: BadgeProps<E>) {
  const Element = asElement(as ?? 'span')
  const bgClass =
    bg === 'warning'
      ? 'bg-warning-100 text-warning-800'
      : bg === 'danger'
        ? 'bg-error-100 text-error-800'
        : bg === 'success'
          ? 'bg-success-100 text-success-800'
          : 'bg-gray-200 text-gray-700'
  return <Element className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', bgClass, className)} {...props} />
}

type ListGroupProps<E extends ElementType = 'ul'> = WithAs<E> & {
  variant?: 'flush'
}

function ListGroupRoot<E extends ElementType = 'ul'>({ as, className, ...props }: ListGroupProps<E>) {
  const Element = asElement(as ?? 'ul')
  return <Element className={cn('m-0 list-none overflow-hidden rounded-xl', className)} {...props} />
}

type ListGroupItemProps<E extends ElementType = 'li'> = WithAs<E> & {
  action?: boolean
}

function ListGroupItem<E extends ElementType = 'li'>({ as, className, action, ...props }: ListGroupItemProps<E>) {
  void action
  const Element = asElement(as ?? 'li')
  return <Element className={cn('border border-gray-200 bg-white p-3 first:rounded-t-xl last:rounded-b-xl', className)} {...props} />
}

export const ListGroup = Object.assign(ListGroupRoot, { Item: ListGroupItem })

type BreadcrumbProps<E extends ElementType = 'ol'> = WithAs<E>

function BreadcrumbRoot<E extends ElementType = 'ol'>({ as, className, ...props }: BreadcrumbProps<E>) {
  const Element = asElement(as ?? 'ol')
  return <Element className={cn('flex flex-wrap items-center gap-2 p-0 text-sm', className)} {...props} />
}

type BreadcrumbItemProps<E extends ElementType = 'li'> = WithAs<E> & {
  active?: boolean
}

function BreadcrumbItem<E extends ElementType = 'li'>({ as, className, active = false, ...props }: BreadcrumbItemProps<E>) {
  const Element = asElement(as ?? 'li')
  return (
    <Element
      className={cn(
        "inline-flex items-center gap-2 text-gray-600 [&+li]:before:mr-2 [&+li]:before:text-gray-400 [&+li]:before:content-['/']",
        active ? 'font-semibold text-gray-900' : '',
        className,
      )}
      {...props}
    />
  )
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem })
