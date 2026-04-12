import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const GALLERY_IMAGES = [
  { id: 1, src: "https://lh3.googleusercontent.com/d/1KjSTYJSklo6eM5lUBGDYo5x0czN6TnZk=w800", name: "Red Rose Close-Up" },
  { id: 2, src: "https://lh3.googleusercontent.com/d/1p7NRwL2MISSKI8lmndAg2yHJ_Q1nv09Y=w800", name: "Pastel Garden Mix" },
  { id: 3, src: "https://lh3.googleusercontent.com/d/1hKJr7ft65mLEFxNtMLEBrXfrUusZ83qQ=w800", name: "Blush & Gold Bouquet" },
  { id: 4, src: "https://lh3.googleusercontent.com/d/1T5-AGmpGJ3OHJ0to7l5KHKaXDFt_A6k4=w800", name: "Vibrant Wildflower Mix" },
  { id: 5, src: "https://lh3.googleusercontent.com/d/1Pwy6ZZbUwDnNeoDlcLbOGwVBPfcjwk39=w800", name: "Gerbera Daisy Delight" },
  { id: 6, src: "https://lh3.googleusercontent.com/d/1tytAeDhgCklRmh1DQcID82_k1QNDqENY=w800", name: "Soft Pink Elegance" },
  { id: 7, src: "https://lh3.googleusercontent.com/d/1FoeVcqPJ5-6036Y0JwV4_UhBrEM0EWjL=w800", name: "Single Stem Gerbera" },
  { id: 8, src: "https://lh3.googleusercontent.com/d/1fM8ju9g1vllQAi2THcAEAaXaHQuH4tbH=w800", name: "Sunset Rose Arrangement" },
  { id: 9, src: "https://lh3.googleusercontent.com/d/1T3Q2Fkl1fssyXjlnNj3-85xdys11AGWb=w800", name: "Orange Gerbera Bouquet" },
  { id: 10, src: "https://lh3.googleusercontent.com/d/10ZfxvDRc93OzzvXVJrNqnoShsVEDOMB-=w800", name: "Cat with Flowers" },
];

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay for fade-in effect
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="gallery-page">
      <SEOHead title="Gallery" description="Take a look at some of the beautiful pet-safe bouquets that could be on their way to you." keywords="pet safe flowers, bouquets, flower gallery" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Inspiration</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C]">Gallery</h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] mt-3 sm:mt-4 max-w-lg">
            Take a look at some of the bouquets that could potentially be getting shipped to you. Every arrangement is handcrafted and 100% pet-safe.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#F2F0EB] rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {GALLERY_IMAGES.map((image, i) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-xl animate-fade-in-up`}
                style={{ animationDelay: `${(i % 6) * 0.1 + 0.1}s` }}
                data-testid={`gallery-item-${image.id}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-['Playfair_Display'] text-sm sm:text-lg font-medium text-white">
                    {image.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
