import { ArrowUpRight, Quote } from "lucide-react";

const TRUSTPILOT_URL = "https://uk.trustpilot.com/review/petalandpaw.co.uk";
const WRITE_REVIEW_URL = "https://uk.trustpilot.com/evaluate/petalandpaw.co.uk";
const REVIEW_BASE = "https://uk.trustpilot.com/reviews/";

// Hand-picked real reviews from Petal & Paw's Trustpilot page.
// To add or swap a review, edit this list (id = the review id in the Trustpilot URL).
const REVIEWS = [
  {
    id: "6a4cfe30fdef6b976b2b0032",
    tag: "Bouquet",
    title: "I absolutely love this business",
    text: "She reached out to ask about my mum's favourite colour and favourite flower so she could make the bouquet extra special and personal, which I thought was such a sweet touch. My mum also has a very curious cat who likes to nibble absolutely everything, so it gave me real peace of mind knowing the flowers were safe for him.",
    date: "June 2026",
  },
  {
    id: "6aab011001192e21ed9fb084",
    tag: "Custom Bouquet",
    title: "The first pet-friendly florist I know",
    text: "Such a life saver! Not only do I have peace of mind knowing my cat won't have any reactions to the flowers, but they also look beautiful. I requested a custom made bouquet and it was absolutely beautiful, and was delivered so quickly! 10/10.",
    date: "Sept 2026",
  },
  {
    id: "6ac6958717899b200066e3a6",
    tag: "Hen-Do Workshop",
    title: "We all had such an amazing time!",
    text: "I organised a floral arrangement class with Petal & Paw for my friend's hen-do. Our host was so knowledgeable and guided us through the bouquet making class effortlessly, answering our questions and assisting when we needed help. I would highly recommend the class!",
    date: "Aug 2026",
  },
  {
    id: "6a5340eaad24486d69f8a4c3",
    tag: "Gift Bouquet",
    title: "I don't usually leave reviews",
    text: "…but this business really deserves one. The bouquet arrived beautifully presented, the flowers were really fresh, and my friends loved them. You can tell a lot of care goes into every order, and the customer service was brilliant too.",
    date: "July 2026",
  },
  {
    id: "6aeb609cdd629f67343d9ed4",
    tag: "Halloween Workshop",
    title: "Halloween Bouquet workshop 🎃💐",
    text: "The flowers were beautiful and the idea of making a bouquet in a pumpkin was very creative and even had a little skeleton to add on. They were very friendly and helpful. I definitely recommend them!",
    date: "Oct 2026",
  },
  {
    id: "6aa864be4e2ba0c107565ff1",
    tag: "Grand Garden",
    title: "Absolutely amazing!",
    text: "I bought one of Petal & Paw's Grand Garden arrangements as a surprise. The quality and presentation were beautiful, and the pets loved it just as much as we did. 🐾🌸 You can really tell how much care and thought goes into their arrangements.",
    date: "Sept 2026",
  },
  {
    id: "6a09cd585af8aaa1412003c9",
    tag: "Large Bouquet",
    title: "Beautiful!",
    text: "I ordered the large bouquet for my sister and it was so beautiful! She has cats so I've never been able to send her flowers before — it's such a good and important idea. Highly recommend.",
    date: "May 2026",
  },
  {
    id: "6a4fd8150c31f10e7ab51fbb",
    tag: "Bouquet & Workshop",
    title: "An excellent service",
    text: "The website is very easy to use. Once I submitted my order the owner reached out asking if my friend had any preferences on colours, the delivery was very prompt and the bouquet was lovely.",
    date: "July 2026",
  },
  {
    id: "6ae9edf12de152371849017b",
    tag: "Pet Birthday",
    title: "He loved it!",
    text: "Bought a bouquet for my dog's birthday and he loved it, the service was excellent and the price was reasonable. Would highly recommend!",
    date: "Nov 2026",
  },
  {
    id: "6a730e6dc15c522d0f77b4dc",
    tag: "Cat Café Workshop",
    title: "Wonderful experience",
    text: "Wonderful experience making bouquets surrounded by rescue cats, would absolutely go again.",
    date: "June 2026",
  },
];

function TrustpilotStar({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 1.5l2.76 7.6h8.04l-6.5 4.73 2.48 7.67L12 16.77l-6.78 4.73 2.48-7.67-6.5-4.73h8.04z" />
    </svg>
  );
}

