import type { NextRequest } from 'next/server';
import { milestonePaymentsService } from '../../../services/blockchain/milestone-payments-service.js';
import { requireAuth } from '../../middleware/auth.js';
import { db } from '../../../db/index.js';
import { milestoneContracts, contractMilestones, contractDisputes } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';

/**
 * API handler for milestone-based contracts
 */
export default requireAuth(async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGetContracts(req, res);
      case 'POST':
        return handleCreateContract(req, res);
      case 'PUT':
        return handleUpdateContract(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    logger.error(`Error in milestone contract API: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Handle GET request to fetch contracts
 */
async function handleGetContracts(req: NextApiRequest, res: NextApiResponse) {
  const { address, id } = req.query;

  try {
    // Get a specific contract by ID
    if (id) {
      const contractId = String(id);
      
      // First check if we have the contract in our database
      const dbContract = await db.query.milestoneContracts.findFirst({
        where: eq(milestoneContracts.contractId, contractId),
        with: {
          milestones: true,
          disputes: true,
        },
      });
      
      // If not in database, fetch from blockchain
      if (!dbContract) {
        const contractResult = await milestonePaymentsService.getContractDetails(contractId);
        
        if (!contractResult.success || !contractResult.contract) {
          return res.status(404).json({ success: false, message: 'Contract not found' });
        }
        
        return res.status(200).json({ 
          success: true, 
          contract: contractResult.contract 
        });
      }
      
      // Return the database contract with related data
      return res.status(200).json({ success: true, contract: dbContract });
    }
    
    // Get contracts for a specific user address
    if (address) {
      const userAddress = String(address);
      
      // Check database first
      const dbContracts = await db.query.milestoneContracts.findMany({
        where: and(
          eq(milestoneContracts.buyer, userAddress.toLowerCase()),
          eq(milestoneContracts.seller, userAddress.toLowerCase())
        ),
        orderBy: (contracts, { desc }) => [desc(contracts.createdAt)],
      });
      
      // If not enough contracts in database, fetch from blockchain
      if (dbContracts.length === 0) {
        const contractsResult = await milestonePaymentsService.getUserContracts(userAddress);
        
        if (!contractsResult.success) {
          return res.status(400).json({ 
            success: false, 
            message: contractsResult.message 
          });
        }
        
        return res.status(200).json({ 
          success: true, 
          contracts: contractsResult.contracts || [] 
        });
      }
      
      // Return the database contracts
      return res.status(200).json({ success: true, contracts: dbContracts });
    }
    
    // No filtering parameters provided
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  } catch (error: any) {
    logger.error(`Error getting contracts: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: 'Failed to get contracts' });
  }
}

/**
 * Handle POST request to create a new contract
 */
