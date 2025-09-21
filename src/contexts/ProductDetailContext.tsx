import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getProductReviews } from '@/services/api';
import { Product, Review } from '@/data/products';

interface ProductWithRating extends Product {
  rating?: number;
}

interface ProductDetailContextType {
  product: ProductWithRating | null;
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refreshProduct: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date' | 'sentiment'>) => Promise<void>;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

export const ProductDetailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) {
      setError('No product ID provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching product with ID: ${id}`);
      const data = await getProductById(id);
      console.log('Product data received in context:', data);
      setProduct(data as ProductWithRating);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product details';
      console.error('Error in fetchProduct:', {
        error: err,
        message: errorMessage,
        productId: id
      });
      setError(errorMessage);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      const data = await getProductReviews(id);
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'sentiment'>) => {
    if (!id) return;
    
    try {
      const newReview = {
        ...reviewData,
        id: `rev_${Date.now()}`,
        date: new Date().toISOString(),
        sentiment: {
          score: 0,
          comparative: 0,
          sentiment: 'neutral',
          positiveWords: [],
          negativeWords: []
        }
      };
      
      // In a real app, you would call your API here to add the review
      // For now, we'll just update the local state
      setReviews(prev => [...prev, newReview as Review]);
      
      // Update the product's average rating
      if (product) {
        const allReviews = [...reviews, newReview as Review];
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        setProduct(prev => ({
          ...prev!,
          rating: parseFloat(avgRating.toFixed(1))
        }));
      }
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    }
  };

  return (
    <ProductDetailContext.Provider value={{
      product: product || ({} as Product & { rating?: number }),
      reviews,
      loading,
      error,
      refreshProduct: fetchProduct,
      refreshReviews: fetchReviews,
      addReview,
    }}>
      {children}
    </ProductDetailContext.Provider>
  );
};

export const useProductDetail = (): ProductDetailContextType => {
  const context = useContext(ProductDetailContext);
  if (context === undefined) {
    throw new Error('useProductDetail must be used within a ProductDetailProvider');
  }
  return context;
};
