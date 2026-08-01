"use client";

export default function FavoriteButton({
  favorited,
  onToggle,
  size = 18,
  position,
  disabled = false,
}: {
  favorited: boolean;
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
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={"icon-btn" + (favorited ? " is-on" : "")}
      style={{
        top: 8,
        right: 8,
        ...position,
        opacity: disabled ? 0.5 : undefined,
        cursor: disabled ? "default" : undefined,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
