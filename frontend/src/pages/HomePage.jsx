import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Leaf, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/products?featured=true`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-6 block">
                Pet-Safe Florals
              </span>
              <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-medium tracking-tight leading-tight text-[#2C2C2C] mb-6">
                Flowers Your Pets Will Love Too
              </h1>
              <p className="text-lg md:text-xl font-light leading-relaxed text-[#6B7280] mb-8 max-w-md">
                Hand-crafted arrangements using only pet-safe blooms. Scandinavian simplicity meets conscious living.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105" data-testid="hero-shop-btn">
                    Shop Now <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/bouquet-builder">
                  <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FAF9F6] px-8 py-6 text-sm uppercase tracking-widest transition-all" data-testid="hero-builder-btn">
                    Build Your Own
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-in-up delay-200 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1510771463146-e89e6e86560e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxkb2clMjBzbmlmZmluZyUyMGZsb3dlcnMlMjBnZW50bGUlMjBhZXN0aGV0aWN8ZW58MHx8fHwxNzczMDg1MDgyfDA&ixlib=rb-4.1.0&q=85"
                  alt="Dog with pet-safe flowers"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] animate-scale-in delay-500">
                <div className="flex items-center gap-2 text-[#8DA399]">
                  <ShieldCheck size={18} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-widest font-semibold">Verified Pet Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Bar */}
      <section className="bg-[#E8E4D9]/40 py-8 md:py-10" data-testid="promise-section">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: ShieldCheck, title: "100% Pet Safe", desc: "Every bloom verified non-toxic" },
              { icon: Leaf, title: "Sustainably Sourced", desc: "Eco-friendly from farm to door" },
              { icon: Truck, title: "Free Delivery", desc: "On orders over $50" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#8DA399]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} strokeWidth={1.5} className="text-[#8DA399]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2C2C2C]">{title}</h3>
                  <p className="text-xs font-light text-[#6B7280]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32" data-testid="featured-products">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-3 block">Curated</span>
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C]">
                Featured Blooms
              </h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="view-all-products">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <Link to="/shop" className="md:hidden flex items-center justify-center gap-2 mt-10 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors" data-testid="view-all-products-mobile">
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 md:py-32 bg-white" data-testid="brand-story">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1548724582-1216ec5351ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwzfHxjYXQlMjBzbGVlcGluZyUyMG5lYXIlMjB2YXNlJTIwb2YlMjBmbG93ZXJzJTIwc2FmZXxlbnwwfHx8fDE3NzMwODUwODR8MA&ixlib=rb-4.1.0&q=85"
                alt="Cat sleeping near pet-safe flowers"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-4 block">Our Story</span>
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-6">
                Born From Love & Care
              </h2>
              <p className="text-base font-light leading-relaxed text-[#6B7280] mb-4">
                Petal & Paw was created when our founder discovered her beloved cat had been poisoned by a common household flower. That moment changed everything.
              </p>
              <p className="text-base font-light leading-relaxed text-[#6B7280] mb-8">
                Today, every arrangement we create is verified safe for cats, dogs, and all household pets. We believe beauty and safety should never be a compromise.
              </p>
              <Link to="/blog">
                <Button variant="outline" className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FAF9F6] px-8 py-6 text-sm uppercase tracking-widest transition-all" data-testid="read-journal-btn">
                  Read Our Journal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32" data-testid="cta-section">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-4 block">Get Creative</span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-6 max-w-2xl mx-auto">
            Design Your Perfect Bouquet
          </h2>
          <p className="text-base md:text-lg font-light text-[#6B7280] mb-8 max-w-lg mx-auto">
            Choose from our selection of pet-safe flowers and create a one-of-a-kind arrangement.
          </p>
          <Link to="/bouquet-builder">
            <Button className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-10 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105" data-testid="cta-builder-btn">
              Start Building <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
