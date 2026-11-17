import { cn } from "@/lib/utils";

interface MaskImageProps {
  src: string;
  className?: string;
  label?: string;
}

/** Renders a monochrome SVG as a shape filled with the shifting iridescent gradient. */
export function MaskImage({ src, className, label }: MaskImageProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("iridescent-mask block", className)}
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  );
}
