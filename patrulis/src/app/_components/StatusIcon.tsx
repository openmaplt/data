import { CheckCircle2 } from 'lucide-react';

interface StatusIconProps {
  type: 'req' | 'did' | 'uzs';
  value: number | null;
}

const renderIconWithTooltip = (icon: React.ReactNode, title: string) => (
  <div className="relative group flex justify-center cursor-help">
    {icon}
    <div className="absolute bottom-full mb-2 hidden group-hover:block z-[60]">
      <div className="bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
        {title}
      </div>
      <div className="w-2 h-2 bg-slate-800 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
    </div>
  </div>
);

export default function StatusIcon({ type, value }: StatusIconProps) {
  if (!value) {
    return <span className="text-slate-300">-</span>;
  }

  const iconColor = 'text-emerald-500';
  const iconProps = `w-5 h-5 ${iconColor} transition-transform group-hover:scale-110`;

  if (type === 'uzs') {
    return renderIconWithTooltip(
      <CheckCircle2 className={iconProps} />,
      value === 2 ? 'taip(A)' : 'taip',
    );
  }

  if (type === 'did') {
    return renderIconWithTooltip(
      <CheckCircle2 className={iconProps} />,
      'taip',
    );
  }

  if (type === 'req') {
    return renderIconWithTooltip(
      <CheckCircle2 className={iconProps} />,
      'taip',
    );
  }

  return <span className="text-slate-300">-</span>;
}
