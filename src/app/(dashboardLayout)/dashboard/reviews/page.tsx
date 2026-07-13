"use client";

import { useEffect, useState } from "react";
import { Review, Booking } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, MessageSquare, Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const tutorName = review.booking?.tutor?.user?.name ?? "Tutor";
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#611f69]/10 flex items-center justify-center overflow-hidden">
          <span className="text-sm font-bold text-[#611f69]">
            {tutorName[0]}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {tutorName}
          </p>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {review.comment}
      </p>
    </motion.div>
  );
}

export default function StudentReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewableBookings, setReviewableBookings] = useState<Booking[]>([]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/student`,
        { credentials: "include" },
      );
      const data = await res.json();
      setReviews(Array.isArray(data.data) ? data.data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableBookings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        credentials: "include",
      });
      const data = await res.json();
      const completed: Booking[] = Array.isArray(data.data)
        ? data.data.filter(
            (b: Booking) => b.status === "COMPLETED" && !b.review,
          )
        : [];
      setReviewableBookings(completed);
    } catch {
      setReviewableBookings([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openForm = async () => {
    await fetchReviewableBookings();
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!selectedBookingId || rating < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: selectedBookingId, rating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      toast.success("Review submitted!");
      setShowForm(false);
      setComment("");
      setRating(5);
      setSelectedBookingId("");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            My Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reviews you&apos;ve left for tutors
          </p>
        </div>
        <Button
          onClick={openForm}
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
        >
          <Plus className="w-4 h-4 mr-2" /> Leave Review
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No reviews yet. Leave your first review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <ReviewCard key={r.id} review={r} index={i} />
          ))}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="review-booking" className="block text-sm font-medium mb-1.5">
                Select Completed Session
              </label>
              {reviewableBookings.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No completed sessions available to review. Sessions must be
                  marked complete first.
                </p>
              ) : (
                <select
                  id="review-booking"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40"
                >
                  <option value="">Select a session…</option>
                  {reviewableBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.tutor?.user.name || "Tutor"} —{" "}
                      {new Date(b.dateTime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <StarSelector value={rating} onChange={setRating} />
            </div>
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium mb-1.5">
                Comment
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedBookingId}
              className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
