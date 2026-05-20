import SEOHead from "@/components/SEOHead";

export default function PrivacyPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="privacy-page">
      <SEOHead title="Privacy Policy" description="Petal & Paw privacy policy - how we collect, use and protect your personal data." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">Privacy Policy</h1>
          <p className="text-sm font-light text-[#6B7280]">Last updated: April 2026</p>
        </div>

        <div className="prose-custom space-y-8 animate-fade-in-up delay-100">
          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">1. Who We Are</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Petal & Paw is a UK-based flower business specialising in pet-safe floral arrangements. Our website is petalandpaw.co.uk. When we refer to "we", "us" or "our", we mean Petal & Paw.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">2. What Data We Collect</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">We may collect the following personal information when you use our website, place an order, or contact us:</p>
            <ul className="mt-2 space-y-1 text-sm font-light text-[#6B7280]">
              <li>- Name and email address</li>
              <li>- Shipping address (collected via Stripe at checkout)</li>
              <li>- Phone number (if provided via our contact or events forms)</li>
              <li>- Account login credentials (email and encrypted password)</li>
              <li>- Order history and subscription details</li>
              <li>- Messages sent via our contact and events forms</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">3. How We Use Your Data</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">We use your personal data to:</p>
            <ul className="mt-2 space-y-1 text-sm font-light text-[#6B7280]">
              <li>- Process and fulfil your orders and subscriptions</li>
              <li>- Send order confirmations and delivery updates</li>
              <li>- Respond to your enquiries and messages</li>
              <li>- Manage your customer account</li>
              <li>- Improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">4. Payment Processing</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">All payments are processed securely through Stripe. We do not store your card details on our servers. Stripe's privacy policy can be found at stripe.com/privacy.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">5. Data Storage & Security</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Your data is stored securely using encrypted databases. Passwords are hashed using industry-standard encryption (bcrypt). We take reasonable measures to protect your personal information from unauthorised access, alteration, or destruction.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">6. Third-Party Services</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">We use the following third-party services which may process your data:</p>
            <ul className="mt-2 space-y-1 text-sm font-light text-[#6B7280]">
              <li>- Stripe (payment processing)</li>
              <li>- Resend (transactional emails)</li>
              <li>- MongoDB Atlas (data storage)</li>
            </ul>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280] mt-2">Each service has its own privacy policy and processes data in accordance with GDPR and applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">7. Your Rights</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Under UK GDPR, you have the right to:</p>
            <ul className="mt-2 space-y-1 text-sm font-light text-[#6B7280]">
              <li>- Access the personal data we hold about you</li>
              <li>- Request correction of inaccurate data</li>
              <li>- Request deletion of your data</li>
              <li>- Withdraw consent for marketing communications</li>
              <li>- Lodge a complaint with the ICO (ico.org.uk)</li>
            </ul>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280] mt-2">To exercise any of these rights, contact us at contact@petalandpaw.co.uk.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">8. Cookies</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">Our website uses essential cookies and local storage to maintain your shopping basket and login session. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3">9. Contact Us</h2>
            <p className="text-sm font-light leading-[1.8] text-[#6B7280]">If you have any questions about this privacy policy or how we handle your data, please contact us at contact@petalandpaw.co.uk.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
