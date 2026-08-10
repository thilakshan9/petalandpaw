// Halloween / seasonal helpers for Petal & Paw

// Palette that harmonises with the existing muted site colours
// (soft plum bridging the mauve #C4A2B0, plus the existing tan/pumpkin tones).
export const HW = {
  purple: "#6B4E71",
  purpleDeep: "#4A3550",
  purpleTint: "rgba(107,78,113,0.08)",
  purpleBorder: "rgba(107,78,113,0.35)",
  pumpkin: "#C97B3C",
  pumpkinSoft: "#D4956A",
  night: "#241B2B",
};

// Preview toggle: append ?spooky=1 to force the theme on (or ?spooky=0 to force it
// off) so it can be previewed outside October. The choice is remembered for the session.
function readPreviewFlag() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("spooky")) {
      const v = params.get("spooky");
      if (v === "0" || v === "false") { sessionStorage.removeItem("pp_spooky"); return false; }
      sessionStorage.setItem("pp_spooky", "1");
      return true;
    }
    return sessionStorage.getItem("pp_spooky") === "1";
  } catch { return false; }
}

// Active during October (month index 9), or whenever the preview flag is set.
export function isHalloweenActive() {
  if (readPreviewFlag()) return true;
  return new Date().getMonth() === 9;
}

// Detect an October date string like "9 October 2026" / "10th October 2026".
export function isOctoberDate(str = "") {
  return /\boct(ober)?\b/i.test(str);
}

// October window for the current (or upcoming) year, for the bouquet delivery picker.
export function octoberRange() {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() > 9) year += 1; // past October -> target next year
  return { min: `${year}-10-01`, max: `${year}-10-31`, year };
}

// Halloween bouquet sizes (prices confirmed by the shop owner).
export const HW_BOUQUET_IMAGE = "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800";
export const HW_BOUQUET_SIZES = [
  { id: "small", label: "Small", price: 24.99, blurb: "A petite posy — 5-7 stems" },
  { id: "medium", label: "Medium", price: 54.99, blurb: "A classic bunch — 10-12 stems" },
  { id: "large", label: "Large", price: 74.99, blurb: "A grand statement — 15-20 stems" },
];

// Fire a swarm of bats across the screen.
export function burstBats() {
  try { window.dispatchEvent(new Event("pp-bats-burst")); } catch { /* noop */ }
}
