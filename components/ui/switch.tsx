'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-slate-300 shadow-xs transition-all duration-200 outline-none data-[state=checked]:bg-sky-600 data-[state=unchecked]:bg-slate-300 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'pointer-events-none block size-5 rounded-full bg-white ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
