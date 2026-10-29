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
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-end justify-between">
          {label && (
            <span className="text-surface text-sm font-medium">{label}</span>
          )}
          {showPercentage && (
            <span className="text-accent text-xs font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Trilho — bg-surface/20 em vez de uma cor fixa: sobre o tile bg-ink
          isso sempre lê como "um tom oposto ao tile", em ambos os temas. */}
      <div className="bg-surface/20 h-4 w-full overflow-hidden rounded-full shadow-inner">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          role="progressbar"
        />
      </div>

      <p className="text-surface/50 text-right text-[10px] italic">
        {current} de {max} unidades
      </p>
    </div>
  );
}
