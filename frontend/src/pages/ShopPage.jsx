import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";
import SeasonalPopup from "@/components/SeasonalPopup";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setLoading(true);
      const res = await fetch(`${API}/products`);
      setProducts(await res.json());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/products/search?q=${encodeURIComponent(searchQuery)}`);
      setProducts(await res.json());
    } catch {}
    setLoading(false);
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="shop-page">
      <SEOHead title="Shop" description="Browse our curated collection of pet-safe flowers, bouquets, and letterbox arrangements." keywords="pet safe flowers, bouquets, letterbox flowers, safe flowers for dogs cats" />
      <div className="container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Collection</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C]">Our Flowers</h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] mt-3 sm:mt-4 max-w-lg">
            Every stem is verified pet-safe. Browse our curated collection of beautiful, worry-free blooms.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 sm:mb-10 animate-fade-in-up delay-100" data-testid="search-form">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input
              type="text"
              placeholder="Search flowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              className="pl-11 pr-4 py-5 border-[#E5E0D6] rounded-full bg-white text-sm placeholder:text-[#6B7280]/50"
              data-testid="search-input"
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#F2F0EB] rounded-lg mb-4" />
                <div className="h-3 bg-[#F2F0EB] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#F2F0EB] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B7280] font-light">No products found.</p>
          </div>
        )}
      </div>
      <SeasonalPopup />
    </div>
  );
}
