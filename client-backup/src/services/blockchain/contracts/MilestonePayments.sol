// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title MilestonePayments
 * @dev Smart contract for milestone-based payment escrow on the Polygon blockchain
 * Used by Bell24h B2B marketplace for secure transaction management
 */
contract MilestonePayments {
    // Contract owner
    address public owner;
    
    // Contract states
    enum ContractState { Created, Active, Completed, Cancelled, Disputed }
    
    // Milestone states
    enum MilestoneState { Pending, InProgress, Completed, Approved, Rejected, Paid }
    
    // Dispute resolution options
    enum DisputeResolution { None, BuyerWins, SellerWins, Split }
    
    // Contract structure
    struct Contract {
        string contractId;           // External reference ID
        address buyer;               // Buyer address
        address seller;              // Seller address
        uint256 totalAmount;         // Total contract amount
        uint256 paidAmount;          // Amount already paid
        uint256 createdAt;           // Contract creation timestamp
        uint256 milestoneCount;      // Number of milestones
        ContractState state;         // Current contract state
        bool hasDispute;             // Whether contract has an active dispute
        string termsHash;            // IPFS hash of contract terms
    }
    
    // Milestone structure
    struct Milestone {
        string description;          // Description of deliverable
        uint256 amount;              // Amount for this milestone
        uint256 dueDate;             // Due date timestamp
        MilestoneState state;        // Current milestone state
        uint256 completedAt;         // When marked as completed
        uint256 paidAt;              // When payment was released
        string deliverableHash;      // IPFS hash for deliverables
        string feedbackNotes;        // Feedback notes if rejected
    }
    
    // Dispute structure
    struct Dispute {
        string disputeId;            // Unique dispute identifier
        string contractId;           // Associated contract ID
        uint256 milestoneIndex;      // Disputed milestone index
        address initiator;           // Address that initiated dispute
        string reason;               // Reason for dispute
        string evidenceHash;         // IPFS hash for dispute evidence
        uint256 createdAt;           // Dispute creation timestamp
        uint256 resolvedAt;          // Dispute resolution timestamp
        DisputeResolution resolution; // Resolution type
        string resolutionNotes;      // Resolution explanation
    }
    
    // Contracts mapping
    mapping(string => Contract) public contracts;
    
    // Contract milestones mapping
    mapping(string => Milestone[]) public contractMilestones;
    
    // Disputes mapping
    mapping(string => Dispute) public disputes;
    
    // Contract IDs by address
    mapping(address => string[]) public userContracts;
    
    // Arbitrators list
    mapping(address => bool) public arbitrators;
    
    // Events
    event ContractCreated(string contractId, address buyer, address seller, uint256 totalAmount);
    event MilestoneAdded(string contractId, uint256 milestoneIndex, string description, uint256 amount);
    event MilestoneStarted(string contractId, uint256 milestoneIndex);
    event MilestoneCompleted(string contractId, uint256 milestoneIndex, string deliverableHash);
    event MilestoneApproved(string contractId, uint256 milestoneIndex);
    event MilestoneRejected(string contractId, uint256 milestoneIndex, string feedback);
    event MilestonePaid(string contractId, uint256 milestoneIndex, uint256 amount);
    event ContractCompleted(string contractId, uint256 finalAmount);
    event ContractCancelled(string contractId);
    event DisputeCreated(string disputeId, string contractId, uint256 milestoneIndex, address initiator);
    event DisputeResolved(string disputeId, DisputeResolution resolution);
    event ArbitratorAdded(address arbitrator);
    event ArbitratorRemoved(address arbitrator);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
    
    modifier onlyArbitrator() {
        require(arbitrators[msg.sender] || msg.sender == owner, "Only arbitrators can call this function");
        _;
    }
    
    modifier onlyBuyer(string memory contractId) {
        require(contracts[contractId].buyer == msg.sender, "Only the buyer can call this function");
        _;
    }
    
    modifier onlySeller(string memory contractId) {
        require(contracts[contractId].seller == msg.sender, "Only the seller can call this function");
        _;
    }
    
    modifier onlyBuyerOrSeller(string memory contractId) {
        require(
            contracts[contractId].buyer == msg.sender || 
            contracts[contractId].seller == msg.sender, 
            "Only the buyer or seller can call this function"
        );
        _;
    }
    
    modifier contractExists(string memory contractId) {
        require(contracts[contractId].createdAt > 0, "Contract does not exist");
        _;
    }
    
    modifier contractActive(string memory contractId) {
        require(
            contracts[contractId].state == ContractState.Active,
            "Contract is not active"
        );
        _;
    }
    
    modifier milestoneExists(string memory contractId, uint256 milestoneIndex) {
        require(
            milestoneIndex < contractMilestones[contractId].length,
            "Milestone does not exist"
        );
        _;
    }
    
    /**
     * @dev Constructor sets the owner of the contract
     */
    constructor() {
        owner = msg.sender;
        arbitrators[msg.sender] = true;
    }
    
    /**
     * @dev Add a new arbitrator
     * @param arbitrator Address of the arbitrator to add
     */
    function addArbitrator(address arbitrator) external onlyOwner {
        require(arbitrator != address(0), "Invalid arbitrator address");
        arbitrators[arbitrator] = true;
        emit ArbitratorAdded(arbitrator);
    }
    
    /**
     * @dev Remove an arbitrator
     * @param arbitrator Address of the arbitrator to remove
     */
    function removeArbitrator(address arbitrator) external onlyOwner {
        require(arbitrator != owner, "Cannot remove the owner as arbitrator");
        arbitrators[arbitrator] = false;
        emit ArbitratorRemoved(arbitrator);
    }
    
    /**
     * @dev Create a new contract with milestones
     * @param contractId External reference ID for the contract
     * @param seller Address of the seller
     * @param termsHash IPFS hash of contract terms
     * @param milestoneDescriptions Array of milestone descriptions
     * @param milestoneAmounts Array of milestone amounts
     * @param milestoneDueDates Array of milestone due dates
     * @return Boolean indicating success
     */
    function createContract(
        string memory contractId,
        address seller,
        string memory termsHash,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneAmounts,
        uint256[] memory milestoneDueDates
    ) external payable returns (bool) {
        // Validate inputs
        require(bytes(contractId).length > 0, "Contract ID cannot be empty");
        require(seller != address(0), "Invalid seller address");
        require(msg.sender != seller, "Buyer cannot be the seller");
        require(contracts[contractId].createdAt == 0, "Contract ID already exists");
        require(
            milestoneDescriptions.length == milestoneAmounts.length && 
            milestoneAmounts.length == milestoneDueDates.length,
            "Milestone arrays must be the same length"
        );
        require(milestoneDescriptions.length > 0, "Must include at least one milestone");
        
        // Calculate total amount
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            totalAmount += milestoneAmounts[i];
        }
        
        // Ensure enough funds are sent
        require(msg.value >= totalAmount, "Insufficient funds sent for contract");
        
        // Create contract
        contracts[contractId] = Contract({
            contractId: contractId,
            buyer: msg.sender,
            seller: seller,
            totalAmount: totalAmount,
            paidAmount: 0,
            createdAt: block.timestamp,
            milestoneCount: milestoneDescriptions.length,
            state: ContractState.Active,
            hasDispute: false,
            termsHash: termsHash
        });
        
        // Add milestones
        for (uint256 i = 0; i < milestoneDescriptions.length; i++) {
            contractMilestones[contractId].push(Milestone({
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                dueDate: milestoneDueDates[i],
                state: MilestoneState.Pending,
                completedAt: 0,
                paidAt: 0,
                deliverableHash: "",
                feedbackNotes: ""
            }));
            
            emit MilestoneAdded(contractId, i, milestoneDescriptions[i], milestoneAmounts[i]);
        }
        
        // Add contract to user listings
        userContracts[msg.sender].push(contractId);
        userContracts[seller].push(contractId);
        
        emit ContractCreated(contractId, msg.sender, seller, totalAmount);
        
        return true;
    }
    
    /**
     * @dev Start working on a milestone
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     */
    function startMilestone(string memory contractId, uint256 milestoneIndex) 
        external
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
        onlySeller(contractId)
    {
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        require(
            milestone.state == MilestoneState.Pending,
            "Milestone must be in pending state"
        );
        
        milestone.state = MilestoneState.InProgress;
        
        emit MilestoneStarted(contractId, milestoneIndex);
    }
    
    /**
     * @dev Mark a milestone as completed
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     * @param deliverableHash IPFS hash for deliverables
     */
    function completeMilestone(
        string memory contractId, 
        uint256 milestoneIndex,
        string memory deliverableHash
    ) 
        external
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
        onlySeller(contractId)
    {
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        require(
            milestone.state == MilestoneState.InProgress,
            "Milestone must be in progress"
        );
        
        milestone.state = MilestoneState.Completed;
        milestone.completedAt = block.timestamp;
        milestone.deliverableHash = deliverableHash;
        
        emit MilestoneCompleted(contractId, milestoneIndex, deliverableHash);
    }
    
    /**
     * @dev Approve a completed milestone
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     */
    function approveMilestone(string memory contractId, uint256 milestoneIndex) 
        external
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
        onlyBuyer(contractId)
    {
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        require(
            milestone.state == MilestoneState.Completed,
            "Milestone must be completed to approve"
        );
        
        milestone.state = MilestoneState.Approved;
        
        emit MilestoneApproved(contractId, milestoneIndex);
        
        // Automatically release payment
        releaseMilestonePayment(contractId, milestoneIndex);
    }
    
    /**
     * @dev Reject a completed milestone with feedback
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     * @param feedback Feedback notes explaining rejection
     */
    function rejectMilestone(
        string memory contractId, 
        uint256 milestoneIndex,
        string memory feedback
    ) 
        external
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
        onlyBuyer(contractId)
    {
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        require(
            milestone.state == MilestoneState.Completed,
            "Milestone must be completed to reject"
        );
        
        milestone.state = MilestoneState.Rejected;
        milestone.feedbackNotes = feedback;
        
        emit MilestoneRejected(contractId, milestoneIndex, feedback);
    }
    
    /**
     * @dev Release payment for an approved milestone
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     */
    function releaseMilestonePayment(string memory contractId, uint256 milestoneIndex)
        internal
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
    {
        Contract storage contractData = contracts[contractId];
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        
        require(
            milestone.state == MilestoneState.Approved,
            "Milestone must be approved to release payment"
        );
        
        milestone.state = MilestoneState.Paid;
        milestone.paidAt = block.timestamp;
        
        // Update contract paid amount
        contractData.paidAmount += milestone.amount;
        
        // Check if all milestones are paid
        bool allPaid = true;
        for (uint256 i = 0; i < contractData.milestoneCount; i++) {
            if (contractMilestones[contractId][i].state != MilestoneState.Paid) {
                allPaid = false;
                break;
            }
        }
        
        // If all milestones are paid, mark contract as completed
        if (allPaid) {
            contractData.state = ContractState.Completed;
            emit ContractCompleted(contractId, contractData.paidAmount);
        }
        
        // Transfer funds to seller
        payable(contractData.seller).transfer(milestone.amount);
        
        emit MilestonePaid(contractId, milestoneIndex, milestone.amount);
    }
    
    /**
     * @dev Cancel a contract (only if no milestone is in progress, completed, or paid)
     * @param contractId Contract identifier
     */
    function cancelContract(string memory contractId)
        external
        contractExists(contractId)
        contractActive(contractId)
    {
        Contract storage contractData = contracts[contractId];
        
        // Only buyer can cancel any time, seller can only cancel if no work started
        bool canCancel = false;
        if (msg.sender == contractData.buyer) {
            canCancel = true;
        } else if (msg.sender == contractData.seller) {
            // Check if any milestone is in progress, completed, or paid
            bool workStarted = false;
            for (uint256 i = 0; i < contractData.milestoneCount; i++) {
                MilestoneState state = contractMilestones[contractId][i].state;
                if (state == MilestoneState.InProgress || 
                    state == MilestoneState.Completed || 
                    state == MilestoneState.Approved || 
                    state == MilestoneState.Paid) {
                    workStarted = true;
                    break;
                }
            }
            canCancel = !workStarted;
        }
        
        require(canCancel, "Cannot cancel contract at this stage");
        
        // Mark contract as cancelled
        contractData.state = ContractState.Cancelled;
        
        // Calculate refund amount (total amount - paid amount)
        uint256 refundAmount = contractData.totalAmount - contractData.paidAmount;
        
        // Return remaining funds to buyer
        if (refundAmount > 0) {
            payable(contractData.buyer).transfer(refundAmount);
        }
        
        emit ContractCancelled(contractId);
    }
    
    /**
     * @dev Create a dispute for a milestone
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     * @param reason Reason for the dispute
     * @param evidenceHash IPFS hash for dispute evidence
     * @return disputeId Unique identifier for the created dispute
     */
    function createDispute(
        string memory contractId,
        uint256 milestoneIndex,
        string memory reason,
        string memory evidenceHash
    )
        external
        contractExists(contractId)
        contractActive(contractId)
        milestoneExists(contractId, milestoneIndex)
        onlyBuyerOrSeller(contractId)
        returns (string memory)
    {
        Contract storage contractData = contracts[contractId];
        Milestone storage milestone = contractMilestones[contractId][milestoneIndex];
        
        require(!contractData.hasDispute, "Contract already has an active dispute");
        require(
            milestone.state == MilestoneState.Completed ||
            milestone.state == MilestoneState.Rejected,
            "Can only dispute completed or rejected milestones"
        );
        
        // Generate dispute ID
        string memory disputeId = string(
            abi.encodePacked(contractId, "-dispute-", uint2str(milestoneIndex))
        );
        
        // Create dispute
        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            contractId: contractId,
            milestoneIndex: milestoneIndex,
            initiator: msg.sender,
            reason: reason,
            evidenceHash: evidenceHash,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolution: DisputeResolution.None,
            resolutionNotes: ""
        });
        
        // Mark contract as having a dispute
        contractData.hasDispute = true;
        
        emit DisputeCreated(disputeId, contractId, milestoneIndex, msg.sender);
        
        return disputeId;
    }
    
    /**
     * @dev Resolve a dispute
     * @param disputeId Dispute identifier
     * @param resolution Resolution type
     * @param resolutionNotes Notes explaining the resolution
     */
    function resolveDispute(
        string memory disputeId,
        DisputeResolution resolution,
        string memory resolutionNotes
    )
        external
        onlyArbitrator
    {
        Dispute storage dispute = disputes[disputeId];
        require(bytes(dispute.contractId).length > 0, "Dispute does not exist");
        require(dispute.resolvedAt == 0, "Dispute already resolved");
        require(resolution != DisputeResolution.None, "Invalid resolution type");
        
        // Get contract and milestone data
        Contract storage contractData = contracts[dispute.contractId];
        Milestone storage milestone = contractMilestones[dispute.contractId][dispute.milestoneIndex];
        
        // Update dispute
        dispute.resolvedAt = block.timestamp;
        dispute.resolution = resolution;
        dispute.resolutionNotes = resolutionNotes;
        
        // Resolve based on resolution type
        if (resolution == DisputeResolution.BuyerWins) {
            // Buyer wins - reset milestone to in progress
            milestone.state = MilestoneState.InProgress;
            milestone.completedAt = 0;
            milestone.deliverableHash = "";
            milestone.feedbackNotes = "";
        } 
        else if (resolution == DisputeResolution.SellerWins) {
            // Seller wins - approve and pay milestone
            milestone.state = MilestoneState.Approved;
            // Release payment
            releaseMilestonePayment(dispute.contractId, dispute.milestoneIndex);
        }
        else if (resolution == DisputeResolution.Split) {
            // Split - pay half the milestone amount
            uint256 halfAmount = milestone.amount / 2;
            
            // Update milestone
            milestone.state = MilestoneState.Paid;
            milestone.paidAt = block.timestamp;
            milestone.amount = halfAmount;
            
            // Update contract paid amount
            contractData.paidAmount += halfAmount;
            contractData.totalAmount -= halfAmount; // Reduce total by half
            
            // Transfer half funds to seller
            payable(contractData.seller).transfer(halfAmount);
            
            // Refund half to buyer
            payable(contractData.buyer).transfer(halfAmount);
            
            emit MilestonePaid(dispute.contractId, dispute.milestoneIndex, halfAmount);
        }
        
        // Remove dispute flag from contract
        contractData.hasDispute = false;
        
        emit DisputeResolved(disputeId, resolution);
    }
    
    /**
     * @dev Get contract details
     * @param contractId Contract identifier
     * @return Contract data
     */
    function getContract(string memory contractId) 
        external
        view
        contractExists(contractId)
        returns (Contract memory)
    {
        return contracts[contractId];
    }
    
    /**
     * @dev Get milestone details
     * @param contractId Contract identifier
     * @param milestoneIndex Index of the milestone
     * @return Milestone data
     */
    function getMilestone(string memory contractId, uint256 milestoneIndex)
        external
        view
        contractExists(contractId)
        milestoneExists(contractId, milestoneIndex)
        returns (Milestone memory)
    {
        return contractMilestones[contractId][milestoneIndex];
    }
    
    /**
     * @dev Get all milestones for a contract
     * @param contractId Contract identifier
     * @return Array of milestone data
     */
    function getContractMilestones(string memory contractId)
        external
        view
        contractExists(contractId)
        returns (Milestone[] memory)
    {
        return contractMilestones[contractId];
    }
    
    /**
     * @dev Get dispute details
     * @param disputeId Dispute identifier
     * @return Dispute data
     */
    function getDispute(string memory disputeId)
        external
        view
        returns (Dispute memory)
    {
        require(bytes(disputes[disputeId].disputeId).length > 0, "Dispute does not exist");
        return disputes[disputeId];
    }
    
    /**
     * @dev Get contracts for a user
     * @param user User address
     * @return Array of contract IDs
     */
    function getUserContracts(address user)
        external
        view
        returns (string[] memory)
    {
        return userContracts[user];
    }
    
    /**
     * @dev Helper function to convert uint to string
     * @param v Unsigned integer to convert
     * @return String representation
     */
    function uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }
        
        uint256 j = v;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = v;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        
        return string(bstr);
    }
}
