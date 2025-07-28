import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Video RFQ API Services
 */
export const videoRfqApi = {
  // Update an RFQ with video information
  updateRfqWithVideo: async (rfqId: string, videoUrl: string, thumbnailUrl: string) => {
    try {
      const response = await axios.patch(`${API_URL}/rfq/${rfqId}`, {
        videoUrl,
        thumbnailUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error updating RFQ with video:', error);
      throw error;
    }
  },
  
  // Get video analytics for an RFQ
  getRfqVideoAnalytics: async (rfqId: string) => {
    try {
      const response = await axios.get(`${API_URL}/video-analytics/rfq/${rfqId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting RFQ video analytics:', error);
      throw error;
    }
  }
};

/**
 * Product Showcase API Services
 */
export const productShowcaseApi = {
  // Create a new product showcase
  createProductShowcase: async (showcaseData: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    productId: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/product-showcase`, showcaseData);
      return response.data;
    } catch (error) {
      console.error('Error creating product showcase:', error);
      throw error;
    }
  },
  
  // Get a product showcase by ID
  getProductShowcase: async (showcaseId: string) => {
    try {
      const response = await axios.get(`${API_URL}/product-showcase/${showcaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product showcase:', error);
      throw error;
    }
  },
  
  // Update a product showcase
  updateProductShowcase: async (
    showcaseId: string,
    showcaseData: {
      title?: string;
      description?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
    }
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/product-showcase/${showcaseId}`,
        showcaseData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product showcase:', error);
      throw error;
    }
  },
  
  // Delete a product showcase
  deleteProductShowcase: async (showcaseId: string) => {
    try {
      await axios.delete(`${API_URL}/product-showcase/${showcaseId}`);
      return true;
    } catch (error) {
      console.error('Error deleting product showcase:', error);
      throw error;
    }
  },
  
  // List product showcases with filtering
  listProductShowcases: async (filters: {
    productId?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await axios.get(`${API_URL}/product-showcase`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error listing product showcases:', error);
      throw error;
    }
  },
  
  // Get analytics for a product showcase
  getProductShowcaseAnalytics: async (showcaseId: string) => {
    try {
      const response = await axios.get(`${API_URL}/product-showcase/${showcaseId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error getting product showcase analytics:', error);
      throw error;
    }
  }
};

/**
 * Video Analytics API Services
 */
export const videoAnalyticsApi = {
  // Track a video view
  trackVideoView: async (data: {
    videoId: string;
    videoType: 'rfq' | 'productShowcase';
    duration?: number;
    deviceInfo?: any;
    userLocation?: any;
    userDemographics?: any;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/video-analytics/view`, data);
      return response.data;
    } catch (error) {
      console.error('Error tracking video view:', error);
      throw error;
    }
  },
  
  // Update video analytics
  updateVideoAnalytics: async (
    analyticsId: string,
    data: {
      views?: number;
      watchTime?: number;
      engagement?: number;
      clickThroughRate?: number;
      conversionRate?: number;
      regionHeatmap?: any;
      viewerDemographics?: any;
    }
  ) => {
    try {
      const response = await axios.patch(`${API_URL}/video-analytics/${analyticsId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating video analytics:', error);
      throw error;
    }
  },
  
  // Get video analytics by ID
  getVideoAnalytics: async (analyticsId: string) => {
    try {
      const response = await axios.get(`${API_URL}/video-analytics/${analyticsId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video analytics:', error);
      throw error;
    }
  },
  
  // Get aggregated analytics
  getAggregatedAnalytics: async (filters: {
    videoType?: 'rfq' | 'productShowcase' | 'all';
    startDate?: string;
    endDate?: string;
    companyId?: string;
  }) => {
    try {
      const response = await axios.get(`${API_URL}/video-analytics/aggregated`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting aggregated analytics:', error);
      throw error;
    }
  },
  
  // Get heatmap data for a video
  getVideoHeatmap: async (analyticsId: string) => {
    try {
      const response = await axios.get(`${API_URL}/video-analytics/${analyticsId}/heatmap`);
      return response.data;
    } catch (error) {
      console.error('Error getting video heatmap:', error);
      throw error;
    }
  },
  
  // Get demographic data for a video
  getVideoDemographics: async (analyticsId: string) => {
    try {
      const response = await axios.get(`${API_URL}/video-analytics/${analyticsId}/demographics`);
      return response.data;
    } catch (error) {
      console.error('Error getting video demographics:', error);
      throw error;
    }
  }
};
