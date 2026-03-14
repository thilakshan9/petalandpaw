import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Minus, Plus, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";

export default function QuickViewModal({ product, open, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart`);
    onClose();
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setQuantity(1); } }}>
      <DialogContent
        className="max-w-3xl w-[95vw] p-0 overflow-hidden border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl gap-0"
        data-testid="quick-view-modal"
      >
        <DialogTitle className="sr-only">{product.name} - Quick View</DialogTitle>
        <DialogDescription className="sr-only">Quick view of {product.name} - ${product.price.toFixed(2)}</DialogDescription>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="aspect-square sm:aspect-auto sm:h-full bg-[#F2F0EB] overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-5 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6B7280]">
                {product.category}
              </span>
              {product.pet_safe && (
                <span className="pet-safe-badge inline-flex items-center gap-1">
                  <ShieldCheck size={10} /> Pet Safe
                </span>
              )}
            </div>

            <h2
              className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium tracking-tight text-[#2C2C2C] mb-2"
              data-testid="quick-view-product-name"
            >
              {product.name}
            </h2>

            <p className="text-xl font-light text-[#2C2C2C] mb-4" data-testid="quick-view-product-price">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-sm font-light leading-relaxed text-[#6B7280] mb-6 line-clamp-3">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Qty</span>
              <div className="flex items-center border border-[#E5E0D6] rounded-full bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-[#F2F0EB] rounded-l-full transition-colors"
                  data-testid="quick-view-qty-decrease"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-medium" data-testid="quick-view-qty-display">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-[#F2F0EB] rounded-r-full transition-colors"
                  data-testid="quick-view-qty-increase"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 py-6 text-xs uppercase tracking-widest transition-all hover:scale-[1.02] w-full mb-3"
              data-testid="quick-view-add-to-cart"
            >
              Add to Cart &mdash; ${(product.price * quantity).toFixed(2)}
            </Button>

            <Link
              to={`/shop/${product.slug}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#8DA399] hover:text-[#2C2C2C] transition-colors py-2"
              data-testid="quick-view-full-details"
            >
              View Full Details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
