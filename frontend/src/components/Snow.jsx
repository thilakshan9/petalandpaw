import { useEffect, useMemo, useRef, useState, useCallback } from "react";

function rand(min, max) { return min + Math.random() * (max - min); }

function makeFlake(i) {
  const size = rand(3, 8);
  return {
    id: i,
    left: rand(0, 100),
    size,
    dur: rand(7, 16),
    delay: -rand(0, 16),
    drift: rand(-40, 40),
    opacity: rand(0.45, 0.95),
    blur: size < 4.5 ? 0.6 : 0,
  };
}

// Global, decorative snow layer. Renders nothing unless `active`.
// Persistent gentle snowfall + an optional `pp-snow-flurry` burst.
export default function Snow({ active = false }) {
  const persistent = useMemo(
    () => Array.from({ length: 50 }, (_, i) => makeFlake(i)),
    []
  );
  const [flurry, setFlurry] = useState([]);
  const idRef = useRef(100000);

  const removeFlurry = useCallback((id, e) => {
    if (e && e.animationName && e.animationName !== "snow-fall") return;
    setFlurry((prev) => prev.filter((f) => f.id !== id));
  }, []);

  useEffect(() => {
    if (!active) { setFlurry([]); return; }
    const onFlurry = () => {
      const batch = Array.from({ length: 40 }, () => {
        idRef.current += 1;
        const f = makeFlake(idRef.current);
        f.delay = -rand(0, 1.5);
        f.dur = rand(4, 8);
        return f;
      });
      setFlurry((prev) => [...prev, ...batch]);
    };
    window.addEventListener("pp-snow-flurry", onFlurry);
    return () => window.removeEventListener("pp-snow-flurry", onFlurry);
  }, [active]);

  if (!active) return null;

  const renderFlake = (f, cls, onEnd) => (
    <span
      key={f.id}
      className={`pp-flake ${cls}`}
      onAnimationEnd={onEnd ? (e) => onEnd(f.id, e) : undefined}
      style={{
        left: `${f.left}vw`,
        width: `${f.size}px`,
        height: `${f.size}px`,
        opacity: f.opacity,
        filter: f.blur ? `blur(${f.blur}px)` : undefined,
        animationDuration: `${f.dur}s`,
        animationDelay: `${f.delay}s`,
        // custom prop consumed by the keyframes
        ["--drift"]: `${f.drift}px`,
      }}
    />
  );

  return (
    <div className="pp-snow" aria-hidden="true">
      {persistent.map((f) => renderFlake(f, "persist"))}
      {flurry.map((f) => renderFlake(f, "once", removeFlurry))}
    </div>
  );
}
