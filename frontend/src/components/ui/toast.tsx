import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

type ToastOptions = {
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastItem = ToastOptions & {
  id: string
  variant: ToastVariant
}

let toastItems: ToastItem[] = []
const listeners = new Set<(items: ToastItem[]) => void>()

function emit() {
  listeners.forEach((listener) => listener(toastItems))
}

function dismissToast(id: string) {
  toastItems = toastItems.filter((item) => item.id !== id)
  emit()
}

function toast({ variant = 'default', ...options }: ToastOptions) {
  const id = crypto.randomUUID()
  toastItems = [...toastItems, { id, variant, ...options }]
  emit()

  return {
    id,
    dismiss: () => dismissToast(id),
  }
}

const toastStyles: Record<ToastVariant, string> = {
  default: 'bg-card text-card-foreground',
  success: 'bg-positive text-positive-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
}

function Toaster() {
  const [items, setItems] = useState(toastItems)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return (
    <ToastPrimitive.Provider duration={5000} swipeDirection="right">
      {items.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          open
          onOpenChange={(open) => {
            if (!open) dismissToast(item.id)
          }}
          className={cn(
            'group pointer-events-auto relative grid w-full grid-cols-[1fr_auto] gap-x-6 overflow-hidden border-2 border-border p-4 shadow-[4px_4px_0_var(--shadow-color)] transition-all',
            toastStyles[item.variant],
          )}
        >
          <div className="grid gap-1">
            <ToastPrimitive.Title className="text-sm font-black">
              {item.title}
            </ToastPrimitive.Title>
            {item.description ? (
              <ToastPrimitive.Description className="text-sm font-medium opacity-85">
                {item.description}
              </ToastPrimitive.Description>
            ) : null}
          </div>
          <ToastPrimitive.Close
            className="size-6 opacity-80 outline-none transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Fechar notificação"
          >
            <X className="size-4" aria-hidden="true" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 outline-none" />
    </ToastPrimitive.Provider>
  )
}

export { Toaster, toast, type ToastOptions, type ToastVariant }
