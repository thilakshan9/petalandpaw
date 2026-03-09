import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/blog?published=true`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 md:py-20" data-testid="blog-page">
      <SEOHead title="Journal" description="Stories about flowers, pets, sustainability, and Scandinavian living." keywords="pet safe flowers blog, flower care, sustainable florals" />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="mb-12 animate-fade-in-up">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8DA399] mb-3 block">Journal</span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-medium tracking-tight text-[#2C2C2C]">
            Our Journal
          </h1>
          <p className="text-base md:text-lg font-light text-[#6B7280] mt-4 max-w-lg">
            Stories about flowers, pets, sustainability, and the art of Scandinavian living.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-[#F2F0EB] rounded-xl mb-4" />
                <div className="h-4 bg-[#F2F0EB] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#F2F0EB] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`group block animate-fade-in-up delay-${(i + 1) * 100}`}
                data-testid={`blog-card-${post.slug}`}
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-[#F2F0EB]">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#8DA399] mb-2 block">{post.author}</span>
                <h2 className="font-['Playfair_Display'] text-xl md:text-2xl font-medium text-[#2C2C2C] group-hover:text-[#8DA399] transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm font-light text-[#6B7280] leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest font-semibold text-[#2C2C2C] group-hover:text-[#8DA399] transition-colors">
                  Read More <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
