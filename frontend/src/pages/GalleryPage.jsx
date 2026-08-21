import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const GALLERY_IMAGES = [
  { id: 21, src: "https://lh3.googleusercontent.com/d/1VsWiT5uJLVdAs71Nw8qLyOQlfxjrriFo", name: "Gallery" },
  { id: 1, src: "https://lh3.googleusercontent.com/d/1Ajc_BFBK7BLNzA9kS_Sq4POSj0bSPtuL", name: "Gallery" },
  { id: 2, src: "https://lh3.googleusercontent.com/d/1DHMIRqEqKT82vywOf77C5C_l4Ayj_UNT", name: "Gallery" },
  { id: 3, src: "https://lh3.googleusercontent.com/d/11qMT3JmsGJZCjyHUyiCNG_HnynZNs4SD", name: "Gallery" },
  { id: 4, src: "https://lh3.googleusercontent.com/d/1VN1VeOiew3g4Hs7LnnbF8NeQcCPage9z", name: "Gallery" },
  { id: 5, src: "https://lh3.googleusercontent.com/d/1o_EX2oKQBPhWGqBM0OxZXqY4Nx94kQIY", name: "Gallery" },
  { id: 6, src: "https://lh3.googleusercontent.com/d/1Hm47eMLOJ7xx1ASublVaPKM6TcLGAmaC", name: "Gallery" },
  { id: 7, src: "https://lh3.googleusercontent.com/d/1NtfK2F7T9s1GcGqU0PsK8OcQBtj2eznC", name: "Gallery" },
  { id: 8, src: "https://lh3.googleusercontent.com/d/1sa4gz3Rb6uO8Agc3Y1fwsaGIT9UlekJn", name: "Gallery" },
  { id: 9, src: "https://lh3.googleusercontent.com/d/1E8vfkUVfUfBPJrxtY6SjswnMfrzxY9Tp", name: "Gallery" },
  { id: 13, src: "https://lh3.googleusercontent.com/d/1Pwy6ZZbUwDnNeoDlcLbOGwVBPfcjwk39", name: "Gallery" },
  { id: 14, src: "https://lh3.googleusercontent.com/d/1gHZ1JMFc4x1_vmoJb27QobEQpfHVNl2P", name: "Gallery" },
  { id: 16, src: "https://lh3.googleusercontent.com/d/1FoeVcqPJ5-6036Y0JwV4_UhBrEM0EWjL", name: "Gallery" },
  { id: 17, src: "https://lh3.googleusercontent.com/d/1EkWGa7V1JU7xAbQDpFigeJp54T_JO3qF", name: "Gallery" },
  { id: 18, src: "https://lh3.googleusercontent.com/d/1mgijBhMeAaTNvqwLtPnpQagfQxGQNCuV", name: "Gallery" },
  { id: 19, src: "https://lh3.googleusercontent.com/d/1etfxf6RlBbP9iDi_anJwT8-_YqxDZM8b", name: "Gallery" },
  { id: 20, src: "https://lh3.googleusercontent.com/d/1UId0PM-fcLfbKhotrrqeS_Culq7LMb4m", name: "Gallery" },
  { id: 22, src: "https://lh3.googleusercontent.com/d/1gs8HH5F4bfWDNAfBq9CLieUKZsGpDnaQ", name: "Gallery" },
  { id: 23, src: "https://lh3.googleusercontent.com/d/1V49np-Le271hW74jeAk5n1XA7p8VUK2B", name: "Gallery" },
  { id: 24, src: "https://lh3.googleusercontent.com/d/1KC1yI9kgbvZ9P4nP-CiEAPYVhVI8-eqg", name: "Gallery" },
  { id: 25, src: "https://lh3.googleusercontent.com/d/1o0rQa9znPmNJhVXf1oQifzjl5ott0yvW", name: "Gallery" },
  { id: 26, src: "https://lh3.googleusercontent.com/d/1B8sUW06Mj4V-Z_8oPiS2OtV46v5ueVkU", name: "Gallery" },
  { id: 27, src: "https://lh3.googleusercontent.com/d/1F7bbp0KZvp7B0wTjpV0lqF1yyiRuk3Bx", name: "Gallery" },
];

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const goNext = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % GALLERY_IMAGES.length);
  }, [lightbox]);

  const goPrev = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [lightbox]);

  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightbox, goNext, goPrev]);

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="gallery-page">
      <SEOHead title="Gallery" description="Take a look at some of the beautiful pet-safe bouquets that could be on their way to you." keywords="pet safe flowers, bouquets, flower gallery" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Inspiration</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C]">Gallery</h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] mt-3 sm:mt-4 max-w-lg">
            Sneak peek into our pet-safe bouquets, seasonal arrangements, and happy pets enjoying flowers made with curious cats and dogs in mind.
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
                className="group relative overflow-hidden rounded-xl animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${(i % 6) * 0.1 + 0.1}s` }}
                data-testid={`gallery-item-${image.id}`}
                onClick={() => openLightbox(i)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`${image.src}=w800`}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          data-testid="gallery-lightbox"
          onClick={closeLightbox}
        >
          <div className="absolute inset-0 bg-[#1a1a1a]/95 backdrop-blur-sm" />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="lightbox-close"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="lightbox-prev"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="lightbox-next"
          >
            <ChevronRight size={24} className="text-white" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${GALLERY_IMAGES[lightbox].src}=w1600`}
              alt={GALLERY_IMAGES[lightbox].name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              data-testid="lightbox-image"
            />
            <div className="text-center mt-4">
              <p className="text-xs text-white/50 mt-1">
                {lightbox + 1} / {GALLERY_IMAGES.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
