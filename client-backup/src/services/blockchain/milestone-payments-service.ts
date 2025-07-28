import { polygonService } from './polygon-integration.js';

// Contract states and milestone states from smart contract
export enum ContractState {
  Created = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Disputed = 4
}

export enum MilestoneState {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Approved = 3,
  Rejected = 4,
  Paid = 5
}

export enum DisputeResolution {
  None = 0,
  BuyerWins = 1,
  SellerWins = 2,
  Split = 3
}

// Milestone type definition
export interface Milestone {
  description: string;
  amount: number;
  dueDate: Date;
  state: MilestoneState;
  completedAt?: Date | null;
  paidAt?: Date | null;
  deliverableHash?: string;
  feedbackNotes?: string;
}

// Contract type definition
export interface Contract {
  contractId: string;
  buyer: string;
  seller: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  milestoneCount: number;
  state: ContractState;
  hasDispute: boolean;
  termsHash: string;
  milestones?: Milestone[];
}

// Dispute type definition
export interface Dispute {
  disputeId: string;
  contractId: string;
  milestoneIndex: number;
  initiator: string;
  reason: string;
  evidenceHash: string;
  createdAt: Date;
  resolvedAt?: Date | null;
  resolution: DisputeResolution;
  resolutionNotes?: string;
}

/**
 * Service for interacting with the MilestonePayments smart contract
 */
export class MilestonePaymentsService {

  constructor() {
    // Load contract address from environment or config
    // Load ABI from the compiled contract or hardcoded for simplicity
  }

