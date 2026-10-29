"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
export function editorSnapshot(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item instanceof File
      ? { name: item.name, size: item.size, lastModified: item.lastModified }
      : item,
  );
}
export function useUnsavedChanges(snapshot: string, ready: boolean) {
  const [baseline, setBaseline] = useState<string | null>(null);
  if (ready && baseline === null) setBaseline(snapshot);
  const dirty = ready && baseline !== null && baseline !== snapshot;
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  return { dirty, markSaved: () => setBaseline(snapshot) };
}
export function EditorStatus({
  dirty,
  upload,
  error,
}: {
  dirty: boolean;
  upload: string;
  error: string;
}) {
  return (
    <div className="space-y-3">
      {dirty && <Badge variant="warning">Alterações não salvas</Badge>}
      {upload && (
        <div
          role="status"
          aria-live="polite"
          className="border-border bg-panel text-text rounded-xl border p-4 text-sm"
        >
          <p className="font-medium">Envio do curso</p>
          <p className="text-text-muted mt-1 break-words">{upload}</p>
          <p className="text-text-muted mt-1 text-xs">
            Mantenha esta página aberta até a confirmação.
          </p>
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="border-danger bg-panel text-danger rounded-xl border p-4 text-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
