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
            <span className="text-sm font-medium text-white">{label}</span>
          )}
          {showPercentage && (
            <span className="text-primary text-xs font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Container da barra (fundo) */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
        {/* Progresso preenchido (cor dinamicamente calculada) */}
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          role="progressbar"
        />
      </div>

      <p className="text-right text-[10px] text-gray-400 italic">
        {current} de {max} unidades
      </p>
    </div>
  );
}
