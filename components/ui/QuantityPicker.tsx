"use client";

import { useState } from "react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

export function QuantityPicker({ initial = 1 }: { initial?: number }) {
  const [quantity, setQuantity] = useState(initial);

  return <QuantitySelector value={quantity} onChange={setQuantity} />;
}
