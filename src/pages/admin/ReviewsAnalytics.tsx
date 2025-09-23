import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getProductReviews, Review, ReviewResponse } from '@/services/api';
import { Product } from '@/data/products';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ReviewsAnalytics = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate statistics from reviews
  const calculateStats = (reviews: Review[]) => {
    const totalReviews = reviews.length;
    const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
    
    reviews.forEach(review => {
      // Count rating distribution
      ratingDistribution[review.rating.toString() as keyof typeof ratingDistribution]++;
      
      // Count sentiment distribution
      if (review.sentiment) {
        const sentiment = review.sentiment.analysis.toLowerCase() as keyof typeof sentimentDistribution;
        sentimentDistribution[sentiment]++;
      }
    });
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // Calculate sentiment percentages
    const positivePercentage = totalReviews > 0 ? 
      (sentimentDistribution.positive / totalReviews) * 100 : 0;
    
    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      sentimentDistribution,
      positivePercentage
    };
  };
  
  const stats = calculateStats(reviews);
  
  const ratingData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Reviews',
        data: [
          stats.ratingDistribution['1'],
          stats.ratingDistribution['2'],
          stats.ratingDistribution['3'],
          stats.ratingDistribution['4'],
          stats.ratingDistribution['5']
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          stats.sentimentDistribution.positive,
          stats.sentimentDistribution.neutral,
          stats.sentimentDistribution.negative
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green
          'rgba(251, 191, 36, 0.8)', // yellow
          'rgba(239, 68, 68, 0.8)', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  const loadReviews = async (productId: string | null) => {
    if (!productId) return;
    
    setIsLoadingStats(true);
    setError(null);
    
    try {
      const response = await getProductReviews(productId);
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
      } else {
        setReviews([]);
        throw new Error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
      toast({
        title: 'Error',
        description: 'Failed to load product reviews',
        variant: 'destructive',
      });
      setReviews([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts({});
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
          // Load reviews for the first product
          loadReviews(data[0].id);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId) || null;
    setSelectedProduct(product);
    loadReviews(productId);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews Analytics</h1>
          <p className="text-muted-foreground">Analyze product reviews and ratings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Select Product</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats.totalReviews}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats.averageRating.toFixed(1)}/5
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positive Sentiment</p>
                  <p className="text-2xl font-bold">
                    {isLoadingStats ? '...' : Math.round(stats.positivePercentage)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-3 space-y-6">
          <Tabs defaultValue="ratings" className="w-full">
            <TabsList>
              <TabsTrigger value="ratings">Rating Distribution</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ratings" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <Bar 
                    data={ratingData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                  <div className="w-2/3">
                    <Pie 
                      data={sentimentData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReviewsAnalytics;
