import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { solarProducts as defaultProducts, Product } from "@/data/products";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          <div className="bg-white rounded-xl overflow-hidden shadow-lg flex items-center justify-center p-2">
            <div className="relative w-full h-[20rem] flex items-center justify-center">
              <img 
                src={product.imageURL} 
                alt={product.name}
                className="rounded-md shadow-sm w-auto h-auto max-w-full max-h-full object-contain max-w-[120%] max-h-[120%] object-center"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-muted-foreground">(24 reviews)</span>
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
              <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
              
              {/* Review Item */}
              <div className="border-b border-border pb-6 mb-6">
                <div className="flex items-center mb-2">
                  <div className="font-semibold mr-2">John D.</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2">Great product! Works as expected.</p>
                <div className="text-xs text-muted-foreground">March 15, 2023</div>
              </div>
              
              {/* Review Item */}
              <div className="border-b border-border pb-6">
                <div className="flex items-center mb-2">
                  <div className="font-semibold mr-2">Sarah M.</div>
                  <div className="flex text-yellow-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2">Good quality, fast shipping.</p>
                <div className="text-xs text-muted-foreground">February 28, 2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
