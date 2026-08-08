"use client";

import type { DeliveryType } from "@/types/media";

export default function DeliveryChoice({
  value,
  onChange,
  disabled = false,
}: {
  value: DeliveryType | null;
  onChange: (type: DeliveryType) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={"delivery-choice" + (disabled ? " is-disabled" : "")}
      role="radiogroup"
      aria-label="Delivery type"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "print"}
        className={"delivery-opt" + (value === "print" ? " is-on" : "")}
        onClick={() => onChange("print")}
        disabled={disabled}
      >
        Print
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "digital"}
        className={"delivery-opt" + (value === "digital" ? " is-on" : "")}
        onClick={() => onChange("digital")}
        disabled={disabled}
      >
        Digital
      </button>
    </div>
  );
}
