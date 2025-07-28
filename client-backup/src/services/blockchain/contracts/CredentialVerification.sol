// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CredentialVerification
 * @dev Smart contract for verifying business credentials on the blockchain
 */
contract CredentialVerification {
    address public admin;
    
    struct Verification {
        string credentialType;
        string credentialHash; // Hash of the credential value
        address business;
        address verifier;
        uint256 timestamp;
        bool verified;
    }
    
    // Maps verification IDs to Verification structs
    mapping(bytes32 => Verification) public verifications;
    
    // Maps business addresses to their credential types to verification IDs
    mapping(address => mapping(string => bytes32)) public businessCredentials;
    
    // Event emitted when a new verification is processed
    event CredentialVerified(
        bytes32 indexed verificationId, 
        string credentialType, 
        address indexed business, 
        address indexed verifier, 
        uint256 timestamp
    );
    
    /**
     * @dev Constructor to set admin address
     */
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Modifier to restrict functions to admin only
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    /**
     * @dev Verifies a business credential and records it on the blockchain
     * @param credentialType Type of credential (e.g., GSTIN, ISO)
     * @param credentialValue Value of the credential
     * @param businessAddress Address of the business being verified
     * @return verificationId Unique identifier for this verification
     */
    function verifyCredential(
        string memory credentialType,
        string memory credentialValue,
        address businessAddress
    ) 
        public 
        onlyAdmin 
        returns (bytes32) 
    {
        // Hash the credential value for privacy
        string memory credentialHash = _hashCredential(credentialValue);
        
        // Generate a unique verification ID
        bytes32 verificationId = keccak256(
            abi.encodePacked(
                businessAddress,
                credentialType,
                credentialHash,
                block.timestamp
            )
        );
        
        // Store the verification record
        verifications[verificationId] = Verification({
            credentialType: credentialType,
            credentialHash: credentialHash,
            business: businessAddress,
            verifier: msg.sender,
            timestamp: block.timestamp,
            verified: true
        });
        
        // Map the business address to this verification
        businessCredentials[businessAddress][credentialType] = verificationId;
        
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
     * @dev Checks the verification status of a specific verification
     * @param verificationId ID of the verification to check
     * @return verified Whether the credential is verified
     * @return timestamp When the verification was done
     * @return verifier Address that performed the verification
     */
    function checkVerification(bytes32 verificationId) 
        public 
        view 
        returns (bool verified, uint256 timestamp, address verifier) 
    {
        Verification memory v = verifications[verificationId];
        return (v.verified, v.timestamp, v.verifier);
    }
    
    /**
     * @dev Checks if a business has a verified credential of a specific type
     * @param businessAddress Address of the business to check
     * @param credentialType Type of credential to check
     * @return Has the business been verified for this credential type
     */
    function hasVerifiedCredential(
        address businessAddress, 
        string memory credentialType
    ) 
        public 
        view 
        returns (bool) 
    {
        bytes32 verificationId = businessCredentials[businessAddress][credentialType];
        
        // If no verification ID exists, return false
        if (verificationId == bytes32(0)) {
            return false;
        }
        
        // Check if the credential is verified
        return verifications[verificationId].verified;
    }
    
    /**
     * @dev Revokes a verification (can only be done by admin)
     * @param verificationId ID of the verification to revoke
     */
    function revokeVerification(bytes32 verificationId) 
        public 
        onlyAdmin 
    {
        require(verifications[verificationId].verified, "Verification not found or already revoked");
        
        // Set verified to false
        verifications[verificationId].verified = false;
    }
    
    /**
     * @dev Internal function to hash credential values for privacy
     * @param value Value to hash
     * @return Hashed value
     */
    function _hashCredential(string memory value) 
        internal 
        pure 
        returns (string memory) 
    {
        return string(abi.encodePacked(keccak256(abi.encodePacked(value))));
    }
}
