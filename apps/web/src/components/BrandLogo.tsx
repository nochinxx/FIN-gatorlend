import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  priority?: boolean;
  size?: "nav" | "hero" | "login";
  variant?: "black" | "white";
};

const dimensions = {
  nav: { width: 168, height: 36 },
  hero: { width: 320, height: 68 },
  login: { width: 220, height: 48 }
} as const;

export function BrandLogo({ href = "/", priority = false, size = "nav", variant = "black" }: BrandLogoProps) {
  const logoSize = dimensions[size];

  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center" }}>
      <Image
        src={`/branding/fin-logo-horizontal-${variant}.png`}
        alt="FIN Club"
        width={logoSize.width}
        height={logoSize.height}
        priority={priority}
        style={{ width: "auto", height: "auto", maxWidth: "100%" }}
      />
    </Link>
  );
}
