import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

function lineKey(item) {
  return [
    item.product_id,
    item.add_pet_toy ? "toy" : "notoy",
    item.pet_type || "",
    item.theme || "",
  ].join("|");
}

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
      const newKey = lineKey(product);
      const existing = prev.find((i) => lineKey(i) === newKey);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === newKey
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((item) => {
    const targetKey = typeof item === "string" ? null : lineKey(item);
    setItems((prev) => {
      if (targetKey) return prev.filter((i) => lineKey(i) !== targetKey);
      // Legacy callers that pass a product id: remove all lines of that product
      return prev.filter((i) => i.product_id !== item);
    });
  }, []);

  const updateQuantity = useCallback((item, quantity) => {
    const targetKey = typeof item === "string" ? null : lineKey(item);
    if (quantity <= 0) {
      setItems((prev) => {
        if (targetKey) return prev.filter((i) => lineKey(i) !== targetKey);
        return prev.filter((i) => i.product_id !== item);
      });
      return;
    }
    setItems((prev) => {
      if (targetKey) return prev.map((i) => (lineKey(i) === targetKey ? { ...i, quantity } : i));
      return prev.map((i) => (i.product_id === item ? { ...i, quantity } : i));
    });
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
