import * as React from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: React.ReactNode;
}

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", className = "", children, ...props }, ref) => {
    const baseClasses = "relative w-full rounded-lg border p-4";

    const variantClasses = {
      info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
      success: "border-green-500/30 bg-green-500/10 text-green-300",
      warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      error: "border-red-500/30 bg-red-500/10 text-red-300",
    };

    const classes = [baseClasses, variantClasses[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} role="alert" {...props}>
        {children}
      </div>
    );
  },
);

Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className = "", children, ...props }, ref) => {
    const classes = ["mb-1 font-medium leading-none tracking-tight", className]
      .filter(Boolean)
      .join(" ");

    return (
      <h5 ref={ref} className={classes} {...props}>
        {children}
      </h5>
    );
  },
);

AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  AlertDescriptionProps
>(({ className = "", children, ...props }, ref) => {
  const classes = ["text-sm [&_p]:leading-relaxed", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

AlertDescription.displayName = "AlertDescription";
