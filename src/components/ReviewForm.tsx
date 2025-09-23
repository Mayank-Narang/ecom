import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReviewFormProps {
  onSubmit: (data: { userName: string; rating: number; comment: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  userName: string;
  comment: string;
  rating: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    comment: '',
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName.trim() || !formData.comment.trim() || formData.rating === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsFormSubmitting(true);
    setError('');

    try {
      await onSubmit({
        userName: formData.userName,
        rating: formData.rating,
        comment: formData.comment,
      });

      // Reset form
      setFormData({
        userName: '',
        comment: '',
        rating: 0,
      });
      
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
      
      onCancel();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Write a Review</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isFormSubmitting || isSubmitting}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="userName">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              disabled={isFormSubmitting || isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>
              Your Rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isFormSubmitting || isSubmitting}
                  className="p-1 focus:outline-none"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      (hoveredRating || formData.rating) >= star
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating > 0
                  ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}`
                  : 'Select rating'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your thoughts about this product..."
              className="min-h-[120px]"
              disabled={isFormSubmitting || isSubmitting}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormSubmitting || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFormSubmitting || isSubmitting}
          >
            {isFormSubmitting || isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReviewForm;
