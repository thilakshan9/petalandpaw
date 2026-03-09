import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // CRITICAL: Skip check if returning from OAuth
    if (window.location.hash?.includes('session_id=')) {
      setChecking(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (res.ok) {
          navigate("/admin/dashboard", { replace: true });
          return;
        }
      } catch {}
      setChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/admin/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Checking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-sm text-center animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf size={24} strokeWidth={1.5} className="text-[#8DA399]" />
          <span className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C]">Petal & Paw</span>
        </div>
        <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-2">Admin Dashboard</h1>
        <p className="text-sm font-light text-[#6B7280] mb-8">Sign in to manage your store</p>
        <Button
          onClick={handleLogin}
          className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-6 text-sm uppercase tracking-widest transition-all hover:scale-105 w-full"
          data-testid="google-login-btn"
        >
          Sign in with Google
        </Button>
        <p className="text-xs font-light text-[#6B7280] mt-6">Protected area. Authorized personnel only.</p>
      </div>
    </div>
  );
}
