import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, AlertTriangle, PawPrint, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SIZES = [
  { id: "small", name: "Petite Posy", stems: "5-7 stems", price: 25.00 },
  { id: "medium", name: "Classic Bunch", stems: "10-12 stems", price: 38.00 },
  { id: "large", name: "Grand Bouquet", stems: "15-20 stems", price: 52.00 },
];

const PET_TYPES = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
];

const COMING_SOON = true;

export default function BouquetBuilder() {
  if (COMING_SOON) {
    return (
      <div className="py-20 sm:py-32 md:py-44" data-testid="bouquet-builder-page">
        <SEOHead title="Build Your Bouquet" description="Create a custom pet-safe bouquet. Coming soon." />
        <div className="container mx-auto px-5 md:px-8 max-w-xl text-center animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 block">Coming Soon</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-4">
            Build Your Bouquet
          </h1>
          <p className="text-sm sm:text-base font-light leading-relaxed text-[#6B7280] mb-8 max-w-md mx-auto">
            We're putting the finishing touches on our custom bouquet builder. Soon you'll be able to choose your size, pick your flowers, and tell us about your pet.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#F2F0EB] rounded-full px-6 py-3 text-xs uppercase tracking-widest font-semibold text-[#6B7280]">
            <AlertTriangle size={14} className="text-[#8DA399]" /> Launching Soon
          </div>
        </div>
      </div>
    );
  }

  return <BouquetBuilderFull />;
}

