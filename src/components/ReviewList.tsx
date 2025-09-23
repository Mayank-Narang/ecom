import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, StarHalf } from 'lucide-react';

export interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: {
    score: number;
    comparative: number;
    analysis: 'positive' | 'neutral' | 'negative';
    tokens?: string[];
    words?: string[];
    positive?: string[];
    negative?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewListProps {
  productId: string;
  reviews: Review[];
  loading: boolean;
  averageRating: number;
  totalReviews: number;
}

const getRatingDescription = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
};

const ReviewList: React.FC<ReviewListProps> = ({ 
  productId, 
  reviews, 
  loading, 
  averageRating, 
  totalReviews 
}) => {
  const [error, setError] = useState('');

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star icons based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-primary text-primary" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-primary text-primary" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-muted-foreground" />);
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          {totalReviews > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {totalReviews > 0 && (
          <Card className="p-4">
            <div className="flex items-center">
              <div className="text-4xl font-bold mr-4">
                {averageRating.toFixed(1)}
                <span className="text-muted-foreground text-2xl">/5</span>
              </div>
              <div>
                {renderStars(averageRating)}
                <p className="text-sm text-muted-foreground mt-1">
                  {getRatingDescription(averageRating)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to review this product!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.userName}</CardTitle>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  {review.sentiment && (
                    <Badge 
                      variant={review.sentiment.analysis === 'positive' ? 'default' : 
                              review.sentiment.analysis === 'negative' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {review.sentiment.analysis}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{review.comment}</p>
                {review.sentiment?.words && review.sentiment.words.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Key points:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.sentiment.words.slice(0, 5).map((word, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
