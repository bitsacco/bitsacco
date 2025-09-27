import * as React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", children, ...props }, ref) => {
    const classes = [
      "text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <label ref={ref} className={classes} {...props}>
        {children}
      </label>
    );
  },
);

Label.displayName = "Label";
