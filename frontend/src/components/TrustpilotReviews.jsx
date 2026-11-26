import { ArrowUpRight } from "lucide-react";

const TRUSTPILOT_URL = "https://uk.trustpilot.com/review/petalandpaw.co.uk";
const REVIEW_BASE = "https://uk.trustpilot.com/reviews/";

// Hand-picked real 5-star reviews from Petal & Paw's Trustpilot page.
// To add or swap a review, edit this list (id = the review id in the Trustpilot URL).
const REVIEWS = [
  { id: "6a4cfe30fdef6b976b2b0032", name: "Em", text: "It gave me real peace of mind knowing the flowers were safe for him. I couldn’t recommend this business enough!" },
  { id: "6aab011001192e21ed9fb084", name: "Afra", text: "The first pet-friendly florist I know and it’s been such a life saver! Absolutely beautiful, and delivered so quickly. 10/10" },
  { id: "6ac6958717899b200066e3a6", name: "Erd", text: "Organised a class for my friend’s hen-do and we all had such an amazing time! Highly recommend." },
  { id: "6a5340eaad24486d69f8a4c3", name: "Cemre", text: "I don’t usually leave reviews, but this business really deserves one. Beautifully presented and really fresh." },
  { id: "6a730e6dc15c522d0f77b4dc", name: "Charlotte C.", text: "Wonderful experience making bouquets surrounded by rescue cats, would absolutely go again." },
  { id: "6aeb609cdd629f67343d9ed4", name: "Yas", text: "A bouquet in a pumpkin, with a little skeleton to add on! So creative, friendly and helpful." },
  { id: "6a09cd585af8aaa1412003c9", name: "Veeren K.", text: "She has cats so I’ve never been able to send her flowers before. Such a good and important idea." },
  { id: "6a4fd8150c31f10e7ab51fbb", name: "Diviya C.", text: "An excellent service. The owner reached out about colour preferences and delivery was very prompt." },
  { id: "6ae9edf12de152371849017b", name: "Piraveen P.", text: "Bought a bouquet for my dog’s birthday and he loved it! Excellent service, reasonable price." },
  { id: "6aa8e98ca01a67d01c2c6727", name: "Alex F.", text: "I’ve always worried about florist arrangements around my cat. Now, I rest assured! Thank you PandP!" },
  { id: "6ae9f4c90b2276395fe0ca17", name: "Sumaya S.", text: "Went to the Halloween workshop for my birthday and had a lovely time! Will definitely be back 🩷" },
  { id: "6af7e6b18f7597b97050e9e6", name: "Theo C.", text: "So fun and chilled. The instructor was very knowledgeable and approachable. A lovely evening had." },
];

function TrustpilotStar({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 1.5l2.76 7.6h8.04l-6.5 4.73 2.48 7.67L12 16.77l-6.78 4.73 2.48-7.67-6.5-4.73h8.04z" />
    </svg>
  );
}

function FiveStars({ size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex gap-[2px]" aria-label="Rated 5 out of 5 stars" role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`${size} bg-[#00B67A] flex items-center justify-center`}>
          <TrustpilotStar className="w-[72%] h-[72%] text-white" />
        </span>
      ))}
    </div>
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
      className="shrink-0 w-[260px] sm:w-[300px] bg-white rounded-xl border border-[#E5E0D6]/80 px-4 py-3 shadow-[0_1px_2px_rgba(44,44,44,0.05)] hover:shadow-[0_10px_24px_-12px_rgba(44,44,44,0.3)] hover:-translate-y-0.5 transition-all duration-300"
      data-testid={hidden ? undefined : `trustpilot-review-${review.id}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 shrink-0 rounded-full bg-[#8DA399]/15 text-[#5F7A6E] text-[11px] font-semibold flex items-center justify-center">
            {review.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-[#2C2C2C] truncate" data-testid="trustpilot-review-name">{review.name}</span>
        </div>
        <FiveStars />
      </div>
      <p className="text-[12.5px] font-light leading-snug text-[#4B5563] line-clamp-2">“{review.text}”</p>
    </a>
  );
}

export default function TrustpilotReviews() {
  return (
    <section
      className="relative z-10 md:-mt-[112px] md:h-[112px] bg-[#F3F0E9] md:bg-white/70 md:backdrop-blur-md border-y md:border-b-0 border-[#E5E0D6]/60 md:border-white/60"
      data-testid="trustpilot-reviews-section"
    >
      <div className="h-full flex flex-col md:flex-row md:items-center">
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1 px-5 md:pl-8 lg:pl-12 md:pr-6 pt-4 pb-2 md:py-0 md:border-r md:border-[#2C2C2C]/10 md:h-[72px]"
          data-testid="trustpilot-read-all-btn"
        >
          <span className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#6B7280]">Reviews on</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold tracking-tight text-[#191919]">
              <TrustpilotStar className="w-4 h-4 text-[#00B67A]" />
              Trustpilot
            </span>
          </span>
          <span className="inline-flex items-center text-[11px] text-[#2C2C2C] underline-offset-4 group-hover:underline">
            Read all reviews <ArrowUpRight size={12} className="ml-0.5" />
          </span>
        </a>

        <div className="relative flex-1 min-w-0 overflow-hidden reviews-marquee-mask pb-4 md:pb-0" data-testid="trustpilot-reviews-marquee">
          <div className="reviews-marquee flex gap-4 w-max py-2">
            {REVIEWS.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
            {REVIEWS.map((r) => (
              <ReviewCard key={`dup-${r.id}`} review={r} hidden />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
