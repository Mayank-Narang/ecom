import axios from 'axios';
import { Product } from '@/data/products';

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
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch products');
    }
    
    // Ensure we always return an array
    const products = response.data.data || [];
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
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch product');
    }
    
    if (!response.data.data) {
      console.error('No data in response:', response.data);
      throw new Error('No product data found in response');
    }
    
    console.log('Product data received:', response.data.data);
    return response.data.data;
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
  try {
    const response = await api.delete(`/products/${id}`);
    if (response.data && response.data.success) {
      return true;
    }
    throw new Error(response.data?.message || 'Failed to delete product');
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    // If we get a 404, the product was already deleted
    if (error.response?.status === 404) {
      return true;
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete product');
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

// Reviews API
export const getProductReviews = async (productId: string) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

export const addReview = async (productId: string, reviewData: {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  try {
    const response = await api.post(`/reviews/product/${productId}`, reviewData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, reviewData: {
  rating: number;
  comment: string;
  userId: string;
}) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string, userId: string) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`, {
      data: { userId },
    });
    return response.data.success;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
};
