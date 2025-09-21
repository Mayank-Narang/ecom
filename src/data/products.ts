export interface SentimentAnalysis {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveWords: string[];
  negativeWords: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  sentiment?: SentimentAnalysis; // Added sentiment analysis data
}

export interface Product {
  id: string; // Required for frontend usage
  _id: string; // MongoDB ID
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
  ratings: Array<{
    userId: string;
    rating: number;
  }>;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

