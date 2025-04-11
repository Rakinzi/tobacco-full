import * as React from "react"
import { cn } from "../../utils/cn"

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-20 w-full rounded-lg border border-green-500/20 bg-zinc-950/60 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-green-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }