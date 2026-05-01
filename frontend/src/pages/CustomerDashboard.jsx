import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomerDashboard() {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !customer) {
      navigate("/login");
      return;
    }
    if (customer) {
      fetch(`${API}/customer/orders`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : { transactions: [], subscriptions: [] })
        .then((data) => {
          setOrders(data.transactions || []);
          setSubscriptions(data.subscriptions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [customer, authLoading, navigate]);

  const handleCancel = async (subId) => {
    setCancelling(subId);
    try {
      const res = await fetch(`${API}/customer/cancel-subscription/${subId}`, {
        method: "POST", credentials: "include"
      });
      if (res.ok) {
        toast.success("Subscription will cancel at end of billing period");
        setSubscriptions(subs => subs.map(s => s.id === subId ? { ...s, cancel_at_period_end: true } : s));
      } else {
        toast.error("Could not cancel subscription");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setCancelling(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Signed out");
  };

  if (authLoading || (!customer && authLoading)) {
    return <div className="py-20 text-center text-[#6B7280]">Loading...</div>;
  }

  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="customer-dashboard">
      <SEOHead title="My Account" />
      <div className="container mx-auto px-5 md:px-8 max-w-4xl">

        <div className="flex items-center justify-between mb-8 sm:mb-12 animate-fade-in-up">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-1 block">My Account</span>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-4xl font-medium tracking-tight text-[#2C2C2C]">
              Hello, {customer?.name || "there"}
            </h1>
            <p className="text-sm font-light text-[#6B7280] mt-1">{customer?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-full border-[#E5E0D6] text-[#6B7280] hover:text-[#2C2C2C] px-4 py-2 text-xs uppercase tracking-widest"
            data-testid="logout-btn"
          >
            <LogOut size={14} className="mr-2" /> Sign Out
          </Button>
        </div>

        {/* Subscriptions */}
        <div className="mb-10 animate-fade-in-up delay-100">
          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-4">Subscriptions</h2>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-[#F2F0EB] rounded-xl animate-pulse" />)}</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 text-center">
              <p className="text-sm font-light text-[#6B7280]">No active subscriptions yet.</p>
              <Button onClick={() => navigate("/subscriptions")} className="mt-4 rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-6 py-4 text-xs uppercase tracking-widest" data-testid="browse-plans-btn">
                Browse Plans
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid={`sub-${sub.id}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw size={14} className="text-[#8DA399]" />
                      <span className="text-sm font-medium text-[#2C2C2C]">{sub.plan_name}</span>
                      <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                        sub.status === "active" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
                      }`}>{sub.status}</span>
                    </div>
                    <p className="text-sm font-light text-[#6B7280]">
                      £{sub.amount?.toFixed(2)}/month
                      {sub.current_period_end && ` - Next billing: ${new Date(sub.current_period_end * 1000).toLocaleDateString('en-GB')}`}
                    </p>
                    {sub.cancel_at_period_end && (
                      <p className="text-xs text-red-400 mt-1">Cancels at end of current period</p>
                    )}
                  </div>
                  {sub.status === "active" && !sub.cancel_at_period_end && (
                    <Button
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancelling === sub.id}
                      variant="outline"
                      className="rounded-full border-red-200 text-red-400 hover:bg-red-50 px-4 py-2 text-xs uppercase tracking-widest flex-shrink-0"
                      data-testid={`cancel-sub-${sub.id}`}
                    >
                      <XCircle size={14} className="mr-1" /> {cancelling === sub.id ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Orders */}
        <div className="animate-fade-in-up delay-200">
          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-4">Past Orders</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#F2F0EB] rounded-xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 text-center">
              <p className="text-sm font-light text-[#6B7280]">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#E5E0D6] rounded-xl p-4 sm:p-5" data-testid={`order-${order.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#8DA399]" />
                      <span className="text-sm font-medium text-[#2C2C2C]">
                        {order.metadata?.plan_name || "Order"}
                      </span>
                      <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                        order.payment_status === "paid" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
                      }`}>{order.payment_status}</span>
                      {order.metadata?.type && (
                        <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-500">{order.metadata.type}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#2C2C2C]">£{order.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-[#6B7280]">
                    {order.metadata?.pet_type && <span>Pet: {order.metadata.pet_type}</span>}
                    {order.metadata?.add_pet_toy === "True" && <span className="text-[#8DA399]">Pet toy included</span>}
                    {order.metadata?.personalized_message && <span>Gift note attached</span>}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
