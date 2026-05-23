import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { toast } from "../components/Toast";

type UserReview = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    rating: 5,
    comment: "Absolutely saved my commute! Getting verified took less than an hour, and now I share rides from Kukatpally to IIIT every single day. The UI is incredibly beautiful too!",
    date: "2 hours ago"
  },
  {
    id: 2,
    name: "Sneha Reddy",
    rating: 5,
    comment: "Love the female passengers preference filter! Makes campus rides feel safe and comfortable. The pricing is perfectly calculated and fair.",
    date: "1 day ago"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    rating: 4,
    comment: "Super convenient and pocket-friendly compared to standard auto fares. Live tracking works great, hope more students join soon!",
    date: "3 days ago"
  }
];

export function RateAppPage() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<UserReview[]>(INITIAL_REVIEWS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast("Please provide your name and comments.", "error");
      return;
    }
    const newReview: UserReview = {
      id: Math.round(Math.random() * 100000),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: "Just now"
    };
    setReviews(prev => [newReview, ...prev]);
    toast("Thank you for rating ShareFare! ❤️", "success");
    setSubmitted(true);
    setName("");
    setComment("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Side: Rating Input Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                <Heart className="h-3.5 w-3.5 fill-indigo-100" /> Community Feedback
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rate ShareFare</h1>
              <p className="text-sm leading-relaxed text-slate-600">
                Your feedback helps us polish and optimize our Hyderabad student mobility network. Let us know your experience!
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">Review Submitted!</h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Thank you! Your feedback has been logged and published to our community reviews panel.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Submit another review
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Stars selector */}
                <div className="space-y-2 text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tap to Select Stars</span>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = (hoverRating ?? rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="transition-transform duration-150 active:scale-95"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`h-9 w-9 shrink-0 transition-colors ${
                              isHighlighted
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 hover:text-amber-200"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="block text-sm font-semibold text-slate-900 mt-2">
                    {rating === 5 ? "Excellent! Love it!" :
                     rating === 4 ? "Very Good!" :
                     rating === 3 ? "Good, could be better" :
                     rating === 2 ? "Needs improvement" :
                     "Poor experience"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Feedback Comments</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you like or what we can improve..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                  />
                </div>

                <GradientButton type="submit" className="w-full">
                  Submit Review
                </GradientButton>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Community Reviews */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 max-h-[580px] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" /> Peer Reviews
            </h2>

            <div className="space-y-3.5">
              <AnimatePresence>
                {reviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                          {rev.name.slice(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 truncate">{rev.name}</span>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{rev.comment}</p>
                    <div className="text-[10px] text-slate-400 text-right">{rev.date}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
