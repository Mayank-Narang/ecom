import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';
import { useToast } from '@/hooks/use-toast';
import { analyzeSentiment } from '@/data/feedback';
import { MessageSquare, Send, Star } from 'lucide-react';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Rating is required to submit feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call with sentiment analysis
    setTimeout(() => {
      const sentiment = analyzeSentiment(comment);
      
      /*
      MongoDB Feedback Submission:
      
      const feedbackData = {
        rating,
        comment,
        customerName: customerName || 'Anonymous',
        sentiment
      };

      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Feedback saved:', data);
      });
      */

      toast({
        title: "Feedback submitted successfully!",
        description: `Thank you ${customerName || 'Anonymous'}! Your feedback helps us improve our services. Sentiment: ${sentiment}`,
      });

      // Reset form
      setRating(0);
      setComment('');
      setCustomerName('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Share Your Experience
          </h1>
          <p className="text-xl text-muted-foreground">
            Your feedback helps us improve our solar products and services. 
            We value your honest opinion and use it to enhance customer experience.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Rate Your Experience
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName">Your Name (Optional)</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Rating */}
              <div>
                <Label className="mb-3 block">Overall Rating *</Label>
                <div className="flex items-center gap-4">
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating}
                    size="lg"
                  />
                  <span className="text-muted-foreground">
                    {rating === 0 && "Select a rating"}
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment">Comments & Suggestions *</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us about your experience with our solar products. What did you like? What could we improve?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-32"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your feedback will be analyzed for sentiment to help us better understand customer satisfaction.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">
            How we use your feedback:
          </h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Improve product quality and features</li>
            <li>• Enhance customer service experience</li>
            <li>• Develop new solar solutions based on your needs</li>
            <li>• Sentiment analysis helps us track customer satisfaction trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Feedback;