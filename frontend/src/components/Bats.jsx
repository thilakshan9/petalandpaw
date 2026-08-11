import { useEffect, useRef, useState, useCallback } from "react";

// A stylised bat silhouette.
function BatSVG({ size }) {
  return (
    <svg
      width={size}
      height={size * 0.45}
      viewBox="0 0 100 45"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 30 C 20 10, 30 25, 40 5 C 45 20, 55 20, 60 5 C 70 25, 80 10, 100 30 C 80 25, 70 35, 60 28 C 55 40, 45 40, 40 28 C 30 35, 20 25, 0 30 Z" />
    </svg>
  );
}

let _batId = 0;

// Global, decorative bat animation layer. Renders nothing unless `active`.
// Ambient: 1-2 bats drift across every several seconds.
// Burst: dispatch a `pp-bats-burst` window event to send a swarm across.
export default function Bats({ active = false, ambient = false }) {
  const [bats, setBats] = useState([]);
  const timerRef = useRef(null);

  const spawn = useCallback((count, opts = {}) => {
    setBats((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        _batId += 1;
        next.push({
          id: _batId,
          top: opts.topFixed ?? (8 + Math.random() * 72),
          size: opts.size ?? (26 + Math.random() * 34),
          dur: opts.dur ?? (6 + Math.random() * 5),
          delay: opts.delay ?? Math.random() * (opts.spread ?? 0.6),
        });
      }
      return next;
    });
  }, []);

  const removeBat = useCallback((id, e) => {
    // Only remove when the horizontal fly animation ends (ignore the looping wing flap).
    if (e && e.animationName && e.animationName !== "bat-fly-across") return;
    setBats((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    if (!active) { setBats([]); return; }

    const tick = () => {
      spawn(1 + Math.floor(Math.random() * 2));
      timerRef.current = setTimeout(tick, 7000 + Math.random() * 7000);
    };
    if (ambient) timerRef.current = setTimeout(tick, 2800);

    const onBurst = () => spawn(6, { spread: 1.3 });
    window.addEventListener("pp-bats-burst", onBurst);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("pp-bats-burst", onBurst);
    };
  }, [active, ambient, spawn]);

  if (!active) return null;

  return (
    <div className="pp-bats" aria-hidden="true">
      {bats.map((b) => (
        <span
          key={b.id}
          className="pp-bat"
          style={{ top: `${b.top}vh`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          onAnimationEnd={(e) => removeBat(b.id, e)}
        >
          <span className="pp-bat-inner">
            <BatSVG size={b.size} />
          </span>
        </span>
      ))}
    </div>
  );
}
