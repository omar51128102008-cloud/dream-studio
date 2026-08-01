"use client";

import { useState } from "react";

export default function NoteInput({
  value,
  onSave,
  position,
}: {
  value: string;
  onSave: (note: string) => void;
  position?: React.CSSProperties;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <input
      type="text"
      value={draft}
      placeholder="Note..."
      onChange={(e) => {
        e.stopPropagation();
        setDraft(e.target.value);
      }}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
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
        ...position,
      }}
    />
  );
}
