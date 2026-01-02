import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'left' | 'right'
}

export function Popover({ children, trigger, open, onOpenChange, align = 'left' }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const handleOpen = React.useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }, [isOpen, onOpenChange])

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={handleOpen}>{trigger}</div>
      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

export function PopoverContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

