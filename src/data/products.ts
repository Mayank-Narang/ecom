export interface Product {
  id: string; // Required for frontend usage
  _id: string; // MongoDB ID
  name: string;
  price: number;
  description: string;
  imageURL: string;
  image?: string; // Alias for imageURL for backward compatibility
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

