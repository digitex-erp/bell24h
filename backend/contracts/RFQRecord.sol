// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RFQRecord {
    struct RFQ {
        uint256 id;
        string ipfsHash;  // IPFS hash of RFQ details
        address buyer;
        uint256 timestamp;
        string status;
        bytes32 documentHash;  // Hash of original RFQ document
    }

    struct Quotation {
        uint256 id;
        uint256 rfqId;
        address supplier;
        string ipfsHash;
        uint256 timestamp;
        string status;
        bytes32 documentHash;
    }

    mapping(uint256 => RFQ) public rfqs;
    mapping(uint256 => Quotation[]) public quotations;
    uint256 public rfqCount;

    event RFQCreated(
        uint256 indexed id,
        address indexed buyer,
        string ipfsHash,
        uint256 timestamp
    );

    event QuotationSubmitted(
        uint256 indexed id,
        uint256 indexed rfqId,
        address indexed supplier,
        string ipfsHash,
        uint256 timestamp
    );

    event StatusUpdated(
        uint256 indexed id,
        string status,
        uint256 timestamp
    );

    modifier onlyBuyer(uint256 _rfqId) {
        require(
            rfqs[_rfqId].buyer == msg.sender,
            "Only the buyer can perform this action"
        );
        _;
    }

    function createRFQ(
        string memory _ipfsHash,
        bytes32 _documentHash
    ) public returns (uint256) {
        rfqCount++;
        rfqs[rfqCount] = RFQ({
            id: rfqCount,
            ipfsHash: _ipfsHash,
            buyer: msg.sender,
            timestamp: block.timestamp,
            status: "OPEN",
            documentHash: _documentHash
        });

        emit RFQCreated(
            rfqCount,
            msg.sender,
            _ipfsHash,
            block.timestamp
        );

        return rfqCount;
    }

    function submitQuotation(
        uint256 _rfqId,
        string memory _ipfsHash,
        bytes32 _documentHash
    ) public {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        require(
            keccak256(bytes(rfqs[_rfqId].status)) == keccak256(bytes("OPEN")),
            "RFQ is not open for quotations"
        );

        Quotation memory quotation = Quotation({
            id: quotations[_rfqId].length + 1,
            rfqId: _rfqId,
            supplier: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            status: "PENDING",
            documentHash: _documentHash
        });

        quotations[_rfqId].push(quotation);

        emit QuotationSubmitted(
            quotation.id,
            _rfqId,
            msg.sender,
            _ipfsHash,
            block.timestamp
        );
    }

    function updateRFQStatus(
        uint256 _rfqId,
        string memory _status
    ) public onlyBuyer(_rfqId) {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        rfqs[_rfqId].status = _status;

        emit StatusUpdated(
            _rfqId,
            _status,
            block.timestamp
        );
    }

    function updateQuotationStatus(
        uint256 _rfqId,
        uint256 _quotationId,
        string memory _status
    ) public onlyBuyer(_rfqId) {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        require(
            _quotationId <= quotations[_rfqId].length,
            "Quotation does not exist"
        );

        quotations[_rfqId][_quotationId - 1].status = _status;

        emit StatusUpdated(
            _quotationId,
            _status,
            block.timestamp
        );
    }

    function getRFQ(
        uint256 _rfqId
    ) public view returns (
        uint256 id,
        string memory ipfsHash,
        address buyer,
        uint256 timestamp,
        string memory status,
        bytes32 documentHash
    ) {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        RFQ memory rfq = rfqs[_rfqId];
        return (
            rfq.id,
            rfq.ipfsHash,
            rfq.buyer,
            rfq.timestamp,
            rfq.status,
            rfq.documentHash
        );
    }

    function getQuotations(
        uint256 _rfqId
    ) public view returns (Quotation[] memory) {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        return quotations[_rfqId];
    }

    function verifyDocument(
        uint256 _rfqId,
        bytes32 _hash
    ) public view returns (bool) {
        require(_rfqId <= rfqCount, "RFQ does not exist");
        return rfqs[_rfqId].documentHash == _hash;
    }
}
