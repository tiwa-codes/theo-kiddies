"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-cream">
        <Image
          src={images[active]}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 90vw, 40vw"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={image + index}
            type="button"
            className={cn(
              "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border",
              index === active ? "border-brand-orange" : "border-brand-orange/10"
            )}
            onClick={() => setActive(index)}
            aria-label={`View image ${index + 1}`}
          >
            <Image src={image} alt={title} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
