import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Star, Trash2 } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { useAuth } from '../context/AuthContext';

export default function ReviewsList({ productId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getByProduct(productId);
        setReviews(response.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, refreshTrigger]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="text-center text-[#b0b0b0]">Loading reviews...</div>;
  }

  return (
    <div>
      {error && (
        <Alert className="mb-4 border-red-500 bg-red-500/10">
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}

      {reviews.length === 0 ? (
        <p className="text-[#b0b0b0] text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-[#1a2332] p-4 rounded-lg border border-[#2a3444]"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[#f5f5f0] font-semibold">{review.user_email || 'User'}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? 'text-[#d4af37] fill-[#d4af37]'
                            : 'text-[#2a3444]'
                        }
                      />
                    ))}
                  </div>
                </div>
                {currentUserId === review.user_id && (
                  <Button
                    onClick={() => handleDeleteReview(review._id)}
                    className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    size="sm"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              <p className="text-[#b0b0b0] leading-relaxed">{review.comment}</p>
              <p className="text-[#5a6a7a] text-xs mt-3">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
