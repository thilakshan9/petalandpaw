import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/CartProvider";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import BouquetBuilder from "@/pages/BouquetBuilder";
import CartPage from "@/pages/CartPage";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import AdminLogin from "@/pages/AdminLogin";
import AuthCallback from "@/pages/AuthCallback";
import AdminDashboard from "@/pages/AdminDashboard";
import "@/App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ProtectedRoute({ children }) {
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
    // CRITICAL: Skip auth check if returning from OAuth
    if (window.location.hash?.includes('session_id=')) {
      return;
    }
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, { credentials: 'include' });
        if (!response.ok) throw new Error('Not authenticated');
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate, location.state]);

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

function AppRouter() {
  const location = useLocation();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
      <Route path="/shop/:slug" element={<Layout><ProductPage /></Layout>} />
      <Route path="/subscriptions" element={<Layout><SubscriptionPage /></Layout>} />
      <Route path="/bouquet-builder" element={<Layout><BouquetBuilder /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/checkout/success" element={<Layout><CheckoutSuccess /></Layout>} />
      <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster position="bottom-right" />
        <AppRouter />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
