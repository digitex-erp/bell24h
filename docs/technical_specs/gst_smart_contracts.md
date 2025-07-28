# Technical Specifications: GST-Compliant Smart Contracts for B2B Marketplace

**Version:** 1.0
**Date:** 2025-06-01
**Status:** Draft

## 1. Introduction & Goals

This document outlines the technical specifications for the GST-compliant smart contracts designed for the Bell24H B2B marketplace. These contracts aim to automate and secure B2B transactions, ensuring GST compliance, transparent fund handling via escrow, and integration with India Stack components like UPI and ONDC.

**Key Goals:**
-   Automate GST calculation and remittance.
-   Provide a secure multi-signature escrow mechanism for transactions.
-   Integrate with decentralized identity systems for KYC/KYB (GSTN verification).
-   Facilitate seamless interaction with UPI for payment confirmations.
-   Enable linkage with ONDC for order fulfillment tracking.
-   Ensure robust security, gas efficiency on Polygon, and upgradeability.

## 2. Platform & Technologies

-   **Blockchain:** Polygon (PoS Mainnet/zkEVM for specific high-value contracts)
-   **Smart Contract Language:** Solidity (latest compatible version, e.g., 0.8.x)
-   **Development Framework:** Hardhat
-   **Standard Libraries:** OpenZeppelin Contracts (for Ownable, ReentrancyGuard, ERC20/721 interactions if any, AccessControl, Upgradeability)
-   **Upgradeability:** UUPS Proxy Pattern (ERC1967)
-   **Oracles:** Chainlink (or custom oracle solution) for external data (e.g., GSTN verification status, UPI payment confirmation, IoT delivery status).

## 3. Core Smart Contracts & Architecture

The system will primarily revolve around a `TradeEscrow` contract, potentially with helper contracts or libraries.

### 3.1. `TradeEscrow.sol`

This contract will manage the lifecycle of a trade between a buyer and a seller, including fund escrow, GST handling, and dispute resolution.

#### 3.1.1. Roles & Access Control
-   **Buyer:** Initiates transaction, deposits funds.
-   **Seller:** Confirms order, delivers goods/services.
-   **Arbitrator (Optional/Multi-sig):** Resolves disputes, co-signs high-value releases.
-   **GST Authority Wallet:** Designated address to receive GST remittances.
-   **Platform Admin:** Manages contract parameters (e.g., fees, arbitrator list), can pause/unpause contract in emergencies. (Uses OpenZeppelin `AccessControl` or `Ownable`).

#### 3.1.2. State Variables (Key Structs & Mappings)

```solidity
struct Trade {
    bytes32 tradeId;
    address buyer;
    address seller;
    uint256 totalAmount; // Includes item cost + estimated GST
    uint256 itemAmount;
    uint256 gstAmount;
    uint256 platformFee;
    address paymentToken; // e.g., USDC, Wrapped MATIC, or native MATIC
    uint256 escrowDeadline; // Timestamp for seller to confirm or goods to be delivered
    uint256 releaseDeadline; // Timestamp for buyer to confirm receipt or auto-release
    TradeStatus status;
    bool buyerGSTVerified; // Pulled from DID/GSTN Oracle
    bool sellerGSTVerified;
    // ... other relevant fields like shipping details, ONDC order ID reference
}

enum TradeStatus {
    Created,        // Trade initiated by buyer
    Funded,         // Buyer deposited funds
    SellerConfirmed,// Seller acknowledged order
    Shipped,        // Seller marked goods as shipped (optional, linked to IoT/Logistics Oracle)
    Delivered,      // Goods confirmed delivered (IoT/Logistics Oracle or Buyer Confirmation)
    BuyerApproved,  // Buyer approved release of funds
    Disputed,       // Dispute raised
    Resolved,       // Dispute resolved by arbitrator
    Released,       // Funds released to seller, GST remitted
    Cancelled,      // Trade cancelled
    Refunded        // Funds refunded to buyer
}

mapping(bytes32 => Trade) public trades;
mapping(address => bool) public isArbitrator; // Managed by Admin
address public gstAuthorityWallet;
address public platformFeeWallet;
uint256 public platformFeePercentage; // e.g., 100 for 1% (basis points)
```

