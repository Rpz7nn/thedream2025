import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-[#36393f] bg-[#23272a] px-4 py-3 text-base text-white placeholder:text-[#b9bbbe] focus:border-[#5865f2] focus:bg-[#23273a] focus:ring-2 focus:ring-[#5865f2]/40 focus:outline-none transition-all file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm sm:h-10 sm:px-3 sm:py-2",
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
