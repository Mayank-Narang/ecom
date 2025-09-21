import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, ArrowLeft, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { ReviewForm } from "@/components/ReviewForm";
import { getSentimentColor, getSentimentEmoji } from "@/utils/sentimentAnalysis";
import { useProductDetail } from "@/contexts/ProductDetailContext";
import { Product } from "@/data/products";

// Define Review interface locally since we don't want to import from products
interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  sentiment?: {
    score: number;
    comparative: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    positiveWords: string[];
    negativeWords: string[];
  };
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { 
    product, 
    reviews, 
    loading, 
    error, 
    addReview 
  } = useProductDetail();
  
  // Use the product directly since it already has the correct type from the context
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            {error || 'Product Not Found'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error 
              ? 'We encountered an error loading this product.' 
              : 'The product you are looking for does not exist or may have been removed.'}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/products" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  }, [product, addToCart, toast]);

  const handleAddReview = useCallback(async (reviewData: Omit<Review, 'id' | 'date' | 'sentiment'>) => {
    try {
      await addReview(reviewData);
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your review.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    }
  }, [addReview, toast]);


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/products" className="flex items-center text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-lg h-96 flex items-center justify-center p-8">
            <div className="h-full w-full flex items-center justify-center">
              <img 
                src={product.imageURL} 
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.rating ? product.rating.toFixed(1) : 'No'} rating
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <p className="text-3xl font-bold text-primary mb-6">{formatCurrency(product.price)}</p>
            
            <p className="text-muted-foreground mb-8">{product.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6">
                Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              <h4 className="text-lg font-medium mb-2">
                Average Rating: {reviews && reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : 'No ratings yet'}
              </h4>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            {review.sentiment && (
                              <div className="flex items-center ml-2">
                                <span className={`text-xs ${getSentimentColor(review.sentiment.sentiment)} flex items-center`}>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {review.sentiment.sentiment.charAt(0).toUpperCase() + review.sentiment.sentiment.slice(1)}
                                  {getSentimentEmoji(review.sentiment.sentiment)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review!</p>
                  {!user && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <p className="text-center text-gray-600 mb-2">Please log in to leave a review</p>
                      <Button 
                        onClick={() => navigate('/admin/login', { state: { from: location } })}
                        className="w-full"
                      >
                        Log In
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
