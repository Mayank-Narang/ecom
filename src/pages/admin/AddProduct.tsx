import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Product } from '@/data/products';
import { createProduct, getProductById, updateProduct } from '@/services/api';

export const AddProduct = () => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageURL: string;
  }>({
    name: '',
    description: '',
    price: 0,
    category: 'Solar Panels',
    imageURL: '',
  });
  const isEditMode = !!id;

  // Load product data if in edit mode
  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          const product = await getProductById(id);
          if (product) {
            const { _id, createdAt, updatedAt, ...rest } = product;
            setFormData(rest);
          }
        } catch (error) {
          console.error('Error loading product:', error);
          toast({
            title: 'Error',
            description: 'Failed to load product details',
            variant: 'destructive',
          });
        }
      }
    };
    
    loadProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = (): boolean => {
    const { name, price, description, imageURL, category } = formData;
    
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product description is required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!imageURL.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Image URL is required',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      new URL(imageURL);
    } catch (e) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid image URL',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: Number(formData.price), // Ensure price is a number
      };

      console.log('Submitting product data:', productData);

      if (isEditMode && id) {
        // Update existing product
        const updatedProduct = await updateProduct(id, productData);
        console.log('Updated product:', updatedProduct);
        
        toast({
          title: 'Success!',
          description: 'Product updated successfully',
        });
        
        // Redirect to products list after a short delay
        setTimeout(() => {
          navigate('/admin/products');
        }, 1000);
      } else {
        // Add new product
        const createdProduct = await createProduct(productData);
        console.log('Created product:', createdProduct);
        
        toast({
          title: 'Success!',
          description: 'Product added successfully',
        });
        
        // Reset form after successful submission
        setFormData({
          name: '',
          description: '',
          price: 0,
          category: 'Solar Panels',
          imageURL: '',
        });
        
        // Redirect to products list after a short delay
        setTimeout(() => {
          navigate('/admin/products');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'An unknown error occurred';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} product: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode ? 'Update the product details' : 'Add a new product to your store'}
        </p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Solar Panels">Solar Panels</option>
                <option value="Inverters">Inverters</option>
                <option value="Batteries">Batteries</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageURL">Image URL</Label>
              <Input
                id="imageURL"
                name="imageURL"
                type="url"
                value={formData.imageURL}
                onChange={handleChange}
                placeholder="Enter image URL"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? isEditMode 
                  ? 'Updating...' 
                  : 'Adding...' 
                : isEditMode 
                  ? 'Update Product' 
                  : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
