"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  title: string;
  images: string[];
};

export function ImageGallery({ title, images }: Props) {
  const safeImages = images.length ? images : ["/placeholder.jpg"];
  const [selected, setSelected] = useState(safeImages[0] || "/placeholder.jpg");

  useEffect(() => {
    setSelected(safeImages[0] || "/placeholder.jpg");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when image set changes
  }, [safeImages.join("|")]);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="flex md:w-[86px] md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[460px] pr-1">
        {safeImages.map((img, idx) => {
          const active = selected === img;
          return (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelected(img)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition ${
                active ? "border-[#00A651] ring-2 ring-[#00A651]/25" : "border-gray-200"
              }`}
              aria-label={`Select image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={shouldUnoptimizeRemoteImage(img)}
              />
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 md:min-h-[460px]">
        <Image
          src={selected || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-contain p-4"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={shouldUnoptimizeRemoteImage(selected || "/placeholder.jpg")}
        />
      </div>
    </div>
  );
}

