"use client";

import { useRef, useState } from "react";

export default function CopyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      inputRef.current?.select();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="dash-access-row">
      <span className="dash-access-label">{label}</span>
      <input
        ref={inputRef}
        className={"dash-access-value" + (mono ? " mono" : "")}
        type="text"
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button type="button" className="btn-dash ghost sm" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
