import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  icon?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', icon, selected = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900/80 rounded-2xl p-5 text-slate-100
        transition-all duration-300 ease-out
        ${selected 
          ? 'shadow-[0_0_25px_rgba(34,211,238,0.7),0_0_60px_rgba(59,130,246,0.6)] scale-[1.02] ring-2 ring-cyan-400/70 border border-cyan-400/40' 
          : 'shadow-[0_0_20px_rgba(56,189,248,0.25),0_0_40px_rgba(129,140,248,0.25),0_12px_30px_rgba(15,23,42,0.9)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6),0_0_70px_rgba(129,140,248,0.5),0_18px_40px_rgba(15,23,42,1)] hover:-translate-y-1 hover:border-cyan-400/40 border border-slate-800'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {icon && (
        <div className="mb-3 text-2xl text-cyan-400">
          <i className={icon}></i>
        </div>
      )}
      {children}
    </div>
  );
}

