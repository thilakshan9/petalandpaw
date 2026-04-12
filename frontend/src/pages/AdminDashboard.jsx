import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Package, ShoppingCart, FileText, BarChart3, LogOut, Plus, Pencil, Trash2, Leaf, CheckCircle2, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white border border-[#E5E0D6] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accent ? 'bg-[#8DA399]/10' : 'bg-[#E8E4D9]/50'}`}>
          <Icon size={16} className={accent ? "text-[#8DA399]" : "text-[#6B7280]"} />
        </div>
        <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">{label}</span>
      </div>
      <p className="text-3xl font-light text-[#2C2C2C]">{value}</p>
    </div>
  );
}

function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: "", slug: "", description: "", price: 0, category: "bouquet",
    image_url: "", pet_safe: true, pet_safe_details: "", in_stock: true, featured: false,
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({ ...form, slug, price: parseFloat(form.price) });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#E5E0D6] mt-1" required data-testid="product-form-name" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Price (£)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border-[#E5E0D6] mt-1" required data-testid="product-form-price" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Category</Label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger className="border-[#E5E0D6] mt-1" data-testid="product-form-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bouquet">Bouquet</SelectItem>
            <SelectItem value="single-stem">Single Stem</SelectItem>
            <SelectItem value="arrangement">Arrangement</SelectItem>
            <SelectItem value="letterbox">Letterbox</SelectItem>
          </SelectContent>
        </Select></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="border-[#E5E0D6] mt-1" data-testid="product-form-image" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-[#E5E0D6] mt-1" rows={3} data-testid="product-form-description" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Pet Safety Details</Label><Input value={form.pet_safe_details} onChange={(e) => setForm({ ...form, pet_safe_details: e.target.value })} className="border-[#E5E0D6] mt-1" /></div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label className="text-sm text-[#6B7280]">Featured</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} /><Label className="text-sm text-[#6B7280]">In Stock</Label></div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest" data-testid="product-form-save">Save</Button>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-[#E5E0D6] text-[#6B7280] px-6 py-5 text-xs uppercase tracking-widest">Cancel</Button>
      </div>
    </form>
  );
}

