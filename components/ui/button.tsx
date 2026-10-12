import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {

    // Added cursor-pointer and h-12 to ensure same height as input
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer h-[48px] px-4 rounded-[var(--radius)]"

    let variantStyles = ""
    if (variant === "primary") variantStyles = "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
    if (variant === "secondary") variantStyles = "bg-gray-100 hover:bg-gray-200 text-gray-900"
    if (variant === "outline") variantStyles = "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900"

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
