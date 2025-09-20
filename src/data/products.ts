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
  id: string;
  name: string;
  price: number; // Price in INR
  description: string;
  imageURL: string;
  category: string;
  stock?: number;
  isActive?: boolean;
  rating?: number; // Average rating
  reviews?: Review[];
}

export const solarProducts: Product[] = [
  {
    id: "1",
    name: "High-Efficiency Solar Panel 400W",
    price: 24999,
    description: "Monocrystalline silicon solar panel with 21% efficiency rating. Perfect for residential installations.",
    imageURL: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    category: "Panels"
  },
  {
    id: "2", 
    name: "MPPT Solar Charge Controller",
    price: 15899,
    description: "30A MPPT charge controller with LCD display and multiple load control modes.",
    imageURL: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop",
    category: "Controllers"
  },
  {
    id: "3",
    name: "Pure Sine Wave Inverter 3000W", 
    price: 45999,
    description: "3000W pure sine wave power inverter with remote control and multiple protection features.",
    imageURL: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    category: "Inverters"
  },
  {
    id: "4",
    name: "Deep Cycle Solar Battery 200Ah",
    price: 37999,
    description: "AGM deep cycle battery designed for solar energy storage systems with 10-year warranty.",
    imageURL: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    category: "Batteries"
  },
  {
    id: "5",
    name: "Solar Panel Mounting Kit",
    price: 10899,
    description: "Universal roof mounting system for solar panels with stainless steel hardware included.",
    imageURL: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop", 
    category: "Accessories"
  },
  {
    id: "6",
    name: "Smart Solar Monitoring System",
    price: 6699,
    description: "WiFi-enabled monitoring device to track your solar system performance in real-time.",
    imageURL: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Monitoring"
  }
];