import "../gate.css";
import { Suspense } from "react";
import GateForm from "@/components/GateForm";

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <GateForm />
    </Suspense>
  );
}
