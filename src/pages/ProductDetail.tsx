import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductById } from '@/services/api';
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { getSentimentColor } from "@/utils/sentimentAnalysis";
import { Product } from "@/data/products";

type SentimentAnalysis = {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveWords: string[];
  negativeWords: string[];
};

interface ProductWithRating extends Product {
  rating?: number;
  sentiment?: SentimentAnalysis;
  image?: string; // Add image as an optional field for backward compatibility
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img 
            src={product.imageURL} 
            alt={product.name}
            className="w-full h-auto object-contain max-h-[500px]"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.averageRating?.toFixed(1) || 'No ratings yet'})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            <span className="text-sm text-green-600 line-through">
              {formatCurrency(product.price * 1.2)} {/* 20% more as original price */}
            </span>
            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              20% OFF
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p>{product.description}</p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10 Days Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pay on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>7 Days Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          {product.sentiment && (
            <div className="mt-4 p-4 rounded-md" style={{
              backgroundColor: `${getSentimentColor(product.sentiment.sentiment)}20`,
              borderLeft: `4px solid ${getSentimentColor(product.sentiment.sentiment)}`
            }}>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="font-medium">
                  {product.sentiment.sentiment.charAt(0).toUpperCase() + product.sentiment.sentiment.slice(1)} 
                  sentiment ({(product.sentiment.score * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 mt-6">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
