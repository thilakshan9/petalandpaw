import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, ShoppingBag, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const POSITIONS = [
  { x: 50, y: 15 },
  { x: 30, y: 22 }, { x: 70, y: 22 },
  { x: 15, y: 35 }, { x: 50, y: 30 }, { x: 85, y: 35 },
  { x: 25, y: 45 }, { x: 45, y: 42 }, { x: 65, y: 42 }, { x: 75, y: 48 },
  { x: 35, y: 52 }, { x: 55, y: 55 }, { x: 20, y: 55 }, { x: 80, y: 52 },
  { x: 40, y: 60 }, { x: 60, y: 58 },
];

export default function BouquetBuilder() {
  const [flowers, setFlowers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API}/bouquet/flowers`)
      .then((r) => r.json())
      .then((data) => { setFlowers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPrice = useMemo(
    () => selected.reduce((sum, s) => sum + s.price * s.quantity, 0),
    [selected]
  );

  const allFlowerInstances = useMemo(() => {
    const instances = [];
    selected.forEach((s) => {
      for (let i = 0; i < s.quantity; i++) {
        instances.push({ ...s, instanceIndex: i });
      }
    });
    return instances;
  }, [selected]);

  const addFlower = (flower) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.id === flower.id);
      if (existing) {
        return prev.map((s) => s.id === flower.id ? { ...s, quantity: s.quantity + 1 } : s);
      }
      return [...prev, { ...flower, quantity: 1 }];
    });
  };

  const removeFlower = (flowerId) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.id === flowerId);
      if (existing && existing.quantity > 1) {
        return prev.map((s) => s.id === flowerId ? { ...s, quantity: s.quantity - 1 } : s);
      }
      return prev.filter((s) => s.id !== flowerId);
    });
  };

  const clearAll = () => setSelected([]);

  const handleAddToCart = async () => {
    if (selected.length === 0) { toast.error("Add some flowers first!"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/bouquet/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowers: selected }),
      });
      const data = await res.json();
      addToCart({
        product_id: `bouquet_${data.id}`,
        name: "Custom Bouquet",
        price: data.total_price,
        quantity: 1,
        image_url: "",
      });
      toast.success("Custom bouquet added to cart!");
      setSelected([]);
    } catch {
      toast.error("Failed to save bouquet.");
    }
    setSaving(false);
  };

  const grouped = useMemo(() => {
    const g = { flower: [], greenery: [], filler: [] };
    flowers.forEach((f) => { if (g[f.category]) g[f.category].push(f); });
    return g;
  }, [flowers]);

  return (
    <div className="py-8 md:py-16" data-testid="bouquet-builder-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-3 block">Create</span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-medium tracking-tight text-[#2C2C2C]">
            Build Your Bouquet
          </h1>
          <p className="text-base md:text-lg font-light text-[#6B7280] mt-4 max-w-lg mx-auto">
            Select pet-safe flowers to design your perfect arrangement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-3 animate-fade-in-up delay-100">
            <div className="bouquet-canvas border border-[#E5E0D6] rounded-2xl relative overflow-hidden" style={{ minHeight: 480 }}>
              {/* Vase */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="vase-shape" />
              </div>

              {/* Flowers in arrangement */}
              {allFlowerInstances.map((inst, i) => {
                const pos = POSITIONS[i % POSITIONS.length];
                const rotation = ((i * 37 + inst.instanceIndex * 13) % 40) - 20;
                return (
                  <div
                    key={`${inst.id}-${inst.instanceIndex}`}
                    className="bouquet-flower-item absolute z-20"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-md animate-scale-in"
                      style={{ boxShadow: `0 2px 12px ${inst.color}40` }}
                    >
                      <img src={inst.image_url} alt={inst.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {selected.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B7280]/40">
                  <Sparkles size={32} strokeWidth={1} />
                  <p className="text-sm font-light mt-3">Select flowers to begin</p>
                </div>
              )}
            </div>

            {/* Summary bar */}
            <div className="mt-4 flex items-center justify-between bg-white border border-[#E5E0D6] rounded-xl px-6 py-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Your Bouquet</span>
                <p className="text-xl font-light text-[#2C2C2C] mt-0.5" data-testid="bouquet-total">${totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                {selected.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAll}
                    className="rounded-full border-[#E5E0D6] text-[#6B7280] px-5 py-5 text-xs uppercase tracking-widest"
                    data-testid="clear-bouquet"
                  >
                    <Trash2 size={12} className="mr-1" /> Clear
                  </Button>
                )}
                <Button
                  onClick={handleAddToCart}
                  disabled={saving || selected.length === 0}
                  className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest transition-all hover:scale-105"
                  data-testid="add-bouquet-to-cart"
                >
                  <ShoppingBag size={12} className="mr-2" /> {saving ? "Saving..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          {/* Flower Selection */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200">
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sticky top-24">
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-6">Select Flowers</h3>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F2F0EB] rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {Object.entries(grouped).map(([cat, items]) => (
                    items.length > 0 && (
                      <div key={cat}>
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-3 capitalize">{cat === "filler" ? "Fillers" : cat}</h4>
                        <div className="space-y-2">
                          {items.map((flower) => {
                            const sel = selected.find((s) => s.id === flower.id);
                            const qty = sel ? sel.quantity : 0;
                            return (
                              <div key={flower.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0EB]/60 transition-colors" data-testid={`flower-${flower.name.toLowerCase().replace(/\s/g, '-')}`}>
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#E5E0D6]">
                                  <img src={flower.image_url} alt={flower.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#2C2C2C] truncate">{flower.name}</p>
                                  <p className="text-xs font-light text-[#6B7280]">${flower.price.toFixed(2)}/stem</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {qty > 0 && (
                                    <>
                                      <button onClick={() => removeFlower(flower.id)} className="w-7 h-7 rounded-full border border-[#E5E0D6] flex items-center justify-center hover:bg-[#E8E4D9] transition-colors" data-testid={`remove-${flower.name.toLowerCase().replace(/\s/g, '-')}`}>
                                        <Minus size={12} />
                                      </button>
                                      <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                    </>
                                  )}
                                  <button onClick={() => addFlower(flower)} className="w-7 h-7 rounded-full bg-[#8DA399] text-white flex items-center justify-center hover:bg-[#8DA399]/80 transition-colors" data-testid={`add-${flower.name.toLowerCase().replace(/\s/g, '-')}`}>
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
