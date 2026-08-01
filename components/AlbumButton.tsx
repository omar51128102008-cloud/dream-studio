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
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 2,
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        ...position,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"
          fill={inAlbum ? "#2563eb" : "none"}
          stroke={inAlbum ? "#2563eb" : "#555"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
