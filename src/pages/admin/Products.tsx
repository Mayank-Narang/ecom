import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, solarProducts as initialProducts } from '@/data/products';

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load products from localStorage on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      console.log('Loading products...');
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        // Load from localStorage if available
        const parsedProducts = JSON.parse(savedProducts);
        console.log('Loaded products from localStorage:', parsedProducts);
        setProducts(Array.isArray(parsedProducts) ? parsedProducts : []);
      } else {
        // Use initial products if localStorage is empty
        console.log('Using initial products:', initialProducts);
        const productsWithDefaults = initialProducts.map(product => ({
          ...product,
          isActive: product.isActive !== undefined ? product.isActive : true,
          stock: product.stock || 10
        }));
        
        // Save to localStorage for future use
        localStorage.setItem('products', JSON.stringify(productsWithDefaults));
        console.log('Saved initial products to localStorage');
        setProducts(productsWithDefaults);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      const updatedProducts = products.filter(product => product.id !== id);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Products</h2>
          <p className="text-muted-foreground">
            Manage your product listings
          </p>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/admin/products/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        {filteredProducts.length === 0 ? (
          <div className="text-center p-8">
            <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-2 text-sm font-medium">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by adding a new product.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/admin/products/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-start justify-between">
                <div className="flex gap-4">
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-medium">₹{product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/products/edit/${product.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
