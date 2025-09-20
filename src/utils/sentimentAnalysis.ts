// Positive and negative word lists (can be expanded as needed)
const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'nice', 'awesome',
  'fantastic', 'superb', 'outstanding', 'impressive', 'satisfied', 'happy', 'love', 'like',
  'recommend', 'best', 'brilliant', 'exceptional', 'fabulous', 'incredible', 'perfectly',
  'pleased', 'smooth', 'splendid', 'stellar', 'super', 'terrific', 'thrilled', 'wonderful',
  'working well', 'easy to use', 'high quality', 'value for money', 'exceeds expectations',
  'highly recommend', 'very good', 'very happy', 'very nice', 'very well', 'works great'
];

const negativeWords = [
  'bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'disappointed',
  'not good', 'not working', 'broke', 'broken', 'damaged', 'defective', 'faulty',
  'useless', 'waste', 'waste of money', 'regret', 'return', 'refund', 'never again',
  'don\'t buy', 'doesn\'t work', 'not worth it', 'not recommended', 'very bad',
  'very poor', 'very disappointed', 'not happy', 'not satisfied', 'not as described',
  'missing parts', 'missing items', 'late delivery', 'poor quality', 'cheap quality'
];

// Helper function to check if a word is positive
const isPositive = (word: string): boolean => {
  return positiveWords.includes(word.toLowerCase());
};

// Helper function to check if a word is negative
const isNegative = (word: string): boolean => {
  return negativeWords.includes(word.toLowerCase());
};

// Clean text by removing punctuation and converting to lowercase
const cleanText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Analyze sentiment of a given text
interface SentimentResult {
  score: number;
  comparative: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveWords: string[];
  negativeWords: string[];
}

export const analyzeSentiment = (text: string): SentimentResult => {
  const words = cleanText(text).split(' ');
  let positiveCount = 0;
  let negativeCount = 0;
  const positiveMatches: string[] = [];
  const negativeMatches: string[] = [];

  // Check each word and phrases
  const textToAnalyze = ` ${cleanText(text)} `; // Add spaces for whole word matching
  
  // Check for positive phrases (multi-word)
  positiveWords
    .filter(word => word.includes(' '))
    .forEach(phrase => {
      if (textToAnalyze.includes(` ${phrase} `)) {
        positiveCount += 2; // Give more weight to phrases
        positiveMatches.push(phrase);
      }
    });

  // Check for negative phrases (multi-word)
  negativeWords
    .filter(word => word.includes(' '))
    .forEach(phrase => {
      if (textToAnalyze.includes(` ${phrase} `)) {
        negativeCount += 2; // Give more weight to phrases
        negativeMatches.push(phrase);
      }
    });

  // Check individual words
  words.forEach(word => {
    // Skip if this word is part of a phrase we already counted
    const isPartOfCountedPhrase = 
      [...positiveMatches, ...negativeMatches].some(phrase => phrase.includes(word));
    
    if (isPartOfCountedPhrase) return;
    
    if (isPositive(word)) {
      positiveCount++;
      positiveMatches.push(word);
    } else if (isNegative(word)) {
      negativeCount++;
      negativeMatches.push(word);
    }
  });

  // Calculate score and determine sentiment
  const score = positiveCount - negativeCount;
  const comparative = words.length > 0 ? score / words.length : 0;
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (score >= 1) {
    sentiment = 'positive';
  } else if (score <= -1) {
    sentiment = 'negative';
  }

  return {
    score,
    comparative,
    sentiment,
    positiveWords: [...new Set(positiveMatches)], // Remove duplicates
    negativeWords: [...new Set(negativeMatches)], // Remove duplicates
  };
};

// Helper to get sentiment emoji
export const getSentimentEmoji = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return '😊';
    case 'negative': return '😞';
    default: return '😐';
  }
};

// Helper to get sentiment color class
export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return 'text-green-500';
    case 'negative': return 'text-red-500';
    default: return 'text-yellow-500';
  }
};
