// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title BusinessCredentialVerification
 * @dev Smart contract for verifying business credentials on the Polygon blockchain
 * Used by Bell24h B2B marketplace for verifying GSTIN, ISO, and other business credentials
 */
contract BusinessCredentialVerification {
    // Contract owner
    address public owner;
    
    // Credential verification record structure
    struct CredentialRecord {
        string credentialType;     // Type of credential (e.g. "GSTIN", "ISO9001")
        string credentialValue;    // The actual credential identifier
        address businessAddress;   // The address of the business
        address verifier;          // Address that verified the credential
        uint256 timestamp;         // When the verification was recorded
        bool isValid;              // Current validity status
        string metadataURI;        // URI to additional metadata (IPFS/centralized)
    }
    
    // Mapping from credential hash to verification record
    mapping(bytes32 => CredentialRecord) public verifications;
    
    // Mapping from business address to credential types they have verified
    mapping(address => mapping(string => bool)) public verifiedCredentials;
    
    // Approved verifiers - addresses that can verify credentials
    mapping(address => bool) public approvedVerifiers;
    
    // Verification events
    event CredentialVerified(
        bytes32 indexed verificationId,
        string credentialType,
        address indexed business,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CredentialRevoked(
        bytes32 indexed verificationId,
        string credentialType,
        address indexed business,
        address indexed revoker,
        uint256 timestamp
    );
    
    event VerifierApproved(address indexed verifier, uint256 timestamp);
    event VerifierRemoved(address indexed verifier, uint256 timestamp);

    /**
     * @dev Constructor sets the owner of the contract
     */
    constructor() {
        owner = msg.sender;
        // Add contract creator as an approved verifier
        approvedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Modifier to check if caller is the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Owner only");
        _;
    }
    
    /**
     * @dev Modifier to check if caller is an approved verifier
     */
    modifier onlyVerifier() {
        require(approvedVerifiers[msg.sender], "Not authorized: Approved verifiers only");
        _;
    }
    
    /**
     * @dev Add a new approved verifier
     * @param verifier Address of the verifier to add
     */
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        approvedVerifiers[verifier] = true;
        emit VerifierApproved(verifier, block.timestamp);
    }
    
    /**
     * @dev Remove an approved verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(approvedVerifiers[verifier], "Address is not an approved verifier");
        delete approvedVerifiers[verifier];
        emit VerifierRemoved(verifier, block.timestamp);
    }
    
    /**
     * @dev Verify a business credential
     * @param credentialType Type of credential (e.g. "GSTIN", "ISO9001")
     * @param credentialValue The credential identifier
     * @param businessAddress Address of the business
     * @param metadataURI Optional URI pointing to additional verification metadata
     * @return verificationId Unique identifier for this verification
     */
    function verifyCredential(
        string calldata credentialType,
        string calldata credentialValue,
        address businessAddress,
        string calldata metadataURI
    ) external onlyVerifier returns (bytes32) {
        require(bytes(credentialType).length > 0, "Credential type cannot be empty");
        require(bytes(credentialValue).length > 0, "Credential value cannot be empty");
        require(businessAddress != address(0), "Invalid business address");
        
        // Create a unique verification ID
        bytes32 verificationId = keccak256(
            abi.encodePacked(
                credentialType,
                credentialValue,
                businessAddress,
                block.timestamp,
                msg.sender
            )
        );
        
        // Store the verification record
        verifications[verificationId] = CredentialRecord({
            credentialType: credentialType,
            credentialValue: credentialValue,
            businessAddress: businessAddress,
            verifier: msg.sender,
            timestamp: block.timestamp,
            isValid: true,
            metadataURI: metadataURI
        });
        
        // Mark this credential as verified for the business
        verifiedCredentials[businessAddress][credentialType] = true;
        
        // Emit verification event
        emit CredentialVerified(
            verificationId,
            credentialType,
            businessAddress,
            msg.sender,
            block.timestamp
        );
        
        return verificationId;
    }
    
    /**
     * @dev Check if a verification exists and is valid
     * @param verificationId The ID of the verification to check
     * @return isValid Whether the verification is valid
     * @return timestamp When the verification was recorded
     * @return verifier Address that verified the credential
     */
    function checkVerification(bytes32 verificationId) external view 
    returns (bool isValid, uint256 timestamp, address verifier) {
        CredentialRecord storage record = verifications[verificationId];
        
        // Check if verification exists (timestamp will be 0 if not set)
        require(record.timestamp > 0, "Verification does not exist");
        
        return (record.isValid, record.timestamp, record.verifier);
    }
    
    /**
     * @dev Get full verification details
     * @param verificationId The ID of the verification to retrieve
     * @return record The full verification record
     */
    function getVerificationDetails(bytes32 verificationId) external view
    returns (CredentialRecord memory) {
        CredentialRecord storage record = verifications[verificationId];
        require(record.timestamp > 0, "Verification does not exist");
        
        return record;
    }
    
    /**
     * @dev Check if a business has a verified credential
     * @param businessAddress Address of the business to check
     * @param credentialType Type of credential to check
     * @return Whether the business has this credential verified
     */
    function hasVerifiedCredential(address businessAddress, string calldata credentialType)
    external view returns (bool) {
        return verifiedCredentials[businessAddress][credentialType];
    }
    
    /**
     * @dev Revoke a previously verified credential
     * @param verificationId The ID of the verification to revoke
     */
    function revokeVerification(bytes32 verificationId) external onlyVerifier {
        CredentialRecord storage record = verifications[verificationId];
        
        // Check if verification exists and is valid
        require(record.timestamp > 0, "Verification does not exist");
        require(record.isValid, "Verification already revoked");
        
        // Only the original verifier or contract owner can revoke
        require(
            msg.sender == record.verifier || msg.sender == owner,
            "Not authorized to revoke this verification"
        );
        
        // Revoke the verification
        record.isValid = false;
        
        // Remove from business verification mapping
        verifiedCredentials[record.businessAddress][record.credentialType] = false;
        
        // Emit revocation event
        emit CredentialRevoked(
            verificationId,
            record.credentialType,
            record.businessAddress,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
}
