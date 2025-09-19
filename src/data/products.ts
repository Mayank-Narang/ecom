// Dummy solar products data
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
}

export const solarProducts: Product[] = [
  {
    id: "1",
    name: "High-Efficiency Solar Panel 400W",
    price: 299.99,
    description: "Monocrystalline silicon solar panel with 21% efficiency rating. Perfect for residential installations.",
    imageURL: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    category: "Panels"
  },
  {
    id: "2", 
    name: "MPPT Solar Charge Controller",
    price: 189.99,
    description: "30A MPPT charge controller with LCD display and multiple load control modes.",
    imageURL: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop",
    category: "Controllers"
  },
  {
    id: "3",
    name: "Pure Sine Wave Inverter 3000W", 
    price: 549.99,
    description: "3000W pure sine wave power inverter with remote control and multiple protection features.",
    imageURL: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    category: "Inverters"
  },
  {
    id: "4",
    name: "Deep Cycle Solar Battery 200Ah",
    price: 449.99, 
    description: "AGM deep cycle battery designed for solar energy storage systems with 10-year warranty.",
    imageURL: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    category: "Batteries"
  },
  {
    id: "5",
    name: "Solar Panel Mounting Kit",
    price: 129.99,
    description: "Universal roof mounting system for solar panels with stainless steel hardware included.",
    imageURL: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop", 
    category: "Accessories"
  },
  {
    id: "6",
    name: "Smart Solar Monitoring System",
    price: 79.99,
    description: "WiFi-enabled monitoring device to track your solar system performance in real-time.",
    imageURL: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Monitoring"
  }
];

/*
MongoDB Schema for Products:
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

// API Route: GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/