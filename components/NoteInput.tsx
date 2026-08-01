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
      placeholder="Note..."
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
      style={{
        position: "absolute",
        bottom: 8,
        left: 8,
        right: 8,
        zIndex: 2,
        padding: "4px 8px",
        fontSize: 12,
        border: "1px solid rgba(255,255,255,0.5)",
        borderRadius: 4,
        background: "rgba(255,255,255,0.9)",
        color: "#333",
        cursor: disabled ? "default" : "text",
        opacity: disabled ? 0.55 : 1,
        ...position,
      }}
    />
  );
}
