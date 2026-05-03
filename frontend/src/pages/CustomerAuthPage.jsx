import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomerAuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "login";
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
        const pending = localStorage.getItem("pp_pending_checkout");
        navigate(pending ? "/subscriptions" : "/account");
      } else if (mode === "register") {
        await register(name, email, password);
        toast.success("Account created!");
        const pending = localStorage.getItem("pp_pending_checkout");
        navigate(pending ? "/subscriptions" : "/account");
      } else if (mode === "forgot") {
        const res = await fetch(`${API}/customer/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, origin_url: window.location.origin }),
        });
        const data = await res.json();
        toast.success(data.message || "Check your email for a reset link");
        setMode("login");
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="customer-auth-page">
      <SEOHead title={mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password"} />
      <div className="container mx-auto px-5 md:px-8 max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2C2C] mb-2">
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Forgot Password"}
          </h1>
          <p className="text-sm font-light text-[#6B7280]">
            {mode === "login" ? "Sign in to view your orders and subscriptions" : mode === "register" ? "Join Petal & Paw to track your orders" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 sm:p-8 animate-fade-in-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="border-[#E5E0D6] text-sm py-5" data-testid="auth-name" />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="border-[#E5E0D6] text-sm py-5" data-testid="auth-email" autoFocus />
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "register" ? "Min 6 characters" : "Your password"} className="border-[#E5E0D6] text-sm py-5" data-testid="auth-password" />
              </div>
            )}
            <Button type="submit" disabled={loading} className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-xs uppercase tracking-widest w-full transition-all hover:scale-105" data-testid="auth-submit">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"} <ArrowRight size={14} className="ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <>
                <p className="text-sm font-light text-[#6B7280]">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("register")} className="text-[#8DA399] hover:underline font-medium" data-testid="switch-to-register">Create one</button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-sm font-light text-[#6B7280]">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-[#8DA399] hover:underline font-medium" data-testid="switch-to-login">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <p className="text-sm font-light text-[#6B7280]">
                <button onClick={() => setMode("login")} className="text-[#8DA399] hover:underline font-medium inline-flex items-center gap-1" data-testid="back-to-login">
                  <ArrowLeft size={12} /> Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
