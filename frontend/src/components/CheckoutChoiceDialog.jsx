import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CheckoutChoiceDialog({ open, onOpenChange, onSignIn, onGuest }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="checkout-choice-dialog">
        <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">How would you like to checkout?</DialogTitle>
        <DialogDescription className="text-sm font-light text-[#6B7280]">
          Sign in to link this order to your account, or continue as a guest.
        </DialogDescription>
        <div className="mt-4 space-y-3">
          <Button
            onClick={onSignIn}
            className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full"
            data-testid="checkout-choice-signin"
          >
            Sign in <ArrowRight size={14} className="ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={onGuest}
            className="rounded-full border-[#2C2C2C] bg-transparent text-[#2C2C2C] hover:bg-[#F2F0EB] px-8 py-6 text-xs uppercase tracking-widest w-full"
            data-testid="checkout-choice-guest"
          >
            Continue as guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
