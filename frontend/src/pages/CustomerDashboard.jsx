import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, RefreshCw, Circle as XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCustomerAuth, authHeaders } from "@/context/CustomerAuthContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomerDashboard() {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelInput, setCancelInput] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !customer) {
      navigate("/login");
      return;
    }
    if (customer) {
      fetch(`${API}/customer/orders`, { headers: authHeaders() })
        .then((r) => r.ok ? r.json() : { transactions: [], subscriptions: [] })
        .then((data) => {
          setOrders(data.transactions || []);
          setSubscriptions(data.subscriptions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [customer, authLoading, navigate]);

  const handleCancelConfirm = async () => {
    if (cancelInput.trim().toUpperCase() !== "CANCEL") {
      toast.error("Please type CANCEL to confirm");
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch(`${API}/customer/cancel-subscription/${cancelDialog}`, {
        method: "POST", headers: authHeaders()
      });
      if (res.ok) {
        toast.success("Subscription will cancel at end of billing period");
        setSubscriptions(subs => subs.map(s => s.id === cancelDialog ? { ...s, cancel_at_period_end: true } : s));
        setCancelDialog(null);
        setCancelInput("");
      } else {
        toast.error("Could not cancel subscription");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setCancelling(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Signed out");
  };

  if (authLoading) {
    return <div className="py-20 text-center text-[#6B7280]">Loading...</div>;
  }

  const hasActiveSub = subscriptions.some(s => s.status === "active" && !s.cancel_at_period_end);

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

        {/* Subscriber Status Banner */}
        <div className="mb-8 animate-fade-in-up delay-50">
          {loading ? (
            <div className="h-16 bg-[#F2F0EB] rounded-2xl animate-pulse" />
          ) : hasActiveSub ? (
            <div className="bg-[#8DA399]/10 border border-[#8DA399]/20 rounded-2xl p-5 flex items-center gap-3" data-testid="subscriber-badge">
              <div className="w-10 h-10 rounded-full bg-[#8DA399]/20 flex items-center justify-center flex-shrink-0">
                <Check size={18} className="text-[#8DA399]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2C2C2C]">Active Subscriber</p>
                <p className="text-xs font-light text-[#6B7280]">You have an active subscription. Thank you for your support!</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#F2F0EB] border border-[#E5E0D6] rounded-2xl p-5 flex items-center gap-3" data-testid="non-subscriber-badge">
              <div className="w-10 h-10 rounded-full bg-[#E5E0D6] flex items-center justify-center flex-shrink-0">
                <RefreshCw size={18} className="text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2C2C2C]">Not Currently Subscribed</p>
                <p className="text-xs font-light text-[#6B7280]">Subscribe for fresh, pet-safe flowers delivered to your door every month.</p>
              </div>
              <Button onClick={() => navigate("/subscriptions")} className="ml-auto rounded-full bg-[#8DA399] text-white hover:bg-[#8DA399]/90 px-5 py-2 text-xs uppercase tracking-widest flex-shrink-0" data-testid="subscribe-cta">
                Subscribe
              </Button>
            </div>
          )}
        </div>

        {/* Subscriptions */}
        <div className="mb-10 animate-fade-in-up delay-100">
          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-4">Subscriptions</h2>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-[#F2F0EB] rounded-xl animate-pulse" />)}</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 text-center">
              <p className="text-sm font-light text-[#6B7280]">No subscriptions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white border border-[#E5E0D6] rounded-2xl p-5 sm:p-6" data-testid={`sub-${sub.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw size={14} className="text-[#8DA399]" />
                        <span className="text-base font-medium text-[#2C2C2C]">{sub.plan_name}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                          sub.status === "active" ? "bg-[#8DA399]/10 text-[#8DA399]" : sub.status === "canceled" ? "bg-red-50 text-red-400" : "bg-[#E8E4D9] text-[#6B7280]"
                        }`}>{sub.status}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-light text-[#6B7280]">
                          Paying <span className="font-medium text-[#2C2C2C]">£{sub.amount?.toFixed(2)}</span>/month
                        </p>
                        {sub.current_period_end && (
                          <p className="text-sm font-light text-[#6B7280]">
                            Next delivery: <span className="font-medium text-[#2C2C2C]">{new Date(sub.current_period_end * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </p>
                        )}
                      </div>

                      {sub.cancel_at_period_end && (
                        <p className="text-xs text-red-400 mt-2 bg-red-50 inline-block px-3 py-1 rounded-full">Cancels at end of current billing period</p>
                      )}
                    </div>

                    {sub.status === "active" && !sub.cancel_at_period_end && (
                      <Button
                        onClick={() => { setCancelDialog(sub.id); setCancelInput(""); }}
                        variant="outline"
                        className="rounded-full border-red-200 text-red-400 hover:bg-red-50 px-4 py-2 text-xs uppercase tracking-widest flex-shrink-0"
                        data-testid={`cancel-sub-${sub.id}`}
                      >
                        <XCircle size={14} className="mr-1" /> Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Orders */}
        <div className="animate-fade-in-up delay-200">
          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-4">Past Purchases</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#F2F0EB] rounded-xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#E5E0D6] rounded-2xl p-6 text-center">
              <p className="text-sm font-light text-[#6B7280]">No purchases yet.</p>
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
                      <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#8DA399]/10 text-[#8DA399]">paid</span>
                      {order.metadata?.type && (
                        <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                          order.metadata.type === "subscription" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                        }`}>{order.metadata.type}</span>
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

        {/* Cancel Confirmation Dialog */}
        <Dialog open={!!cancelDialog} onOpenChange={(v) => { if (!v) { setCancelDialog(null); setCancelInput(""); } }}>
          <DialogContent className="max-w-sm border-[#E5E0D6] bg-[#FAF9F6] rounded-2xl" data-testid="cancel-dialog">
            <DialogTitle className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-sm font-light text-[#6B7280]">
              Are you sure you want to cancel? Your subscription will remain active until the end of your current billing period.
            </DialogDescription>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] mb-1.5 block">Type CANCEL to confirm</label>
                <Input
                  value={cancelInput}
                  onChange={(e) => setCancelInput(e.target.value)}
                  placeholder="CANCEL"
                  className="border-[#E5E0D6] text-sm py-5 font-mono"
                  data-testid="cancel-confirm-input"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => { setCancelDialog(null); setCancelInput(""); }}
                  variant="outline"
                  className="rounded-full border-[#E5E0D6] text-[#6B7280] px-6 py-5 text-xs uppercase tracking-widest flex-1"
                  data-testid="cancel-nevermind"
                >
                  Never Mind
                </Button>
                <Button
                  onClick={handleCancelConfirm}
                  disabled={cancelling || cancelInput.trim().toUpperCase() !== "CANCEL"}
                  className="rounded-full bg-red-500 text-white hover:bg-red-600 px-6 py-5 text-xs uppercase tracking-widest flex-1 disabled:opacity-40"
                  data-testid="cancel-confirm-btn"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
