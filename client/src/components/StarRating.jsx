// Small reusable component to show a star rating, e.g. ★★★★☆ 4.2 (12)
export default function StarRating({ rating, count, size = 14 }) {
  if (rating == null) {
    return <span style={{ fontSize: size, color: "var(--ink-soft)" }}>No reviews yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: size }}>
      <span style={{ color: "var(--mustard)" }}>
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
      </span>
      <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
        {rating} {count != null ? `(${count})` : ""}
      </span>
    </span>
  );
}
