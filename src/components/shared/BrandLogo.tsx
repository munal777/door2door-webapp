import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export default function BrandLogo({
  className,
  alt = "Door2Door logo",
}: BrandLogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={cn("block h-auto w-auto object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );
}
