"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Props = {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  roundedClassName?: string;
};

/**
 * Безпечне відео з graceful‑fallback на постер/картинку, якщо iOS блокує автоплей або файл не вантажиться.
 */
export function SafeVideo({ src, poster = "/images/img_banner.gif", alt = "Video preview", className, roundedClassName }: Props) {
  const [fallback, setFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setFallback(true));
    }
  }, [src]);

  if (fallback) {
    return (
      <div className={clsx("relative h-full w-full", roundedClassName, className)}>
        <Image src={poster} alt={alt} fill className="object-cover" sizes="100vw" priority />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className={clsx("h-full w-full object-cover", roundedClassName, className)}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      onError={() => setFallback(true)}
    />
  );
}