async function handleCreateContract(req: NextApiRequest, res: NextApiResponse) {
  const { contractId, seller, termsHash, milestoneData, totalAmount } = req.body;
  
  if (!contractId || !seller || !termsHash || !milestoneData || !totalAmount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters' 
    });
  }
  
  try {
    // Create the contract on the blockchain
    const result = await milestonePaymentsService.createContract(
      contractId,
      seller,
      termsHash,
      milestoneData,
      totalAmount
    );
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
    
    // Store contract in database for faster retrieval
    const [dbContract] = await db.insert(milestoneContracts).values({
      contractId,
      buyer: req.user.walletAddress.toLowerCase(),
      seller: seller.toLowerCase(),
      totalAmount,
      paidAmount: 0,
      state: 0, // Created state
      hasDispute: false,
      termsHash,
      transactionHash: result.transactionHash,
    }).returning();
    
    // Store milestones in database
    for (let i = 0; i < milestoneData.length; i++) {
      const milestone = milestoneData[i];
      
      await db.insert(contractMilestones).values({
        contractId,
        index: i,
        description: milestone.description,
        amount: milestone.amount,
        dueDate: milestone.dueDate,
        state: 0, // Pending state
      });
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Contract created successfully',
      contract: dbContract,
      transactionHash: result.transactionHash
    });
  } catch (error: any) {
    logger.error(`Error creating contract: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: 'Failed to create contract' });
  }
}

/**
 * Handle PUT request to update contract state
 */
async function handleUpdateContract(req: NextApiRequest, res: NextApiResponse) {
  const { contractId, action, milestoneIndex, data } = req.body;
  
  if (!contractId || !action) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters' 
    });
  }
  
  try {
    let result;
    
    // Perform the requested action on the contract
    switch (action) {
      case 'start':
        if (milestoneIndex === undefined) {
          return res.status(400).json({ 
            success: false, 
            message: 'Milestone index is required' 
          });
        }
        
        result = await milestonePaymentsService.startMilestone(contractId, milestoneIndex);
        
        if (result.success) {
          // Update milestone state in database
          await db.update(contractMilestones)
            .set({ state: 1 }) // InProgress state
            .where(
              and(
                eq(contractMilestones.contractId, contractId),
                eq(contractMilestones.index, milestoneIndex)
              )
            );
        }
        break;
        
      case 'complete':
        if (milestoneIndex === undefined || !data?.deliverableHash) {
          return res.status(400).json({ 
            success: false, 
            message: 'Milestone index and deliverable hash are required' 
          });
        }
        
        result = await milestonePaymentsService.completeMilestone(
          contractId,
          milestoneIndex,
          data.deliverableHash
        );
        
        if (result.success) {
          // Update milestone state in database
          await db.update(contractMilestones)
            .set({ 
              state: 2, // Completed state
              deliverableHash: data.deliverableHash,
              completedAt: new Date()
            })
            .where(
              and(
                eq(contractMilestones.contractId, contractId),
                eq(contractMilestones.index, milestoneIndex)
              )
            );
        }
        break;
        
      case 'approve':
        if (milestoneIndex === undefined) {
          return res.status(400).json({ 
            success: false, 
            message: 'Milestone index is required' 
          });
        }
        
        result = await milestonePaymentsService.approveMilestone(contractId, milestoneIndex);
        
        if (result.success) {
          // Get milestone to know its amount
          const milestone = await db.query.contractMilestones.findFirst({
            where: and(
              eq(contractMilestones.contractId, contractId),
              eq(contractMilestones.index, milestoneIndex)
            ),
          });
          
          // Update milestone state in database
          await db.update(contractMilestones)
            .set({ 
              state: 3, // Approved state
            })
            .where(
              and(
                eq(contractMilestones.contractId, contractId),
                eq(contractMilestones.index, milestoneIndex)
              )
            );
            
          // Update contract paid amount
          if (milestone) {
            await db.update(milestoneContracts)
              .set({ 
                paidAmount: ({ paidAmount }) => `${paidAmount} + ${milestone.amount}`
              })
              .where(eq(milestoneContracts.contractId, contractId));
          }
        }
        break;
        
      case 'reject':
        if (milestoneIndex === undefined || !data?.feedback) {
          return res.status(400).json({ 
            success: false, 
            message: 'Milestone index and feedback are required' 
          });
        }
        
        result = await milestonePaymentsService.rejectMilestone(
          contractId,
          milestoneIndex,
          data.feedback
        );
        
        if (result.success) {
          // Update milestone state in database
          await db.update(contractMilestones)
            .set({ 
              state: 4, // Rejected state
              feedbackNotes: data.feedback
            })
            .where(
              and(
                eq(contractMilestones.contractId, contractId),
                eq(contractMilestones.index, milestoneIndex)
              )
            );
        }
        break;
        
      case 'cancel':
        result = await milestonePaymentsService.cancelContract(contractId);
        
        if (result.success) {
          // Update contract state in database
          await db.update(milestoneContracts)
            .set({ state: 3 }) // Cancelled state
            .where(eq(milestoneContracts.contractId, contractId));
        }
        break;
        
      case 'dispute':
        if (milestoneIndex === undefined || !data?.reason || !data?.evidenceHash) {
          return res.status(400).json({ 
            success: false, 
            message: 'Milestone index, reason, and evidence hash are required' 
          });
        }
        
        result = await milestonePaymentsService.createDispute(
          contractId,
          milestoneIndex,
          data.reason,
          data.evidenceHash
        );
        
        if (result.success && result.disputeId) {
          // Update contract dispute flag in database
          await db.update(milestoneContracts)
            .set({ 
              hasDispute: true,
              state: 4 // Disputed state
            })
            .where(eq(milestoneContracts.contractId, contractId));
            
          // Store dispute in database
          await db.insert(contractDisputes).values({
            disputeId: result.disputeId,
            contractId,
            milestoneIndex,
            initiator: req.user.walletAddress.toLowerCase(),
            reason: data.reason,
            evidenceHash: data.evidenceHash,
            resolution: 0, // None
          });
        }
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: `Invalid action: ${action}` 
        });
    }
    
    if (!result || !result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result?.message || 'Action failed' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Contract ${action} successful`,
      transactionHash: result.transactionHash,
      disputeId: result.disputeId
    });
  } catch (error: any) {
    logger.error(`Error updating contract: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: 'Failed to update contract' });
  }
}
