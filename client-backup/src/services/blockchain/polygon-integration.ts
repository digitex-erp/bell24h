import { ethers } from 'ethers';
import config from '../../config.js';

// Interface for blockchain provider configuration
interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  privateKey: string;
  contractAddress: string;
}

// ABIs for our smart contracts
const RFQ_CONTRACT_ABI = [
  // Function to create a new RFQ record
  "function createRFQ(string memory rfqHash, string memory rfqId, uint256 timestamp) public returns (bytes32)",
  // Function to verify an RFQ record
  "function verifyRFQ(bytes32 transactionId, string memory rfqHash) public view returns (bool)",
  // Event emitted when a new RFQ is created
  "event RFQCreated(bytes32 indexed transactionId, string rfqId, address indexed creator, uint256 timestamp)"
];

const CREDENTIAL_VERIFICATION_ABI = [
  // Function to verify a business credential (GSTIN, ISO, etc.)
  "function verifyCredential(string memory credentialType, string memory credentialValue, address businessAddress) public returns (bytes32)",
  // Function to check verification status
  "function checkVerification(bytes32 verificationId) public view returns (bool verified, uint256 timestamp, address verifier)",
  // Event emitted when a new verification is processed
  "event CredentialVerified(bytes32 indexed verificationId, string credentialType, address indexed business, address indexed verifier, uint256 timestamp)"
];

export class PolygonIntegration {
  private ownerAddress: string;
  
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private signer: ethers.Signer;
  private rfqContract: ethers.Contract;
  private credentialContract: ethers.Contract;
  private milestoneContract: ethers.Contract;
  private chainId: number;

  constructor() {
    this.ownerAddress = process.env.POLYGON_OWNER_ADDRESS || '';
    
    const blockchainConfig: BlockchainConfig = {
      rpcUrl: config.POLYGON_RPC_URL || 'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY',
      chainId: Number(config.POLYGON_CHAIN_ID) || 80001, // Mumbai testnet by default
      privateKey: config.POLYGON_PRIVATE_KEY || '',
      contractAddress: config.POLYGON_CONTRACT_ADDRESS || ''
    };

    this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
    this.chainId = blockchainConfig.chainId;
    
    // Create wallet and signer from private key
    // In production, this would use secure vault/HSM for key management
    this.wallet = new ethers.Wallet(blockchainConfig.privateKey, this.provider);
    this.signer = this.wallet;
    
    // Initialize contracts
    this.rfqContract = new ethers.Contract(
      blockchainConfig.contractAddress, 
      RFQ_CONTRACT_ABI, 
      this.signer
    );
    
    this.credentialContract = new ethers.Contract(
      config.POLYGON_CREDENTIAL_CONTRACT_ADDRESS || '',
      CREDENTIAL_VERIFICATION_ABI,
      this.signer
    );
    
    // Initialize milestone payments contract
    const MILESTONE_PAYMENTS_ABI = [
      // Contract functions
      "function createContract(string,address,string,string[],uint256[],uint256[]) payable returns (bool)",
      "function startMilestone(string,uint256)",
      "function completeMilestone(string,uint256,string)",
      "function approveMilestone(string,uint256)",
      "function rejectMilestone(string,uint256,string)",
      "function cancelContract(string)",
      "function createDispute(string,uint256,string,string) returns (string)",
      "function resolveDispute(string,uint8,string)",
      // View functions
      "function getContract(string) view returns (tuple(string,address,address,uint256,uint256,uint256,uint256,uint8,bool,string))",
      "function getMilestone(string,uint256) view returns (tuple(string,uint256,uint256,uint8,uint256,uint256,string,string))",
      "function getContractMilestones(string) view returns (tuple(string,uint256,uint256,uint8,uint256,uint256,string,string)[])",
      "function getDispute(string) view returns (tuple(string,string,uint256,address,string,string,uint256,uint256,uint8,string))",
      "function getUserContracts(address) view returns (string[])"
    ];
    
    this.milestoneContract = new ethers.Contract(
      config.POLYGON_MILESTONE_CONTRACT_ADDRESS || '',
      MILESTONE_PAYMENTS_ABI,
      this.signer
    );
  }

