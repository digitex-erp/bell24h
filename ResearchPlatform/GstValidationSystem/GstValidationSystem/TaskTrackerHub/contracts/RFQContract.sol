// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RFQContract
 * @dev Manages the RFQ (Request for Quote) process on Bell24h marketplace
 */
contract RFQContract is Ownable, ReentrancyGuard {
    // RFQ states
    enum RFQState { Created, Open, Closed, Awarded, Completed, Canceled }
    
    // Quote states
    enum QuoteState { Submitted, Accepted, Rejected, Expired }
    
    // RFQ structure
    struct RFQ {
        uint256 id;
        address buyer;
        string rfqNumber;
        string product;
        string quantity;
        uint256 dueDate;
        string description;
        string documentHash; // IPFS hash for RFQ documents
        RFQState state;
        uint256 createdAt;
        uint256 awardedQuoteId; // ID of the accepted quote
    }
    
    // Quote structure
    struct Quote {
        uint256 id;
        uint256 rfqId;
        address supplier;
        uint256 price;
        string deliveryTime;
        string documentHash; // IPFS hash for quote documents
        QuoteState state;
        uint256 createdAt;
    }
    
    // Mapping of RFQs by ID
    mapping(uint256 => RFQ) public rfqs;
    
    // Mapping of quotes by ID
    mapping(uint256 => Quote) public quotes;
    
    // Mapping of quotes by RFQ ID
    mapping(uint256 => uint256[]) public rfqToQuotes;
    
    // Current IDs
    uint256 private nextRfqId = 1;
    uint256 private nextQuoteId = 1;
    
    // Events
    event RFQCreated(uint256 indexed id, address indexed buyer, string rfqNumber);
    event RFQUpdated(uint256 indexed id, RFQState state);
    event QuoteSubmitted(uint256 indexed id, uint256 indexed rfqId, address indexed supplier);
    event QuoteUpdated(uint256 indexed id, QuoteState state);
    event RFQAwarded(uint256 indexed rfqId, uint256 indexed quoteId, address indexed supplier);
    
    /**
     * @dev Create a new RFQ
     * @param rfqNumber Unique RFQ number
     * @param product Product description
     * @param quantity Quantity required
     * @param dueDate Due date for quotes
     * @param description Detailed description
     * @param documentHash IPFS hash for RFQ documents
     */
    function createRFQ(
        string memory rfqNumber,
        string memory product,
        string memory quantity,
        uint256 dueDate,
        string memory description,
        string memory documentHash
    ) external {
        require(bytes(rfqNumber).length > 0, "RFQ number cannot be empty");
        require(bytes(product).length > 0, "Product cannot be empty");
        require(bytes(quantity).length > 0, "Quantity cannot be empty");
        require(dueDate > block.timestamp, "Due date must be in the future");
        
        uint256 rfqId = nextRfqId++;
        
        rfqs[rfqId] = RFQ({
            id: rfqId,
            buyer: msg.sender,
            rfqNumber: rfqNumber,
            product: product,
            quantity: quantity,
            dueDate: dueDate,
            description: description,
            documentHash: documentHash,
            state: RFQState.Open,
            createdAt: block.timestamp,
            awardedQuoteId: 0
        });
        
        emit RFQCreated(rfqId, msg.sender, rfqNumber);
    }
    
    /**
     * @dev Submit a quote for an RFQ
     * @param rfqId RFQ ID
     * @param price Quoted price
     * @param deliveryTime Estimated delivery time
     * @param documentHash IPFS hash for quote documents
     */
    function submitQuote(
        uint256 rfqId,
        uint256 price,
        string memory deliveryTime,
        string memory documentHash
    ) external {
        require(rfqs[rfqId].id > 0, "RFQ does not exist");
        require(rfqs[rfqId].state == RFQState.Open, "RFQ is not open for quotes");
        require(rfqs[rfqId].dueDate >= block.timestamp, "RFQ due date has passed");
        require(rfqs[rfqId].buyer != msg.sender, "Buyer cannot submit quote");
        
        uint256 quoteId = nextQuoteId++;
        
        quotes[quoteId] = Quote({
            id: quoteId,
            rfqId: rfqId,
            supplier: msg.sender,
            price: price,
            deliveryTime: deliveryTime,
            documentHash: documentHash,
            state: QuoteState.Submitted,
            createdAt: block.timestamp
        });
        
        rfqToQuotes[rfqId].push(quoteId);
        
        emit QuoteSubmitted(quoteId, rfqId, msg.sender);
    }
    
    /**
     * @dev Award an RFQ to a quote
     * @param rfqId RFQ ID
     * @param quoteId Quote ID
     */
    function awardRFQ(uint256 rfqId, uint256 quoteId) external {
        require(rfqs[rfqId].id > 0, "RFQ does not exist");
        require(rfqs[rfqId].buyer == msg.sender, "Only buyer can award RFQ");
        require(rfqs[rfqId].state == RFQState.Open, "RFQ is not open");
        require(quotes[quoteId].id > 0, "Quote does not exist");
        require(quotes[quoteId].rfqId == rfqId, "Quote is not for this RFQ");
        require(quotes[quoteId].state == QuoteState.Submitted, "Quote is not in submitted state");
        
        // Update RFQ state
        rfqs[rfqId].state = RFQState.Awarded;
        rfqs[rfqId].awardedQuoteId = quoteId;
        
        // Update quote state
        quotes[quoteId].state = QuoteState.Accepted;
        
        // Reject all other quotes
        uint256[] memory quoteIds = rfqToQuotes[rfqId];
        for (uint256 i = 0; i < quoteIds.length; i++) {
            if (quoteIds[i] != quoteId && quotes[quoteIds[i]].state == QuoteState.Submitted) {
                quotes[quoteIds[i]].state = QuoteState.Rejected;
                emit QuoteUpdated(quoteIds[i], QuoteState.Rejected);
            }
        }
        
        emit RFQAwarded(rfqId, quoteId, quotes[quoteId].supplier);
        emit RFQUpdated(rfqId, RFQState.Awarded);
        emit QuoteUpdated(quoteId, QuoteState.Accepted);
    }
    
    /**
     * @dev Complete an RFQ after delivery
     * @param rfqId RFQ ID
     */
    function completeRFQ(uint256 rfqId) external {
        require(rfqs[rfqId].id > 0, "RFQ does not exist");
        require(rfqs[rfqId].buyer == msg.sender, "Only buyer can complete RFQ");
        require(rfqs[rfqId].state == RFQState.Awarded, "RFQ is not awarded");
        
        rfqs[rfqId].state = RFQState.Completed;
        
        emit RFQUpdated(rfqId, RFQState.Completed);
    }
    
    /**
     * @dev Cancel an RFQ
     * @param rfqId RFQ ID
     */
    function cancelRFQ(uint256 rfqId) external {
        require(rfqs[rfqId].id > 0, "RFQ does not exist");
        require(rfqs[rfqId].buyer == msg.sender || owner() == msg.sender, "Only buyer or owner can cancel RFQ");
        require(rfqs[rfqId].state == RFQState.Open, "RFQ can only be canceled when open");
        
        rfqs[rfqId].state = RFQState.Canceled;
        
        // Expire all submitted quotes
        uint256[] memory quoteIds = rfqToQuotes[rfqId];
        for (uint256 i = 0; i < quoteIds.length; i++) {
            if (quotes[quoteIds[i]].state == QuoteState.Submitted) {
                quotes[quoteIds[i]].state = QuoteState.Expired;
                emit QuoteUpdated(quoteIds[i], QuoteState.Expired);
            }
        }
        
        emit RFQUpdated(rfqId, RFQState.Canceled);
    }
    
    /**
     * @dev Get all quotes for an RFQ
     * @param rfqId RFQ ID
     * @return Array of quote IDs
     */
    function getQuotesForRFQ(uint256 rfqId) external view returns (uint256[] memory) {
        return rfqToQuotes[rfqId];
    }
    
    /**
     * @dev Verify document integrity using its hash
     * @param documentHash IPFS hash of the document
     * @param providedHash Hash to verify against
     * @return Boolean indicating if the document hash matches
     */
    function verifyDocument(string memory documentHash, string memory providedHash) 
        external pure returns (bool) 
    {
        return keccak256(abi.encodePacked(documentHash)) == keccak256(abi.encodePacked(providedHash));
    }
}