import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Instagram } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const faqs = [
  {
    q: "Are your flowers completely safe for pets?",
    a: `All of our bouquets are thoughtfully designed with pet-friendly flowers in mind. We carefully avoid commonly known toxic varieties and select stems that are considered safer for homes with cats and dogs.\n\nThat said, we always recommend keeping flowers out of reach and supervising curious pets — every animal is different.`
  },
  {
    q: 'What do you mean by "pet-friendly"?',
    a: `"Pet-friendly" means we avoid flowers that are widely known to be toxic to cats and dogs.\n\nMany people don't realise how common toxic flowers are, so we've done the research for you — so you don't have to second guess what's in your home.`
  },
  {
    q: "Why are some flowers dangerous for pets?",
    a: `Many popular flowers — including some of the most commonly sold bouquets — can be toxic to cats and dogs.\n\nFor example, flowers like Lilies are well known for being highly toxic to cats, even in small amounts. Others can cause milder reactions like skin irritation, upset stomachs, or breathing discomfort.\n\nThe tricky part is that this isn't always widely communicated, and most bouquets don't come with any guidance — so it's easy to bring something into your home without realising the risk.\n\nThat's why we've taken the guesswork out of it.\n\nAt Petal & Paw, we carefully select flowers that are considered safer for homes with pets, so you can enjoy your space without second-guessing what's in it.`
  },
  {
    q: "Are your bouquets handmade?",
    a: `Yes — every single one.\n\nI personally select each stem and handcraft every bouquet with care. No mass production, no pre-made arrangements — just thoughtfully put together flowers, every time.`
  },
  {
    q: "Will my bouquet look exactly like the photos?",
    a: `Each bouquet is made fresh and by hand, so there may be slight variations depending on seasonal availability.\n\nBut the overall style, colour palette, and feel will always stay true to what you see.`
  },
  {
    q: "When do you ship?",
    a: `We currently ship on a weekly basis to keep flowers as fresh as possible.\n\nYou'll be able to see the next shipping date at checkout.`
  },
  {
    q: "How long will my flowers last?",
    a: `With proper care, most bouquets last around 5–10 days.\n\nWe include a care card with every order to help you get the most out of your flowers.`
  },
  {
    q: "Do you offer letterbox flowers?",
    a: `Yes! We offer both standard bouquets and letterbox-friendly options — perfect for gifting or treating yourself.`
  },
  {
    q: "Can I send this as a gift?",
    a: `Of course!\n\nYou can send your bouquet directly to someone special, and we can include a personalised message for that extra touch.`
  },
  {
    q: "Do you offer flowers for events?",
    a: `Yes — we'd love to!\n\nWe offer flowers for small events, gatherings, and special occasions, all designed with the same care and attention as our bouquets.\n\nIf your event includes pets, we can create beautiful arrangements using our pet-friendly stems. And if there are no pets involved, we're also happy to work with a wider range of flowers to suit your vision.\n\nEvery event is slightly different, so we recommend getting in touch to chat through your ideas — we'll work with you to create something that feels just right.`
  },
  {
    q: "Do you offer custom bouquets?",
    a: `Right now, we focus on curated designs to ensure quality and consistency.\n\nAs we grow, we may introduce custom options — so keep an eye out!`
  },
  {
    q: "Why Petal & Paw?",
    a: `Because you shouldn't have to choose between a beautiful home and a safe one.\n\nWe're here to make flowers feel easy, joyful, and worry-free for pet lovers.`
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E0D6]" data-testid={`faq-item`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 sm:py-6 text-left gap-4 group cursor-pointer"
        data-testid={`faq-toggle`}
      >
        <span className="text-sm sm:text-base font-medium text-[#2C2C2C] group-hover:text-[#8DA399] transition-colors">{q}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`text-[#8DA399] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[600px] pb-5 sm:pb-6" : "max-h-0"}`}
      >
        <p className="text-sm sm:text-base font-light leading-[1.8] text-[#6B7280] whitespace-pre-line">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="py-8 sm:py-12 md:py-20" data-testid="faq-page">
      <SEOHead title="FAQ" description="Frequently asked questions about Petal & Paw pet-safe flowers." />
      <div className="container mx-auto px-5 md:px-8 max-w-3xl">

        <div className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-2 sm:mb-3 block">Help</span>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#2C2C2C] mb-3 sm:mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-lg font-light text-[#6B7280] max-w-xl mx-auto">
            Everything you need to know about Petal & Paw.
          </p>
        </div>

        <div className="animate-fade-in-up delay-100 border-t border-[#E5E0D6]">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* Still have a question */}
        <div className="mt-12 sm:mt-16 text-center animate-fade-in-up delay-200 bg-white border border-[#E5E0D6] rounded-2xl p-8 sm:p-10">
          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-medium text-[#2C2C2C] mb-3">
            Still have a question?
          </h2>
          <p className="text-sm font-light text-[#6B7280] mb-5">
            Drop us a message on Instagram — we're always happy to help!
          </p>
          <a
            href="https://instagram.com/petalandpawflorist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#2C2C2C] text-[#FAF9F6] rounded-full px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#2C2C2C]/90 transition-all hover:scale-105"
            data-testid="faq-instagram-link"
          >
            <Instagram size={16} strokeWidth={1.5} /> @petalandpawflorist
          </a>
        </div>
      </div>
    </div>
  );
}
