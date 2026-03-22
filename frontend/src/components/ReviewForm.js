import React, { useState } from 'react';
import { reviewService } from '../services/api';
import { Button } from './ui/button.jsx';
import { Textarea } from './ui/textarea.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Star } from 'lucide-react';

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      await reviewService.create({
        product_id: productId,
        rating,
        title: '',
        comment,
      });
      setComment('');
      setRating(5);
      setSuccess('Review posted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      onReviewAdded?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3444]">
      <h3 className="text-lg font-semibold text-[#f5f5f0] mb-4">Leave a Review</h3>

      {error && (
        <Alert className="mb-4 border-red-500 bg-red-500/10">
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-500/10">
          <AlertDescription className="text-green-500">{success}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <label className="block text-[#b0b0b0] mb-2 text-sm font-medium">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition"
            >
              <Star
                size={28}
                className={
                  star <= rating
                    ? 'text-[#d4af37] fill-[#d4af37]'
                    : 'text-[#2a3444]'
                }
              />
            </button>
          ))}
          <span className="ml-2 text-[#b0b0b0]">{rating}/5</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[#b0b0b0] mb-2 text-sm font-medium">Comment</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0] placeholder-[#5a6a7a]"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold"
      >
        {loading ? 'Posting...' : 'Post Review'}
      </Button>
    </form>
  );
}
