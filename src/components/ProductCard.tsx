import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/data/products';
import { ShoppingCart, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Use _id as the primary identifier, fall back to id if _id is not available
  const productId = product._id || product.id;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30 h-full flex flex-col">
      <Link 
        to={`/products/${productId}`}
        state={{ product }} // Pass the entire product object in the state
        className="block flex-1 flex flex-col"
      >
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-success text-success-foreground text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              {product.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 flex-1 flex flex-col">
          <CardTitle className="text-base font-semibold mb-1 text-foreground line-clamp-2 h-10">
            {product.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs line-clamp-2 mb-2 flex-1">
            {product.description}
          </CardDescription>
        </CardContent>
      </Link>
      
      <CardFooter className="p-3 pt-0 mt-auto">
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs sm:text-sm"
              asChild
            >
              <Link 
              to={`/products/${product.id}`}
              state={{ product }} // Pass the entire product object in the state
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent event bubbling
            >
                Details
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full text-xs sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};