import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/data/products';
import { getProducts, deleteProduct } from '@/services/api';

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load products from API on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products from server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState<{[key: string]: boolean}>({});

  const handleDelete = async (productId: string) => {
    if (!productId) {
      toast({
        title: 'Error',
        description: 'Invalid product ID',
        variant: 'destructive',
      });
      return;
    }

    // Find the product to confirm deletion
    const productToDelete = products.find(p => p._id === productId || p.id === productId);
    if (!productToDelete) {
      toast({
        title: 'Error',
        description: 'Product not found in local state',
        variant: 'destructive',
      });
      return;
    }

    // Get the correct ID to use (prefer id over _id if available)
    const idToDelete = productToDelete.id || productToDelete._id;
    
    if (!idToDelete) {
      toast({
        title: 'Error',
        description: 'Could not determine product ID',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Use the determined ID for all operations
      setIsDeleting(prev => ({ ...prev, [idToDelete]: true }));
      
      console.log('Deleting product:', { id: idToDelete, name: productToDelete.name });
      
      await deleteProduct(idToDelete);
      
      // Optimistically update the UI
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== idToDelete && product.id !== idToDelete)
      );
      
      toast({
        title: 'Success',
        description: `"${productToDelete.name}" has been deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      let errorMessage = 'Failed to delete product';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Refresh the product list to ensure consistency
      await loadProducts();
    } finally {
      setIsDeleting(prev => {
        const newState = { ...prev };
        // Clean up loading state for both possible ID fields
        if (productToDelete.id) delete newState[productToDelete.id];
        if (productToDelete._id) delete newState[productToDelete._id];
        return newState;
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
            <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center mb-2">
              <Package className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground">No products found</p>
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
              <div key={product._id} className="p-4 flex items-start justify-between">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={product.imageURL}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">₹{product.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          to={`/admin/products/${product.id || product._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id || product._id)}
                        disabled={isLoading || isDeleting[product.id || product._id]}
                        aria-label={`Delete ${product.name}`}
                      >
                        {isDeleting[product.id || product._id] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
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
