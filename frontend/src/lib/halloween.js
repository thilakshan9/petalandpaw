// Seasonal engine for Petal & Paw (Halloween in October, Christmas in December).
// The file keeps its original name/exports for backward compatibility.

// ---- Palettes (all harmonise with the muted site colours) ----
export const HW = {
  purple: "#6B4E71",
  purpleDeep: "#4A3550",
  purpleTint: "rgba(107,78,113,0.08)",
  purpleBorder: "rgba(107,78,113,0.35)",
  pumpkin: "#C97B3C",
  pumpkinSoft: "#D4956A",
  night: "#241B2B",
};

export const XMAS = {
  green: "#2E5D3F",
  greenDeep: "#1E3D2A",
  greenTint: "rgba(46,93,63,0.08)",
  greenBorder: "rgba(46,93,63,0.35)",
  gold: "#C9A24B",
  goldSoft: "#E3C77E",
  red: "#8C2F2F",
  night: "#122019",
};

// ---- Preview toggles ----
// ?spooky=1 -> halloween, ?festive=1 -> christmas, ?season=halloween|christmas|off,
// ?spooky=0 / ?festive=0 / ?season=off -> clear. Remembered for the session.
function readPreview() {
  try {
    const p = new URLSearchParams(window.location.search);
    const off = (v) => v === "0" || v === "false" || v === "off" || v === "none";
    if (p.has("season")) {
      const v = (p.get("season") || "").toLowerCase();
      if (off(v)) { sessionStorage.removeItem("pp_season"); return null; }
      if (v === "halloween" || v === "spooky") { sessionStorage.setItem("pp_season", "halloween"); return "halloween"; }
      if (v === "christmas" || v === "xmas" || v === "festive") { sessionStorage.setItem("pp_season", "christmas"); return "christmas"; }
    }
    if (p.has("spooky")) {
      if (off(p.get("spooky"))) { sessionStorage.removeItem("pp_season"); return null; }
      sessionStorage.setItem("pp_season", "halloween"); return "halloween";
    }
    if (p.has("festive")) {
      if (off(p.get("festive"))) { sessionStorage.removeItem("pp_season"); return null; }
      sessionStorage.setItem("pp_season", "christmas"); return "christmas";
    }
    return sessionStorage.getItem("pp_season") || null;
  } catch { return null; }
}

// Returns "halloween" | "christmas" | null
//
// MANUAL OVERRIDE: set FORCE_SEASON to keep a season permanently on regardless
// of the month. Set it back to null to restore automatic behaviour
// (Halloween in October, Christmas in December). Preview params still win.
const FORCE_SEASON = "halloween"; // "halloween" | "christmas" | null

export function getActiveSeason() {
  const preview = readPreview();
  if (preview) return preview;
  if (FORCE_SEASON) return FORCE_SEASON;
  const m = new Date().getMonth();
  if (m === 9) return "halloween"; // October
  if (m === 11) return "christmas"; // December
  return null;
}

export function isHalloweenActive() { return getActiveSeason() === "halloween"; }
export function isChristmasActive() { return getActiveSeason() === "christmas"; }
export function isSeasonActive() { return getActiveSeason() !== null; }

