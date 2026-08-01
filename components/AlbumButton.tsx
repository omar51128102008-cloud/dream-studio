"use client";

export default function AlbumButton({
  inAlbum,
  onToggle,
  size = 18,
  position,
  disabled = false,
}: {
  inAlbum: boolean;
  onToggle: () => void;
  size?: number;
  position?: React.CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-pressed={inAlbum}
      aria-label={inAlbum ? "Remove from album" : "Add to album"}
      className={"icon-btn" + (inAlbum ? " is-on" : "")}
      style={{
        top: 8,
        right: 8,
        ...position,
        opacity: disabled ? 0.5 : undefined,
        cursor: disabled ? "default" : undefined,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-3.8L6 21V4z" />
      </svg>
    </button>
  );
}
