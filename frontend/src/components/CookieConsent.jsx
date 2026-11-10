import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getCookieConsent,
  saveCookieConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
} from "@/lib/cookieConsent";

const OPTIONAL_CATEGORIES = [
  {
    key: "analytics",
    id: "cookie-analytics",
    label: "Analytics",
    description: "Helps us understand how the site is used so we can improve it. We do not currently run analytics cookies.",
  },
  {
    key: "marketing",
    id: "cookie-marketing",
    label: "Marketing",
    description: "Used to show you relevant offers. We do not currently run marketing cookies.",
  },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !getCookieConsent());
  const [customising, setCustomising] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const openSettings = () => {
      const current = getCookieConsent() || {};
      setDraft({ analytics: !!current.analytics, marketing: !!current.marketing });
      setCustomising(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const finish = (choices) => {
    saveCookieConsent(choices);
    setVisible(false);
    setCustomising(false);
  };

  const openCustomise = () => {
    setDraft({ analytics: false, marketing: false });
    setCustomising(true);
  };

  return (
    <>
      {visible && !customising && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[70] bg-white border border-[#E5E0D6] rounded-2xl shadow-xl p-5 sm:p-6 animate-fade-in-up"
          data-testid="cookie-banner"
        >
          <h2 className="font-['Playfair_Display'] text-lg font-medium text-[#2C2C2C] mb-2">We value your privacy</h2>
          <p className="text-sm font-light leading-relaxed text-[#4B5563] mb-5">
            We use essential cookies to keep your basket and login working. You can choose whether to allow any optional cookies. See our{" "}
            <Link to="/privacy" className="text-[#2C6E5A] underline underline-offset-2 hover:text-[#1F4F40]">privacy policy</Link> for details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => finish({})}
              className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#F2F0EB] px-5 py-5 text-xs uppercase tracking-widest font-semibold"
              data-testid="cookie-reject-all"
            >
              Reject all
            </Button>
            <Button
              variant="outline"
              onClick={openCustomise}
              className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#F2F0EB] px-5 py-5 text-xs uppercase tracking-widest font-semibold"
              data-testid="cookie-customise"
            >
              Customise
            </Button>
            <Button
              onClick={() => finish({ analytics: true, marketing: true })}
              className="rounded-full bg-[#2C2C2C] text-white hover:bg-[#2C2C2C]/90 px-5 py-5 text-xs uppercase tracking-widest font-semibold"
              data-testid="cookie-accept-all"
            >
              Accept all
            </Button>
          </div>
        </div>
      )}

      <Dialog open={customising} onOpenChange={setCustomising}>
        <DialogContent className="bg-white max-w-md" data-testid="cookie-settings-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C]">Cookie settings</DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280]">
              Choose which cookies you are happy for us to use.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="cookie-necessary-label" className="text-sm font-medium text-[#2C2C2C]">Strictly necessary</p>
                <p className="text-sm font-light text-[#6B7280]">Keeps your basket, login and security working. Always on.</p>
              </div>
              <Switch checked disabled aria-labelledby="cookie-necessary-label" />
            </div>

            {OPTIONAL_CATEGORIES.map((category) => (
              <div key={category.key} className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor={category.id} className="text-sm font-medium text-[#2C2C2C]">{category.label}</label>
                  <p className="text-sm font-light text-[#6B7280]">{category.description}</p>
                </div>
                <Switch
                  id={category.id}
                  checked={draft[category.key]}
                  onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, [category.key]: checked }))}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => finish({})}
              className="rounded-full border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#F2F0EB] px-5 py-5 text-xs uppercase tracking-widest font-semibold"
              data-testid="cookie-reject-all-settings"
            >
              Reject all
            </Button>
            <Button
              onClick={() => finish(draft)}
              className="rounded-full bg-[#2C2C2C] text-white hover:bg-[#2C2C2C]/90 px-5 py-5 text-xs uppercase tracking-widest font-semibold"
              data-testid="cookie-save-settings"
            >
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
