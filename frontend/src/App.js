import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/CartProvider";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import BouquetBuilder from "@/pages/BouquetBuilder";
import CartPage from "@/pages/CartPage";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import AdminLogin from "@/pages/AdminLogin";
import AuthCallback from "@/pages/AuthCallback";
import AdminDashboard from "@/pages/AdminDashboard";
import AccountPage from "@/pages/AccountPage";
import ReferralPage from "@/pages/ReferralPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import FaqPage from "@/pages/FaqPage";
import ReturnsPage from "@/pages/ReturnsPage";
import EventsPage from "@/pages/EventsPage";
import SafeFlowersPage from "@/pages/SafeFlowersPage";
import CustomerAuthPage from "@/pages/CustomerAuthPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import "@/App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ProtectedRoute({ children, adminOnly = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }
    if (window.location.hash?.includes('session_id=')) return;
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, { credentials: 'include' });
        if (!response.ok) throw new Error('Not authenticated');
        const userData = await response.json();
        if (adminOnly && !userData.is_admin) {
          setIsAuthenticated(false);
          navigate('/admin/login');
          return;
        }
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        navigate(adminOnly ? '/admin/login' : '/login');
      }
    };
    checkAuth();
  }, [navigate, location.state, adminOnly]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return children;
}

function CustomerLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) { setChecking(false); return; }
    const check = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (res.ok) { navigate("/account", { replace: true }); return; }
      } catch {}
      setChecking(false);
    };
    check();
  }, [navigate]);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/account';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center"><div className="animate-pulse text-[#6B7280] font-light tracking-widest text-sm uppercase">Checking...</div></div>;

  return (
    <div className="py-20 md:py-32 text-center" data-testid="customer-login-page">
      <div className="container mx-auto px-4 max-w-sm animate-fade-in-up">
        <h1 className="font-['Playfair_Display'] text-3xl font-medium text-[#2C2C2C] mb-2">My Account</h1>
        <p className="text-sm font-light text-[#6B7280] mb-8">Sign in to view orders and manage your referrals.</p>
        <button onClick={handleLogin} className="w-full rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-8 py-4 text-sm uppercase tracking-widest transition-all" data-testid="customer-google-login-btn">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
      <Route path="/subscriptions" element={<Layout><SubscriptionPage /></Layout>} />
      <Route path="/bouquet-builder" element={<Layout><BouquetBuilder /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout/success" element={<Layout><CheckoutSuccess /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/faq" element={<Layout><FaqPage /></Layout>} />
      <Route path="/returns" element={<Layout><ReturnsPage /></Layout>} />
      <Route path="/events" element={<Layout><EventsPage /></Layout>} />
      <Route path="/safe-flowers" element={<Layout><SafeFlowersPage /></Layout>} />
      <Route path="/login" element={<Layout><CustomerAuthPage /></Layout>} />
      <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
      <Route path="/account" element={<Layout><CustomerDashboard /></Layout>} />
      <Route path="/referral/:code" element={<Layout><ReferralPage /></Layout>} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CustomerAuthProvider>
          <CartProvider>
            <Toaster position="bottom-right" />
            <AppRouter />
          </CartProvider>
        </CustomerAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
