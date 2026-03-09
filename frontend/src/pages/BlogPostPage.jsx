import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 md:py-20 container mx-auto px-4 md:px-8 max-w-3xl animate-pulse">
        <div className="h-6 bg-[#F2F0EB] w-1/4 rounded mb-6" />
        <div className="h-12 bg-[#F2F0EB] w-3/4 rounded mb-4" />
        <div className="aspect-[16/9] bg-[#F2F0EB] rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#6B7280] font-light">Post not found.</p>
        <Link to="/blog" className="text-[#8DA399] mt-4 inline-block">Back to Journal</Link>
      </div>
    );
  }

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="py-8 md:py-16" data-testid="blog-post-page">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-light text-[#6B7280] hover:text-[#2C2C2C] transition-colors mb-8" data-testid="back-to-blog">
          <ArrowLeft size={14} /> Back to Journal
        </Link>

        <article className="animate-fade-in-up">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8DA399] mb-3 block">{post.author}</span>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-tight text-[#2C2C2C] mb-4" data-testid="blog-post-title">
              {post.title}
            </h1>
            {formattedDate && (
              <div className="flex items-center gap-2 text-sm font-light text-[#6B7280]">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </div>
  );
}
