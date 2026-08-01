"use client";

import { useState } from "react";

export default function NoteInput({
  value,
  onSave,
  position,
  disabled = false,
}: {
  value: string;
  onSave: (note: string) => void;
  position?: React.CSSProperties;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <input
      type="text"
      value={draft}
      placeholder="Add a note…"
      readOnly={disabled}
      onChange={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setDraft(e.target.value);
      }}
      onBlur={() => {
        if (disabled) return;
        if (draft !== value) onSave(draft);
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (disabled) return;
        e.stopPropagation();
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="note-field"
      style={{
        ...position,
        opacity: disabled ? 0.55 : undefined,
        cursor: disabled ? "default" : undefined,
      }}
    />
  );
}
