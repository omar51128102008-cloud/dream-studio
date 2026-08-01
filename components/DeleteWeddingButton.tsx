"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteWeddingButton({
  weddingId,
  clientNames,
}: {
  weddingId: string;
  clientNames: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredText = clientNames || "DELETE";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleDelete() {
    if (confirmText !== requiredText) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(body?.error ?? "Failed to delete wedding.");
        return;
      }

      router.push("/dashboard/weddings");
      router.refresh();
    } catch (err) {
      console.error("[wedding-delete] failed", err);
      setError("Unexpected error deleting wedding.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="btn-dash ghost sm"
        onClick={() => {
          setOpen(true);
          setConfirmText("");
          setError(null);
        }}
      >
        Delete wedding
      </button>

      {open && (
        <div className="dash-modal" onClick={() => !busy && setOpen(false)}>
          <div
            className="dash-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-wedding-title"
          >
            <h3 className="dash-modal-title" id="delete-wedding-title">
              Delete this wedding?
            </h3>
            <p className="dash-modal-text">
              This permanently removes every photo, favorite, album pick, and
              note for this client. The gallery link will stop working. This
              cannot be undone.
            </p>
            <p className="dash-modal-text">
              Type <strong>{requiredText}</strong> to confirm.
            </p>
            <input
              className="dash-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredText}
              autoFocus
              disabled={busy}
            />
            {error && <p className="dash-error">{error}</p>}
            <div className="dash-actions justify-end">
              <button
                className="btn-dash ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="btn-dash"
                onClick={handleDelete}
                disabled={busy || confirmText !== requiredText}
              >
                {busy ? "Deleting…" : "Delete wedding"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
