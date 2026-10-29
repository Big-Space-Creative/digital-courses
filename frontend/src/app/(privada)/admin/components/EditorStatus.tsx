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
    const message = "H� altera��es n�o salvas. Deseja sair e descart�-las?";
    const interceptLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.href === window.location.href ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search &&
          destination.hash)
      )
        return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    // A same-URL entry lets Back reach the guard before Next changes the route.
    const interceptAction = (event: Event) => {
      if (!window.confirm(message)) event.preventDefault();
    };
    const url = window.location.href;
    window.history.pushState(
      { ...window.history.state, adminEditorGuard: true },
      "",
      url,
    );
    let passing = false;
    const interceptBack = (event: PopStateEvent) => {
      if (passing) return;
      event.stopImmediatePropagation();
      if (window.confirm(message)) {
        passing = true;
        window.history.back();
      } else {
        window.history.pushState(
          { ...window.history.state, adminEditorGuard: true },
          "",
          url,
        );
      }
    };
    window.addEventListener("beforeunload", prevent);
    document.addEventListener("click", interceptLink, true);
    window.addEventListener("admin:leave", interceptAction);
    window.addEventListener("popstate", interceptBack, true);
    return () => {
      window.removeEventListener("beforeunload", prevent);
      document.removeEventListener("click", interceptLink, true);
      window.removeEventListener("admin:leave", interceptAction);
      window.removeEventListener("popstate", interceptBack, true);
    };
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
