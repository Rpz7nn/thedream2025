import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-[72px] right-4 z-[100] flex max-h-[calc(100vh-5rem)] w-full flex-col gap-3 p-0 sm:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-10 shadow-xl min-w-[320px] max-w-[420px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-toast-slide-in data-[state=closed]:animate-toast-slide-out data-[swipe=end]:animate-toast-slide-out",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toastTypeStyles = {
  success: {
    icon: <CheckCircle className="text-green-500 w-5 h-5" />,
    color: "bg-[#0f0f0f] border-[#22c55e] border-l-4 text-[#ffffff]",
  },
  error: {
    icon: <XCircle className="text-red-500 w-5 h-5" />,
    color: "bg-[#0f0f0f] border-[#ef4444] border-l-4 text-[#ffffff]",
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-500 w-5 h-5" />,
    color: "bg-[#0f0f0f] border-[#eab308] border-l-4 text-[#ffffff]",
  },
  info: {
    icon: <Info className="text-blue-500 w-5 h-5" />,
    color: "bg-[#0f0f0f] border-[#3b82f6] border-l-4 text-[#ffffff]",
  },
  default: {
    icon: <Info className="text-[#999999] w-5 h-5" />,
    color: "bg-[#0f0f0f] border-[#1a1a1a] border-l-4 text-[#ffffff]",
  },
};

export type ToastType = "success" | "error" | "warning" | "info" | "default";

interface CustomToastProps extends Omit<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>, "type">, VariantProps<typeof toastVariants> {
  type?: ToastType;
  icon?: React.ReactNode;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  CustomToastProps
>(({ className, variant, type = "default", icon, children, ...props }, ref) => {
  const style = toastTypeStyles[type] || toastTypeStyles.default;
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        toastVariants({ variant }),
        style.color,
        "flex items-center gap-3",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 ease-out">{icon || style.icon}</div>
      <div className="flex-1 min-w-0 transition-opacity duration-300 ease-out">{children}</div>
      <ToastClose className="absolute right-2 top-2 rounded-md p-1.5 text-[#999999] hover:text-[#ffffff] hover:bg-[#1a1a1a] transition-all duration-200 ease-out">
        <X className="w-4 h-4" />
      </ToastClose>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-2 text-foreground bg-transparent opacity-100 transition-all duration-150 hover:bg-zinc-800/80 focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-5 w-5" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-[#ffffff]", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-[#999999] mt-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = CustomToastProps

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
