import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      const res = await fetch(`${API}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image_url: i.image_url || "",
          })),
          origin_url: window.location.origin,
          order_type: "regular",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 md:py-32" data-testid="cart-page-empty">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[#E5E0D6] mb-6" />
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-medium text-[#2C2C2C] mb-4">Your cart is empty</h1>
          <p className="text-base font-light text-[#6B7280] mb-8">Time to find something beautiful for your home.</p>
          <Link to="/shop">
            <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20" data-testid="cart-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-10 animate-fade-in-up">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-4 md:gap-6 bg-white border border-[#E5E0D6] rounded-xl p-4 md:p-6 animate-fade-in-up" data-testid={`cart-item-${item.product_id}`}>
                {item.image_url && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F2F0EB] flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] truncate">{item.name}</h3>
                  <p className="text-sm font-light text-[#6B7280] mt-1">${item.price.toFixed(2)} each</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[#E5E0D6] rounded-full">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 hover:bg-[#F2F0EB] rounded-l-full transition-colors" data-testid={`cart-decrease-${item.product_id}`}>
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 hover:bg-[#F2F0EB] rounded-r-full transition-colors" data-testid={`cart-increase-${item.product_id}`}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-[#6B7280] hover:text-red-500 transition-colors" data-testid={`cart-remove-${item.product_id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-light text-[#2C2C2C]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 md:p-8 sticky top-24">
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-light text-[#6B7280]">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-light text-[#6B7280]">
                  <span>Delivery</span>
                  <span>{total >= 50 ? "Free" : "$5.99"}</span>
                </div>
                <div className="border-t border-[#E5E0D6] pt-3 flex justify-between">
                  <span className="text-base font-medium text-[#2C2C2C]">Total</span>
                  <span className="text-base font-medium text-[#2C2C2C]" data-testid="cart-total">
                    ${(total + (total >= 50 ? 0 : 5.99)).toFixed(2)}
                  </span>
                </div>
              </div>
              {total < 50 && (
                <p className="text-xs font-light text-[#8DA399] mb-4">
                  Add ${(50 - total).toFixed(2)} more for free delivery
                </p>
              )}
              <Button
                onClick={handleCheckout}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full"
                data-testid="checkout-btn"
              >
                Checkout <ArrowRight size={14} className="ml-2" />
              </Button>
              <Link to="/shop" className="block text-center mt-4 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
