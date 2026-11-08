const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function earliestDeliveryDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3);
  return d;
}

export function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isDeliveryDateTooSoon(isoDate) {
  return new Date(isoDate + "T00:00:00") < earliestDeliveryDate();
}

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
