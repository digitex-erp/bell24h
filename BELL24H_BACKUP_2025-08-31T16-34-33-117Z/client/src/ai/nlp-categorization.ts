import * as tf from '@tensorflow/tfjs';
import {
  tfLoader,
  initializeTensorFlow,
  loadModel,
  measureInference,
  getPerformanceMetrics,
} from '@/lib/tensorflow-loader';

// AI Categorization Interfaces
export interface CategoryPrediction {
  category: string;
  confidence: number;
  subcategory?: string;
  reasoning: string[];
}

export interface NLPAnalysis {
  categories: CategoryPrediction[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
  extractedEntities: {
    companies: string[];
    locations: string[];
    products: string[];
    prices: string[];
  };
  performanceMetrics?: {
    processingTime: number;
    modelLoadTime: number;
    backendUsed: string;
  };
}

export class RFQCategorizer {
  private model: any = null;
  private tokenizer: any = null;
  private categoryMap: Map<number, string> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      console.log('🤖 Initializing RFQ Categorizer with optimized TensorFlow.js...');

      // Initialize TensorFlow.js with optimizations
      await initializeTensorFlow();

      // Setup category mapping
      this.setupCategoryMapping();

      // Load the model with optimizations
      await this.initializeModel();

      this.isInitialized = true;
      console.log('✅ RFQ Categorizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RFQ Categorizer:', error);
      this.setupFallbackClassification();
    }
  }

  private async initializeModel() {
    try {
      // Load pre-trained BERT model for classification with optimizations
      this.model = await loadModel('/models/rfq-classifier/model.json', {
        cache: true,
        timeout: 30000,
        onProgress: progress => {
          console.log(`📊 Model loading progress: ${progress}%`);
        },
      });

      console.log('✅ NLP Model loaded successfully with optimizations');

      // Log performance metrics
      const metrics = getPerformanceMetrics();
      if (metrics) {
        console.log(`🚀 Backend: ${tfLoader.getBackend()}`);
        console.log(`⚡ Optimizations: ${metrics.backendOptimizations.join(', ')}`);
        console.log(`💾 Memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (error) {
      console.warn('⚠️ NLP Model not found, using fallback classification');
      this.setupFallbackClassification();
    }
  }

  private setupCategoryMapping() {
    // Map model outputs to Bell24H categories
    this.categoryMap.set(0, 'agriculture');
    this.categoryMap.set(1, 'electronics');
    this.categoryMap.set(2, 'computers-internet');
    this.categoryMap.set(3, 'apparel-fashion');
    this.categoryMap.set(4, 'automobile');
    this.categoryMap.set(5, 'ayurveda-herbal');
    this.categoryMap.set(6, 'business-services');
    this.categoryMap.set(7, 'chemicals');
    this.categoryMap.set(8, 'cosmetics-personal-care');
    this.categoryMap.set(9, 'electronics-electrical');
    this.categoryMap.set(10, 'food-beverage');
    this.categoryMap.set(11, 'furniture-carpentry');
    this.categoryMap.set(12, 'gifts-crafts');
    this.categoryMap.set(13, 'health-beauty');
    this.categoryMap.set(14, 'home-furnishings');
    this.categoryMap.set(15, 'home-supplies');
    this.categoryMap.set(16, 'machinery');
    this.categoryMap.set(17, 'industrial-supplies');
    this.categoryMap.set(18, 'jewelry-designers');
    this.categoryMap.set(19, 'mineral-metals');
    this.categoryMap.set(20, 'office-supplies');
    this.categoryMap.set(21, 'packaging-paper');
    this.categoryMap.set(22, 'real-estate-construction');
    this.categoryMap.set(23, 'security-products');
    this.categoryMap.set(24, 'sports-entertainment');
    this.categoryMap.set(25, 'telecommunication');
    this.categoryMap.set(26, 'textiles');
    this.categoryMap.set(27, 'tools-equipment');
    this.categoryMap.set(28, 'tours-travels-hotels');
    this.categoryMap.set(29, 'toys-games');
    this.categoryMap.set(30, 'renewable-energy');
    this.categoryMap.set(31, 'ai-automation');
    this.categoryMap.set(32, 'sustainable-products');
    this.categoryMap.set(33, 'healthcare-technology');
    this.categoryMap.set(34, 'ecommerce-solutions');
    this.categoryMap.set(35, 'gaming-esports');
    this.categoryMap.set(36, 'electric-vehicles');
    this.categoryMap.set(37, 'drones-uavs');
    this.categoryMap.set(38, 'wearable-technology');
    this.categoryMap.set(39, 'logistics-solutions');
    this.categoryMap.set(40, '3d-printing');
    this.categoryMap.set(41, 'food-tech-agri-tech');
    this.categoryMap.set(42, 'iron-steel-industry');
    this.categoryMap.set(43, 'mining-raw-materials');
    this.categoryMap.set(44, 'metal-recycling');
    this.categoryMap.set(45, 'metallurgy-metalworking');
    this.categoryMap.set(46, 'heavy-machinery');
    this.categoryMap.set(47, 'ferrous-non-ferrous');
    this.categoryMap.set(48, 'mining-safety');
    this.categoryMap.set(49, 'precious-metals');
  }

  private setupFallbackClassification() {
    // Keyword-based classification as fallback
    console.log('🔄 Using keyword-based classification fallback');
  }

  async analyzeRFQ(rfqText: string): Promise<NLPAnalysis> {
    // Ensure the system is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    const text = rfqText.toLowerCase();

    // Measure performance with optimized TensorFlow.js
    const { result, inferenceTime } = await measureInference(async () => {
      // Extract entities using regex patterns
      const entities = this.extractEntities(text);

      // Perform category classification
      const categories = await this.classifyCategories(text);

      // Analyze sentiment
      const sentiment = this.analyzeSentiment(text);

      // Determine urgency
      const urgency = this.extractUrgency(text);

      return {
        categories,
        sentiment,
        urgency,
        extractedEntities: entities,
      };
    });

    // Add performance metrics
    const performanceMetrics = getPerformanceMetrics();

    return {
      ...result,
      performanceMetrics: {
        processingTime: inferenceTime,
        modelLoadTime: performanceMetrics?.modelLoadTime || 0,
        backendUsed: tfLoader.getBackend(),
      },
    };
  }

  private async classifyCategories(text: string): Promise<CategoryPrediction[]> {
    if (this.model) {
      return this.mlClassification(text);
    } else {
      return this.keywordClassification(text);
    }
  }

  private async mlClassification(text: string): Promise<CategoryPrediction[]> {
    try {
      // Tokenize and preprocess text for BERT
      const tokens = this.tokenizeText(text);

      // Create input tensor with proper memory management
      const inputTensor = tf.tensor2d([tokens], [1, 128]);

      // Run inference with performance measurement
      const { result: predictions, inferenceTime } = await measureInference(async () => {
        return this.model!.predict(inputTensor) as any;
      });

      const probabilities = await predictions.data();

      // Clean up tensors to prevent memory leaks
      inputTensor.dispose();
      predictions.dispose();

      // Convert to category predictions
      const results: CategoryPrediction[] = [];

      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > 0.3) {
          // Confidence threshold
          const category = this.categoryMap.get(i) || 'unknown';
          results.push({
            category,
            confidence: probabilities[i],
            reasoning: [
              `ML confidence: ${(probabilities[i] * 100).toFixed(1)}%`,
              `Inference time: ${inferenceTime.toFixed(2)}ms`,
              `Backend: ${tfLoader.getBackend()}`,
            ],
          });
        }
      }

      return results.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    } catch (error) {
      console.error('❌ ML Classification failed:', error);
      // Fallback to keyword classification
      return this.keywordClassification(text);
    }
  }

  private keywordClassification(text: string): CategoryPrediction[] {
    // Advanced keyword-based classification with reasoning
    const classifications: CategoryPrediction[] = [];

    // Agriculture keywords
    const agriKeywords = [
      'agriculture',
      'farming',
      'seeds',
      'fertilizer',
      'tractor',
      'crop',
      'harvest',
      'irrigation',
      'basmati',
      'rice',
      'wheat',
      'sugar',
      'cotton',
      'vegetables',
      'fruits',
      'organic',
      'pesticide',
      'livestock',
      'dairy',
      'poultry',
    ];
    const agriScore = this.calculateKeywordScore(text, agriKeywords);
    if (agriScore > 0) {
      classifications.push({
        category: 'agriculture',
        confidence: agriScore,
        reasoning: [
          `Matched agriculture keywords: ${this.getMatchedKeywords(text, agriKeywords).join(', ')}`,
        ],
      });
    }

    // Electronics keywords
    const elecKeywords = [
      'electronics',
      'semiconductor',
      'circuit',
      'microcontroller',
      'resistor',
      'capacitor',
      'pcb',
      'led',
      'display',
      'sensor',
      'battery',
      'charger',
      'cable',
      'component',
      'chip',
      'processor',
      'memory',
      'ic',
      'diode',
      'transistor',
    ];
    const elecScore = this.calculateKeywordScore(text, elecKeywords);
    if (elecScore > 0) {
      classifications.push({
        category: 'electronics',
        confidence: elecScore,
        reasoning: [
          `Matched electronics keywords: ${this.getMatchedKeywords(text, elecKeywords).join(', ')}`,
        ],
      });
    }

    // Automobile keywords
    const autoKeywords = [
      'automobile',
      'car',
      'vehicle',
      'brake',
      'engine',
      'tire',
      'automotive',
      'parts',
      'transmission',
      'clutch',
      'gear',
      'steering',
      'suspension',
      'radiator',
      'battery',
      'alternator',
      'headlight',
      'bumper',
      'windshield',
      'dashboard',
    ];
    const autoScore = this.calculateKeywordScore(text, autoKeywords);
    if (autoScore > 0) {
      classifications.push({
        category: 'automobile',
        confidence: autoScore,
        reasoning: [
          `Matched automotive keywords: ${this.getMatchedKeywords(text, autoKeywords).join(', ')}`,
        ],
      });
    }

    // Textile keywords
    const textileKeywords = [
      'textile',
      'fabric',
      'cotton',
      'silk',
      'wool',
      'polyester',
      'yarn',
      'thread',
      'cloth',
      'garment',
      'apparel',
      'dress',
      'shirt',
      'pants',
      'jacket',
      'fashion',
      'clothing',
      'weaving',
      'knitting',
      'dyeing',
    ];
    const textileScore = this.calculateKeywordScore(text, textileKeywords);
    if (textileScore > 0) {
      classifications.push({
        category: 'textiles',
        confidence: textileScore,
        reasoning: [
          `Matched textile keywords: ${this.getMatchedKeywords(text, textileKeywords).join(', ')}`,
        ],
      });
    }

    // Chemical keywords
    const chemicalKeywords = [
      'chemical',
      'acid',
      'alkali',
      'polymer',
      'solvent',
      'catalyst',
      'reagent',
      'compound',
      'solution',
      'industrial',
      'pharmaceutical',
      'cosmetic',
      'paint',
      'adhesive',
      'coating',
      'plastic',
      'rubber',
      'petrochemical',
      'fertilizer',
      'pesticide',
    ];
    const chemicalScore = this.calculateKeywordScore(text, chemicalKeywords);
    if (chemicalScore > 0) {
      classifications.push({
        category: 'chemicals',
        confidence: chemicalScore,
        reasoning: [
          `Matched chemical keywords: ${this.getMatchedKeywords(text, chemicalKeywords).join(
            ', '
          )}`,
        ],
      });
    }

    // Machinery keywords
    const machineryKeywords = [
      'machinery',
      'machine',
      'equipment',
      'motor',
      'pump',
      'compressor',
      'generator',
      'turbine',
      'valve',
      'bearing',
      'gear',
      'conveyor',
      'crane',
      'excavator',
      'bulldozer',
      'forklift',
      'lathe',
      'mill',
      'press',
      'furnace',
    ];
    const machineryScore = this.calculateKeywordScore(text, machineryKeywords);
    if (machineryScore > 0) {
      classifications.push({
        category: 'machinery',
        confidence: machineryScore,
        reasoning: [
          `Matched machinery keywords: ${this.getMatchedKeywords(text, machineryKeywords).join(
            ', '
          )}`,
        ],
      });
    }

    // Food & Beverage keywords
    const foodKeywords = [
      'food',
      'beverage',
      'snack',
      'drink',
      'juice',
      'milk',
      'tea',
      'coffee',
      'spices',
      'oil',
      'flour',
      'sugar',
      'salt',
      'processed',
      'packaged',
      'frozen',
      'fresh',
      'organic',
      'restaurant',
      'catering',
    ];
    const foodScore = this.calculateKeywordScore(text, foodKeywords);
    if (foodScore > 0) {
      classifications.push({
        category: 'food-beverage',
        confidence: foodScore,
        reasoning: [
          `Matched food & beverage keywords: ${this.getMatchedKeywords(text, foodKeywords).join(
            ', '
          )}`,
        ],
      });
    }

    // Construction keywords
    const constructionKeywords = [
      'construction',
      'building',
      'cement',
      'concrete',
      'steel',
      'brick',
      'tile',
      'paint',
      'pipe',
      'wire',
      'lumber',
      'plumbing',
      'electrical',
      'roofing',
      'flooring',
      'door',
      'window',
      'hardware',
      'contractor',
      'architect',
    ];
    const constructionScore = this.calculateKeywordScore(text, constructionKeywords);
    if (constructionScore > 0) {
      classifications.push({
        category: 'real-estate-construction',
        confidence: constructionScore,
        reasoning: [
          `Matched construction keywords: ${this.getMatchedKeywords(
            text,
            constructionKeywords
          ).join(', ')}`,
        ],
      });
    }

    // Add more categories as needed...

    return classifications.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    let score = 0;
    let matches = 0;

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matches++;
        // Weight longer keywords higher
        score += keyword.length / 100;
      }
    });

    if (matches === 0) return 0;

    // Normalize score (0-1 range) with bonus for multiple matches
    const baseScore = score / keywords.length;
    const matchBonus = matches / keywords.length;
    return Math.min(baseScore + matchBonus, 1);
  }

  private getMatchedKeywords(text: string, keywords: string[]): string[] {
    return keywords.filter(keyword => text.includes(keyword));
  }

  private extractEntities(text: string) {
    // Enhanced entity extraction
    return {
      companies: this.extractCompanies(text),
      locations: this.extractLocations(text),
      products: this.extractProducts(text),
      prices: this.extractPrices(text),
    };
  }

  private extractCompanies(text: string): string[] {
    // Pattern: "Company Name Pvt Ltd", "Corp", "Inc", etc.
    const companyPatterns = [
      /([A-Z][a-zA-Z\s]+(?:Pvt\s+Ltd|Ltd|Corp|Inc|Company))/g,
      /([A-Z][a-zA-Z\s]+(?:Solutions|Systems|Industries|Enterprises|Technologies))/g,
    ];

    const companies: string[] = [];
    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) companies.push(...matches);
    });

    return [...new Set(companies)]; // Remove duplicates
  }

  private extractLocations(text: string): string[] {
    // Indian cities and states
    const locations = [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Chennai',
      'Kolkata',
      'Hyderabad',
      'Pune',
      'Ahmedabad',
      'Jaipur',
      'Surat',
      'Lucknow',
      'Kanpur',
      'Nagpur',
      'Indore',
      'Thane',
      'Bhopal',
      'Visakhapatnam',
      'Pimpri',
      'Patna',
      'Vadodara',
      'Ghaziabad',
      'Ludhiana',
      'Agra',
      'Nashik',
      'Faridabad',
      'Meerut',
      'Rajkot',
      'Kalyan',
      'Vasai',
      'Varanasi',
      'Maharashtra',
      'Karnataka',
      'Tamil Nadu',
      'Gujarat',
      'Rajasthan',
      'Punjab',
      'Haryana',
      'Uttar Pradesh',
      'West Bengal',
      'Madhya Pradesh',
      'Andhra Pradesh',
      'Telangana',
      'Kerala',
      'Odisha',
      'Bihar',
      'Jharkhand',
      'Assam',
      'Chhattisgarh',
      'Goa',
    ];

    return locations.filter(location => text.toLowerCase().includes(location.toLowerCase()));
  }

  private extractProducts(text: string): string[] {
    // Common product terms
    const productPatterns = [
      /(\d+\s+(?:tonnes?|kg|units?|pieces?|meters?|liters?|gallons?)\s+[a-zA-Z\s]+)/g,
      /([a-zA-Z\s]+(?:equipment|machinery|parts|components|supplies|materials|products))/g,
      /([a-zA-Z\s]+(?:steel|iron|copper|aluminum|plastic|rubber|glass|ceramic))/g,
    ];

    const products: string[] = [];
    productPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) products.push(...matches);
    });

    return products.slice(0, 5); // Limit to top 5
  }

  private extractPrices(text: string): string[] {
    // Price patterns: ₹1,00,000, $10,000, etc.
    const pricePatterns = [
      /[₹$][\d,]+(?:\s*-\s*[₹$][\d,]+)?/g,
      /[\d,]+\s*(?:INR|USD|EUR|GBP)/g,
      /[\d,]+\s*(?:rupees?|dollars?|per\s+(?:unit|kg|tonne|piece))/g,
    ];

    const prices: string[] = [];
    pricePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) prices.push(...matches);
    });

    return [...new Set(prices)]; // Remove duplicates
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    // Enhanced sentiment analysis
    const positiveWords = [
      'excellent',
      'best',
      'premium',
      'quality',
      'urgent',
      'immediate',
      'good',
      'great',
      'top',
      'high',
      'superior',
      'reliable',
      'trusted',
      'certified',
      'verified',
      'professional',
    ];
    const negativeWords = [
      'cheap',
      'low',
      'minimum',
      'budget',
      'used',
      'old',
      'damaged',
      'defective',
      'poor',
      'bad',
      'waste',
      'rejected',
      'scrap',
      'second-hand',
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });

    // Consider context and weights
    if (positiveScore > negativeScore + 1) return 'positive';
    if (negativeScore > positiveScore + 1) return 'negative';
    return 'neutral';
  }

  private extractUrgency(text: string): 'high' | 'medium' | 'low' {
    const urgentWords = [
      'urgent',
      'immediate',
      'asap',
      'emergency',
      'rush',
      'priority',
      'quickly',
      'fast',
      'soon',
      'critical',
    ];

    // Check for urgent keywords
    const urgentCount = urgentWords.filter(word => text.includes(word)).length;
    if (urgentCount >= 2) return 'high';
    if (urgentCount >= 1) return 'medium';

    // Check for time indicators
    const timePatterns = [
      /(\d+)\s*days?/g,
      /(\d+)\s*weeks?/g,
      /(\d+)\s*months?/g,
      /(\d+)\s*hours?/g,
    ];

    for (const pattern of timePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const timeValue = parseInt(matches[0]);
        if (pattern.source.includes('hours?') && timeValue <= 24) return 'high';
        if (pattern.source.includes('days?') && timeValue <= 7) return 'high';
        if (pattern.source.includes('days?') && timeValue <= 30) return 'medium';
        if (pattern.source.includes('weeks?') && timeValue <= 2) return 'high';
        if (pattern.source.includes('weeks?') && timeValue <= 4) return 'medium';
        if (pattern.source.includes('months?') && timeValue <= 1) return 'medium';
      }
    }

    return 'low'; // Default
  }

  private tokenizeText(text: string): number[] {
    // Simplified tokenization (replace with proper BERT tokenizer in production)
    const tokens = text.toLowerCase().split(/\s+/);
    return tokens.map(token => this.tokenToId(token)).slice(0, 128);
  }

  private tokenToId(token: string): number {
    // Simplified token to ID mapping
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 30000; // Vocabulary size
  }
}
