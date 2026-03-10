import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
  return (
    <Link
      to={`/shop/${product.slug}`}
      className={`group block animate-fade-in-up delay-${(index % 4) * 100 + 100}`}
      data-testid={`product-card-${product.slug}`}
    >
      <div className="product-image-wrapper aspect-[3/4] bg-[#F2F0EB] rounded-lg overflow-hidden mb-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
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
  );
}
