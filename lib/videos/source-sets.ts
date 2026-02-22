import fs from "node:fs";
import path from "node:path";

type VideoSource = {
  src: string;
  type?: string;
  media?: string;
};

function publicPathToFs(publicPath: string) {
  return path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
}

function withSuffix(publicPath: string, suffix: ".mobile" | ".desktop" | ".mobile.webm" | ".desktop.webm") {
  const ext = path.extname(publicPath);
  const base = publicPath.slice(0, -ext.length);
  return `${base}${suffix}${suffix.endsWith(".webm") ? "" : ext}`;
}

function existsPublic(publicPath: string) {
  try {
    return fs.existsSync(publicPathToFs(publicPath));
  } catch {
    return false;
  }
}

function inferType(src: string) {
  if (src.endsWith(".webm")) return "video/webm";
  if (src.endsWith(".mp4")) return "video/mp4";
  return undefined;
}

export function getResponsiveVideoSources(src: string): VideoSource[] {
  const sources: VideoSource[] = [];
  const mobileWebm = withSuffix(src, ".mobile.webm");
  const desktopWebm = withSuffix(src, ".desktop.webm");
  const mobileMp4 = withSuffix(src, ".mobile");
  const desktopMp4 = withSuffix(src, ".desktop");

  if (existsPublic(mobileWebm)) sources.push({ src: mobileWebm, type: inferType(mobileWebm), media: "(max-width: 767px)" });
  if (existsPublic(desktopWebm)) sources.push({ src: desktopWebm, type: inferType(desktopWebm), media: "(min-width: 768px)" });
  if (existsPublic(mobileMp4)) sources.push({ src: mobileMp4, type: inferType(mobileMp4), media: "(max-width: 767px)" });
  if (existsPublic(desktopMp4)) sources.push({ src: desktopMp4, type: inferType(desktopMp4), media: "(min-width: 768px)" });

  sources.push({ src, type: inferType(src) });
  return sources;
}

