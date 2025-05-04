/**
 * Configuration utility for external APIs
 */
export class ExternalApiConfig {
  /**
   * Get Kotak Securities API configuration
   * 
   * @returns Kotak Securities API configuration
   */
  static getKotakSecuritiesConfig() {
    return {
      apiKey: process.env.KOTAK_SECURITIES_API_KEY,
      apiSecret: process.env.KOTAK_SECURITIES_API_SECRET,
      isConfigured: !!(process.env.KOTAK_SECURITIES_API_KEY && process.env.KOTAK_SECURITIES_API_SECRET)
    };
  }

  /**
   * Get KredX API configuration
   * 
   * @returns KredX API configuration
   */
  static getKredXConfig() {
    return {
      apiKey: process.env.KREDX_API_KEY,
      apiSecret: process.env.KREDX_API_SECRET,
      isConfigured: !!(process.env.KREDX_API_KEY && process.env.KREDX_API_SECRET)
    };
  }

  /**
   * Get RazorpayX API configuration
   * 
   * @returns RazorpayX API configuration
   */
  static getRazorpayXConfig() {
    return {
      apiKey: process.env.RAZORPAYX_API_KEY,
      apiSecret: process.env.RAZORPAYX_API_SECRET,
      isConfigured: !!(process.env.RAZORPAYX_API_KEY && process.env.RAZORPAYX_API_SECRET)
    };
  }

  /**
   * Get FSAT API configuration
   * 
   * @returns FSAT API configuration
   */
  static getFSATConfig() {
    return {
      apiKey: process.env.FSAT_API_KEY,
      apiSecret: process.env.FSAT_API_SECRET,
      baseUrl: process.env.FSAT_BASE_URL,
      isConfigured: !!(process.env.FSAT_API_KEY && process.env.FSAT_API_SECRET && process.env.FSAT_BASE_URL)
    };
  }

  /**
   * Check if all external APIs are configured
   * 
   * @returns Whether all external APIs are configured
   */
  static areAllApisConfigured(): boolean {
    return (
      this.getKotakSecuritiesConfig().isConfigured &&
      this.getKredXConfig().isConfigured &&
      this.getRazorpayXConfig().isConfigured &&
      this.getFSATConfig().isConfigured
    );
  }

  /**
   * Get status of all external APIs configuration
   * 
   * @returns External APIs configuration status
   */
  static getApiConfigStatus() {
    return {
      kotakSecurities: this.getKotakSecuritiesConfig().isConfigured,
      kredx: this.getKredXConfig().isConfigured,
      razorpayx: this.getRazorpayXConfig().isConfigured,
      fsat: this.getFSATConfig().isConfigured
    };
  }

  /**
   * Get a list of APIs that are not configured
   * 
   * @returns List of APIs that are not configured
   */
  static getUnconfiguredApis(): string[] {
    const status = this.getApiConfigStatus();
    
    return Object.entries(status)
      .filter(([_, isConfigured]) => !isConfigured)
      .map(([apiName]) => apiName);
  }

  /**
   * Sanitized API configurations for display (no secrets)
   * 
   * @returns Sanitized API configurations
   */
  static getSanitizedApiConfigs() {
    const kotakSecurities = this.getKotakSecuritiesConfig();
    const kredx = this.getKredXConfig();
    const razorpayx = this.getRazorpayXConfig();
    const fsat = this.getFSATConfig();
    
    return {
      kotakSecurities: {
        isConfigured: kotakSecurities.isConfigured,
        apiKeyConfigured: !!kotakSecurities.apiKey,
        apiSecretConfigured: !!kotakSecurities.apiSecret
      },
      kredx: {
        isConfigured: kredx.isConfigured,
        apiKeyConfigured: !!kredx.apiKey,
        apiSecretConfigured: !!kredx.apiSecret
      },
      razorpayx: {
        isConfigured: razorpayx.isConfigured,
        apiKeyConfigured: !!razorpayx.apiKey,
        apiSecretConfigured: !!razorpayx.apiSecret
      },
      fsat: {
        isConfigured: fsat.isConfigured,
        apiKeyConfigured: !!fsat.apiKey,
        apiSecretConfigured: !!fsat.apiSecret,
        baseUrlConfigured: !!fsat.baseUrl
      }
    };
  }
}