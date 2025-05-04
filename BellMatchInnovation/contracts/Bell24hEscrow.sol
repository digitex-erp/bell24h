// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Bell24hEscrow
 * @dev Manages escrow payments for the Bell24h marketplace with milestone payment support
 */
contract Bell24hEscrow {
    // Payment states
    enum PaymentState { Created, Funded, Released, Refunded, Disputed, Resolved }
    
    // Payment types
    enum PaymentType { FullPayment, Milestone }
    
    // Payment structure
    struct Payment {
        uint256 id;
        uint256 orderId;
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
        uint256 resolvedAt;
    }
    
    // Fee percentage (base 1000, e.g., 25 = 2.5%)
    uint256 public feeRate = 25; // 2.5% by default
    
    // Platform fee collector address
    address public feeCollector;
    
    // Contract owner
    address public owner;
    
    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256[]) public orderToPayments;
    mapping(uint256 => uint256) public orderBalances;
    
    // Current payment ID
    uint256 private nextPaymentId = 1;
    
    // Events
    event PaymentCreated(uint256 indexed id, uint256 indexed orderId, address buyer, address supplier, uint256 amount, PaymentType paymentType);
    event PaymentFunded(uint256 indexed id, uint256 amount);
    event PaymentReleased(uint256 indexed id, address supplier, uint256 amount);
    event PaymentRefunded(uint256 indexed id, address buyer, uint256 amount);
    event DisputeCreated(uint256 indexed paymentId, string reason);
    event DisputeResolved(uint256 indexed paymentId, string resolution);
    event FeeRateChanged(uint256 newFeeRate);
    event FeeCollectorChanged(address newFeeCollector);
    
    /**
     * @dev Constructor
     * @param _feeCollector Address where platform fees will be sent
     */
    constructor(address _feeCollector) {
        owner = msg.sender;
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Modifier to check if caller is the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    /**
     * @dev Modifier to check if caller is the buyer of a payment
     */
    modifier onlyBuyer(uint256 _paymentId) {
        require(msg.sender == payments[_paymentId].buyer, "Only buyer can call this");
        _;
    }
    
    /**
     * @dev Create a new payment
     * @param _orderId ID of the order this payment is for
     * @param _supplier Address of the supplier
     * @param _amount Amount to be paid
     * @param _paymentType Type of payment (full or milestone)
     * @param _milestoneNumber If milestone payment, which milestone number
     * @param _totalMilestones Total number of milestones
     * @param _documentHash IPFS hash of any related documents
     * @return id of the created payment
     */
    function createPayment(
        uint256 _orderId,
        address _supplier,
        uint256 _amount,
        PaymentType _paymentType,
        uint256 _milestoneNumber,
        uint256 _totalMilestones,
        string memory _documentHash
    ) public returns (uint256) {
        require(_supplier != address(0), "Invalid supplier address");
        require(_amount > 0, "Amount must be greater than 0");
        
        if (_paymentType == PaymentType.Milestone) {
            require(_milestoneNumber > 0, "Milestone number must be greater than 0");
            require(_milestoneNumber <= _totalMilestones, "Invalid milestone number");
            require(_totalMilestones > 0, "Total milestones must be greater than 0");
        }
        
        uint256 paymentId = nextPaymentId++;
        
        Payment memory newPayment = Payment({
            id: paymentId,
            orderId: _orderId,
            buyer: msg.sender,
            supplier: _supplier,
            amount: _amount,
            state: PaymentState.Created,
            paymentType: _paymentType,
            milestoneNumber: _milestoneNumber,
            totalMilestones: _totalMilestones,
            createdAt: block.timestamp,
            documentHash: _documentHash
        });
        
        payments[paymentId] = newPayment;
        orderToPayments[_orderId].push(paymentId);
        
        emit PaymentCreated(paymentId, _orderId, msg.sender, _supplier, _amount, _paymentType);
        
        return paymentId;
    }
    
    /**
     * @dev Fund a payment
     * @param _paymentId ID of the payment to fund
     */
    function fundPayment(uint256 _paymentId) public payable onlyBuyer(_paymentId) {
        Payment storage payment = payments[_paymentId];
        
        require(payment.id != 0, "Payment does not exist");
        require(payment.state == PaymentState.Created, "Payment not in Created state");
        require(msg.value == payment.amount, "Incorrect payment amount");
        
        payment.state = PaymentState.Funded;
        orderBalances[payment.orderId] += msg.value;
        
        emit PaymentFunded(_paymentId, msg.value);
    }
    
    /**
     * @dev Fund payment for an order directly
     * @param _orderId ID of the order
     */
    function deposit(uint256 _orderId) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        orderBalances[_orderId] += msg.value;
    }
    
    /**
     * @dev Get balance for an order
     * @param _orderId ID of the order
     * @return balance for the order
     */
    function getBalance(uint256 _orderId) public view returns (uint256) {
        return orderBalances[_orderId];
    }
    
    /**
     * @dev Release payment to supplier
     * @param _paymentId ID of the payment to release
     */
    function releasePayment(uint256 _paymentId) public onlyBuyer(_paymentId) {
        Payment storage payment = payments[_paymentId];
        
        require(payment.id != 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment not in Funded state");
        require(orderBalances[payment.orderId] >= payment.amount, "Insufficient balance");
        
        uint256 feeAmount = (payment.amount * feeRate) / 1000;
        uint256 supplierAmount = payment.amount - feeAmount;
        
        payment.state = PaymentState.Released;
        orderBalances[payment.orderId] -= payment.amount;
        
        // Transfer fee to fee collector
        (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Transfer payment to supplier
        (bool supplierSuccess, ) = payment.supplier.call{value: supplierAmount}("");
        require(supplierSuccess, "Supplier transfer failed");
        
        emit PaymentReleased(_paymentId, payment.supplier, supplierAmount);
    }
    
    /**
     * @dev Release funds from an order to a supplier
     * @param _orderId ID of the order
     * @param _supplier Address of the supplier
     */
    function release(uint256 _orderId, address _supplier) public {
        require(_supplier != address(0), "Invalid supplier address");
        uint256 balance = orderBalances[_orderId];
        require(balance > 0, "Insufficient balance");
        
        uint256 feeAmount = (balance * feeRate) / 1000;
        uint256 supplierAmount = balance - feeAmount;
        
        orderBalances[_orderId] = 0;
        
        // Transfer fee to fee collector
        (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Transfer payment to supplier
        (bool supplierSuccess, ) = _supplier.call{value: supplierAmount}("");
        require(supplierSuccess, "Supplier transfer failed");
    }
    
    /**
     * @dev Refund payment to buyer
     * @param _paymentId ID of the payment to refund
     */
    function refundPayment(uint256 _paymentId) public onlyOwner {
        Payment storage payment = payments[_paymentId];
        
        require(payment.id != 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment not in Funded state");
        require(orderBalances[payment.orderId] >= payment.amount, "Insufficient balance");
        
        payment.state = PaymentState.Refunded;
        orderBalances[payment.orderId] -= payment.amount;
        
        // Transfer refund to buyer
        (bool success, ) = payment.buyer.call{value: payment.amount}("");
        require(success, "Refund transfer failed");
        
        emit PaymentRefunded(_paymentId, payment.buyer, payment.amount);
    }
    
    /**
     * @dev Create a dispute for a payment
     * @param _paymentId ID of the payment to dispute
     * @param _reason Reason for the dispute
     * @param _evidence IPFS hash of evidence documents
     */
    function createDispute(uint256 _paymentId, string memory _reason, string memory _evidence) public onlyBuyer(_paymentId) {
        Payment storage payment = payments[_paymentId];
        
        require(payment.id != 0, "Payment does not exist");
        require(payment.state == PaymentState.Funded, "Payment must be in Funded state");
        
        payment.state = PaymentState.Disputed;
        
        disputes[_paymentId] = Dispute({
            paymentId: _paymentId,
            reason: _reason,
            evidence: _evidence,
            resolved: false,
            resolution: "",
            createdAt: block.timestamp,
            resolvedAt: 0
        });
        
        emit DisputeCreated(_paymentId, _reason);
    }
    
    /**
     * @dev Resolve a dispute
     * @param _paymentId ID of the payment with dispute
     * @param _resolution Resolution details
     * @param _refundBuyer Whether to refund the buyer
     */
    function resolveDispute(uint256 _paymentId, string memory _resolution, bool _refundBuyer) public onlyOwner {
        Payment storage payment = payments[_paymentId];
        Dispute storage dispute = disputes[_paymentId];
        
        require(payment.id != 0, "Payment does not exist");
        require(payment.state == PaymentState.Disputed, "Payment not in Disputed state");
        require(!dispute.resolved, "Dispute already resolved");
        require(orderBalances[payment.orderId] >= payment.amount, "Insufficient balance");
        
        dispute.resolved = true;
        dispute.resolution = _resolution;
        dispute.resolvedAt = block.timestamp;
        
        payment.state = PaymentState.Resolved;
        orderBalances[payment.orderId] -= payment.amount;
        
        if (_refundBuyer) {
            // Refund to buyer
            (bool success, ) = payment.buyer.call{value: payment.amount}("");
            require(success, "Refund transfer failed");
            emit PaymentRefunded(_paymentId, payment.buyer, payment.amount);
        } else {
            // Release to supplier with fee
            uint256 feeAmount = (payment.amount * feeRate) / 1000;
            uint256 supplierAmount = payment.amount - feeAmount;
            
            // Transfer fee to fee collector
            (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
            
            // Transfer payment to supplier
            (bool supplierSuccess, ) = payment.supplier.call{value: supplierAmount}("");
            require(supplierSuccess, "Supplier transfer failed");
            
            emit PaymentReleased(_paymentId, payment.supplier, supplierAmount);
        }
        
        emit DisputeResolved(_paymentId, _resolution);
    }
    
    /**
     * @dev Change the fee rate
     * @param _newFeeRate New fee rate (base 1000)
     */
    function setFeeRate(uint256 _newFeeRate) public onlyOwner {
        require(_newFeeRate <= 100, "Fee rate too high"); // Max 10%
        feeRate = _newFeeRate;
        emit FeeRateChanged(_newFeeRate);
    }
    
    /**
     * @dev Change the fee collector address
     * @param _newFeeCollector New fee collector address
     */
    function setFeeCollector(address _newFeeCollector) public onlyOwner {
        require(_newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = _newFeeCollector;
        emit FeeCollectorChanged(_newFeeCollector);
    }
    
    /**
     * @dev Transfer contract ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        owner = _newOwner;
    }
    
    /**
     * @dev Get all payment IDs for an order
     * @param _orderId ID of the order
     * @return Array of payment IDs
     */
    function getOrderPayments(uint256 _orderId) public view returns (uint256[] memory) {
        return orderToPayments[_orderId];
    }
    
    /**
     * @dev Get payment details
     * @param _paymentId ID of the payment
     * @return Payment details
     */
    function getPayment(uint256 _paymentId) public view returns (
        uint256 id,
        uint256 orderId,
        address buyer,
        address supplier,
        uint256 amount,
        PaymentState state,
        PaymentType paymentType,
        uint256 milestoneNumber,
        uint256 totalMilestones,
        uint256 createdAt,
        string memory documentHash
    ) {
        Payment memory payment = payments[_paymentId];
        require(payment.id != 0, "Payment does not exist");
        
        return (
            payment.id,
            payment.orderId,
            payment.buyer,
            payment.supplier,
            payment.amount,
            payment.state,
            payment.paymentType,
            payment.milestoneNumber,
            payment.totalMilestones,
            payment.createdAt,
            payment.documentHash
        );
    }
    
    /**
     * @dev Get dispute details
     * @param _paymentId ID of the payment with dispute
     * @return Dispute details
     */
    function getDispute(uint256 _paymentId) public view returns (
        uint256 paymentId,
        string memory reason,
        string memory evidence,
        bool resolved,
        string memory resolution,
        uint256 createdAt,
        uint256 resolvedAt
    ) {
        Dispute memory dispute = disputes[_paymentId];
        require(dispute.paymentId != 0, "Dispute does not exist");
        
        return (
            dispute.paymentId,
            dispute.reason,
            dispute.evidence,
            dispute.resolved,
            dispute.resolution,
            dispute.createdAt,
            dispute.resolvedAt
        );
    }
}