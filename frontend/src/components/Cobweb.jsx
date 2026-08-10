// Subtle decorative cobweb for a hero corner (top-left by default).
// Pass flip to mirror it for the top-right corner.
export default function Cobweb({ size = 130, flip = false, color = "rgba(250,249,246,0.30)", className = "", style = {} }) {
  const ends = [
    [1, 0], [1, 0.35], [1, 0.7], [1, 1], [0.7, 1], [0.35, 1], [0, 1],
  ].map(([x, y]) => [x * 100, y * 100]);
  const rings = [0.3, 0.55, 0.8];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined, ...style }}
      fill="none"
      stroke={color}
      strokeWidth="0.7"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* spokes */}
      {ends.map(([x, y], i) => (
        <line key={`s${i}`} x1="0" y1="0" x2={x} y2={y} />
      ))}
      {/* rings connecting the spokes */}
      {rings.map((r, ri) => {
        const pts = ends.map(([x, y]) => `${(x * r).toFixed(1)},${(y * r).toFixed(1)}`).join(" ");
        return <polyline key={`r${ri}`} points={pts} />;
      })}
    </svg>
  );
}
