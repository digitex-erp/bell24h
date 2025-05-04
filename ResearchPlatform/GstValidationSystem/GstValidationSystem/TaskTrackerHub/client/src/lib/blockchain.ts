import { ethers } from 'ethers';
import { apiRequest } from './queryClient';
import RFQContractABI from '../../../contracts/abis/RFQContract.json';
import TokenContractABI from '../../../contracts/abis/Bell24Token.json';
import EscrowPaymentABI from '../../../contracts/abis/EscrowPayment.json';
import DocumentStorageABI from '../../../contracts/abis/DocumentStorage.json';

// Current network settings
const NETWORK_SETTINGS = {
  chainId: import.meta.env.VITE_CHAIN_ID || '0x89', // Default to Polygon
  chainName: import.meta.env.VITE_CHAIN_NAME || 'Polygon',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://rpc-mainnet.maticvigil.com',
  blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://polygonscan.com'
};

// Contract addresses
const CONTRACT_ADDRESSES = {
  RFQ: import.meta.env.VITE_RFQ_CONTRACT_ADDRESS || '',
  TOKEN: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '',
  ESCROW: import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '',
  DOCUMENT: import.meta.env.VITE_DOCUMENT_STORAGE_ADDRESS || ''
};

// ABIs
const CONTRACT_ABIS = {
  RFQ: RFQContractABI,
  TOKEN: TokenContractABI,
  ESCROW: EscrowPaymentABI,
  DOCUMENT: DocumentStorageABI
};

/**
 * Blockchain client for Bell24h frontend
 */
class BlockchainClient {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: Record<string, ethers.Contract | null> = {
    RFQ: null,
    TOKEN: null,
    ESCROW: null,
    DOCUMENT: null
  };
  private isConnected: boolean = false;
  private userAddress: string = '';
  
  /**
   * Initialize the blockchain client
   */
  constructor() {
    this.initializeProvider();
  }
  
