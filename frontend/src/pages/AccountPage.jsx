import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Gift, LogOut, Copy, Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ordersRes, refRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: "include" }),
          fetch(`${API}/account/orders`, { credentials: "include" }),
          fetch(`${API}/referral/code`, { credentials: "include" }),
        ]);
        if (!userRes.ok) { navigate("/login"); return; }
        setUser(await userRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (refRes.ok) setReferral(await refRes.json());
      } catch { navigate("/login"); }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  const copyReferralLink = () => {
    if (!referral?.code) return;
    const link = `${window.location.origin}/referral/${referral.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="account-page">
      <SEOHead title="My Account" description="View your order history and manage your account." />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C]">
              My Account
            </h1>
            {user && <p className="text-base font-light text-[#6B7280] mt-2">{user.email}</p>}
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-[#6B7280]" data-testid="account-logout-btn">
            <LogOut size={16} className="mr-1" /> Logout
          </Button>
        </div>

        {/* Referral Card */}
        {referral && (
          <div className="bg-[#8DA399]/8 border border-[#8DA399]/20 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up" data-testid="referral-section">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8DA399]/10 flex items-center justify-center flex-shrink-0">
                <Gift size={20} className="text-[#8DA399]" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-1">Give $10, Get $10</h3>
                <p className="text-sm font-light text-[#6B7280] mb-4">
                  Share your referral code with friends. When they make their first purchase, you both get $10 credit.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-white border border-[#E5E0D6] rounded-full px-5 py-2.5 font-mono text-sm tracking-widest font-semibold text-[#2C2C2C]" data-testid="referral-code">
                    {referral.code}
                  </div>
                  <Button onClick={copyReferralLink} variant="outline" className="rounded-full border-[#8DA399] text-[#8DA399] px-5 py-5 text-xs uppercase tracking-widest" data-testid="copy-referral-btn">
                    {copied ? <><Check size={12} className="mr-1" /> Copied</> : <><Copy size={12} className="mr-1" /> Copy Link</>}
                  </Button>
                </div>
                {referral.credits > 0 && (
                  <div className="flex items-center gap-2 mt-4 text-[#8DA399]">
                    <CreditCard size={14} />
                    <span className="text-sm font-semibold">Your credit: ${referral.credits.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="animate-fade-in-up delay-200">
          <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-6 flex items-center gap-2">
            <Package size={20} /> Order History
          </h2>
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#E5E0D6] rounded-2xl">
              <p className="text-[#6B7280] font-light mb-4">No orders yet.</p>
              <Link to="/shop">
                <Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest" data-testid="shop-now-btn">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white border border-[#E5E0D6] rounded-xl p-5" data-testid={`order-${o.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#6B7280]">#{o.id?.slice(0, 8)}</span>
                    <span className={`text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full ${
                      o.status === "complete" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
                    }`}>{o.status}</span>
                  </div>
                  <div className="space-y-1">
                    {o.items?.map((item, i) => (
                      <p key={i} className="text-sm text-[#4B5563]">{item.name} x{item.quantity}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E0D6]">
                    <span className="text-xs font-light text-[#6B7280]">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}
                    </span>
                    <span className="text-lg font-light text-[#2C2C2C]">${o.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
