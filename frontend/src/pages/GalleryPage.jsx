import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GalleryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
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
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`group relative overflow-hidden rounded-xl animate-fade-in-up delay-${(i % 6) * 100 + 100}`}
                data-testid={`gallery-item-${product.slug}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-['Playfair_Display'] text-sm sm:text-lg font-medium text-white">
                    {product.name}
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
