import * as React from "react"
import { cn } from "../../utils/cn"

const Input = React.forwardRef(
    ({ className, type, ...props }, ref) => {
      return (
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border border-green-500/20 bg-zinc-950/60 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-green-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-500/30 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }
  )
Input.displayName = "Input"

export { Input }