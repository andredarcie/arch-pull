import { forwardRef } from "react";
import { buttonClass } from "../lib/buttonClass";
import type { ButtonClassProps } from "../lib/buttonClass";

export interface ButtonProps
  extends ButtonClassProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidth, className, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    />
  )
);

Button.displayName = "Button";
