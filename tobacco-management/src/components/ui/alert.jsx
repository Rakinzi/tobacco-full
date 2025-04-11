import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px]",
  {
    variants: {
      variant: {
        default: "border-green-500/20 text-white",
        destructive:
          "border-red-500/50 text-red-400 dark:border-red-500/30 dark:text-red-400 bg-red-500/10",
        success:
          "border-green-500/50 text-green-400 dark:border-green-500/30 dark:text-green-400 bg-green-500/10",
        warning:
          "border-yellow-500/50 text-yellow-400 dark:border-yellow-500/30 dark:text-yellow-400 bg-yellow-500/10",
        info:
          "border-blue-500/50 text-blue-400 dark:border-blue-500/30 dark:text-blue-400 bg-blue-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }