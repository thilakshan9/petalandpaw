import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("petal-paw-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("petal-paw-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const sameOptions = (i) =>
        i.product_id === product.product_id &&
        !!i.add_pet_toy === !!product.add_pet_toy &&
        (i.pet_type || "") === (product.pet_type || "") &&
        (i.theme || "") === (product.theme || "");
      const existing = prev.find(sameOptions);
      if (existing) {
        return prev.map((i) =>
          sameOptions(i)
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
