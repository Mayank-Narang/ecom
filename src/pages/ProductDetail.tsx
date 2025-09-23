import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getProductById, getProductReviews, createReview, Review } from '@/services/api';
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/data/products";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import StarRating from "@/components/StarRating";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Product features
  const productFeatures = [
    { text: "20% OFF" },
    { text: "1 Year Warranty" },
    { text: "Free Delivery" },
    { text: "10 Days Return Policy" }
  ];

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      
      // Fetch reviews for this product
      await fetchReviews(id);
    } catch (err) {
      setError('Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async (productId: string) => {
    try {
      setLoadingReviews(true);
      const response = await getProductReviews(productId);
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
        setReviewCount(response.data.totalReviews || 0);
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Create a cart item with only the required properties
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      imageURL: product.imageURL,
      category: product.category
    };
    
    addToCart(cartItem);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleReviewSubmitted = async (reviewData: { userName: string; rating: number; comment: string }) => {
    if (!id) return;
    
    try {
      setIsSubmittingReview(true);
      const response = await createReview({
        ...reviewData,
        productId: id,
      });
      
      // Refresh reviews to get the latest data
      await fetchReviews(id);
      
      // Also update the product's rating in the product details
      if (product) {
        const updatedProduct = await getProductById(id);
        setProduct(updatedProduct);
      }
      
      setShowReviewForm(false);
      
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      // Re-throw the error to be handled by the form
      throw error;
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderReviewSection = () => {
    if (showReviewForm && id) {
      return (
        <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Write a Review</h3>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmittingReview}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ReviewForm 
            onSubmit={handleReviewSubmitted}
            onCancel={() => setShowReviewForm(false)}
            isSubmitting={isSubmittingReview}
          />
        </div>
      );
    }

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || loadingReviews}
          >
            Write a Review
          </button>
        </div>
        
        <ReviewList 
          productId={id} 
          key={`reviews-${refreshKey}`} 
          reviews={reviews}
          loading={loadingReviews}
          averageRating={averageRating}
          totalReviews={reviewCount}
        />
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find the product you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.imageURL}
            alt={product.name}
            className="w-full h-auto object-cover"
            onError={(e) => {
              // Fallback to a placeholder image if the main image fails to load
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
            }}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-2">
            <StarRating rating={averageRating} />
            <span className="text-sm text-gray-600">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(product.price * 0.8)}
            </p>
            <p className="text-lg text-gray-500 line-through">
              {formatCurrency(product.price)}
            </p>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
              20% OFF
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {productFeatures.map((feature, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                {feature.text}
              </span>
            ))}
          </div>
          
          <p className="text-sm text-green-600 font-medium">
            In Stock
          </p>
          
          <p className="text-gray-700">{product.description}</p>
          
          <div className="pt-4">
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mb-12">
        {renderReviewSection()}
      </div>
    </div>
  );
};

export default ProductDetailPage;
