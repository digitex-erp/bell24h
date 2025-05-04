import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { log } from '../vite';
import { Buffer } from 'buffer';

class IPFSService {
  private client: IPFSHTTPClient | null = null;
  private isConnected: boolean = false;
  
  constructor() {
    this.initializeClient();
  }
  
  private initializeClient() {
    try {
      // Connect to IPFS - use environment variable or default to Infura
      const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'https://ipfs.infura.io:5001';
      
      // If using Infura, we need project ID and secret
      if (ipfsNodeUrl.includes('infura.io') && process.env.INFURA_PROJECT_ID && process.env.INFURA_API_SECRET) {
        const auth = 'Basic ' + Buffer.from(
          process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_API_SECRET
        ).toString('base64');
        
        this.client = create({
          url: ipfsNodeUrl,
          headers: {
            authorization: auth
          }
        });
        
        log('IPFS service initialized with Infura', 'ipfs');
      } else if (ipfsNodeUrl.includes('infura.io')) {
        log('Infura IPFS credentials not provided, service will operate in mock mode', 'ipfs');
      } else {
        // Connect to custom IPFS node
        this.client = create({ url: ipfsNodeUrl });
        log(`IPFS service initialized with custom node: ${ipfsNodeUrl}`, 'ipfs');
      }
      
      this.isConnected = !!this.client;
    } catch (error) {
      log(`Error initializing IPFS service: ${error}`, 'ipfs');
      this.isConnected = false;
      this.client = null;
    }
  }
  
  /**
   * Upload content to IPFS
   * @param content Content to upload (string or Buffer)
   * @param type Optional content type
   * @returns IPFS hash (CID) or error
   */
  public async uploadContent(content: string | Buffer, type?: string): Promise<{ cid: string; url: string } | { error: string }> {
    try {
      if (!this.isConnected || !this.client) {
        // If not connected, use simulation mode
        return this.simulateUpload(content);
      }
      
      const data = typeof content === 'string' ? Buffer.from(content) : content;
      const result = await this.client.add(data, {
        pin: true
      });
      
      const cid = result.cid.toString();
      log(`Content uploaded to IPFS: ${cid}`, 'ipfs');
      
      return {
        cid,
        url: `https://ipfs.io/ipfs/${cid}`
      };
    } catch (error) {
      log(`Error uploading to IPFS: ${error}`, 'ipfs');
      
      // Fallback to simulation in case of error
      return this.simulateUpload(content);
    }
  }
  
  /**
   * Upload a JSON object to IPFS
   * @param jsonObject Object to upload as JSON
   * @returns IPFS hash (CID) or error
   */
  public async uploadJson(jsonObject: any): Promise<{ cid: string; url: string } | { error: string }> {
    try {
      const jsonString = JSON.stringify(jsonObject);
      return this.uploadContent(jsonString, 'application/json');
    } catch (error) {
      log(`Error uploading JSON to IPFS: ${error}`, 'ipfs');
      return { error: error.message };
    }
  }
  
  /**
   * Retrieve content from IPFS
   * @param cid IPFS content identifier
   * @returns Content as string or error
   */
  public async getContent(cid: string): Promise<{ content: string } | { error: string }> {
    try {
      if (!this.isConnected || !this.client) {
        // If not connected, use simulation mode
        return this.simulateRetrieval(cid);
      }
      
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      
      const content = Buffer.concat(chunks).toString();
      log(`Content retrieved from IPFS: ${cid}`, 'ipfs');
      
      return { content };
    } catch (error) {
      log(`Error retrieving from IPFS: ${error}`, 'ipfs');
      
      // Fallback to simulation in case of error
      return this.simulateRetrieval(cid);
    }
  }
  
  /**
   * Get IPFS URL for a CID
   * @param cid IPFS content identifier
   * @returns Public accessible URL
   */
  public getIpfsUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }
  
  /**
   * Check connection status
   * @returns Boolean indicating if connected to IPFS
   */
  public isIpfsConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Simulate upload for development without IPFS connection
   * @param content Content to "upload"
   * @returns Simulated IPFS hash
   */
  private simulateUpload(content: string | Buffer): { cid: string; url: string } {
    // Generate a fake CID
    const fakeCid = 'Qm' + [...Array(44)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    log(`[SIMULATION] Content would be uploaded to IPFS with CID: ${fakeCid}`, 'ipfs');
    
    return {
      cid: fakeCid,
      url: `https://ipfs.io/ipfs/${fakeCid}`
    };
  }
  
  /**
   * Simulate retrieval for development without IPFS connection
   * @param cid IPFS content identifier
   * @returns Simulated content
   */
  private simulateRetrieval(cid: string): { content: string } {
    log(`[SIMULATION] Retrieving content from IPFS with CID: ${cid}`, 'ipfs');
    
    // Return a placeholder content
    return {
      content: JSON.stringify({
        simulatedContent: true,
        requestedCid: cid,
        message: 'This is simulated content as IPFS connection is not available',
        timestamp: new Date().toISOString()
      })
    };
  }
}

// Export singleton instance
const ipfsService = new IPFSService();
export default ipfsService;