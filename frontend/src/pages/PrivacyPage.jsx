import SEOHead from "@/components/SEOHead";

const headingClass = "font-['Playfair_Display'] text-xl font-medium text-[#2C2C2C] mb-3";
const paragraphClass = "text-sm font-light leading-[1.8] text-[#4B5563]";
const listClass = "mt-2 space-y-1 text-sm font-light leading-[1.8] text-[#4B5563]";

function Section({ title, children }) {
  return (
    <section>
      <h2 className={headingClass}>{title}</h2>
      {children}
    </section>
  );
}

function List({ items }) {
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="privacy-page">
      <SEOHead title="Privacy Policy" description="Petal & Paw privacy policy - how we collect, use and protect your personal data under UK GDPR." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">
        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-3">Privacy Policy</h1>
          <p className="text-sm font-light text-[#4B5563]">Last updated: November 2026</p>
        </div>

        <div className="space-y-8 animate-fade-in-up delay-100">
          <Section title="1. Who We Are">
            <p className={paragraphClass}>
              Petal & Paw is a UK-based flower business specialising in non-toxic floral arrangements. Our website is petalandpaw.co.uk. We are the controller of the personal data described in this policy, which means we decide how and why it is used. When we refer to "we", "us" or "our", we mean Petal & Paw. You can contact us at contact@petalandpaw.co.uk.
            </p>
          </Section>

          <Section title="2. What Data We Collect">
            <p className={paragraphClass}>We may collect the following personal data when you use our website, place an order, book a workshop or event, or contact us:</p>
            <List items={[
              "Identity and contact details: name, email address and phone number (if you provide it)",
              "Delivery details: shipping address, collected through our checkout",
              "Account details: email address, name and, if you create an account, login information",
              "Order and booking history, subscription details and wreath kit or workshop bookings",
              "Messages you send through our contact, events or hire forms",
              "Technical data: IP address and basic device and browser information recorded in our server logs for security and troubleshooting",
            ]} />
            <p className={`${paragraphClass} mt-3`}>We do not knowingly collect personal data from children under 16. Our products are sold to adults.</p>
          </Section>

          <Section title="3. How We Use Your Data and Our Legal Basis">
            <p className={paragraphClass}>We use your personal data only where we have a lawful basis under UK GDPR:</p>
            <List items={[
              "To process and fulfil your orders, subscriptions, bookings and vouchers (necessary to perform a contract with you)",
              "To send order confirmations, booking confirmations and delivery updates (necessary to perform a contract with you)",
              "To respond to your enquiries and messages (legitimate interests in answering customers)",
              "To manage your customer account and reset your password (necessary to perform a contract with you)",
              "To keep accounting and tax records (legal obligation)",
              "To keep the website secure and prevent fraud (legitimate interests)",
              "To send marketing emails, only if you have opted in (consent, which you can withdraw at any time)",
            ]} />
          </Section>

          <Section title="4. Payment Processing">
            <p className={paragraphClass}>
              All card payments are processed securely by Stripe. We do not see or store your full card details on our servers. Stripe acts as an independent controller for the payment data it handles. You can read Stripe's privacy policy at stripe.com/privacy.
            </p>
          </Section>

          <Section title="5. Cookies and Local Storage">
            <p className={paragraphClass}>
              We use cookies and browser local storage only where needed. Strictly necessary items keep your basket, your login session and your cookie choices working, and they do not need your consent. We do not currently use analytics or advertising cookies.
            </p>
            <List items={[
              "Basket contents (local storage): strictly necessary, kept until you empty your basket or clear your browser",
              "Login session (cookie): strictly necessary, kept until you sign out or the session expires",
            ]} />
            <p className={`${paragraphClass} mt-3`}>
              If we add optional cookies in future, such as analytics or marketing, we will ask for your consent first and update this section.
            </p>
          </Section>

          <Section title="6. Third-Party Services">
            <p className={paragraphClass}>We share data with the following service providers, only as needed to run our business:</p>
            <List items={[
              "Stripe: payment processing",
              "SendGrid: transactional emails such as order confirmations and password resets",
              "MongoDB: secure storage of our website and customer data",
              "Google: if you choose to sign in with Google",
            ]} />
            <p className={`${paragraphClass} mt-3`}>
              Some of these providers may process data outside the UK. Where this happens, we rely on appropriate safeguards recognised under UK data protection law, such as the UK International Data Transfer Agreement or the UK Extension to the EU-US Data Privacy Framework. Each provider has its own privacy policy.
            </p>
          </Section>

          <Section title="7. How Long We Keep Your Data">
            <List items={[
              "Order and invoice records: six years after the transaction, to meet HMRC requirements",
              "Account details: while your account is active, and deleted on request",
              "Enquiry messages: up to 12 months after we have responded, unless they lead to an order",
              "Server logs: kept for a short period for security purposes",
            ]} />
          </Section>

          <Section title="8. Data Security">
            <p className={paragraphClass}>
              Your data is stored in encrypted databases and passwords are stored in hashed form. We limit access to personal data to people who need it, and we take reasonable measures to protect your information from unauthorised access, alteration or loss.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p className={paragraphClass}>Under UK GDPR you have the right to:</p>
            <List items={[
              "Be informed about how we use your data (this policy)",
              "Access the personal data we hold about you",
              "Have inaccurate data corrected",
              "Have your data erased in certain circumstances",
              "Restrict or object to certain processing",
              "Receive your data in a portable format",
              "Withdraw consent at any time, for example for marketing emails",
            ]} />
            <p className={`${paragraphClass} mt-3`}>
              To exercise any of these rights, email contact@petalandpaw.co.uk. We will respond within one month. We will not charge a fee unless your request is clearly unfounded or excessive.
            </p>
          </Section>

          <Section title="10. Complaints">
            <p className={paragraphClass}>
              If you are unhappy with how we handle your data, please contact us first so we can put things right. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p className={paragraphClass}>
              We may update this policy from time to time. The date at the top shows when it was last changed. Significant changes will be highlighted on our website.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p className={paragraphClass}>
              If you have any questions about this policy or how we handle your data, please email contact@petalandpaw.co.uk.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
