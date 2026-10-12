import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Determine the actual type of the input
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        {/* Render Left Icon if provided */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          type={actualType}
          // Adjust padding based on the presence of leftIcon and password toggle
          className={`w-full h-[48px] text-[16px] bg-white border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow rounded-[var(--radius)] ${leftIcon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-12' : 'pr-4'} ${className}`}
          ref={ref}
          {...props}
        />

        {/* Render Hide/Show toggle for Password inputs */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