function FiveStars({ size = "w-5 h-5" }) {
  return (
    <div className="flex gap-[3px]" aria-label="Rated 5 out of 5 stars" role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`${size} bg-[#00B67A] flex items-center justify-center`}>
          <TrustpilotStar className="w-[70%] h-[70%] text-white" />
        </span>
      ))}
    </div>
  );
}

function TrustpilotMark({ dark = true }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold tracking-tight ${dark ? "text-[#191919]" : "text-white"}`}>
      <TrustpilotStar className="w-4 h-4 text-[#00B67A]" />
      Trustpilot
    </span>
  );
}

function ReviewCard({ review, hidden }) {
  return (
    <a
      href={`${REVIEW_BASE}${review.id}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
      className="group relative shrink-0 w-[290px] sm:w-[360px] bg-white rounded-2xl border border-[#E5E0D6]/70 p-6 sm:p-7 flex flex-col shadow-[0_1px_2px_rgba(44,44,44,0.04)] hover:shadow-[0_18px_40px_-18px_rgba(44,44,44,0.25)] hover:-translate-y-1 transition-all duration-300"
      data-testid={hidden ? undefined : `trustpilot-review-${review.id}`}
    >
      <Quote size={36} strokeWidth={1} className="absolute top-5 right-5 text-[#8DA399]/25" />
      <FiveStars size="w-[18px] h-[18px]" />
      <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-medium text-[#2C2C2C] mt-4 mb-2 leading-snug pr-8">
        {review.title}
      </h3>
      <p className="text-sm font-light leading-relaxed text-[#4B5563] line-clamp-5 flex-1">
        {review.text}
      </p>
      <div className="mt-5 pt-4 border-t border-[#E5E0D6]/60 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#8DA399] truncate">{review.tag}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6B7280] whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B67A]" />
          Verified · {review.date}
        </span>
      </div>
    </a>
  );
}

export default function TrustpilotReviews() {
  const featured = REVIEWS[0];

  return (
    <section className="relative py-14 sm:py-20 md:py-28 bg-[#F3F0E9] overflow-hidden" data-testid="trustpilot-reviews-section">
      {/* soft decorative blooms */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#8DA399]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#E8C8C0]/30 blur-3xl" />

      <div className="relative container mx-auto px-5 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-10 sm:mb-14 reveal" data-reveal>
          <div className="lg:col-span-5">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#8DA399] mb-3 sm:mb-4 block">
              Kind Words
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] leading-[1.1] mb-5">
              Loved by pet parents <span className="italic text-[#8DA399]">&amp; their pets</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <FiveStars />
              <span className="text-sm text-[#4B5563]">Real reviews on</span>
              <TrustpilotMark />
            </div>
          </div>

          <figure className="lg:col-span-7 relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white p-6 sm:p-8" data-testid="trustpilot-featured-review">
            <Quote size={44} strokeWidth={1} className="text-[#8DA399] mb-3" />
            <blockquote className="font-['Playfair_Display'] text-lg sm:text-2xl leading-snug text-[#2C2C2C]">
              “It gave me real peace of mind knowing the flowers were safe for him if he decided to investigate! I couldn’t recommend this business enough.”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 text-xs text-[#6B7280]">
              <FiveStars size="w-4 h-4" />
              <span>{featured.tag} · Verified Trustpilot review</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Auto-scrolling review marquee */}
      <div className="relative reviews-marquee-mask" data-testid="trustpilot-reviews-marquee">
        <div className="reviews-marquee flex gap-5 w-max py-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          {REVIEWS.map((r) => (
            <ReviewCard key={`dup-${r.id}`} review={r} hidden />
          ))}
        </div>
      </div>

      <div className="relative container mx-auto px-5 md:px-8 max-w-7xl mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#2C2C2C] text-[#FAF9F6] hover:bg-[#2C2C2C]/90 px-7 py-4 text-xs uppercase tracking-[0.18em] transition-all hover:scale-105"
          data-testid="trustpilot-read-all-btn"
        >
          Read more on Trustpilot <ArrowUpRight size={15} className="ml-2" />
        </a>
        <a
          href={WRITE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-[#2C2C2C]/20 text-[#2C2C2C] hover:bg-white px-7 py-4 text-xs uppercase tracking-[0.18em] transition-all"
          data-testid="trustpilot-write-review-btn"
        >
          Leave us a review
        </a>
      </div>
    </section>
  );
}