// Per-season display config used across nav, banners, popups.
export function seasonConfig(season = getActiveSeason()) {
  if (season === "christmas") {
    return {
      season: "christmas",
      emoji: "🎄",
      label: "Seasonal",
      linkColor: "#2E5D3F",
      palette: XMAS,
      tagEmoji: "🎄",
      tagLabel: "Christmas",
      themeAddLabel: "Make it Christmas themed",
      bannerKicker: "Festive Season",
      bannerTitle: "Christmas has arrived at Petal & Paw",
      bannerBlurb: "Order a fresh, pet-safe Christmas wreath for any day in December, and explore our festive workshops.",
      heroKicker: "Petal & Paw at Christmas",
      heroTitle: "A Very Merry, Pet-Safe Christmas",
      heroBlurb: "Fresh evergreen wreaths and festive blooms, always pet-safe. Order for any day in December and join our Christmas workshops.",
      popupTitle: "Something festive is in bloom",
      popupBlurb: "Step into our seasonal shop for pet-safe Christmas wreaths and December's festive workshops.",
      collectionKicker: "Order Now",
      collectionTitle: "The Christmas Wreath Collection",
      collectionBlurb: "Fresh, hand-tied evergreen wreaths for your door or table, with pet-safe foliage throughout. Choose your favourite and the December day you\u2019d like it delivered.",
    };
  }
  // default halloween
  return {
    season: "halloween",
    emoji: "🎃",
    label: "Seasonal",
    linkColor: "#6B4E71",
    palette: HW,
    tagEmoji: "🎃",
    tagLabel: "Halloween",
    themeAddLabel: "Make it Halloween themed",
    bannerKicker: "Spooky Season",
    bannerTitle: "Halloween has landed at Petal & Paw",
    bannerBlurb: "Preorder a pet-safe Halloween bouquet for any day in October, and explore our spooky-season workshops.",
    heroKicker: "Petal & Paw After Dark",
    heroTitle: "A Spooky Season in Bloom",
    heroBlurb: "Deliciously dark, always pet-safe. Preorder a Halloween bouquet for any day in October and join our spooky-season workshops.",
    popupTitle: "Something spooky this way blooms",
    popupBlurb: "Step into our seasonal shop for pet-safe Halloween bouquets and October's spooky workshops.",
    collectionKicker: "Preorder Now",
    collectionTitle: "The Halloween Bouquet",
    collectionBlurb: "A haunting arrangement of pet-safe autumnal blooms in deep plums, burnt oranges and inky tones, delicately tangled with spooky spiderwebs for a beautifully eerie finish. Choose your size and the October day you’d like your Halloween bouquet to arrive.",
  };
}

// ---- Date helpers ----
export function isOctoberDate(str = "") { return /\boct(ober)?\b/i.test(str); }
export function isDecemberDate(str = "") { return /\bdec(ember)?\b/i.test(str); }
export function isSeasonDate(str = "", season = getActiveSeason()) {
  if (season === "christmas") return isDecemberDate(str);
  if (season === "halloween") return isOctoberDate(str);
  return false;
}

function monthRange(monthIndex) {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() > monthIndex) year += 1; // past target month -> next year
  const mm = String(monthIndex + 1).padStart(2, "0");
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return { min: `${year}-${mm}-01`, max: `${year}-${mm}-${lastDay}`, year };
}
export function octoberRange() { return monthRange(9); }
export function decemberRange() { return monthRange(11); }
export function seasonRange(season = getActiveSeason()) {
  return season === "christmas" ? decemberRange() : octoberRange();
}

// ---- Halloween bouquet (sizes) ----
export const HW_BOUQUET_IMAGE = "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800";
export const HW_BOUQUET_SIZES = [
  { id: "small", label: "Pocket Spell", price: 24.99, blurb: "A petite posy, 5-7 stems" },
  { id: "medium", label: "Coven's Crown", price: 54.99, blurb: "A classic bunch, 10-12 stems" },
  { id: "large", label: "Witching Hour", price: 74.99, blurb: "A grand statement, 15-20 stems" },
];

// ---- Christmas wreath collection (fixed IDs match backend-seeded products) ----
export const XMAS_WREATHS = [
  { id: "christmas-wreath-classic", name: "Classic Fir Wreath", price: 39.99,
    blurb: "Timeless fresh fir, simply finished.",
    image: "https://images.unsplash.com/photo-1638644686388-f4cfc968bc02?w=800" },
  { id: "christmas-wreath-luxe", name: "Golden Pinecone Wreath", price: 59.99,
    blurb: "Lush evergreen with pinecones & soft gold.",
    image: "https://images.unsplash.com/photo-1639334317586-ced6c3ce407a?w=800" },
  { id: "christmas-wreath-grand", name: "Grand Winter Wreath", price: 79.99,
    blurb: "Our most generous statement wreath.",
    image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800" },
];

// ---- Effects ----
export function burstBats() {
  try { window.dispatchEvent(new Event("pp-bats-burst")); } catch { /* noop */ }
}
export function flurrySnow() {
  try { window.dispatchEvent(new Event("pp-snow-flurry")); } catch { /* noop */ }
}
