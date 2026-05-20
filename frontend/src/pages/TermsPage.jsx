import SEOHead from "@/components/SEOHead";

export default function TermsPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="terms-page">
      <SEOHead title="Terms & Conditions" description="Petal & Paw terms and conditions of sale and use." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">Terms & Conditions</h1>
          <p className="text-sm font-light text-[#6B7280]">Last updated: April 2026</p>
        </div>

        <div className="prose-custom space-y-8 animate-fade-in-up delay-100">
          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">1. About These Terms</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">These terms and conditions apply to all orders placed through petalandpaw.co.uk. By placing an order or using our website, you agree to be bound by these terms. Please read them carefully before making a purchase.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">2. Products & Availability</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">All bouquets are handmade using seasonal flowers. As our arrangements use fresh, natural stems, exact colours, varieties, and compositions may vary from images shown on the website. This is part of the charm of fresh flowers, and each bouquet is unique. We reserve the right to substitute stems of equal or greater value if certain flowers are unavailable.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">3. Pet Safety</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Our bouquets are designed using flowers that are widely considered non-toxic to cats and dogs, based on guidance from the ASPCA. However, we are not veterinary professionals and cannot guarantee that every pet will react the same way. We always recommend keeping flowers out of direct reach of pets and supervising curious animals. Petal & Paw accepts no liability for any adverse reactions.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">4. Pricing & Payment</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">All prices are displayed in British Pounds (GBP) and include VAT where applicable. Payment is taken at the time of purchase via Stripe. We accept major credit and debit cards. For subscriptions, payment is taken monthly on the date you first subscribed.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">5. Subscriptions</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Subscriptions are recurring monthly payments. You may cancel your subscription at any time through your account dashboard. Cancellations take effect at the end of the current billing period - you will still receive your flowers for the month you've already paid for. We do not offer partial refunds for subscription cancellations.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">6. Delivery</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">We currently deliver within the United Kingdom only. Delivery is free on all orders. We require a minimum of 3 days' notice for deliveries. Delivery dates are estimates and while we make every effort to deliver on time, we cannot guarantee exact delivery dates due to factors outside our control. Subscription deliveries are dispatched monthly.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">7. Returns & Refunds</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Due to the perishable nature of flowers, we do not accept returns. If your flowers arrive damaged or in poor condition, please contact us within 24 hours of delivery with a photo and we will arrange a replacement or full refund. Please see our Returns page for full details.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">8. Workshops & Events</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Workshop bookings are subject to availability. Cancellations made more than 48 hours before the event will receive a full refund. Cancellations within 48 hours are non-refundable but may be transferred to another attendee. We reserve the right to cancel or reschedule workshops, in which case a full refund will be provided.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">9. Accounts</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately if you suspect any unauthorised access to your account. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">10. Intellectual Property</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">All content on this website - including images, text, logos, and designs - is the property of Petal & Paw and is protected by UK copyright law. You may not reproduce, distribute, or use any content without our written permission.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">11. Limitation of Liability</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">To the fullest extent permitted by law, Petal & Paw shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability for any claim shall not exceed the amount paid for the relevant order.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">12. Governing Law</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">13. Changes to These Terms</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">We reserve the right to update these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">14. Contact Us</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">If you have any questions about these terms, please contact us at contact@petalandpaw.co.uk.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