function BouquetBuilderFull() {
  const [step, setStep] = useState(1);
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToCart } = useCart();

  // Form state
  const [size, setSize] = useState("");
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [petType, setPetType] = useState("");
  const [petTypeOther, setPetTypeOther] = useState("");
  const [addPetToy, setAddPetToy] = useState(false);

  useEffect(() => {
    fetch(`${API}/bouquet/flowers`)
      .then((r) => r.json())
      .then((data) => { setFlowers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPrice = useMemo(() => {
    const sizePrice = SIZES.find((s) => s.id === size)?.price || 0;
    const flowerCost = selectedFlowers.reduce((sum, f) => sum + f.price * f.quantity, 0);
    return sizePrice + flowerCost + (addPetToy ? 8.99 : 0);
  }, [size, selectedFlowers, addPetToy]);

  const canProceed = () => {
    if (step === 1) return !!size;
    if (step === 2) return selectedFlowers.length > 0;
    if (step === 3) return !!petType && (petType !== "other" || petTypeOther.trim());
    return true;
  };

  const addFlower = (flowerId) => {
    const flower = flowers.find((f) => f.id === flowerId);
    if (!flower) return;
    setSelectedFlowers((prev) => {
      const ex = prev.find((f) => f.id === flowerId);
      if (ex) return prev.map((f) => f.id === flowerId ? { ...f, quantity: f.quantity + 1 } : f);
      return [...prev, { id: flower.id, name: flower.name, price: flower.price, quantity: 1 }];
    });
  };

  const removeFlower = (flowerId) => {
    setSelectedFlowers((prev) => {
      const ex = prev.find((f) => f.id === flowerId);
      if (ex && ex.quantity > 1) return prev.map((f) => f.id === flowerId ? { ...f, quantity: f.quantity - 1 } : f);
      return prev.filter((f) => f.id !== flowerId);
    });
  };

  const handleAddToCart = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/bouquet/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size, flowers: selectedFlowers, pet_type: petType,
          pet_type_other: petTypeOther, add_pet_toy: addPetToy,
        }),
      });
      const data = await res.json();
      addToCart({
        product_id: `bouquet_${data.id}`, name: "Custom Bouquet",
        price: data.total_price, quantity: 1, image_url: "",
      });
      toast.success("Custom bouquet added to cart!");
      setStep(1); setSize(""); setSelectedFlowers([]); setPetType(""); setPetTypeOther(""); setAddPetToy(false);
    } catch { toast.error("Failed to save bouquet."); }
    setSaving(false);
  };

  const grouped = useMemo(() => {
    const g = { flower: [], greenery: [], filler: [] };
    flowers.forEach((f) => { if (g[f.category]) g[f.category].push(f); });
    return g;
  }, [flowers]);

  return (
    <div className="py-6 sm:py-8 md:py-16" data-testid="bouquet-builder-page">
      <SEOHead title="Build Your Bouquet" description="Create a custom pet-safe bouquet. Choose size, flowers, and tell us about your pet." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Create</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#2C2C2C]">
            Build Your Bouquet
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12 animate-fade-in-up delay-100">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-colors ${
                step === s ? "bg-[#2C2C2C] text-[#FAF9F6]" : step > s ? "bg-[#8DA399] text-white" : "bg-[#E8E4D9] text-[#6B7280]"
              }`}>{step > s ? <Check size={14} /> : s}</div>
              {s < 4 && <div className={`w-6 sm:w-8 md:w-12 h-px ${step > s ? "bg-[#8DA399]" : "bg-[#E5E0D6]"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-6 md:p-10 animate-fade-in-up delay-200">
          {/* Step 1: Size */}
          {step === 1 && (
            <div data-testid="step-1-size">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">Select Bouquet Size</h2>
              <p className="text-sm font-light text-[#6B7280] mb-8">Choose the perfect size for your arrangement.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                      size === s.id ? "border-[#8DA399] bg-[#8DA399]/5" : "border-[#E5E0D6] hover:border-[#8DA399]/50"
                    }`}
                    data-testid={`size-${s.id}`}
                  >
                    <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-1">{s.name}</h3>
                    <p className="text-xs font-light text-[#6B7280] mb-2">{s.stems}</p>
                    <p className="text-xl font-light text-[#2C2C2C]">£{s.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Flowers */}
          {step === 2 && (
            <div data-testid="step-2-flowers">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">Choose Your Flowers</h2>
              <p className="text-sm font-light text-[#6B7280] mb-8">Select flowers to add to your bouquet.</p>
              {loading ? (
                <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[#F2F0EB] rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(grouped).map(([cat, items]) => items.length > 0 && (
                    <div key={cat}>
                      <h4 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-4 capitalize">{cat === "filler" ? "Fillers" : cat}</h4>
                      <div className="space-y-2">
                        {items.map((flower) => {
                          const sel = selectedFlowers.find((f) => f.id === flower.id);
                          const qty = sel ? sel.quantity : 0;
                          return (
                            <div key={flower.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0EB]/60 transition-colors">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#E5E0D6]">
                                <img src={flower.image_url} alt={flower.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#2C2C2C]">{flower.name}</p>
                                <p className="text-xs font-light text-[#6B7280]">£{flower.price.toFixed(2)}/stem</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {qty > 0 && (
                                  <>
                                    <button onClick={() => removeFlower(flower.id)} className="w-7 h-7 rounded-full border border-[#E5E0D6] flex items-center justify-center hover:bg-[#E8E4D9] transition-colors text-sm" data-testid={`flower-remove-${flower.id}`}>-</button>
                                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                  </>
                                )}
                                <button onClick={() => addFlower(flower.id)} className="w-7 h-7 rounded-full bg-[#8DA399] text-white flex items-center justify-center hover:bg-[#8DA399]/80 transition-colors text-sm" data-testid={`flower-add-${flower.id}`}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pet Type */}
          {step === 3 && (
            <div data-testid="step-3-pet">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">Tell Us About Your Pet</h2>
              <p className="text-sm font-light text-[#6B7280] mb-8">We'll adapt the bouquet to ensure maximum safety for your pet.</p>
              <div className="space-y-6">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-[#6B7280] mb-2 block">Pet Type</Label>
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger className="border-[#E5E0D6] py-5" data-testid="pet-type-select"><SelectValue placeholder="Select your pet type" /></SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {petType === "other" && (
                  <div className="animate-fade-in">
                    <Label className="text-xs uppercase tracking-widest text-[#6B7280] mb-2 block">Please specify</Label>
                    <Input value={petTypeOther} onChange={(e) => setPetTypeOther(e.target.value)} placeholder="e.g., Hamster, Bird, Guinea Pig" className="border-[#E5E0D6] py-5" data-testid="pet-type-other-input" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Add-ons & Review */}
          {step === 4 && (
            <div data-testid="step-4-review">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-2">Review & Add-ons</h2>
              <p className="text-sm font-light text-[#6B7280] mb-8">Review your bouquet and add optional extras.</p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Size: {SIZES.find((s) => s.id === size)?.name}</span>
                  <span className="text-[#2C2C2C]">£{SIZES.find((s) => s.id === size)?.price.toFixed(2)}</span>
                </div>
                {selectedFlowers.map((f) => (
                  <div key={f.id} className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">{f.name} x{f.quantity}</span>
                    <span className="text-[#2C2C2C]">£{(f.price * f.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Pet: {petType === "other" ? petTypeOther : petType}</span>
                </div>
              </div>

              {/* Pet Toy Add-on */}
              <div className="flex items-center justify-between bg-[#F2F0EB]/60 rounded-xl px-5 py-4 mb-8" data-testid="pet-toy-addon">
                <div className="flex items-center gap-3">
                  <PawPrint size={16} className="text-[#8DA399]" />
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">Add a pet toy</p>
                    <p className="text-xs font-light text-[#6B7280]">A safe plush toy for your furry friend (+£8.99)</p>
                  </div>
                </div>
                <Switch checked={addPetToy} onCheckedChange={setAddPetToy} />
              </div>

              {addPetToy && (
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-[#6B7280]">Pet toy</span>
                  <span className="text-[#2C2C2C]">£8.99</span>
                </div>
              )}

              <div className="border-t border-[#E5E0D6] pt-4 flex justify-between text-lg">
                <span className="font-medium text-[#2C2C2C]">Total</span>
                <span className="font-medium text-[#2C2C2C]" data-testid="bouquet-total">£{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="mt-8 p-4 bg-[#FFF8E7] border border-[#E8D9A8] rounded-xl flex items-start gap-3" data-testid="safety-notice">
            <AlertTriangle size={16} className="text-[#B8960C] mt-0.5 flex-shrink-0" />
            <p className="text-xs font-light text-[#7A6A0A] leading-relaxed">
              Your bouquet may not look exactly like the image shown. Flowers may vary based on availability and will be adapted to ensure they are safe for your pet.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E0D6]">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="text-[#6B7280] px-6 py-5"
              data-testid="step-prev"
            >
              <ArrowLeft size={14} className="mr-2" /> Back
            </Button>
            <div className="text-sm font-light text-[#6B7280]">Step {step} of 4</div>
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest"
                data-testid="step-next"
              >
                Next <ArrowRight size={14} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                disabled={saving}
                className="rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-5 text-xs uppercase tracking-widest transition-all hover:scale-105"
                data-testid="add-bouquet-to-cart"
              >
                <ShoppingBag size={14} className="mr-2" /> {saving ? "Saving..." : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
