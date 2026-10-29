"use client";
import { EmptyState, EmptyStateProps } from "./EmptyState";
import { Button } from "./Button";
export type ErrorStateProps = Omit<EmptyStateProps, "title"> & {
  title?: string;
  onRetry?: () => void;
  loading?: boolean;
};
export function ErrorState({
  title = "Não foi possível carregar",
  onRetry,
  loading,
  action,
  ...props
}: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        {...props}
        title={title}
        action={
          action ??
          (onRetry && (
            <Button variant="secondary" loading={loading} onClick={onRetry}>
              Tentar novamente
            </Button>
          ))
        }
      />
    </div>
  );
}
