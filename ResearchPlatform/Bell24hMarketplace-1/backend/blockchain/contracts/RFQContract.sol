
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RFQContract {
    struct RFQ {
        string id;
        address buyer;
        string title;
        string description;
        uint256 budget;
        uint256 quantity;
        uint256 deliveryDays;
        address selectedSupplier;
        RFQStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Bid {
        string id;
        string rfqId;
        address supplier;
        uint256 price;
        uint256 deliveryDays;
        string notes;
        BidStatus status;
        uint256 createdAt;
    }

    enum RFQStatus { Open, InProgress, Completed, Cancelled }
    enum BidStatus { Pending, Accepted, Rejected, Completed }

    mapping(string => RFQ) public rfqs;
    mapping(string => Bid[]) public rfqBids;
    mapping(address => uint256) public supplierReputationScores;

    event RFQCreated(string id, address buyer, uint256 timestamp);
    event BidSubmitted(string rfqId, string bidId, address supplier, uint256 timestamp);
    event BidAccepted(string rfqId, string bidId, address supplier, uint256 timestamp);
    event RFQCompleted(string rfqId, address supplier, uint256 timestamp);

    function createRFQ(
        string memory _id,
        string memory _title,
        string memory _description,
        uint256 _budget,
        uint256 _quantity,
        uint256 _deliveryDays
    ) public {
        RFQ memory newRFQ = RFQ({
            id: _id,
            buyer: msg.sender,
            title: _title,
            description: _description,
            budget: _budget,
            quantity: _quantity,
            deliveryDays: _deliveryDays,
            selectedSupplier: address(0),
            status: RFQStatus.Open,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        rfqs[_id] = newRFQ;
        emit RFQCreated(_id, msg.sender, block.timestamp);
    }

    function submitBid(
        string memory _rfqId,
        string memory _bidId,
        uint256 _price,
        uint256 _deliveryDays,
        string memory _notes
    ) public {
        require(rfqs[_rfqId].status == RFQStatus.Open, "RFQ is not open for bidding");
        
        Bid memory newBid = Bid({
            id: _bidId,
            rfqId: _rfqId,
            supplier: msg.sender,
            price: _price,
            deliveryDays: _deliveryDays,
            notes: _notes,
            status: BidStatus.Pending,
            createdAt: block.timestamp
        });

        rfqBids[_rfqId].push(newBid);
        emit BidSubmitted(_rfqId, _bidId, msg.sender, block.timestamp);
    }

    function acceptBid(string memory _rfqId, string memory _bidId) public {
        require(rfqs[_rfqId].buyer == msg.sender, "Only RFQ owner can accept bids");
        require(rfqs[_rfqId].status == RFQStatus.Open, "RFQ is not open");

        Bid[] storage bids = rfqBids[_rfqId];
        uint256 bidIndex;
        bool bidFound = false;

        for (uint256 i = 0; i < bids.length; i++) {
            if (keccak256(bytes(bids[i].id)) == keccak256(bytes(_bidId))) {
                bidIndex = i;
                bidFound = true;
                break;
            }
        }

        require(bidFound, "Bid not found");

        bids[bidIndex].status = BidStatus.Accepted;
        rfqs[_rfqId].status = RFQStatus.InProgress;
        rfqs[_rfqId].selectedSupplier = bids[bidIndex].supplier;
        rfqs[_rfqId].updatedAt = block.timestamp;

        emit BidAccepted(_rfqId, _bidId, bids[bidIndex].supplier, block.timestamp);
    }

    function completeRFQ(string memory _rfqId) public {
        require(rfqs[_rfqId].buyer == msg.sender, "Only RFQ owner can complete RFQ");
        require(rfqs[_rfqId].status == RFQStatus.InProgress, "RFQ is not in progress");

        rfqs[_rfqId].status = RFQStatus.Completed;
        rfqs[_rfqId].updatedAt = block.timestamp;

        // Update supplier reputation score
        address supplier = rfqs[_rfqId].selectedSupplier;
        supplierReputationScores[supplier] += 1;

        emit RFQCompleted(_rfqId, supplier, block.timestamp);
    }
}
