interface ProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-[rgba(32,32,32,0.62)]">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-3 overflow-hidden rounded-full border border-[var(--border)] bg-white/60">
        <div
          className="h-full rounded-full border-r border-[rgba(255,255,255,0.75)] bg-[linear-gradient(to_right,_#9c9c9c,_#dcdcdc)] transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
