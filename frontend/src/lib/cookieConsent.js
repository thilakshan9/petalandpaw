export const CONSENT_KEY = "pp_cookie_consent";
export const CONSENT_CHANGE_EVENT = "pp-cookie-consent-change";
export const OPEN_COOKIE_SETTINGS_EVENT = "pp-open-cookie-settings";

export function getCookieConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

export function saveCookieConsent({ analytics = false, marketing = false }) {
  const record = { necessary: true, analytics, marketing, savedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  return record;
}