  /**
   * Initialize the Ethereum provider
   */
  private initializeProvider() {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Set provider and signer
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        console.warn('No Ethereum wallet detected. Please install MetaMask or another wallet.');
      }
    } catch (error) {
      console.error('Error initializing blockchain client:', error);
    }
  }
  
  /**
   * Check if user has a wallet installed
   */
  public hasWallet(): boolean {
    return !!window.ethereum;
  }
  
  /**
   * Check if user is connected to blockchain
   */
  public isUserConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Get user's blockchain address
   */
  public getUserAddress(): string {
    return this.userAddress;
  }
  
  /**
   * Connect to the wallet
   */
  public async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!this.provider) {
        throw new Error('Ethereum provider not available');
      }
      
      // Request accounts from wallet
      const accounts = await this.provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Set signer and user address
      this.signer = this.provider.getSigner();
      this.userAddress = accounts[0];
      this.isConnected = true;
      
      // Initialize contracts
      this.initializeContracts();
      
      return { success: true, address: accounts[0] };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Initialize smart contracts
   */
  private initializeContracts() {
    try {
      if (!this.signer) {
        throw new Error('Signer not available');
      }
      
      // Initialize each contract if address is available
      Object.keys(CONTRACT_ADDRESSES).forEach(key => {
        const address = CONTRACT_ADDRESSES[key as keyof typeof CONTRACT_ADDRESSES];
        const abi = CONTRACT_ABIS[key as keyof typeof CONTRACT_ABIS];
        
        if (address && abi) {
          this.contracts[key] = new ethers.Contract(address, abi, this.signer!);
        } else {
          console.warn(`Contract ${key} configuration incomplete`);
        }
      });
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }
  
  /**
   * Switch to the desired network
   */
  public async switchToNetwork(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not available');
      }
      
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_SETTINGS.chainId }],
        });
        
        return { success: true };
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: NETWORK_SETTINGS.chainId,
                  chainName: NETWORK_SETTINGS.chainName,
                  rpcUrls: [NETWORK_SETTINGS.rpcUrl],
                  blockExplorerUrls: [NETWORK_SETTINGS.blockExplorerUrl],
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                  }
                },
              ],
            });
            
            return { success: true };
          } catch (addError) {
            throw new Error('Failed to add the network to wallet');
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get token balance
   */
  public async getTokenBalance(): Promise<{ balance: string; success: boolean; error?: string }> {
    try {
      if (!this.contracts.TOKEN || !this.userAddress) {
        throw new Error('Token contract not initialized or user not connected');
      }
      
      const balance = await this.contracts.TOKEN.balanceOf(this.userAddress);
      return {
        balance: ethers.utils.formatEther(balance),
        success: true
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      
      // Try server-side fallback
      try {
        const result = await apiRequest<{ balance: string }>('/api/blockchain/token-balance', 'GET');
        return { balance: result.balance, success: true };
      } catch (serverError) {
        return { balance: '0', success: false, error: error.message };
      }
    }
  }
  
  /**
   * Create an RFQ on-chain
   */
  public async createRFQ(
    rfqNumber: string,
    product: string,
    quantity: string,
    dueDate: number,
    description: string,
    documentHash: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.contracts.RFQ || !this.signer) {
        throw new Error('RFQ contract not initialized or user not connected');
      }
      
      const tx = await this.contracts.RFQ.createRFQ(
        rfqNumber,
        product,
        quantity,
        dueDate,
        description,
        documentHash
      );
      
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash,
        success: true
      };
    } catch (error) {
      console.error('Error creating RFQ on-chain:', error);
      
      // Try server-side fallback
      try {
        const result = await apiRequest<{ txHash: string }>('/api/blockchain/create-rfq', 'POST', {
          rfqNumber,
          product,
          quantity,
          dueDate,
          description,
          documentHash
        });
        
        return { txHash: result.txHash, success: true };
      } catch (serverError) {
        return { success: false, error: error.message };
      }
    }
  }
  
  /**
   * Submit a quote on-chain
   */
  public async submitQuote(
    rfqId: number,
    price: number,
    deliveryTime: string,
    documentHash: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.contracts.RFQ || !this.signer) {
        throw new Error('RFQ contract not initialized or user not connected');
      }
      
      const tx = await this.contracts.RFQ.submitQuote(
        rfqId,
        ethers.utils.parseEther(price.toString()),
        deliveryTime,
        documentHash
      );
      
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash,
        success: true
      };
    } catch (error) {
      console.error('Error submitting quote on-chain:', error);
      
      // Try server-side fallback
      try {
        const result = await apiRequest<{ txHash: string }>('/api/blockchain/submit-quote', 'POST', {
          rfqId,
          price,
          deliveryTime,
          documentHash
        });
        
        return { txHash: result.txHash, success: true };
      } catch (serverError) {
        return { success: false, error: error.message };
      }
    }
  }
  
  /**
   * Create escrow payment on-chain
   */
  public async createPayment(
    rfqId: number,
    supplier: string,
    amount: number,
    paymentType: 'full' | 'milestone',
    milestoneNumber: number,
    totalMilestones: number,
    documentHash: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.contracts.ESCROW || !this.signer) {
        throw new Error('Escrow contract not initialized or user not connected');
      }
      
      const paymentTypeValue = paymentType === 'full' ? 0 : 1;
      const valueInWei = ethers.utils.parseEther(amount.toString());
      
      const tx = await this.contracts.ESCROW.createPayment(
        rfqId,
        supplier,
        valueInWei,
        paymentTypeValue,
        milestoneNumber,
        totalMilestones,
        documentHash,
        { value: valueInWei }
      );
      
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash,
        success: true
      };
    } catch (error) {
      console.error('Error creating payment on-chain:', error);
      
      // Try server-side fallback
      try {
        const result = await apiRequest<{ txHash: string }>('/api/blockchain/create-payment', 'POST', {
          rfqId,
          supplier,
          amount,
          paymentType,
          milestoneNumber,
          totalMilestones,
          documentHash
        });
        
        return { txHash: result.txHash, success: true };
      } catch (serverError) {
        return { success: false, error: error.message };
      }
    }
  }
  
  /**
   * Store document on-chain and IPFS
   */
  public async storeDocument(
    content: string,
    referenceId: number,
    documentType: string,
    description: string
  ): Promise<{ contentHash?: string; ipfsHash?: string; success: boolean; error?: string }> {
    try {
      // Store document via server
      const result = await apiRequest<{ contentHash: string; ipfsHash: string; txHash: string }>(
        '/api/blockchain/store-document', 
        'POST', 
        {
          content,
          referenceId,
          documentType,
          description
        }
      );
      
      return {
        contentHash: result.contentHash,
        ipfsHash: result.ipfsHash,
        success: true
      };
    } catch (error) {
      console.error('Error storing document:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Verify document on-chain
   */
  public async verifyDocument(contentHash: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.contracts.DOCUMENT || !this.signer) {
        throw new Error('Document contract not initialized or user not connected');
      }
      
      const tx = await this.contracts.DOCUMENT.verifyDocument(contentHash);
      await tx.wait();
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying document on-chain:', error);
      
      // Try server-side fallback
      try {
        await apiRequest('/api/blockchain/verify-document', 'POST', { contentHash });
        return { success: true };
      } catch (serverError) {
        return { success: false, error: error.message };
      }
    }
  }
  
  /**
   * Get transaction URL for block explorer
   */
  public getTransactionUrl(txHash: string): string {
    return `${NETWORK_SETTINGS.blockExplorerUrl}/tx/${txHash}`;
  }
}

// Export singleton instance
const blockchainClient = new BlockchainClient();
export default blockchainClient;