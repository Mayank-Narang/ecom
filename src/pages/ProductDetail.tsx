import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { solarProducts as defaultProducts, Product, Review } from "@/data/products";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { ReviewForm } from "@/components/ReviewForm";
import { getSentimentColor, getSentimentEmoji } from "@/utils/sentimentAnalysis";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = () => {
      try {
        // First check localStorage
        const savedProducts = localStorage.getItem('products');
        let productsList: Product[] = [];

        if (savedProducts) {
          productsList = JSON.parse(savedProducts);
        } else {
          // Fallback to default products if localStorage is empty
          productsList = defaultProducts;
        }

        const foundProduct = productsList.find(p => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setReviews(foundProduct.reviews || []);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="text-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

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
              <div className="flex items-center mr-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <p className="text-3xl font-bold text-primary mb-6">{formatCurrency(product.price)}</p>
            
            <p className="text-muted-foreground mb-8">{product.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                onClick={() => addToCart(product)}
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
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              )}
              
              {/* Review Form */}
              <ReviewForm 
                productId={product.id} 
                onReviewSubmit={() => {
                  // Reload product to get updated reviews
                  const savedProducts = localStorage.getItem('products');
                  if (savedProducts) {
                    const products = JSON.parse(savedProducts);
                    const updatedProduct = products.find((p: Product) => p.id === product.id);
                    if (updatedProduct) {
                      setProduct(updatedProduct);
                      setReviews(updatedProduct.reviews || []);
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
