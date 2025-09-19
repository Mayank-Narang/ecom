// Dummy feedback data with sentiment analysis
export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  customerName?: string;
  date: string;
}

// Simple sentiment analysis function (mock)
export const analyzeSentiment = (text: string): 'Positive' | 'Negative' | 'Neutral' => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'disappointed'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  return 'Neutral';
};

export const dummyFeedback: Feedback[] = [
  {
    id: "1",
    rating: 5,
    comment: "Excellent solar panels! The quality is amazing and installation was smooth.",
    sentiment: 'Positive',
    customerName: "John Smith",
    date: "2024-01-15"
  },
  {
    id: "2", 
    rating: 4,
    comment: "Good product overall, delivery was quick. Could use better packaging.",
    sentiment: 'Positive',
    customerName: "Sarah Johnson", 
    date: "2024-01-14"
  },
  {
    id: "3",
    rating: 2,
    comment: "Disappointed with the inverter quality. Had issues after one month.",
    sentiment: 'Negative',
    customerName: "Mike Davis",
    date: "2024-01-13"
  },
  {
    id: "4",
    rating: 5,
    comment: "Perfect solution for my home! Love the monitoring system features.",
    sentiment: 'Positive', 
    customerName: "Lisa Wilson",
    date: "2024-01-12"
  },
  {
    id: "5",
    rating: 3,
    comment: "Product works as expected. Customer service was helpful.",
    sentiment: 'Neutral',
    customerName: "Robert Brown",
    date: "2024-01-11"
  }
];

/*
MongoDB Schema for Feedback:
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral'],
    required: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);

// API Route: POST /api/feedback
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

app.post('/api/feedback', async (req, res) => {
  try {
    const { rating, comment, customerName } = req.body;
    
    // Analyze sentiment
    const analysis = sentiment.analyze(comment);
    let sentimentResult = 'Neutral';
    
    if (analysis.score > 0) sentimentResult = 'Positive';
    else if (analysis.score < 0) sentimentResult = 'Negative';
    
    const feedback = new Feedback({
      rating,
      comment,
      sentiment: sentimentResult,
      customerName
    });
    
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// API Route: GET /api/feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/