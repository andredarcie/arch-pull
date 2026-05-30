export type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle" | "icon";
export type ButtonSize = "lg" | "md" | "sm" | "xs";

export interface ButtonClassProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonClassProps = {}): string {
  return [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}