  /**
   * Creates a blockchain record for an RFQ with proper transaction submission
   */
  async createRFQRecord(rfqData: Record<string, any>): Promise<{ hash: string, transactionId: string }> {
    try {
      // Create a hash of the RFQ data
      const rfqHash = ethers.id(JSON.stringify({
        type: 'RFQ',
        rfqId: rfqData.id,
        title: rfqData.title,
        description: rfqData.description,
        category: rfqData.category,
        user_id: rfqData.user_id,
        created_at: rfqData.created_at
      }));

      // Estimate gas for transaction
      const gasEstimate = await this.rfqContract.createRFQ.estimateGas(
        rfqHash,
        rfqData.id,
        Math.floor(Date.now() / 1000)
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100);

      // Submit transaction to blockchain
      const tx = await this.rfqContract.createRFQ(
        rfqHash,
        rfqData.id,
        Math.floor(Date.now() / 1000),
        { gasLimit }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract transaction ID from events
      const event = receipt?.logs[0];
      let transactionId = '';
      
      if (event) {
        // Parse the event to get the transactionId
        const parsedLog = this.rfqContract.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        transactionId = parsedLog?.args[0];
      }
      
      return {
        hash: tx.hash,
        transactionId: transactionId || tx.hash
      };
    } catch (error: any) {
      console.error('Error creating RFQ blockchain record:', error);
      throw new Error(`RFQ blockchain record creation failed: ${error.message}`);
    }
  }

  /**
   * Verifies a business credential on the blockchain
   */
  async verifyBusinessCredential(
    credentialType: string,
    credentialValue: string,
    businessAddress: string
  ): Promise<{ verificationId: string, transactionHash: string }> {
    try {
      // Estimate gas for transaction
      const gasEstimate = await this.credentialContract.verifyCredential.estimateGas(
        credentialType,
        credentialValue,
        businessAddress
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100);

      // Submit credential verification transaction
      const tx = await this.credentialContract.verifyCredential(
        credentialType,
        credentialValue,
        businessAddress,
        { gasLimit }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract verification ID from events
      const event = receipt?.logs[0];
      let verificationId = '';
      
      if (event) {
        // Parse the event to get the verification ID
        const parsedLog = this.credentialContract.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        verificationId = parsedLog?.args[0];
      }
      
      return {
        verificationId: verificationId || '',
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error verifying business credential:', error);
      throw new Error(`Business credential verification failed: ${error.message}`);
    }
  }

  /**
   * Checks the verification status of a business credential
   */
  async checkCredentialVerification(verificationId: string): Promise<{
    verified: boolean;
    timestamp: number;
    verifier: string;
  }> {
    try {
      const result = await this.credentialContract.checkVerification(verificationId);
      return {
        verified: result[0],
        timestamp: Number(result[1]),
        verifier: result[2]
      };
    } catch (error: any) {
      console.error('Error checking credential verification:', error);
      throw new Error(`Credential verification check failed: ${error.message}`);
    }
  }

  /**
   * Get the owner address for the Polygon integration
   * This is the address that's used to sign and verify transactions
   */
  getOwnerAddress(): string {
    return this.ownerAddress;
  }
  
  /**
   * Record a credential verification on the blockchain
   * @param credentialType Type of credential (e.g., GSTIN, ISO9001)
   * @param credentialValue The actual credential identifier
   * @param businessAddress Blockchain address of the business
   * @param metadataURI URI pointing to additional metadata (IPFS or other storage)
   * @returns The verification ID and transaction hash
   */
  async recordCredentialVerification(
    credentialType: string,
    credentialValue: string,
    businessAddress: string,
    metadataURI: string = ''
  ): Promise<{ verificationId: string; transactionHash: string }> {
    try {
      // Estimate gas for the transaction
      const gasEstimate = await this.credentialContract.verifyCredential.estimateGas(
        credentialType,
        credentialValue,
        businessAddress,
        metadataURI
      );
      
      // Add a 20% buffer to the gas estimate
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100);
      
      // Submit transaction to blockchain
      const tx = await this.credentialContract.verifyCredential(
        credentialType,
        credentialValue,
        businessAddress,
        metadataURI,
        { gasLimit }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract verification ID from events
      const event = receipt?.logs[0];
      let verificationId = '';
      
      if (event) {
        // Parse the event to get the verification ID
        const parsedLog = this.credentialContract.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        verificationId = parsedLog?.args[0];
      }
      
      return {
        verificationId: verificationId || '',
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error recording credential verification:', error);
      throw new Error(`Failed to record credential verification: ${error.message}`);
    }
  }
  
  /**
   * Get credential verification details from the blockchain
   * @param verificationId The blockchain verification ID
   * @returns Verification details including validity and metadata
   */
  async getCredentialVerificationDetails(verificationId: string): Promise<{
    isValid: boolean;
    timestamp: number;
    verifier: string;
    credentialType?: string;
    credentialValue?: string;
    businessAddress?: string;
    metadataURI?: string;
  }> {
    try {
      // Call the smart contract to get full verification details
      const details = await this.credentialContract.getVerificationDetails(verificationId);
      
      return {
        credentialType: details[0],
        credentialValue: details[1],
        businessAddress: details[2],
        verifier: details[3],
        timestamp: Number(details[4]),
        isValid: details[5],
        metadataURI: details[6]
      };
    } catch (error: any) {
      console.error('Error getting credential verification details:', error);
      throw new Error(`Failed to get verification details: ${error.message}`);
    }
  }
  
  /**
   * Check if a business has a specific credential verified
   * @param businessAddress Blockchain address of the business
   * @param credentialType Type of credential to check
   * @returns Boolean indicating if credential is verified
   */
  async hasBusinessCredential(
    businessAddress: string,
    credentialType: string
  ): Promise<boolean> {
    try {
      return await this.credentialContract.hasVerifiedCredential(businessAddress, credentialType);
    } catch (error: any) {
      console.error('Error checking business credential:', error);
      return false;
    }
  }
  
  /**
   * Create a milestone-based contract
   * @param contractId Unique identifier for the contract
   * @param seller Address of the seller
   * @param termsHash IPFS hash of contract terms
   * @param descriptions Array of milestone descriptions
   * @param amounts Array of milestone amounts in wei
   * @param dueDates Array of milestone due dates as UNIX timestamps
   * @param totalAmount Total contract amount in wei
   */
  async createMilestoneContract(
    contractId: string,
    seller: string,
    termsHash: string,
    descriptions: string[],
    amounts: number[],
    dueDates: number[],
    totalAmount: number
  ): Promise<{ transactionHash: string }> {
    try {
      // Ensure equal length arrays
      if (descriptions.length !== amounts.length || amounts.length !== dueDates.length) {
        throw new Error('Milestone arrays must have the same length');
      }

      // Convert amounts to BigInts for the transaction
      const amountsBigInt = amounts.map(amount => BigInt(amount));
      
      // Submit transaction to blockchain with value equal to total amount
      const tx = await this.milestoneContract.createContract(
        contractId,
        seller,
        termsHash,
        descriptions,
        amountsBigInt,
        dueDates,
        { value: BigInt(totalAmount) }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error creating milestone contract:', error);
      throw new Error(`Failed to create milestone contract: ${error.message}`);
    }
  }

  /**
   * Start working on a milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   */
  async startMilestone(
    contractId: string,
    milestoneIndex: number
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.startMilestone(contractId, milestoneIndex);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error starting milestone:', error);
      throw new Error(`Failed to start milestone: ${error.message}`);
    }
  }

  /**
   * Mark a milestone as completed
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   * @param deliverableHash IPFS hash of deliverables
   */
  async completeMilestone(
    contractId: string,
    milestoneIndex: number,
    deliverableHash: string
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.completeMilestone(
        contractId,
        milestoneIndex,
        deliverableHash
      );
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      throw new Error(`Failed to complete milestone: ${error.message}`);
    }
  }

  /**
   * Approve a milestone (triggers payment)
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   */
  async approveMilestone(
    contractId: string,
    milestoneIndex: number
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.approveMilestone(contractId, milestoneIndex);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error approving milestone:', error);
      throw new Error(`Failed to approve milestone: ${error.message}`);
    }
  }

  /**
   * Reject a milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   * @param feedback Feedback explaining the rejection
   */
  async rejectMilestone(
    contractId: string,
    milestoneIndex: number,
    feedback: string
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.rejectMilestone(
        contractId,
        milestoneIndex,
        feedback
      );
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error rejecting milestone:', error);
      throw new Error(`Failed to reject milestone: ${error.message}`);
    }
  }

  /**
   * Cancel a milestone-based contract
   * @param contractId Contract identifier
   */
  async cancelMilestoneContract(
    contractId: string
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.cancelContract(contractId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error cancelling contract:', error);
      throw new Error(`Failed to cancel contract: ${error.message}`);
    }
  }

  /**
   * Create a dispute for a milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   * @param reason Reason for the dispute
   * @param evidenceHash IPFS hash of evidence
   */
  async createMilestoneDispute(
    contractId: string,
    milestoneIndex: number,
    reason: string,
    evidenceHash: string
  ): Promise<{ transactionHash: string; disputeId: string }> {
    try {      
      const tx = await this.milestoneContract.createDispute(
        contractId,
        milestoneIndex,
        reason,
        evidenceHash
      );
      const receipt = await tx.wait();
      
      // Extract dispute ID from the event logs
      let disputeId = '';
      if (receipt.logs && receipt.logs.length > 0) {
        const event = receipt.logs[0];
        const parsedLog = this.milestoneContract.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        // DisputeCreated event should have the dispute ID as the first argument
        disputeId = parsedLog?.args[0] || '';
      }
      
      return {
        transactionHash: tx.hash,
        disputeId
      };
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      throw new Error(`Failed to create dispute: ${error.message}`);
    }
  }

  /**
   * Resolve a dispute
   * @param disputeId Dispute identifier
   * @param resolution Resolution type (1=BuyerWins, 2=SellerWins, 3=Split)
   * @param resolutionNotes Notes explaining the resolution
   */
  async resolveMilestoneDispute(
    disputeId: string,
    resolution: number,
    resolutionNotes: string
  ): Promise<{ transactionHash: string }> {
    try {      
      const tx = await this.milestoneContract.resolveDispute(
        disputeId,
        resolution,
        resolutionNotes
      );
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  }

  /**
   * Get contract details
   * @param contractId Contract identifier
   */
  async getMilestoneContract(contractId: string): Promise<{
    contractId: string;
    buyer: string;
    seller: string;
    totalAmount: number;
    paidAmount: number;
    createdAt: Date;
    milestoneCount: number;
    state: number;
    hasDispute: boolean;
    termsHash: string;
  } | null> {
    try {
      const contract = await this.milestoneContract.getContract(contractId);
      
      if (!contract || !contract[0]) {
        return null;
      }
      
      return {
        contractId: contract[0],
        buyer: contract[1],
        seller: contract[2],
        totalAmount: Number(contract[3]),
        paidAmount: Number(contract[4]),
        createdAt: new Date(Number(contract[5]) * 1000), // Convert UNIX timestamp to JS Date
        milestoneCount: Number(contract[6]),
        state: Number(contract[7]),
        hasDispute: contract[8],
        termsHash: contract[9]
      };
    } catch (error: any) {
      console.error('Error getting milestone contract:', error);
      return null;
    }
  }

  /**
   * Get milestone details
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone
   */
  async getMilestone(contractId: string, milestoneIndex: number): Promise<{
    description: string;
    amount: number;
    dueDate: Date;
    state: number;
    completedAt: Date | null;
    paidAt: Date | null;
    deliverableHash: string;
    feedbackNotes: string;
  } | null> {
    try {
      const milestone = await this.milestoneContract.getMilestone(contractId, milestoneIndex);
      
      if (!milestone || !milestone[0]) {
        return null;
      }
      
      return {
        description: milestone[0],
        amount: Number(milestone[1]),
        dueDate: new Date(Number(milestone[2]) * 1000),
        state: Number(milestone[3]),
        completedAt: milestone[4] > 0 ? new Date(Number(milestone[4]) * 1000) : null,
        paidAt: milestone[5] > 0 ? new Date(Number(milestone[5]) * 1000) : null,
        deliverableHash: milestone[6],
        feedbackNotes: milestone[7]
      };
    } catch (error: any) {
      console.error('Error getting milestone:', error);
      return null;
    }
  }

  /**
   * Get all milestones for a contract
   * @param contractId Contract identifier
   */
  async getMilestones(contractId: string): Promise<Array<{
    description: string;
    amount: number;
    dueDate: Date;
    state: number;
    completedAt: Date | null;
    paidAt: Date | null;
    deliverableHash: string;
    feedbackNotes: string;
  }>> {
    try {
      const milestones = await this.milestoneContract.getContractMilestones(contractId);
      
      return milestones.map((milestone: any) => ({
        description: milestone[0],
        amount: Number(milestone[1]),
        dueDate: new Date(Number(milestone[2]) * 1000),
        state: Number(milestone[3]),
        completedAt: milestone[4] > 0 ? new Date(Number(milestone[4]) * 1000) : null,
        paidAt: milestone[5] > 0 ? new Date(Number(milestone[5]) * 1000) : null,
        deliverableHash: milestone[6],
        feedbackNotes: milestone[7]
      }));
    } catch (error: any) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  /**
   * Get dispute details
   * @param disputeId Dispute identifier
   */
  async getMilestoneDispute(disputeId: string): Promise<{
    disputeId: string;
    contractId: string;
    milestoneIndex: number;
    initiator: string;
    reason: string;
    evidenceHash: string;
    createdAt: Date;
    resolvedAt: Date | null;
    resolution: number;
    resolutionNotes: string;
  } | null> {
    try {
      const dispute = await this.milestoneContract.getDispute(disputeId);
      
      if (!dispute || !dispute[0]) {
        return null;
      }
      
      return {
        disputeId: dispute[0],
        contractId: dispute[1],
        milestoneIndex: Number(dispute[2]),
        initiator: dispute[3],
        reason: dispute[4],
        evidenceHash: dispute[5],
        createdAt: new Date(Number(dispute[6]) * 1000),
        resolvedAt: dispute[7] > 0 ? new Date(Number(dispute[7]) * 1000) : null,
        resolution: Number(dispute[8]),
        resolutionNotes: dispute[9]
      };
    } catch (error: any) {
      console.error('Error getting dispute:', error);
      return null;
    }
  }

  /**
   * Get contracts associated with a user
   * @param userAddress User's blockchain address
   */
  async getUserMilestoneContracts(userAddress: string): Promise<string[]> {
    try {
      const contractIds = await this.milestoneContract.getUserContracts(userAddress);
      return contractIds;
    } catch (error: any) {
      console.error('Error getting user contracts:', error);
      return [];
    }
  }

  /**
   * Gets detailed transaction information from the Polygon blockchain
   */
  async getTransactionDetails(transactionHash: string): Promise<Record<string, any>> {
    try {
      // Get transaction details
      const tx = await this.provider.getTransaction(transactionHash);
      
      if (!tx) {
        throw new Error(`Transaction ${transactionHash} not found`);
      }
      
      // Get transaction receipt for additional info (status, gas used, etc.)
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      // Get block information
      const block = await this.provider.getBlock(tx.blockHash!);
      
      // Format the response
      return {
        hash: tx.hash,
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        from: tx.from,
        to: tx.to,
        timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : '',
        gasUsed: receipt ? receipt.gasUsed.toString() : '',
        gasPrice: tx.gasPrice?.toString(),
        transactionFee: receipt ? (Number(receipt.gasUsed) * Number(tx.gasPrice) / 1e18).toFixed(6) + ' MATIC' : '',
        network: this.getNetworkName(),
        verificationUrl: `${this.getExplorerUrl()}/tx/${transactionHash}`
      };
    } catch (error: any) {
      console.error('Error getting transaction details:', error);
      throw new Error(`Failed to get transaction details: ${error.message}`);
    }
  }

  /**
   * Gets the network name based on the chain ID
   */
  private getNetworkName(): string {
    switch (this.chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai Testnet';
      default:
        return `Network (Chain ID: ${this.chainId})`;
    }
  }

  /**
   * Gets the block explorer URL based on the chain ID
   */
  private getExplorerUrl(): string {
    switch (this.chainId) {
      case 1:
        return 'https://etherscan.io';
      case 137:
        return 'https://polygonscan.com';
      case 80001:
        return 'https://mumbai.polygonscan.com';
      default:
        return 'https://polygonscan.com';
    }
  }
}

// Export singleton instance
export const polygonService = new PolygonIntegration();
