import fetch from 'node-fetch';

/**
 * Base API client with common functionality for all API clients
 */
export class BaseApiClient {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  /**
   * Constructor for the base API client
   * 
   * @param baseUrl - The base URL for the API
   * @param headers - Default headers to include in all requests
   */
  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  /**
   * Make a GET request to the API
   * 
   * @param endpoint - The endpoint to request
   * @param queryParams - Query parameters to include in the request
   * @param customHeaders - Additional headers to include in the request
   * @returns The response data
   */
  async get<T>(endpoint: string, queryParams: Record<string, any> = {}, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = this._buildUrl(endpoint, queryParams);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    return this._handleResponse<T>(response);
  }

  /**
   * Make a POST request to the API
   * 
   * @param endpoint - The endpoint to request
   * @param data - The data to send in the request body
   * @param customHeaders - Additional headers to include in the request
   * @returns The response data
   */
  async post<T>(endpoint: string, data: Record<string, any> = {}, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse<T>(response);
  }

  /**
   * Make a PUT request to the API
   * 
   * @param endpoint - The endpoint to request
   * @param data - The data to send in the request body
   * @param customHeaders - Additional headers to include in the request
   * @returns The response data
   */
  async put<T>(endpoint: string, data: Record<string, any> = {}, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse<T>(response);
  }

  /**
   * Make a PATCH request to the API
   * 
   * @param endpoint - The endpoint to request
   * @param data - The data to send in the request body
   * @param customHeaders - Additional headers to include in the request
   * @returns The response data
   */
  async patch<T>(endpoint: string, data: Record<string, any> = {}, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse<T>(response);
  }

  /**
   * Make a DELETE request to the API
   * 
   * @param endpoint - The endpoint to request
   * @param customHeaders - Additional headers to include in the request
   * @returns The response data
   */
  async delete<T>(endpoint: string, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    return this._handleResponse<T>(response);
  }

  /**
   * Build a URL with the base URL and endpoint, optionally including query parameters
   * 
   * @param endpoint - The endpoint to include in the URL
   * @param queryParams - Query parameters to include in the URL
   * @returns The built URL
   * @private
   */
  protected _buildUrl(endpoint: string, queryParams: Record<string, any> = {}): string {
    // Ensure the endpoint has a leading slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build the URL with the base URL and endpoint
    let url = `${this.baseUrl}${formattedEndpoint}`;
    
    // Add query parameters if they exist
    if (Object.keys(queryParams).length > 0) {
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => {
          if (value === undefined || value === null) {
            return null;
          }
          
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .filter(Boolean)
        .join('&');
      
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return url;
  }

  /**
   * Handle a response from the API, parsing the JSON and checking for errors
   * 
   * @param response - The response to handle
   * @returns The parsed response data
   * @private
   */
  protected async _handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    // Parse the response body based on the content type
    let data: any;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Check if the response was successful
    if (!response.ok) {
      const error = new Error(typeof data === 'string' ? data : JSON.stringify(data));
      (error as any).status = response.status;
      (error as any).response = data;
      throw error;
    }
    
    return data as T;
  }
}