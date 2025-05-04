// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./RFQContract.sol";

/**
 * @title EscrowPayment
 * @dev Manages escrow payments for the Bell24h marketplace
 */
contract EscrowPayment is Ownable, ReentrancyGuard {
    // Payment states
    enum PaymentState { Created, Funded, Released, Refunded, Disputed, Resolved }
    
    // Payment types
    enum PaymentType { FullPayment, Milestone }
    
    // Payment structure
    struct Payment {
        uint256 id;
        uint256 rfqId;
        address buyer;
        address supplier;
        uint256 amount;
        PaymentState state;
        PaymentType paymentType;
        uint256 milestoneNumber;
        uint256 totalMilestones;
        uint256 createdAt;
        string documentHash; // IPFS hash for any payment documents
    }
    
    // Dispute structure
    struct Dispute {
        uint256 paymentId;
        string reason;
        string evidence; // IPFS hash for dispute evidence
        bool resolved;
        string resolution;
        uint256 createdAt;
    }
    
    // RFQ contract reference
    RFQContract public rfqContract;
    
    // Fee percentage (base 1000, e.g., 25 = 2.5%)
    uint256 public feeRate = 25; // 2.5% by default
    
    // Platform fee collector address
    address public feeCollector;
    
    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256[]) public rfqToPayments;
    
    // Current payment ID
    uint256 private nextPaymentId = 1;
    
    // Events
    event PaymentCreated(uint256 indexed id, uint256 indexed rfqId, address buyer, address supplier, uint256 amount);
    event PaymentFunded(uint256 indexed id, uint256 amount);
    event PaymentReleased(uint256 indexed id, address indexed supplier, uint256 amount);
    event PaymentRefunded(uint256 indexed id, address indexed buyer, uint256 amount);
    event DisputeRaised(uint256 indexed paymentId, string reason);
    event DisputeResolved(uint256 indexed paymentId, string resolution);
    event FeeCollected(uint256 indexed paymentId, uint256 fee);
    
    /**
     * @dev Constructor
     * @param rfqContractAddress Address of the RFQ contract
     * @param feeCollectorAddress Address to collect platform fees
     */
    constructor(address rfqContractAddress, address feeCollectorAddress) Ownable(msg.sender) {
        rfqContract = RFQContract(rfqContractAddress);
        feeCollector = feeCollectorAddress;
    }
    
    /**
     * @dev Update the platform fee rate
     * @param newFeeRate New fee rate (base 1000)
     */
    function setFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 100, "Fee rate cannot exceed 10%");
        feeRate = newFeeRate;
    }
    
    /**
     * @dev Update the fee collector address
     * @param newFeeCollector New fee collector address
     */
    function setFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = newFeeCollector;
    }
    
    /**
     * @dev Create a new payment
     * @param rfqId RFQ ID
     * @param supplier Supplier address
     * @param amount Payment amount
     * @param paymentType Payment type (full or milestone)
     * @param milestoneNumber Milestone number (if milestone payment)
     * @param totalMilestones Total number of milestones (if milestone payment)
     * @param documentHash IPFS hash for payment documents
     */
    function createPayment(
        uint256 rfqId,
        address supplier,
        uint256 amount,
        PaymentType paymentType,
        uint256 milestoneNumber,
        uint256 totalMilestones,
        string memory documentHash
    ) external payable nonReentrant {
        require(amount > 0, "Payment amount must be greater than 0");
        require(supplier != address(0), "Invalid supplier address");
        
        if (paymentType == PaymentType.Milestone) {
            require(milestoneNumber > 0, "Milestone number must be greater than 0");
            require(milestoneNumber <= totalMilestones, "Invalid milestone number");
            require(totalMilestones > 0, "Total milestones must be greater than 0");
        }
        
        uint256 paymentId = nextPaymentId++;
        
        payments[paymentId] = Payment({
            id: paymentId,
            rfqId: rfqId,
            buyer: msg.sender,
            supplier: supplier,
            amount: amount,
            state: PaymentState.Created,
            paymentType: paymentType,
            milestoneNumber: milestoneNumber,
            totalMilestones: totalMilestones,
            createdAt: block.timestamp,
            documentHash: documentHash
        });
        
        rfqToPayments[rfqId].push(paymentId);
        
        emit PaymentCreated(paymentId, rfqId, msg.sender, supplier, amount);
        
        // If ETH is sent with the transaction, fund the payment immediately
        if (msg.value > 0) {
            require(msg.value >= amount, "Insufficient payment amount");
            
            payments[paymentId].state = PaymentState.Funded;
            emit PaymentFunded(paymentId, amount);
            
            // Return excess funds if any
            if (msg.value > amount) {
                payable(msg.sender).transfer(msg.value - amount);
            }
        }
    }
    
    /**
     * @dev Fund an existing payment
     * @param paymentId Payment ID
     */
    function fundPayment(uint256 paymentId) external payable nonReentrant {
        Payment storage payment = payments[paymentId];
        
        require(payment.id > 0, "Payment does not exist");
        require(payment.buyer == msg.sender, "Only buyer can fund payment");
        require(payment.state == PaymentState.Created, "Payment is not in created state");
        require(msg.value >= payment.amount, "Insufficient payment amount");
        
        payment.state = PaymentState.Funded;
        
        emit PaymentFunded(paymentId, payment.amount);
        
        // Return excess funds if any
        if (msg.value > payment.amount) {
            payable(msg.sender).transfer(msg.value - payment.amount);
        }
    }
    
    /**
     * @dev Release a payment to the supplier
     * @param paymentId Payment ID
     */
    function releasePayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        
        require(payment.id > 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment is not funded");
        require(
            payment.buyer == msg.sender || owner() == msg.sender,
            "Only buyer or contract owner can release payment"
        );
        
        payment.state = PaymentState.Released;
        
        // Calculate and deduct fee
        uint256 fee = (payment.amount * feeRate) / 1000;
        uint256 supplierAmount = payment.amount - fee;
        
        // Transfer funds
        if (fee > 0 && feeCollector != address(0)) {
            payable(feeCollector).transfer(fee);
            emit FeeCollected(paymentId, fee);
        }
        
        payable(payment.supplier).transfer(supplierAmount);
        
        emit PaymentReleased(paymentId, payment.supplier, supplierAmount);
    }
    
    /**
     * @dev Refund a payment to the buyer
     * @param paymentId Payment ID
     */
    function refundPayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        
        require(payment.id > 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment is not funded");
        require(
            payment.supplier == msg.sender || owner() == msg.sender,
            "Only supplier or contract owner can refund payment"
        );
        
        payment.state = PaymentState.Refunded;
        
        // Transfer full amount back to buyer
        payable(payment.buyer).transfer(payment.amount);
        
        emit PaymentRefunded(paymentId, payment.buyer, payment.amount);
    }
    
    /**
     * @dev Raise a dispute for a payment
     * @param paymentId Payment ID
     * @param reason Reason for dispute
     * @param evidence IPFS hash for dispute evidence
     */
    function raiseDispute(
        uint256 paymentId,
        string memory reason,
        string memory evidence
    ) external {
        Payment storage payment = payments[paymentId];
        
        require(payment.id > 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment is not funded");
        require(
            payment.buyer == msg.sender || payment.supplier == msg.sender,
            "Only buyer or supplier can raise dispute"
        );
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        payment.state = PaymentState.Disputed;
        
        disputes[paymentId] = Dispute({
            paymentId: paymentId,
            reason: reason,
            evidence: evidence,
            resolved: false,
            resolution: "",
            createdAt: block.timestamp
        });
        
        emit DisputeRaised(paymentId, reason);
    }
    
    /**
     * @dev Resolve a dispute
     * @param paymentId Payment ID
     * @param resolution Resolution description
     * @param refundToBuyer Whether to refund to buyer or release to supplier
     */
    function resolveDispute(
        uint256 paymentId,
        string memory resolution,
        bool refundToBuyer
    ) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        Dispute storage dispute = disputes[paymentId];
        
        require(payment.id > 0, "Payment does not exist");
        require(payment.state == PaymentState.Disputed, "Payment is not disputed");
        require(dispute.paymentId == paymentId, "Dispute does not exist");
        require(!dispute.resolved, "Dispute already resolved");
        
        dispute.resolved = true;
        dispute.resolution = resolution;
        
        if (refundToBuyer) {
            // Refund to buyer
            payment.state = PaymentState.Refunded;
            payable(payment.buyer).transfer(payment.amount);
            emit PaymentRefunded(paymentId, payment.buyer, payment.amount);
        } else {
            // Release to supplier
            payment.state = PaymentState.Released;
            
            // Calculate and deduct fee
            uint256 fee = (payment.amount * feeRate) / 1000;
            uint256 supplierAmount = payment.amount - fee;
            
            // Transfer funds
            if (fee > 0 && feeCollector != address(0)) {
                payable(feeCollector).transfer(fee);
                emit FeeCollected(paymentId, fee);
            }
            
            payable(payment.supplier).transfer(supplierAmount);
            emit PaymentReleased(paymentId, payment.supplier, supplierAmount);
        }
        
        payment.state = PaymentState.Resolved;
        emit DisputeResolved(paymentId, resolution);
    }
    
    /**
     * @dev Get all payments for an RFQ
     * @param rfqId RFQ ID
     * @return Array of payment IDs
     */
    function getPaymentsForRFQ(uint256 rfqId) external view returns (uint256[] memory) {
        return rfqToPayments[rfqId];
    }
    
    /**
     * @dev Get contract balance
     * @return Current contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Withdraw fees to fee collector (emergency function)
     */
    function withdrawFees() external onlyOwner nonReentrant {
        require(feeCollector != address(0), "Fee collector not set");
        payable(feeCollector).transfer(address(this).balance);
    }
}