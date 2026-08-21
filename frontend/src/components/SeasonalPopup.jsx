import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Ghost, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getActiveSeason, seasonConfig, burstBats, flurrySnow, HW, XMAS } from "@/lib/halloween";

export default function SeasonalPopup() {
  const navigate = useNavigate();

  const season = getActiveSeason();
  const cfg = seasonConfig(season);
  const isXmas = season === "christmas";
  const seasonActive = !!season;
  const seasonEffect = useCallback(() => (isXmas ? flurrySnow() : burstBats()), [isXmas]);
  const [seasonalPopup, setSeasonalPopup] = useState(false);

  useEffect(() => {
    if (!seasonActive) return;
    const key = "pp_seasonal_popup_ts";
    const last = localStorage.getItem(key);
    const now = Date.now();
    if (last && now - parseInt(last, 10) < 15 * 60 * 1000) return;
    const t = setTimeout(() => {
      setSeasonalPopup(true);
      localStorage.setItem(key, String(Date.now()));
      seasonEffect();
    }, 1200);
    return () => clearTimeout(t);
  }, [seasonActive, seasonEffect]);

  const goSeasonal = () => {
    setSeasonalPopup(false);
    seasonEffect();
    navigate("/seasonal");
  };

  if (!seasonActive) return null;

  return (
    <Dialog open={seasonalPopup} onOpenChange={setSeasonalPopup}>
      <DialogContent
        className="max-w-md rounded-2xl border-0 overflow-hidden text-center p-0"
        data-testid="seasonal-popup"
      >
        <div
          className="relative px-7 py-9"
          style={{ background: isXmas
            ? `radial-gradient(120% 120% at 50% -10%, ${XMAS.green} 0%, ${XMAS.greenDeep} 55%, ${XMAS.night} 100%)`
            : `radial-gradient(120% 120% at 50% -10%, ${HW.purple} 0%, ${HW.purpleDeep} 55%, ${HW.night} 100%)` }}
        >
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF9F6]/10 mb-4">
              {isXmas
                ? <TreePine size={30} strokeWidth={1.5} className="text-[#E3C77E] spooky-float" />
                : <Ghost size={30} strokeWidth={1.5} className="text-[#F3E4C8] spooky-float" />}
            </div>
            <DialogTitle className="font-['Playfair_Display'] text-2xl sm:text-3xl font-medium text-[#FAF9F6] mb-2 spooky-flicker">
              {cfg.popupTitle}
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-[#FAF9F6]/80 mb-6">
              {cfg.popupBlurb}
            </DialogDescription>
            <div className="flex flex-col gap-2">
              <Button
                onClick={goSeasonal}
                className="rounded-full text-[#241B2B] px-8 py-6 text-xs uppercase tracking-widest font-semibold w-full transition-all hover:scale-[1.02]"
                style={{ background: isXmas ? XMAS.goldSoft : "#D4956A" }}
                data-testid="seasonal-popup-enter-btn"
              >
                Enter the seasonal shop <ArrowRight size={14} className="ml-2" />
              </Button>
              <Button
                onClick={() => setSeasonalPopup(false)}
                variant="ghost"
                className="rounded-full px-6 py-4 text-xs uppercase tracking-widest w-full text-[#FAF9F6]/70 hover:text-[#FAF9F6] hover:bg-[#FAF9F6]/10"
                data-testid="seasonal-popup-dismiss-btn"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