  /**
   * Create a new milestone-based contract
   * @param contractId Unique identifier for the contract
   * @param seller Blockchain address of the seller
   * @param termsHash IPFS hash of contract terms document
   * @param milestones Array of milestone details
   * @param totalAmount Total contract amount in wei
   */
  async createContract(
    contractId: string,
    seller: string,
    termsHash: string,
    milestones: { description: string; amount: number; dueDate: Date }[],
    totalAmount: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      // Validate input
      if (!contractId || !seller || !termsHash || !milestones || milestones.length === 0) {
        return {
          success: false,
          message: 'Invalid contract parameters. All fields are required.'
        };
      }

      // Prepare milestone arrays for contract
      const descriptions: string[] = [];
      const amounts: number[] = [];
      const dueDates: number[] = [];

      // Calculate sum to verify against total amount
      let sum = 0;
      for (const milestone of milestones) {
        descriptions.push(milestone.description);
        amounts.push(milestone.amount);
        // Convert JS Date to UNIX timestamp in seconds
        dueDates.push(Math.floor(milestone.dueDate.getTime() / 1000));
        sum += milestone.amount;
      }

      // Verify sum matches total amount
      if (sum !== totalAmount) {
        return {
          success: false,
          message: `Milestone amounts (${sum}) do not match total amount (${totalAmount})`
        };
      }

      // Call the contract to create the milestone-based agreement
      const result = await polygonService.createMilestoneContract(
        contractId,
        seller,
        termsHash,
        descriptions,
        amounts,
        dueDates,
        totalAmount
      );

      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Contract created successfully'
      };
    } catch (error: any) {
      console.error('Error creating milestone contract:', error);
      return {
        success: false,
        message: `Failed to create contract: ${error.message}`
      };
    }
  }

  /**
   * Start working on a milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone to start
   */
  async startMilestone(
    contractId: string,
    milestoneIndex: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.startMilestone(contractId, milestoneIndex);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Milestone started successfully'
      };
    } catch (error: any) {
      console.error('Error starting milestone:', error);
      return {
        success: false,
        message: `Failed to start milestone: ${error.message}`
      };
    }
  }

  /**
   * Complete a milestone with deliverables
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone to complete
   * @param deliverableHash IPFS hash of deliverable documents
   */
  async completeMilestone(
    contractId: string,
    milestoneIndex: number,
    deliverableHash: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.completeMilestone(
        contractId,
        milestoneIndex,
        deliverableHash
      );
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Milestone marked as completed'
      };
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      return {
        success: false,
        message: `Failed to complete milestone: ${error.message}`
      };
    }
  }

  /**
   * Approve a completed milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone to approve
   */
  async approveMilestone(
    contractId: string,
    milestoneIndex: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.approveMilestone(contractId, milestoneIndex);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Milestone approved and payment released'
      };
    } catch (error: any) {
      console.error('Error approving milestone:', error);
      return {
        success: false,
        message: `Failed to approve milestone: ${error.message}`
      };
    }
  }

  /**
   * Reject a completed milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the milestone to reject
   * @param feedback Feedback explaining the rejection
   */
  async rejectMilestone(
    contractId: string,
    milestoneIndex: number,
    feedback: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.rejectMilestone(
        contractId,
        milestoneIndex,
        feedback
      );
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Milestone rejected with feedback'
      };
    } catch (error: any) {
      console.error('Error rejecting milestone:', error);
      return {
        success: false,
        message: `Failed to reject milestone: ${error.message}`
      };
    }
  }

  /**
   * Cancel a contract
   * @param contractId Contract identifier
   */
  async cancelContract(
    contractId: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.cancelMilestoneContract(contractId);
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Contract cancelled successfully'
      };
    } catch (error: any) {
      console.error('Error cancelling contract:', error);
      return {
        success: false,
        message: `Failed to cancel contract: ${error.message}`
      };
    }
  }

  /**
   * Create a dispute for a milestone
   * @param contractId Contract identifier
   * @param milestoneIndex Index of the disputed milestone
   * @param reason Reason for the dispute
   * @param evidenceHash IPFS hash of evidence documents
   */
  async createDispute(
    contractId: string,
    milestoneIndex: number,
    reason: string,
    evidenceHash: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    disputeId?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.createMilestoneDispute(
        contractId,
        milestoneIndex,
        reason,
        evidenceHash
      );
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        disputeId: result.disputeId,
        message: 'Dispute created successfully'
      };
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      return {
        success: false,
        message: `Failed to create dispute: ${error.message}`
      };
    }
  }

  /**
   * Resolve a dispute (arbitrator only)
   * @param disputeId Dispute identifier
   * @param resolution Resolution type
   * @param resolutionNotes Notes explaining the resolution
   */
  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    resolutionNotes: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    message: string;
  }> {
    try {
      const result = await polygonService.resolveMilestoneDispute(
        disputeId,
        resolution,
        resolutionNotes
      );
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        message: 'Dispute resolved successfully'
      };
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      return {
        success: false,
        message: `Failed to resolve dispute: ${error.message}`
      };
    }
  }

  /**
   * Get contract details
   * @param contractId Contract identifier
   */
  async getContractDetails(contractId: string): Promise<{
    success: boolean;
    contract?: Contract;
    message: string;
  }> {
    try {
      const contractData = await polygonService.getMilestoneContract(contractId);
      
      if (!contractData) {
        return {
          success: false,
          message: 'Contract not found'
        };
      }
      
      // Get milestones for this contract
      const milestones = await this.getContractMilestones(contractId);
      
      return {
        success: true,
        contract: {
          ...contractData,
          milestones: milestones.milestones
        },
        message: 'Contract details retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error getting contract details:', error);
      return {
        success: false,
        message: `Failed to get contract details: ${error.message}`
      };
    }
  }

  /**
   * Get milestones for a contract
   * @param contractId Contract identifier
   */
  async getContractMilestones(contractId: string): Promise<{
    success: boolean;
    milestones?: Milestone[];
    message: string;
  }> {
    try {
      const milestonesData = await polygonService.getMilestones(contractId);
      
      return {
        success: true,
        milestones: milestonesData,
        message: 'Milestones retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error getting contract milestones:', error);
      return {
        success: false,
        message: `Failed to get milestones: ${error.message}`
      };
    }
  }

  /**
   * Get dispute details
   * @param disputeId Dispute identifier
   */
  async getDisputeDetails(disputeId: string): Promise<{
    success: boolean;
    dispute?: Dispute | null;
    message: string;
  }> {
    try {
      const disputeData = await polygonService.getMilestoneDispute(disputeId);
      
      return {
        success: true,
        dispute: disputeData,
        message: 'Dispute details retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error getting dispute details:', error);
      return {
        success: false,
        message: `Failed to get dispute details: ${error.message}`
      };
    }
  }

  /**
   * Get contracts associated with a user
   * @param userAddress Blockchain address of the user
   */
  async getUserContracts(userAddress: string): Promise<{
    success: boolean;
    contractIds?: string[];
    contracts?: Contract[];
    message: string;
  }> {
    try {
      const contractIds = await polygonService.getUserMilestoneContracts(userAddress);
      
      // Optional: Get full details for each contract
      const contracts: Contract[] = [];
      for (const contractId of contractIds) {
        const result = await this.getContractDetails(contractId);
        if (result.success && result.contract) {
          contracts.push(result.contract);
        }
      }
      
      return {
        success: true,
        contractIds,
        contracts,
        message: 'User contracts retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error getting user contracts:', error);
      return {
        success: false,
        message: `Failed to get user contracts: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const milestonePaymentsService = new MilestonePaymentsService();
