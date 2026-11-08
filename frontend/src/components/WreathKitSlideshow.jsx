import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const INTERVAL_MS = 4000;

const navButtonClass =
  "absolute top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#2C2C2C] rounded-full p-2 shadow-sm transition-all hover:scale-110";

export default function WreathKitSlideshow({ images, alt }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [count, index]);

  const step = (delta) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F2F0EB] animate-fade-in-up" data-testid="wreath-kit-slideshow">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {count > 1 && (
        <>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${navButtonClass} left-3`} data-testid="wreath-kit-slide-prev">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${navButtonClass} right-3`} data-testid="wreath-kit-slide-next">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
