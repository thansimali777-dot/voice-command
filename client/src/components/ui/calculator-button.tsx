import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CalculatorButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'clear' | 'equals';
  className?: string;
  span?: number;
  'data-testid'?: string;
}

const variants = {
  default: 'bg-white hover:bg-slate-50 text-slate-900',
  operator: 'bg-blue-500 text-white hover:bg-blue-600',
  clear: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
  equals: 'bg-emerald-500 text-white hover:bg-emerald-600'
};

export function CalculatorButton({ 
  children, 
  onClick, 
  variant = 'default', 
  className, 
  span = 1,
  'data-testid': testId
}: CalculatorButtonProps) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={cn(
        'calculator-btn haptic-feedback',
        variants[variant],
        span === 2 && 'col-span-2',
        className
      )}
    >
      {children}
    </button>
  );
}
