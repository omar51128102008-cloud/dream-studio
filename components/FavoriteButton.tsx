"use client";

export default function FavoriteButton({
  favorited,
  onToggle,
  size = 18,
  position,
}: {
  favorited: boolean;
  onToggle: () => void;
  size?: number;
  position?: React.CSSProperties;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
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
        cursor: "pointer",
        ...position,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M12 21s-6.7-4.3-9.3-8.5C.9 9.5 2 5.6 5.4 4.4c2-.7 4.3 0 5.6 1.7L12 7.3l1-1.2c1.3-1.7 3.6-2.4 5.6-1.7 3.4 1.2 4.5 5.1 2.7 8.1C18.7 16.7 12 21 12 21z"
          fill={favorited ? "#e0245e" : "none"}
          stroke={favorited ? "#e0245e" : "#555"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
