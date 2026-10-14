/** Stand-in for `next/image`: a plain <img>, with the portal's local images inlined. */
import type { ImgHTMLAttributes } from "react";
import logo from "../../public/baesa-logo.png";

// esbuild's dataurl loader turns the import into a data: URI string (Next's types say StaticImageData).
const LOCAL: Record<string, string> = { "/baesa-logo.png": logo as unknown as string };

export default function Image({
  src,
  alt,
  priority: _priority,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; priority?: boolean }) {
  void _priority;
  // eslint-disable-next-line @next/next/no-img-element -- this file replaces next/image in the artifact build
  return <img src={LOCAL[src] ?? src} alt={alt} {...rest} />;
}
