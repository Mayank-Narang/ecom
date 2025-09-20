import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, Sparkles } from 'lucide-react';
import { Product, Review } from '@/data/products';
import { getSentimentColor, getSentimentEmoji } from '@/utils/sentimentAnalysis';
import { useToast } from '@/hooks/use-toast';

const ProductReviews = () => {
  interface ProductWithStats extends Product {
    reviewCount: number;
    avgRating: number;
    sentimentCounts: {
      positive: number;
      negative: number;
      neutral: number;
    };
    sentimentScore: number;
  }

  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        
              // Calculate review stats and sentiment analysis for each product
        const productsWithStats = parsedProducts.map((product: Product) => {
          const reviewCount = product.reviews?.length || 0;
          const avgRating = product.rating || 0;
          
          // Sentiment analysis
          const sentimentCounts = {
            positive: 0,
            negative: 0,
            neutral: 0
          };
          
          if (product.reviews) {
            product.reviews.forEach(review => {
              const sentiment = review.sentiment?.sentiment || 'neutral';
              sentimentCounts[sentiment]++;
            });
          }
          
          return { 
            ...product, 
            reviewCount, 
            avgRating,
            sentimentCounts,
            sentimentScore: sentimentCounts.positive - sentimentCounts.negative
          };
        });
        
        setProducts(productsWithStats);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete functionality has been removed as per requirements

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedProduct ? 'Product Reviews' : 'All Products'}
          </h2>
          <p className="text-muted-foreground">
            {selectedProduct 
              ? `Viewing reviews for: ${selectedProduct.name}`
              : 'Select a product to view and manage reviews'}
          </p>
        </div>
        
        {selectedProduct && (
          <Button variant="outline" onClick={() => setSelectedProduct(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        )}
      </div>

      {!selectedProduct ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div 
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  
                  {/* Sentiment Summary */}
                  {product.reviewCount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center text-xs text-muted-foreground mb-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Sentiment: 
                        <span className={`ml-1 ${product.sentimentScore > 0 ? 'text-green-500' : product.sentimentScore < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                          {product.sentimentScore > 0 ? 'Mostly Positive' : product.sentimentScore < 0 ? 'Mostly Negative' : 'Neutral'}
                        </span>
                      </div>
                      
                      {/* Sentiment bars */}
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 text-xs">
                        <div 
                          className="flex items-center justify-center bg-green-500 text-white"
                          style={{ width: `${(product.sentimentCounts.positive / product.reviewCount) * 100}%` }}
                          title={`${product.sentimentCounts.positive} positive`}
                        />
                        <div 
                          className="flex items-center justify-center bg-yellow-500 text-white"
                          style={{ width: `${(product.sentimentCounts.neutral / product.reviewCount) * 100}%` }}
                          title={`${product.sentimentCounts.neutral} neutral`}
                        />
                        <div 
                          className="flex items-center justify-center bg-red-500 text-white"
                          style={{ width: `${(product.sentimentCounts.negative / product.reviewCount) * 100}%` }}
                          title={`${product.sentimentCounts.negative} negative`}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end ml-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm font-medium">
                      {product.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.reviews?.length || 0} review{selectedProduct.reviews?.length !== 1 ? 's' : ''}
                  {selectedProduct.rating ? ` • ${selectedProduct.rating.toFixed(1)} average rating` : ''}
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.floor(selectedProduct.rating || 0) ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedProduct.reviews?.length ? (
              selectedProduct.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-semibold mr-2">{review.userName}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {review.sentiment && (
                        <div className="mt-1">
                          <span className={`text-xs ${getSentimentColor(review.sentiment.sentiment)} flex items-center`}>
                            <Sparkles className="h-3 w-3 mr-1" />
                            {review.sentiment.sentiment.charAt(0).toUpperCase() + review.sentiment.sentiment.slice(1)}
                            {getSentimentEmoji(review.sentiment.sentiment)}
                          </span>
                          {(review.sentiment.positiveWords.length > 0 || review.sentiment.negativeWords.length > 0) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Detected: 
                              {review.sentiment.positiveWords.map((word, i) => (
                                <span key={`${review.id}-pos-${i}`} className="text-green-500 ml-1">{word}</span>
                              ))}
                              {review.sentiment.negativeWords.map((word, i) => (
                                <span key={`${review.id}-neg-${i}`} className="text-red-500 ml-1">{word}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                    
                    <div className="flex flex-col items-end ml-4">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="h-8 w-8"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reviews yet for this product.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
