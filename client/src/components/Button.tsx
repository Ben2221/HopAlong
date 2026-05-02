import { motion } from "motion/react";
import { Icon } from "@iconify/react";

const Button = ({
  children,
  icon,
  onClick,
  fullWidth,
  disabled = false,
  className,
  size = 'md',
  variant = 'primary',
  type = 'button',
}: {
  children?: string;
  icon?: string;
  delay?: number;
  onClick?: (() => void) | (() => Promise<void>);
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'danger';
  type?: 'button' | 'submit' | 'reset';
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-yellow-400 text-white hover:bg-yellow-500',
    outline: 'bg-transparent border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <motion.button
      type={type}
      className={`${className ?? ""} ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon icon={icon} className="text-lg" />}
      {children}
    </motion.button>
  );
};

export default Button;
