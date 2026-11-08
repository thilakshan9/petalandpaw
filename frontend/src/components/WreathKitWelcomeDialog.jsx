import { Snowflake } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function WreathKitWelcomeDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#FAF9F6] border-[#E5E0D6] rounded-2xl p-8 text-center" data-testid="wreath-kit-welcome-dialog">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#8DA399]/15 flex items-center justify-center mb-2">
          <Snowflake size={24} strokeWidth={1.5} className="text-[#8DA399]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8DA399]">Festive Season</span>
        <DialogHeader>
          <DialogTitle className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] leading-[1.2]">
            Christmas wreath making kits are here!
          </DialogTitle>
          <DialogDescription className="text-sm font-light text-[#6B7280] leading-[1.6]">
            A little festive creativity, delivered to your door. Create your own wreath with fresh foliage, decorations and easy step-by-step instructions.
          </DialogDescription>
        </DialogHeader>
        <p className="font-['Playfair_Display'] text-xl text-[#2C2C2C] mt-2">£50.00</p>
        <Button
          onClick={() => onOpenChange(false)}
          className="mt-4 w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-5 text-sm uppercase tracking-widest transition-all hover:scale-105"
          data-testid="wreath-kit-welcome-close-btn"
        >
          Explore the kit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
