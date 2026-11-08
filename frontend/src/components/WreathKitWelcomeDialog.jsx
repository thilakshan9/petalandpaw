import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function WreathKitWelcomeDialog({ open, onOpenChange }) {
  const navigate = useNavigate();

  const handleCheckItOut = () => {
    onOpenChange(false);
    navigate("/wreath-kit");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 bg-[#1F1F1F] text-white [&>button]:text-white [&>button]:z-20"
        data-testid="wreath-kit-welcome-dialog"
      >
        <img
          src="/images/wreath-kit.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/60 to-[#1F1F1F]/10" />

        <div className="relative z-10 flex flex-col gap-4 p-8 sm:p-10 min-h-[460px] justify-end animate-fade-in-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-semibold text-white">
            <Sparkles size={12} className="animate-pulse text-[#F5E6B8]" />
            Festive Season
          </span>

          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="font-['Playfair_Display'] text-3xl sm:text-4xl font-medium text-white leading-[1.2]">
              Christmas wreath kits are here
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-light text-white/90 leading-[1.6]">
              A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="font-['Playfair_Display'] text-2xl text-white">£50.00</p>
            <Button
              onClick={handleCheckItOut}
              className="group rounded-full bg-white text-[#2C2C2C] hover:bg-[#F2F0EB] px-6 py-5 text-sm uppercase tracking-widest font-semibold transition-all hover:scale-105"
              data-testid="wreath-kit-welcome-close-btn"
            >
              Let's check this out
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
