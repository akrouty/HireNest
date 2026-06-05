import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-800 hover:shadow-md',
        destructive:
          'border border-red-300 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-100',
        outline:
          'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400',
        secondary:
          'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md',
        ghost:
          'hover:bg-slate-100 hover:text-slate-950',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 min-h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-xl px-6 has-[>svg]:px-4',
        icon: 'size-11 min-h-11 px-0',
        'icon-sm': 'size-9 min-h-9 px-0',
        'icon-lg': 'size-12 min-h-12 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
