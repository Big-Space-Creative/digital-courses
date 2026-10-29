interface ProgressBarProps {
  max: number;
  current: number;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  max,
  current,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  // Cálculo da porcentagem (garantindo que não passe de 100% nem seja menor que 0)
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeCurrent = Number.isFinite(current)
    ? Math.min(Math.max(current, 0), safeMax)
    : 0;
  const percentage = safeMax ? (safeCurrent / safeMax) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-end justify-between">
          {label && (
            <span className="text-text text-sm font-medium">{label}</span>
          )}
          {showPercentage && (
            <span className="text-accent-text text-xs font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className="bg-canvas border-border h-3 w-full overflow-hidden rounded-full border"
        role="progressbar"
        aria-label={label ?? "Progresso"}
        aria-valuenow={safeCurrent}
        aria-valuemin={0}
        aria-valuemax={safeMax || 1}
      >
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-text-muted text-right text-xs">
        {safeCurrent} de {safeMax} unidades
      </p>
    </div>
  );
}
