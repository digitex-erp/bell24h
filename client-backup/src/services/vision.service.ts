import axios, { AxiosInstance } from 'axios';

export interface ProductResult {
  name: string;
  score: number;
  imageUri: string;
  price: string;
  description?: string;
  category?: string;
}

export interface VisionApiResponse {
  products: ProductResult[];
  labels: Array<{ description: string; score: number }>;
  webEntities: Array<{ description: string; score: number }>;
  error?: string;
}

class VisionService {
  private apiKey: string;
  private apiUrl: string;
  private client: AxiosInstance;

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY || '';
    this.apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    
    if (!this.apiKey) {
      console.warn('Google Cloud Vision API key is not set. Please set REACT_APP_GOOGLE_CLOUD_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      params: { key: this.apiKey },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Detects products in an image using Google Cloud Vision API
   * @param imageFile The image file to analyze
   * @returns Promise with detected products and metadata
   */
  async detectProducts(imageFile: File): Promise<VisionApiResponse> {
    if (!this.apiKey) {
      throw new Error('Google Cloud Vision API key is not configured');
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await this.client.post('', {
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'WEB_DETECTION', maxResults: 10 },
              { type: 'PRODUCT_SEARCH', maxResults: 5 },
              { type: 'TEXT_DETECTION', maxResults: 5 }
            ],
            imageContext: {
              productSearchParams: {
                productSet: `projects/${process.env.REACT_APP_GOOGLE_CLOUD_PROJECT_ID}/locations/us-west1/productSets/your-product-set`,
                productCategories: ['general-v1']
              }
            }
          }
        ]
      });

      if (!response.data?.responses?.[0]) {
        throw new Error('Invalid response from Vision API');
      }

      return this.processVisionResponse(response.data.responses[0]);
    } catch (error: any) {
      console.error('Error detecting products:', error);
      return {
        products: [],
        labels: [],
        webEntities: [],
        error: error.message || 'Failed to process image'
      };
    }
  }

  /**
   * Processes the raw Vision API response into a structured format
   */
  private processVisionResponse(response: any): VisionApiResponse {
    // Process labels (general object detection)
    const labels = (response.labelAnnotations || []).map((label: any) => ({
      description: label.description,
      score: label.score || 0
    }));

    // Process web entities (web search results)
    const webEntities = (response.webDetection?.webEntities || [])
      .filter((entity: any) => entity.description && entity.score > 0.5)
      .map((entity: any) => ({
        description: entity.description,
        score: entity.score
      }));

    // Process product search results
    let products: ProductResult[] = [];
    
    if (response.productSearchResults?.results) {
      products = response.productSearchResults.results.map((result: any) => ({
        name: result.product?.displayName || 'Unnamed Product',
        score: result.score || 0,
        imageUri: result.image || result.product?.imageUri || '',
        price: this.extractPrice(result.product?.productLabels),
        description: result.product?.description,
        category: result.product?.productCategory
      }));
    }

    // If no products found but we have labels, create product suggestions
    if (products.length === 0 && labels.length > 0) {
      products = labels
        .filter((label: any) => label.score > 0.7)
        .slice(0, 3)
        .map((label: any) => ({
          name: label.description,
          score: label.score,
          imageUri: '',
          price: 'Price not available',
          description: `Potential match for ${label.description}`
        }));
    }

    return {
      labels,
      webEntities,
      products: products.sort((a, b) => (b.score || 0) - (a.score || 0))
    };
  }

  /**
   * Extracts price information from product labels
   */
  private extractPrice(labels?: Array<{description: string}>) {
    if (!labels) return 'Price not available';
    
    // Look for price patterns in labels
    const priceLabel = labels.find(label => 
      /^\$?\d+(\.\d{2})?$/.test(label.description) ||
      /\d+(\.\d{2})?\s?(USD|EUR|GBP|INR)/i.test(label.description)
    );
    
    return priceLabel?.description || 'Price not available';
  }

  /**
   * Converts a File object to a base64-encoded string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        reject(new Error('File is not an image'));
        return;
      }

      // Check file size (max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        reject(new Error('Image is too large. Maximum size is 10MB.'));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = result.split(',')[1];
          if (!base64Data) {
            throw new Error('Failed to read image data');
          }
          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(new Error('Failed to read image file'));
      };
    });
  }
}

export const visionService = new VisionService();