#### 3.1.3. Key Functions

-   **`createTrade(...) returns (bytes32 tradeId)`**
    -   Inputs: `seller`, `itemAmount`, `paymentToken`, `gstRate` (or fetched based on HSN code via oracle).
    -   Buyer calls this.
    -   Calculates `totalAmount` (itemAmount + GST).
    -   Stores trade details, sets status to `Created`.
    -   Emits `TradeCreated` event.

-   **`fundTrade(bytes32 tradeId)` payable**
    -   Buyer calls this.
    -   Requires `msg.value` (if MATIC) or `transferFrom` (if ERC20) to match `totalAmount`.
    -   Updates status to `Funded`.
    -   Triggers GSTN verification for buyer and seller via oracle if not already done.
    -   Emits `TradeFunded` event.

-   **`sellerConfirmOrder(bytes32 tradeId)`**
    -   Seller calls this.
    -   Updates status to `SellerConfirmed`.
    -   Emits `OrderConfirmedBySeller` event.

-   **`markAsShipped(bytes32 tradeId, string shipmentDetails)`** (Optional)
    -   Seller calls this.
    -   Updates status to `Shipped`.
    -   Emits `GoodsShipped` event.

-   **`confirmDelivery(bytes32 tradeId)`**
    -   Can be called by Buyer OR an authorized IoT/Logistics Oracle.
    -   Updates status to `Delivered`.
    -   Emits `DeliveryConfirmed` event.

-   **`approveRelease(bytes32 tradeId)`**
    -   Buyer calls this after `Delivered` status.
    -   Updates status to `BuyerApproved`.
    -   If transaction value > threshold (e.g., ₹1M), requires multi-sig approval (see `executeReleaseMultiSig`).
    -   Otherwise, directly calls internal `_releaseFundsAndGST`.
    -   Emits `BuyerApprovedRelease` event.

-   **`executeRelease(bytes32 tradeId)`**
    -   Can be called by Seller or Buyer if `releaseDeadline` has passed and status is `Delivered` or `BuyerApproved`.
    -   Handles single-signature release for non-high-value transactions.
    -   Calls internal `_releaseFundsAndGST`.

-   **`_releaseFundsAndGST(bytes32 tradeId)` internal**
    -   Transfers `itemAmount` (less platform fee) to Seller.
    -   Transfers `gstAmount` to `gstAuthorityWallet`.
    -   Transfers `platformFee` to `platformFeeWallet`.
    -   Updates status to `Released`.
    -   Emits `FundsReleased` and `GSTRemitted` events.

