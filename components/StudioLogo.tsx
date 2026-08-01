import Link from "next/link";

export default function StudioLogo({
  onDark = false,
  href = "/",
}: {
  onDark?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={"studio-logo" + (onDark ? " on-dark" : "")}
      aria-label="Dream Studio home"
    >
      <img className="logo-light" src="/logo-light.png" alt="Dream Studio" />
      <img className="logo-dark" src="/logo-dark.png" alt="Dream Studio" />
    </Link>
  );
}
