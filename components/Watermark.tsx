function svgEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function Watermark({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="340">` +
    `<g transform="rotate(-30 170 170)">` +
    `<text x="170" y="170" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="500" fill="rgba(255,255,255,0.28)">${svgEscape(text)}</text>` +
    `</g></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: url,
        backgroundSize: "340px 340px",
        backgroundRepeat: "repeat",
        pointerEvents: "none",
      }}
    />
  );
}
