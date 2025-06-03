"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const WideDialog = DialogPrimitive.Root;

const WideDialogTrigger = DialogPrimitive.Trigger;

const WideDialogPortal = DialogPrimitive.Portal;

const WideDialogClose = DialogPrimitive.Close;

const WideDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
WideDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const WideDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  }
>(({ className, children, size = "xl", ...props }, ref) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[95vw]"
  };

  return (
    <WideDialogPortal>
      <WideDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          sizeClasses[size],
          "max-h-[90vh]", // Limit height to 90% of viewport
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </WideDialogPortal>
  );
});
WideDialogContent.displayName = DialogPrimitive.Content.displayName;

const WideDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
WideDialogHeader.displayName = "WideDialogHeader";

const WideDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-1", // Make scrollable
      className
    )}
    {...props}
  />
);
WideDialogBody.displayName = "WideDialogBody";

const WideDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t pt-4 mt-4",
      className
    )}
    {...props}
  />
);
WideDialogFooter.displayName = "WideDialogFooter";

const WideDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
WideDialogTitle.displayName = DialogPrimitive.Title.displayName;

const WideDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
WideDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  WideDialog,
  WideDialogPortal,
  WideDialogOverlay,
  WideDialogClose,
  WideDialogTrigger,
  WideDialogContent,
  WideDialogHeader,
  WideDialogBody,
  WideDialogFooter,
  WideDialogTitle,
  WideDialogDescription,
};

// Form wrapper component for wide dialogs
export const WideDialogForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  }
>(({ className, title, description, children, footer, size = "xl", ...props }, ref) => (
  <form ref={ref} className={cn("space-y-6", className)} {...props}>
    <WideDialogHeader>
      <WideDialogTitle>{title}</WideDialogTitle>
      {description && (
        <WideDialogDescription>{description}</WideDialogDescription>
      )}
    </WideDialogHeader>
    
    <WideDialogBody>
      {children}
    </WideDialogBody>
    
    {footer && (
      <WideDialogFooter>
        {footer}
      </WideDialogFooter>
    )}
  </form>
));
