"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button className="sa-button sa-button-primary sa-print-button" type="button" onClick={() => window.print()}><Printer size={15} /> Print invoice</button>;
}
