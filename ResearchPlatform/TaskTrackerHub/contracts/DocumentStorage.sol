// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DocumentStorage
 * @dev Stores and verifies document hashes for the Bell24h marketplace
 */
contract DocumentStorage is Ownable {
    // Document types
    enum DocumentType { RFQ, Quote, Shipment, Payment, Dispute, Other }
    
    // Document structure
    struct Document {
        bytes32 contentHash;       // Hash of the document content
        address uploader;          // Address that uploaded the document
        string ipfsHash;           // IPFS hash for retrieval
        uint256 timestamp;         // Upload timestamp
        uint256 referenceId;       // ID of the related entity (RFQ, payment, etc.)
        DocumentType documentType; // Type of document
        string description;        // Optional description
        bool verified;             // Whether the document has been verified
    }
    
    // Mapping from document hash to Document
    mapping(bytes32 => Document) public documents;
    
    // Events
    event DocumentStored(bytes32 indexed contentHash, address indexed uploader, DocumentType documentType, uint256 referenceId);
    event DocumentVerified(bytes32 indexed contentHash, address indexed verifier);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Store a document hash
     * @param contentHash Hash of the document content
     * @param ipfsHash IPFS hash for retrieval
     * @param referenceId ID of the related entity
     * @param documentType Type of document
     * @param description Optional description
     */
    function storeDocument(
        bytes32 contentHash,
        string memory ipfsHash,
        uint256 referenceId,
        DocumentType documentType,
        string memory description
    ) external {
        require(contentHash != bytes32(0), "Content hash cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        documents[contentHash] = Document({
            contentHash: contentHash,
            uploader: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            referenceId: referenceId,
            documentType: documentType,
            description: description,
            verified: false
        });
        
        emit DocumentStored(contentHash, msg.sender, documentType, referenceId);
    }
    
    /**
     * @dev Verify a document
     * @param contentHash Hash of the document to verify
     */
    function verifyDocument(bytes32 contentHash) external {
        require(contentHash != bytes32(0), "Content hash cannot be empty");
        require(documents[contentHash].contentHash == contentHash, "Document does not exist");
        require(
            documents[contentHash].uploader == msg.sender || owner() == msg.sender,
            "Only uploader or owner can verify document"
        );
        
        documents[contentHash].verified = true;
        
        emit DocumentVerified(contentHash, msg.sender);
    }
    
    /**
     * @dev Check if a document exists and is verified
     * @param contentHash Hash of the document to check
     * @return exists Whether the document exists
     * @return verified Whether the document is verified
     * @return ipfsHash IPFS hash for retrieval
     */
    function checkDocument(bytes32 contentHash) 
        external view 
        returns (bool exists, bool verified, string memory ipfsHash) 
    {
        Document memory doc = documents[contentHash];
        exists = (doc.contentHash == contentHash);
        verified = doc.verified;
        ipfsHash = doc.ipfsHash;
    }
    
    /**
     * @dev Get document details
     * @param contentHash Hash of the document
     * @return uploader Address that uploaded the document
     * @return ipfsHash IPFS hash for retrieval
     * @return timestamp Upload timestamp
     * @return referenceId ID of the related entity
     * @return documentType Type of document
     * @return description Document description
     * @return verified Whether the document is verified
     */
    function getDocument(bytes32 contentHash)
        external
        view
        returns (
            address uploader,
            string memory ipfsHash,
            uint256 timestamp,
            uint256 referenceId,
            DocumentType documentType,
            string memory description,
            bool verified
        )
    {
        Document memory doc = documents[contentHash];
        require(doc.contentHash == contentHash, "Document does not exist");
        
        return (
            doc.uploader,
            doc.ipfsHash,
            doc.timestamp,
            doc.referenceId,
            doc.documentType,
            doc.description,
            doc.verified
        );
    }
    
    /**
     * @dev Create a content hash from a string
     * @param content String content to hash
     * @return Hash of the content
     */
    function createContentHash(string memory content) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(content));
    }
}