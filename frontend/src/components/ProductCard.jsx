import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye } from "lucide-react";
import QuickViewModal from "@/components/QuickViewModal";

export default function ProductCard({ product, index = 0 }) {
  const [quickView, setQuickView] = useState(false);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView(true);
  };

  return (
    <>
      <Link
        to={`/shop/${product.slug}`}
        className={`group block animate-fade-in-up delay-${(index % 4) * 100 + 100}`}
        data-testid={`product-card-${product.slug}`}
      >
        <div className="product-image-wrapper aspect-[3/4] bg-[#F2F0EB] rounded-lg overflow-hidden mb-4 relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Desktop: full-width bar on hover */}
          <button
            onClick={handleQuickView}
            className="hidden sm:flex absolute bottom-0 left-0 right-0 bg-[#2C2C2C]/85 backdrop-blur-sm text-[#FAF9F6] items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-widest font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out cursor-pointer"
            data-testid={`quick-view-btn-${product.slug}`}
          >
            <Eye size={14} strokeWidth={1.5} /> Quick View
          </button>
          {/* Mobile: small icon button always visible */}
          <button
            onClick={handleQuickView}
            className="sm:hidden absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#2C2C2C] active:scale-90 transition-transform"
            data-testid={`quick-view-btn-mobile-${product.slug}`}
          >
            <Eye size={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {product.pet_safe && (
              <span className="pet-safe-badge inline-flex items-center gap-1">
                <ShieldCheck size={10} /> Pet Safe
              </span>
            )}
          </div>
          <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-medium text-[#2C2C2C] group-hover:text-[#8DA399] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm font-light text-[#6B7280]">${product.price.toFixed(2)}</p>
        </div>
      </Link>

      <QuickViewModal
        product={product}
        open={quickView}
        onClose={() => setQuickView(false)}
      />
    </>
  );
}
