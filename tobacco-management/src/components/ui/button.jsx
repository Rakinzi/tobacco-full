import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20 disabled:pointer-events-none disabled:opacity-50",
    {
      variants: {
        variant: {
          default:
            "bg-green-600 text-white shadow-lg shadow-green-900/30 hover:bg-green-500",
          destructive:
            "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300",
          outline:
            "border border-green-500/20 bg-transparent hover:bg-green-500/10 text-green-500 hover:text-green-400",
          secondary:
            "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400",
          ghost: 
            "text-green-500 hover:bg-green-500/10 hover:text-green-400",
          link: 
            "text-green-500 underline-offset-4 hover:text-green-400 hover:underline",
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-8 rounded-md px-3 text-xs",
          lg: "h-12 rounded-md px-8 text-base",
          icon: "h-9 w-9",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }