import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ArrowRight, Leaf, Gift, BookOpen, PawPrint, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import WreathKitSlideshow from "@/components/WreathKitSlideshow";

const WREATH_KIT = {
  id: "wreath_kit",
  name: "Wreath Making Kit",
  price: 50,
  image_url: "/images/wreath-kit.jpg",
  images: ["/images/wreath-kit.jpg", "/images/wreath-kit-2.jpg", "/images/wreath-kit-3.jpg"],
};

const WREATH_PET_TOY_PRICE = 8.99;

const included = [
  {
    icon: Leaf,
    title: "Frame & foliage",
    items: ["Metal wreath ring", "Moss", "Fresh foliage", "Roll of wire"],
  },
  {
    icon: Gift,
    title: "Decorations",
    items: ["4 pine cones", "9 mini baubles", "4 mini bows", "2 bells", "4 dried orange slices", "Ribbon"],
  },
  {
    icon: BookOpen,
    title: "Step-by-step guide",
    items: ["Written step-by-step instructions", "Video guide, so you can follow along at your own pace"],
  },
];

export default function WreathKitPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [petToy, setPetToy] = useState(false);
  const [petType, setPetType] = useState("");
  const [petTypeOther, setPetTypeOther] = useState("");

  const petLabel = petType === "other" ? petTypeOther.trim() : petType;

  const handleBuyNow = () => {
    if (petToy && !petType) {
      toast.error("Please select your pet type first");
      return;
    }
    if (petToy && petType === "other" && !petLabel) {
      toast.error("Please enter your pet type");
      return;
    }
    addToCart({
      product_id: petToy ? `${WREATH_KIT.id}:pet:${petLabel}` : WREATH_KIT.id,
      name: WREATH_KIT.name,
      price: WREATH_KIT.price + (petToy ? WREATH_PET_TOY_PRICE : 0),
      quantity,
      image_url: WREATH_KIT.image_url,
      add_pet_toy: petToy,
      pet_type: petToy ? petLabel : "",
    });
    navigate("/cart");
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="wreath-kit-page">
      <SEOHead
        title="Wreath Making Kits"
        description="A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions."
      />
      <div className="container mx-auto px-5 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          <WreathKitSlideshow images={WREATH_KIT.images} alt="Wreath making kit" />

          <div className="animate-fade-in-up delay-50">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 block">Christmas Kit</span>
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4">
              Wreath Making Kit
            </h1>
            <p className="text-base font-light text-[#6B7280] leading-[1.6] mb-6">
              A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions.
            </p>
            <p className="font-['Playfair_Display'] text-2xl text-[#2C2C2C] mb-8" data-testid="wreath-kit-price">
              £{WREATH_KIT.price.toFixed(2)}
            </p>

            <div className="bg-[#F2F0EB]/60 rounded-xl px-4 py-3 mb-4" data-testid="wreath-kit-pet-toy-toggle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PawPrint size={14} className="text-[#8DA399]" />
                  <span className="text-sm text-[#2C2C2C]">Add festive pet toy/treat</span>
                  <span className="text-xs text-[#6B7280]">+£{WREATH_PET_TOY_PRICE.toFixed(2)}</span>
                </div>
                <Switch checked={petToy} onCheckedChange={setPetToy} data-testid="wreath-kit-pet-toy-switch" />
              </div>
            </div>

            {petToy && (
              <div className="mb-6" data-testid="wreath-kit-pet-type-section">
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Your Pet</label>
                <div className="relative">
                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full appearance-none border border-[#E5E0D6] rounded-lg px-3 py-2.5 text-sm font-light text-[#2C2C2C] bg-white focus:outline-none focus:ring-1 focus:ring-[#8DA399] pr-8"
                    data-testid="wreath-kit-pet-type-select"
                  >
                    <option value="">Select pet...</option>
                    <option value="cat">Cat</option>
                    <option value="dog">Dog</option>
                    <option value="n/a">Petless</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                </div>
                {petType === "other" && (
                  <Input
                    type="text"
                    placeholder="Please specify..."
                    value={petTypeOther}
                    onChange={(e) => setPetTypeOther(e.target.value)}
                    className="mt-2 border-[#E5E0D6] text-sm"
                    data-testid="wreath-kit-pet-type-other-input"
                  />
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center border border-[#E5E0D6] rounded-full w-fit" data-testid="wreath-kit-quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[#F2F0EB] rounded-l-full transition-colors"
                  aria-label="Decrease quantity"
                  data-testid="wreath-kit-decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm text-[#2C2C2C]" data-testid="wreath-kit-quantity-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 hover:bg-[#F2F0EB] rounded-r-full transition-colors"
                  aria-label="Increase quantity"
                  data-testid="wreath-kit-increase"
                >
                  <Plus size={14} />
                </button>
              </div>
              <Button
                onClick={handleBuyNow}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 flex-1"
                data-testid="wreath-kit-buy-now-btn"
              >
                Buy Now <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 mt-4 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors"
              data-testid="wreath-kit-view-basket-link"
            >
              View basket <ArrowRight size={12} />
            </Link>

            <section className="mt-10 pt-10 border-t border-[#E5E0D6]" data-testid="wreath-kit-included">
              <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-5">What's Included</h2>
              <div className="space-y-4">
                {included.map(({ icon: Icon, title, items }) => (
                  <div key={title} className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-6 flex gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#8DA399]/15 flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.5} className="text-[#8DA399]" />
                    </div>
                    <div>
                      <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-2">{title}</h3>
                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="text-sm font-light text-[#6B7280] leading-[1.6] flex gap-2">
                            <span className="text-[#8DA399]" aria-hidden="true">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