-   **Multi-Signature for High-Value Transactions (e.g., > ₹1M):**
    -   A separate mechanism or integrated logic (e.g., using OpenZeppelin's `TimelockController` or a custom multi-sig wallet pattern) where `approveRelease` for high-value trades queues the release, and an Arbitrator/Admin must co-sign.
    -   Alternatively, the `TradeEscrow` contract itself could be an owner on a Gnosis Safe (or similar) for managing high-value payouts.

-   **`raiseDispute(bytes32 tradeId, string reason)`**
-   **`resolveDispute(bytes32 tradeId, TradeStatus resolutionStatus, address payable fundRecipient)`** (Callable by Arbitrator)
-   **`cancelTrade(bytes32 tradeId)`** (Conditions for cancellation, e.g., before funding, or by mutual consent)
-   **Admin functions:** `setPlatformFee`, `setGSTAuthorityWallet`, `addArbitrator`, `removeArbitrator`, `pause`, `unpause`.

#### 3.1.4. Events
-   `TradeCreated(bytes32 indexed tradeId, address indexed buyer, address indexed seller, uint256 totalAmount)`
-   `TradeFunded(bytes32 indexed tradeId, uint256 amount)`
-   `OrderConfirmedBySeller(bytes32 indexed tradeId)`
-   `DeliveryConfirmed(bytes32 indexed tradeId, address confirmer)`
-   `BuyerApprovedRelease(bytes32 indexed tradeId)`
-   `FundsReleased(bytes32 indexed tradeId, address indexed seller, uint256 amount)`
-   `GSTRemitted(bytes32 indexed tradeId, address indexed gstAuthority, uint256 gstAmount)`
-   `PlatformFeeCollected(bytes32 indexed tradeId, uint256 feeAmount)`
-   `TradeDisputed(bytes32 indexed tradeId, address disputer)`
-   `TradeResolved(bytes32 indexed tradeId, TradeStatus resolution)`
-   `TradeCancelled(bytes32 indexed tradeId)`

### 3.2. `GSTOracle.sol` (Interface / Off-chain component)
-   While not a smart contract itself, an oracle system is crucial.
-   **Functions needed (to be called by `TradeEscrow`):**
    -   `getGSTNStatus(address businessEntity) returns (bool isVerified, string gstNumber)`
    -   `getHSNGSTDetails(string hsnCode) returns (uint256 gstRate)`
    -   `getUPITransactionStatus(string upiTransactionId) returns (bool confirmed, uint256 amount)`
    -   `getONDCOrderStatus(string ondcOrderId) returns (string status)`
    -   `getShipmentStatus(string shipmentId) returns (string status)` (from IoT/Logistics provider)

## 4. UPI & ONDC Integration Points

-   **UPI Payments:**
    -   Buyer makes payment off-chain via UPI.
    -   The UPI transaction ID is submitted to the platform.
    -   An oracle verifies the UPI payment status with NPCI (or through an aggregator).
    -   Upon confirmation, the oracle calls a function on `TradeEscrow` (e.g., `confirmUPIPayment(tradeId, upiTxId)`) which then can move the trade to `Funded` or a similar state if direct contract funding isn't used.
    -   Alternatively, the platform backend confirms UPI and then funds the contract on behalf of the buyer using a custodial wallet approach for gas abstraction.
-   **ONDC Integration:**
    -   ONDC order IDs can be stored within the `Trade` struct.
    -   Oracle updates from the ONDC network regarding order fulfillment (e.g., "shipped", "delivered") can trigger state changes in the `TradeEscrow` contract (e.g., calling `confirmDelivery`).

## 5. Security Considerations

-   **Reentrancy:** Use OpenZeppelin `ReentrancyGuard`.
-   **Access Control:** Rigorous use of `onlyOwner`, `onlyRole` (from `AccessControl.sol`) for sensitive functions.
-   **Input Validation:** `require` statements for all inputs.
-   **Integer Overflow/Underflow:** Use Solidity 0.8.x+ which has built-in checks.
-   **Oracle Manipulation:** Ensure oracle design is robust, uses multiple sources if possible, and has a dispute mechanism or fallback.
-   **Gas Limits:** Design functions to be mindful of block gas limits, especially loops or complex computations. Use patterns like withdrawal over send.
-   **Emergency Stop:** Implement `pausable` functionality.
-   **Audits:** Thorough third-party security audits are mandatory before deployment.

## 6. Gas Optimization (Polygon)

-   Minimize storage writes.
-   Use efficient data types (e.g., `uint256` is often more efficient than smaller `uints` unless packing structs).
-   Optimize loops and computations.
-   Consider EIP-1167 Minimal Proxy for deploying multiple instances if a factory pattern is used for trades (though a central `TradeEscrow` managing all trades via mapping is likely more common).

## 7. Upgradeability

-   Use OpenZeppelin UUPS proxy pattern (`ERC1967Upgrade`).
-   Ensure storage layout compatibility between upgrades.
-   Thoroughly test upgrade process in staging environments.

## 8. Future Considerations
-   Integration with TReDS for invoice discounting.
-   Support for dynamic NFT-based invoices.
-   Cross-chain capabilities.

---
This forms a solid foundation for the GST smart contract specifications.
