import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '@/services/api';
import { Product } from '@/data/products';

interface ProductDetailContextType {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refreshProduct: () => Promise<void>;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

interface ProductDetailProviderProps {
  children: React.ReactNode;
  initialProduct?: Product | null;
}

export const ProductDetailProvider: React.FC<ProductDetailProviderProps> = ({ 
  children,
  initialProduct = null 
}) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    console.log('fetchProduct called with id:', id);
    if (!id) {
      const errorMsg = 'No product ID provided';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Starting to fetch product with ID: ${id}`);
      setLoading(true);
      setError(null);
      
      console.log('Calling getProductById...');
      const data = await getProductById(id);
      console.log('Product data received in context:', {
        hasData: !!data,
        data: data,
        type: typeof data,
        keys: data ? Object.keys(data) : 'no data'
      });
      
      if (!data) {
        throw new Error('No data returned from getProductById');
      }
      
      // Ensure the product has the required id field
      const formattedProduct = {
        ...data,
        id: data.id || data._id || '', // Ensure id is always defined
      };
      
      setProduct(formattedProduct as Product);
      console.log('Product set in context state');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product details';
      console.error('Error in fetchProduct:', {
        error: err,
        message: errorMessage,
        productId: id,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(errorMessage);
      setProduct(null);
    } finally {
      console.log('fetchProduct completed, setting loading to false');
      setLoading(false);
    }
  };

  const refreshProduct = async () => {
    await fetchProduct();
  };

  useEffect(() => {
    if (!initialProduct) {
      fetchProduct();
    }
  }, [id]);

  const value = {
    product,
    loading,
    error,
    refreshProduct,
  };

  return (
    <ProductDetailContext.Provider value={value}>
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
