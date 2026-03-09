import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { value: "", label: "All" },
  { value: "bouquet", label: "Bouquets" },
  { value: "single-stem", label: "Single Stems" },
  { value: "arrangement", label: "Arrangements" },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    setLoading(true);
    const url = activeCategory ? `${API}/products?category=${activeCategory}` : `${API}/products`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="py-12 md:py-20" data-testid="shop-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="mb-12 animate-fade-in-up">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-3 block">Collection</span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-medium tracking-tight text-[#2C2C2C]">
            Our Flowers
          </h1>
          <p className="text-base md:text-lg font-light text-[#6B7280] mt-4 max-w-lg">
            Every stem is verified pet-safe. Browse our curated collection of beautiful, worry-free blooms.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up delay-200">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              className={`rounded-full text-xs uppercase tracking-widest px-6 py-5 transition-all ${
                activeCategory === cat.value
                  ? "bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90"
                  : "border-[#E5E0D6] text-[#6B7280] hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
              }`}
              onClick={() => setSearchParams(cat.value ? { category: cat.value } : {})}
              data-testid={`filter-${cat.value || 'all'}`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#F2F0EB] rounded-lg mb-4" />
                <div className="h-3 bg-[#F2F0EB] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#F2F0EB] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B7280] font-light">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
