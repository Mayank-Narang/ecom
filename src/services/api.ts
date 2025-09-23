import axios from 'axios';
import { Product } from '@/data/products';

export interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: {
    score: number;
    comparative: number;
    analysis: 'positive' | 'neutral' | 'negative';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  success: boolean;
  data: {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    review?: Review;
  };
}

export interface ReviewStats {
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageRating: number;
  totalReviews: number;
  productName: string;
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

export interface CreateReviewData {
  productId: string;
  userName: string;
  rating: number;
  comment: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status}`, {
      data: response.data,
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : undefined,
    };
    console.error('[API] Response error:', errorDetails);
    return Promise.reject(error);
  }
);

// Products API
export interface GetProductsParams {
  search?: string;
  category?: string;
}

export const getProducts = async (params: GetProductsParams = {}) => {
  try {
    console.log('Fetching products with params:', params);
    const response = await api.get('/products', { params });
    console.log('Products API response:', response.data);
    
    // The backend now returns a direct array of products
    const products = Array.isArray(response.data) ? response.data : [];
    
    console.log(`Fetched ${products.length} products`);
    return products;
  } catch (error: any) {
    console.error('Error in getProducts:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    
    let errorMessage = 'Failed to fetch products';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const getProductById = async (id: string) => {
  try {
    console.log(`Fetching product with ID: ${id}`);
    const response = await api.get(`/products/${id}`);
    
    console.log('Raw API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    // The backend now returns a direct product object
    const product = response.data;
    
    if (!product || !product.id) {
      throw new Error('Invalid product data received');
    }
    
    console.log('Product data received:', product);
    return product;
  } catch (error: any) {
    console.error(`Error in getProductById:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    
    let errorMessage = `Failed to fetch product ${id}`;
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const deleteProduct = async (id: string) => {
  if (!id) {
    throw new Error('Product ID is required');
  }

  try {
    console.log(`[API] Attempting to delete product with ID:`, id);
    
    // Make the DELETE request with the ID in the URL path
    const response = await api.delete(`/products/${id}`);
    
    console.log('[API] Delete response:', response.data);
    
    // Check for success in the response
    if (response.data && response.data.success) {
      return true;
    }
    
    // If we get here, the request succeeded but the response format is unexpected
    console.warn('Unexpected response format from delete endpoint:', response.data);
    return true; // Still consider it a success if we get this far
    
  } catch (error: any) {
    console.error(`[API] Error deleting product ${id}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Handle different error cases
    if (error.response?.status === 404) {
      console.log(`[API] Product ${id} not found`);
      throw new Error('Product not found. It may have already been deleted.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    
    if (!navigator.onLine) {
      throw new Error('You are offline. Please check your internet connection.');
    }
    
    // Handle validation errors
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .map((err: any) => err.message || err.msg)
        .filter(Boolean);
      
      if (errorMessages.length > 0) {
        throw new Error(errorMessages.join('. '));
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to delete product. Please try again.';
    
    throw new Error(errorMessage);
  }
};

export interface CreateProductData {
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
}

export const createProduct = async (productData: CreateProductData) => {
  try {
    console.log('Creating product with data:', productData);
    
    // Ensure price is a number
    const payload = {
      ...productData,
      price: Number(productData.price)
    };
    
    console.log('Sending payload to server:', payload);
    
    const response = await api.post('/products', payload);
    console.log('Server response:', response.data);
    
    if (!response.data.success) {
      console.error('Server returned error:', response.data);
      throw new Error(response.data.message || 'Failed to create product');
    }
    
    if (!response.data.data) {
      console.error('No data in response:', response.data);
      throw new Error('No product data returned from server');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error in createProduct:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });
    
    let errorMessage = 'Failed to create product';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
  imageURL?: string;
  category?: string;
}

export const updateProduct = async (id: string, productData: UpdateProductData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update product');
    }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update product');
  }
};

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (productId: string): Promise<ReviewResponse> => {
  try {
    const response = await api.get<ReviewResponse>(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: CreateReviewData) => {
  try {
    const response = await api.post<ReviewResponse>('/reviews', reviewData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating review:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Get review statistics for a product
 * @param productId The ID of the product to get statistics for
 * @returns Review statistics including rating and sentiment distribution
 */
export const getReviewStats = async (productId: string): Promise<ReviewStatsResponse> => {
  try {
    const response = await api.get<ReviewStatsResponse>(`/reviews/stats/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching review stats:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Get review statistics for all products
 * @returns Review statistics for all products combined
 */
export const getAllReviewsStats = async (): Promise<ReviewStatsResponse> => {
  try {
    const response = await api.get<ReviewStatsResponse>('/reviews/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all reviews stats:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
