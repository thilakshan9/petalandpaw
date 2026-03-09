import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API}/products/${slug}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="py-12 md:py-20 container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-[#F2F0EB] rounded-lg" />
          <div className="space-y-4">
            <div className="h-4 bg-[#F2F0EB] w-1/4 rounded" />
            <div className="h-10 bg-[#F2F0EB] w-3/4 rounded" />
            <div className="h-6 bg-[#F2F0EB] w-1/4 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#6B7280] font-light">Product not found.</p>
        <Link to="/shop" className="text-[#8DA399] mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16" data-testid="product-page">
      <SEOHead title={product.name} description={product.description} image={product.image_url} keywords={`${product.name}, pet safe flowers, ${product.category}`} />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors mb-8" data-testid="back-to-shop">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <div className="animate-fade-in-up">
            <div className="aspect-[3/4] bg-[#F2F0EB] rounded-2xl overflow-hidden">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="animate-fade-in-up delay-200 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6B7280]">{product.category}</span>
              {product.pet_safe && (
                <span className="pet-safe-badge inline-flex items-center gap-1">
                  <ShieldCheck size={10} /> Pet Safe
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4" data-testid="product-name">
              {product.name}
            </h1>

            <p className="text-2xl font-light text-[#2C2C2C] mb-6" data-testid="product-price">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-base font-light leading-relaxed text-[#6B7280] mb-8">
              {product.description}
            </p>

            {product.pet_safe_details && (
              <div className="bg-[#8DA399]/8 border border-[#8DA399]/20 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-[#8DA399]" />
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#8DA399]">Pet Safety Info</span>
                </div>
                <p className="text-sm font-light text-[#6B7280]">{product.pet_safe_details}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-light text-[#6B7280]">Quantity</span>
              <div className="flex items-center border border-[#E5E0D6] rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-[#F2F0EB] rounded-l-full transition-colors"
                  data-testid="quantity-decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-medium" data-testid="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-[#F2F0EB] rounded-r-full transition-colors"
                  data-testid="quantity-increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-10 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full md:w-auto"
              data-testid="add-to-cart-btn"
            >
              Add to Cart &mdash; ${(product.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
