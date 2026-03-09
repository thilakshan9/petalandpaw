import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");

    if (!sessionId) {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Determine login type from the current path
    const isAdmin = window.location.pathname.includes("/admin");
    const loginType = isAdmin ? "admin" : "customer";
    const redirectPath = isAdmin ? "/admin/dashboard" : "/account";

    const exchangeSession = async () => {
      try {
        const res = await fetch(`${API}/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId, login_type: loginType }),
        });

        if (!res.ok) throw new Error("Auth failed");

        const user = await res.json();
        window.history.replaceState(null, "", window.location.pathname);
        navigate(redirectPath, { replace: true, state: { user } });
      } catch {
        navigate(isAdmin ? "/admin/login" : "/login", { replace: true });
      }
    };

    exchangeSession();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Authenticating...</div>
    </div>
  );
}
