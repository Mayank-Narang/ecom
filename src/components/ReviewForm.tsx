import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeSentiment, getSentimentEmoji, getSentimentColor } from '@/utils/sentimentAnalysis';

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: (review: {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
  userId: string;
  userName: string;
  onUserNameChange?: (name: string) => void;
}

export const ReviewForm = ({ 
  productId, 
  onReviewSubmit, 
  userId, 
  userName: propUserName, 
  onUserNameChange 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(propUserName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState<{
    score: number;
    comparative: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    positiveWords: string[];
    negativeWords: string[];
  } | null>(null);
  const { toast } = useToast();

  // Analyze sentiment when comment changes
  useEffect(() => {
    if (comment.trim()) {
      const analysis = analyzeSentiment(comment);
      setSentiment(analysis);
    } else {
      setSentiment(null);
    }
  }, [comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onReviewSubmit({
        userId,
        userName: userName.trim(),
        rating,
        comment,
      });
      
      // Show sentiment feedback to user
      toast({
        title: `Your review is ${sentiment?.sentiment} ${getSentimentEmoji(sentiment?.sentiment || 'neutral')}`,
        description: sentiment?.positiveWords.length || sentiment?.negativeWords.length 
          ? `Detected keywords: ${[...(sentiment?.positiveWords || []), ...(sentiment?.negativeWords || [])].join(', ')}`
          : undefined,
      });
      
      // Clear the form
      setRating(0);
      setComment('');
      setSentiment(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              if (onUserNameChange) onUserNameChange(e.target.value);
            }}
            placeholder="Your name"
            className="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
            disabled={!!propUserName}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`h-8 w-8 flex items-center justify-center rounded-full ${
                  star <= rating ? 'bg-yellow-100' : 'bg-gray-100'
                } hover:bg-yellow-50`}
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              Your Review <span className="text-red-500">*</span>
            </label>
            {sentiment && (
              <div className={`flex items-center text-sm ${getSentimentColor(sentiment.sentiment)}`}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span className="capitalize">
                  {sentiment.sentiment} {getSentimentEmoji(sentiment.sentiment)}
                </span>
              </div>
            )}
          </div>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts about this product..."
            className="w-full"
            disabled={isSubmitting}
          />
          {sentiment && (sentiment.positiveWords.length > 0 || sentiment.negativeWords.length > 0) && (
            <div className="mt-2 text-xs text-muted-foreground">
              Detected: 
              {sentiment.positiveWords.map(word => (
                <span key={`pos-${word}`} className="text-green-500 ml-1">{word}</span>
              ))}
              {sentiment.negativeWords.map(word => (
                <span key={`neg-${word}`} className="text-red-500 ml-1">{word}</span>
              ))}
            </div>
          )}
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
};
