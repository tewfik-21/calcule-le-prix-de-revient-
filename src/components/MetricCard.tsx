import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  color = 'primary',
  id
}) => {
  // Premium glowing border indicators
  const borderClasses = {
    primary: 'border-l-4 border-l-emerald-500 hover:border-emerald-500/50',
    success: 'border-l-4 border-l-emerald-400 hover:border-emerald-400/50',
    warning: 'border-l-4 border-l-amber-500 hover:border-amber-500/50',
    danger: 'border-l-4 border-l-rose-500 hover:border-rose-500/50',
    info: 'border-l-4 border-l-blue-500 hover:border-blue-500/50',
    neutral: 'border-l-4 border-l-zinc-400 hover:border-zinc-400/50'
  };

  const iconBgClasses = {
    primary: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    success: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    neutral: 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30'
  };

  const dotClasses = {
    primary: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
    success: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    warning: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
    danger: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
    info: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
    neutral: 'bg-zinc-500 shadow-[0_0_8px_#71717a]'
  };

  return (
    <div
      id={id || `metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-6 border border-zinc-800/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-black/40 group ${borderClasses[color]}`}
    >
      {/* Subtle card glow overlay on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-zinc-100/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Background glow dot */}
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 ${
        color === 'primary' || color === 'success' ? 'bg-emerald-500' : 
        color === 'warning' ? 'bg-amber-500' : 
        color === 'danger' ? 'bg-rose-500' : 
        color === 'info' ? 'bg-blue-500' : 'bg-zinc-400'
      }`} />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 relative z-10">
        <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
          {value}
        </h3>
        {subValue && (
          <p className="mt-3 text-[10px] font-medium tracking-wider flex items-center gap-2 font-mono text-zinc-400">
            <span className={`inline-block h-2 w-2 rounded-full ${dotClasses[color]}`} />
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};
