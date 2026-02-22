"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type VideoSource = {
  src: string;
  type?: string;
  media?: string;
};

type Props = {
  src: string;
  sources?: VideoSource[];
  poster?: string;
  alt?: string;
  className?: string;
  roundedClassName?: string;
  preload?: "none" | "metadata" | "auto";
  loadingStrategy?: "eager" | "lazy";
  autoplay?: boolean;
  loop?: boolean;
};

/**
 * Безпечне відео з graceful‑fallback на постер/картинку, якщо iOS блокує автоплей або файл не вантажиться.
 */
export function SafeVideo({
  src,
  sources,
  poster = "/images/img_banner.gif",
  alt = "Video preview",
  className,
  roundedClassName,
  preload = "metadata",
  loadingStrategy = "eager",
  autoplay = true,
  loop = true
}: Props) {
  const [fallback, setFallback] = useState(false);
  const [canLoad, setCanLoad] = useState(loadingStrategy === "eager");
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (loadingStrategy !== "lazy" || canLoad) return;
    const target = rootRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setCanLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCanLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoad, loadingStrategy]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !canLoad || reducedMotion || !autoplay) return;
    const playPromise = v.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setFallback(true));
    }
  }, [autoplay, canLoad, reducedMotion, src]);

  if (fallback || reducedMotion || !canLoad) {
    return (
      <div ref={rootRef} className={clsx("relative h-full w-full", roundedClassName, className)}>
        <Image src={poster} alt={alt} fill className="object-cover" sizes="100vw" priority={loadingStrategy === "eager"} />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={clsx("h-full w-full object-cover", roundedClassName, className)}
      autoPlay={autoplay}
      muted
      loop={loop}
      playsInline
      preload={preload}
      poster={poster}
      onError={() => setFallback(true)}
    >
      {(sources && sources.length > 0 ? sources : [{ src, type: "video/mp4" }]).map((source) => (
        <source key={`${source.src}-${source.media ?? "all"}`} src={source.src} type={source.type} media={source.media} />
      ))}
    </video>
  );
}
