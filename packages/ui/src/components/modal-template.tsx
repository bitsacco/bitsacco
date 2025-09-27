"use client";

import * as React from "react";

export interface ModalTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface ModalTemplateContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalTemplateHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalTemplateFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalTemplateTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface ModalTemplateDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function ModalTemplate({
  open,
  onOpenChange,
  children,
}: ModalTemplateProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />

        {/* Dialog container */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export const ModalTemplateContent = React.forwardRef<
  HTMLDivElement,
  ModalTemplateContentProps
>(({ className = "", children, ...props }, ref) => {
  const classes = [
    "bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto text-gray-100 p-6 animate-in fade-in-50 zoom-in-95 duration-300",
    "focus:outline-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
});

ModalTemplateContent.displayName = "ModalTemplateContent";

export const ModalTemplateHeader = React.forwardRef<
  HTMLDivElement,
  ModalTemplateHeaderProps
>(({ className = "", children, ...props }, ref) => {
  const classes = ["flex flex-col space-y-1.5 text-left mb-6", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

ModalTemplateHeader.displayName = "ModalTemplateHeader";

export const ModalTemplateFooter = React.forwardRef<
  HTMLDivElement,
  ModalTemplateFooterProps
>(({ className = "", children, ...props }, ref) => {
  const classes = [
    "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

ModalTemplateFooter.displayName = "ModalTemplateFooter";

export const ModalTemplateTitle = React.forwardRef<
  HTMLHeadingElement,
  ModalTemplateTitleProps
>(({ className = "", children, ...props }, ref) => {
  const classes = [
    "text-xl font-bold leading-none tracking-tight text-gray-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <h2 ref={ref} className={classes} {...props}>
      {children}
    </h2>
  );
});

ModalTemplateTitle.displayName = "ModalTemplateTitle";

export const ModalTemplateDescription = React.forwardRef<
  HTMLParagraphElement,
  ModalTemplateDescriptionProps
>(({ className = "", children, ...props }, ref) => {
  const classes = ["text-sm text-gray-400", className]
    .filter(Boolean)
    .join(" ");

  return (
    <p ref={ref} className={classes} {...props}>
      {children}
    </p>
  );
});

ModalTemplateDescription.displayName = "ModalTemplateDescription";