function BlogForm({ post, onSave, onClose }) {
  const [form, setForm] = useState(post || {
    title: "", slug: "", excerpt: "", content: "", image_url: "", author: "Petal & Paw", published: true, meta_description: "", meta_keywords: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({ ...form, slug });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border-[#E5E0D6] mt-1" required data-testid="blog-form-title" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="border-[#E5E0D6] mt-1" rows={2} data-testid="blog-form-excerpt" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Content (HTML)</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="border-[#E5E0D6] mt-1" rows={6} data-testid="blog-form-content" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="border-[#E5E0D6] mt-1" data-testid="blog-form-image" /></div>
      <div><Label className="text-xs uppercase tracking-widest text-[#6B7280]">Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="border-[#E5E0D6] mt-1" /></div>
      <div className="border-t border-[#E5E0D6] pt-4 mt-2"><h4 className="text-xs uppercase tracking-widest font-semibold text-[#8DA399] mb-3">SEO Metadata</h4>
        <div className="space-y-3">
          <div><Label className="text-xs text-[#6B7280]">Meta Description</Label><Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="border-[#E5E0D6] mt-1" rows={2} data-testid="blog-form-meta-desc" /></div>
          <div><Label className="text-xs text-[#6B7280]">Meta Keywords</Label><Input value={form.meta_keywords} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} className="border-[#E5E0D6] mt-1" placeholder="comma, separated, keywords" data-testid="blog-form-meta-keywords" /></div>
        </div>
      </div>
      <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sm text-[#6B7280]">Published</Label></div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest" data-testid="blog-form-save">Save</Button>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-[#E5E0D6] text-[#6B7280] px-6 py-5 text-xs uppercase tracking-widest">Cancel</Button>
      </div>
    </form>
  );
}

function OrderDetailDialog({ order }) {
  if (!order) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[#6B7280]">#{order.id?.slice(0, 8)}</span>
        <span className={`text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full ${
          order.status === "complete" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
        }`}>{order.status}</span>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-widest font-semibold text-[#6B7280]">Items</h4>
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-[#4B5563]">{item.name} x{item.quantity}</span>
            <span className="text-[#2C2C2C]">£{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#E5E0D6] pt-3 flex justify-between font-medium">
        <span>Total</span><span>£{order.total?.toFixed(2)}</span>
      </div>
      {order.customer_email && <p className="text-xs text-[#6B7280]">Email: {order.customer_email}</p>}
      {order.delivery_date && <p className="text-xs text-[#6B7280]">Delivery: {order.delivery_date}</p>}
      {order.pet_notes && <p className="text-xs text-[#6B7280]">Pet Notes: {order.pet_notes}</p>}
      {order.order_type && <p className="text-xs text-[#6B7280]">Type: {order.order_type}</p>}
      {order.referral_code && <p className="text-xs text-[#8DA399]">Referral: {order.referral_code} (-£{order.credit_applied?.toFixed(2)})</p>}
      <p className="text-xs text-[#6B7280]">{order.created_at ? new Date(order.created_at).toLocaleString() : ""}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [stats, setStats] = useState({ products: 0, orders: 0, blog_posts: 0, revenue: 0, subscription_orders: 0, todo_orders: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subOrders, setSubOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [blogDialog, setBlogDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsR, prodR, ordR, subR, blogR, txR] = await Promise.all([
        fetch(`${API}/admin/stats`, { credentials: "include" }),
        fetch(`${API}/products`),
        fetch(`${API}/orders`, { credentials: "include" }),
        fetch(`${API}/admin/orders/subscriptions`, { credentials: "include" }),
        fetch(`${API}/blog`),
        fetch(`${API}/admin/transactions`, { credentials: "include" }),
      ]);
      if (statsR.ok) setStats(await statsR.json());
      setProducts(await prodR.json());
      if (ordR.ok) setOrders(await ordR.json());
      if (subR.ok) setSubOrders(await subR.json());
      setBlogPosts(await blogR.json());
      if (txR.ok) setTransactions(await txR.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    if (!user) {
      fetch(`${API}/auth/me`, { credentials: "include" })
        .then((r) => { if (r.ok) return r.json(); throw new Error(); })
        .then(setUser).catch(() => {});
    }
  }, [fetchData, user]);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/admin/login", { replace: true });
  };

  const toggleOrderStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === "todo" ? "complete" : "todo";
    try {
      await fetch(`${API}/admin/orders/${orderId}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Order marked as ${newStatus}`);
      fetchData();
    } catch { toast.error("Failed to update"); }
  };

  const saveProduct = async (data) => {
    const isEdit = !!editProduct;
    const url = isEdit ? `${API}/products/${editProduct.id}` : `${API}/products`;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(data),
      });
      if (res.ok) { toast.success(isEdit ? "Updated" : "Created"); setProductDialog(false); setEditProduct(null); fetchData(); }
    } catch { toast.error("Failed"); }
  };

  const deleteProduct = async (id) => {
    await fetch(`${API}/products/${id}`, { method: "DELETE", credentials: "include" });
    toast.success("Deleted"); fetchData();
  };

  const savePost = async (data) => {
    const isEdit = !!editPost;
    const url = isEdit ? `${API}/blog/${editPost.id}` : `${API}/blog`;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(data),
      });
      if (res.ok) { toast.success(isEdit ? "Updated" : "Created"); setBlogDialog(false); setEditPost(null); fetchData(); }
    } catch { toast.error("Failed"); }
  };

  const deletePost = async (id) => {
    await fetch(`${API}/blog/${id}`, { method: "DELETE", credentials: "include" });
    toast.success("Deleted"); fetchData();
  };

  const OrderRow = ({ o }) => (
    <div className="flex items-center gap-4 bg-white border border-[#E5E0D6] rounded-xl p-4" data-testid={`admin-order-${o.id}`}>
      <button onClick={() => toggleOrderStatus(o.id, o.status)}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          o.status === "complete" ? "bg-[#8DA399] text-white" : "border-2 border-[#E5E0D6] text-[#6B7280] hover:border-[#8DA399]"
        }`} data-testid={`toggle-status-${o.id}`}>
        {o.status === "complete" ? <CheckCircle2 size={16} /> : <Clock size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6B7280]">#{o.id?.slice(0, 8)}</span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
            o.status === "complete" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
          }`}>{o.status}</span>
          {o.order_type === "subscription" && <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">Subscription</span>}
        </div>
        <p className="text-sm text-[#4B5563] mt-1">{o.items?.length || 0} items &middot; £{o.total?.toFixed(2)}</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)} data-testid={`view-order-${o.id}`}><Eye size={14} /></Button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#FAF9F6]">
          <DialogHeader><DialogTitle className="font-['Playfair_Display'] text-xl">Order Details</DialogTitle></DialogHeader>
          <OrderDetailDialog order={o} />
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="admin-dashboard">
      <header className="bg-white border-b border-[#E5E0D6] px-4 md:px-8 py-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf size={20} className="text-[#8DA399]" />
            <span className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C]">Petal & Paw</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#6B7280] ml-2">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm font-light text-[#6B7280] hidden md:block">{user.name || user.email}</span>}
            <Button variant="ghost" onClick={handleLogout} className="text-[#6B7280]" data-testid="admin-logout-btn"><LogOut size={16} className="mr-1" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
        <Tabs defaultValue="overview">
          <TabsList className="bg-[#E8E4D9]/40 rounded-full p-1 mb-8 flex-wrap">
            <TabsTrigger value="overview" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-overview"><BarChart3 size={14} className="mr-1" /> Overview</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-products"><Package size={14} className="mr-1" /> Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-orders"><ShoppingCart size={14} className="mr-1" /> Orders</TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-subscriptions"><Package size={14} className="mr-1" /> Subscriptions</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-blog"><FileText size={14} className="mr-1" /> Blog</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-full text-xs uppercase tracking-widest data-[state=active]:bg-white" data-testid="tab-transactions"><BarChart3 size={14} className="mr-1" /> Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Products" value={stats.products} icon={Package} accent />
              <StatCard label="Total Orders" value={stats.orders} icon={ShoppingCart} />
              <StatCard label="To Do" value={stats.todo_orders} icon={Clock} />
              <StatCard label="Subscriptions" value={stats.subscription_orders} icon={Package} />
              <StatCard label="Blog Posts" value={stats.blog_posts} icon={FileText} />
              <StatCard label="Revenue" value={`£${stats.revenue.toFixed(2)}`} icon={BarChart3} accent />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C]">Products</h2>
              <Dialog open={productDialog} onOpenChange={(o) => { setProductDialog(o); if (!o) setEditProduct(null); }}>
                <DialogTrigger asChild><Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest" data-testid="add-product-btn"><Plus size={14} className="mr-1" /> Add Product</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF9F6]">
                  <DialogHeader><DialogTitle className="font-['Playfair_Display'] text-xl">{editProduct ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
                  <ProductForm product={editProduct} onSave={saveProduct} onClose={() => { setProductDialog(false); setEditProduct(null); }} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white border border-[#E5E0D6] rounded-xl p-4" data-testid={`admin-product-${p.id}`}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F2F0EB] flex-shrink-0"><img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#2C2C2C] truncate">{p.name}</h3>
                    <p className="text-xs font-light text-[#6B7280]">£{p.price?.toFixed(2)} &middot; {p.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.featured && <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8DA399] bg-[#8DA399]/10 px-2 py-1 rounded-full">Featured</span>}
                    <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setProductDialog(true); }} data-testid={`edit-product-${p.id}`}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600" data-testid={`delete-product-${p.id}`}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-6">All Orders</h2>
            {orders.length === 0 ? <p className="text-sm font-light text-[#6B7280]">No orders yet.</p> : (
              <div className="space-y-3">{orders.map((o) => <OrderRow key={o.id} o={o} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions">
            <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-6">Subscription Orders</h2>
            {subOrders.length === 0 ? <p className="text-sm font-light text-[#6B7280]">No subscription orders yet.</p> : (
              <div className="space-y-3">{subOrders.map((o) => <OrderRow key={o.id} o={o} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="blog">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C]">Blog Posts</h2>
              <Dialog open={blogDialog} onOpenChange={(o) => { setBlogDialog(o); if (!o) setEditPost(null); }}>
                <DialogTrigger asChild><Button className="rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-6 py-5 text-xs uppercase tracking-widest" data-testid="add-blog-btn"><Plus size={14} className="mr-1" /> Add Post</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF9F6]">
                  <DialogHeader><DialogTitle className="font-['Playfair_Display'] text-xl">{editPost ? "Edit" : "Add"} Post</DialogTitle></DialogHeader>
                  <BlogForm post={editPost} onSave={savePost} onClose={() => { setBlogDialog(false); setEditPost(null); }} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {blogPosts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white border border-[#E5E0D6] rounded-xl p-4" data-testid={`admin-blog-${p.id}`}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F2F0EB] flex-shrink-0"><img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#2C2C2C] truncate">{p.title}</h3>
                    <p className="text-xs font-light text-[#6B7280]">{p.author} {p.meta_description ? ' | SEO' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.published && <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8DA399] bg-[#8DA399]/10 px-2 py-1 rounded-full">Published</span>}
                    <Button variant="ghost" size="icon" onClick={() => { setEditPost(p); setBlogDialog(true); }} data-testid={`edit-blog-${p.id}`}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePost(p.id)} className="text-red-400 hover:text-red-600" data-testid={`delete-blog-${p.id}`}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <h2 className="font-['Playfair_Display'] text-2xl font-medium text-[#2C2C2C] mb-6">Payment Transactions</h2>
            {transactions.length === 0 ? <p className="text-sm font-light text-[#6B7280]">No transactions yet.</p> : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white border border-[#E5E0D6] rounded-xl p-4" data-testid={`admin-tx-${tx.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#6B7280]">#{tx.session_id?.slice(-8)}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                          tx.payment_status === "paid" ? "bg-[#8DA399]/10 text-[#8DA399]" : "bg-[#E8E4D9] text-[#6B7280]"
                        }`}>{tx.payment_status}</span>
                        {tx.metadata?.type && (
                          <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                            tx.metadata.type === "subscription" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                          }`}>{tx.metadata.type}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#2C2C2C]">£{tx.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                      {tx.metadata?.plan_name && <span>Plan: <strong className="text-[#2C2C2C]">{tx.metadata.plan_name}</strong></span>}
                      {tx.metadata?.pet_type && <span>Pet: <strong className="text-[#2C2C2C]">{tx.metadata.pet_type}</strong></span>}
                      <span>Pet Toy: <strong className={tx.metadata?.add_pet_toy === "True" ? "text-[#8DA399]" : "text-[#6B7280]"}>{tx.metadata?.add_pet_toy === "True" ? "Yes" : "No"}</strong></span>
                      {tx.metadata?.personalized_message && <span>Gift Note: <strong className="text-[#2C2C2C]">{tx.metadata.personalized_message.slice(0, 50)}{tx.metadata.personalized_message.length > 50 ? "..." : ""}</strong></span>}
                      {tx.customer_email && <span>Email: {tx.customer_email}</span>}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{tx.created_at ? new Date(tx.created_at).toLocaleString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
