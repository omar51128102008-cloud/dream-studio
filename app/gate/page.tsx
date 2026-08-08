import "../gate.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import GateForm from "@/components/GateForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <GateForm />
    </Suspense>
  );
}
