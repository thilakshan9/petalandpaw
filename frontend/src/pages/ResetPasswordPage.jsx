import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/customer/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[#6B7280]">Invalid reset link.</p>
        <Button onClick={() => navigate("/login")} className="mt-4 rounded-full bg-[#2C2C2C] text-[#FAF9F6] px-6 py-4 text-xs uppercase tracking-widest">
          Back to Sign In
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="py-8 sm:py-12 md:py-20" data-testid="reset-success">
        <div className="container mx-auto px-5 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#8DA399]/10 flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-[#8DA399]" />
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-3">Password Reset</h1>
          <p className="text-sm font-light text-[#6B7280] mb-6">Your password has been updated. You can now sign in with your new password.</p>
          <Button onClick={() => navigate("/login")} className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest transition-all hover:scale-105" data-testid="go-to-login">
            Sign In <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="reset-password-page">
      <SEOHead title="Reset Password" />
      <div className="container mx-auto px-5 md:px-8 max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2C2C] mb-2">
            Set New Password
          </h1>
          <p className="text-sm font-light text-[#6B7280]">Enter your new password below.</p>
        </div>

        <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 animate-fade-in-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">New Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="border-[#E5E0D6] text-sm py-5" data-testid="new-password" autoFocus />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Confirm Password</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" className="border-[#E5E0D6] text-sm py-5" data-testid="confirm-password" />
            </div>
            <Button type="submit" disabled={loading} className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-105" data-testid="reset-submit">
              {loading ? "Please wait..." : "Reset Password"} <ArrowRight size={14} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
