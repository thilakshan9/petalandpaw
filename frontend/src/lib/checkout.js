const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function startStripeCheckout(items, details = {}) {
  const res = await fetch(`${API}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({
        product_id: i.product_id, name: i.name, price: i.price,
        quantity: i.quantity, image_url: i.image_url || "",
        add_pet_toy: i.add_pet_toy || false,
        pet_type: i.pet_type || "",
      })),
      origin_url: window.location.origin,
      order_type: "regular",
      delivery_date: details.deliveryDate || "",
      personalized_message: details.personalizedMessage || "",
      special_notes: details.specialNotes || "",
      phone_number: details.phoneNumber || "",
    }),
  });
  const data = await res.json();
  if (!data.url) throw new Error("No checkout URL returned");
  window.location.href = data.url;
}
