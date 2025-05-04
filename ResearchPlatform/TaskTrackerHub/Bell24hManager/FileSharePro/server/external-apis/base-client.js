import fetch from 'node-fetch';

/**
 * Base API client with common functionality for all API clients
 */
export class BaseApiClient {
  /**
   * Constructor for the base API client
   * 
   * @param {string} baseUrl - The base URL for the API
   * @param {Object} headers - Default headers to include in all requests
   */
  constructor(baseUrl, headers = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  /**
   * Make a GET request to the API
   * 
   * @param {string} endpoint - The endpoint to request
   * @param {Object} queryParams - Query parameters to include in the request
   * @param {Object} customHeaders - Additional headers to include in the request
   * @returns {Promise<Object>} - The response data
   */
  async get(endpoint, queryParams = {}, customHeaders = {}) {
    const url = this._buildUrl(endpoint, queryParams);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    return this._handleResponse(response);
  }

  /**
   * Make a POST request to the API
   * 
   * @param {string} endpoint - The endpoint to request
   * @param {Object} data - The data to send in the request body
   * @param {Object} customHeaders - Additional headers to include in the request
   * @returns {Promise<Object>} - The response data
   */
  async post(endpoint, data = {}, customHeaders = {}) {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse(response);
  }

  /**
   * Make a PUT request to the API
   * 
   * @param {string} endpoint - The endpoint to request
   * @param {Object} data - The data to send in the request body
   * @param {Object} customHeaders - Additional headers to include in the request
   * @returns {Promise<Object>} - The response data
   */
  async put(endpoint, data = {}, customHeaders = {}) {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse(response);
  }

  /**
   * Make a PATCH request to the API
   * 
   * @param {string} endpoint - The endpoint to request
   * @param {Object} data - The data to send in the request body
   * @param {Object} customHeaders - Additional headers to include in the request
   * @returns {Promise<Object>} - The response data
   */
  async patch(endpoint, data = {}, customHeaders = {}) {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    
    return this._handleResponse(response);
  }

  /**
   * Make a DELETE request to the API
   * 
   * @param {string} endpoint - The endpoint to request
   * @param {Object} customHeaders - Additional headers to include in the request
   * @returns {Promise<Object>} - The response data
   */
  async delete(endpoint, customHeaders = {}) {
    const url = this._buildUrl(endpoint);
    const headers = { ...this.headers, ...customHeaders };
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    return this._handleResponse(response);
  }

  /**
   * Build a URL with the base URL and endpoint, optionally including query parameters
   * 
   * @param {string} endpoint - The endpoint to include in the URL
   * @param {Object} queryParams - Query parameters to include in the URL
   * @returns {string} - The built URL
   * @private
   */
  _buildUrl(endpoint, queryParams = {}) {
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
   * @param {Response} response - The response to handle
   * @returns {Promise<Object>} - The parsed response data
   * @private
   */
  async _handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    // Parse the response body based on the content type
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Check if the response was successful
    if (!response.ok) {
      const error = new Error(typeof data === 'string' ? data : JSON.stringify(data));
      error.status = response.status;
      error.response = data;
      throw error;
    }
    
    return data;
  }
}