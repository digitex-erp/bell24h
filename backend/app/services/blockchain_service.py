from web3 import Web3
from eth_account import Account
from eth_account.signers.local import LocalAccount
import json
import hashlib
from typing import Dict, Any, Optional
from app.core.config import settings

class BlockchainService:
    def __init__(self):
        # Connect to Polygon network
        self.w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
        
        # Load contract ABI and address
        with open('contracts/RFQRecord.json') as f:
            contract_json = json.load(f)
        self.contract_abi = contract_json['abi']
        self.contract_address = settings.RFQ_CONTRACT_ADDRESS
        
        # Initialize contract
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        
        # Initialize account from private key
        self.account: LocalAccount = Account.from_key(settings.POLYGON_PRIVATE_KEY)

    def _get_transaction_params(self) -> Dict[str, Any]:
        """Get basic transaction parameters"""
        return {
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 2000000,
            'gasPrice': self.w3.eth.gas_price
        }

    def _hash_document(self, document: Dict[str, Any]) -> bytes:
        """Create a hash of the document"""
        document_str = json.dumps(document, sort_keys=True)
        return hashlib.sha256(document_str.encode()).digest()

    async def store_rfq(
        self,
        rfq_id: int,
        rfq_data: Dict[str, Any],
        ipfs_hash: str
    ) -> Dict[str, Any]:
        """Store RFQ record on blockchain"""
        try:
            # Hash the RFQ document
            document_hash = self._hash_document(rfq_data)
            
            # Prepare transaction
            tx_params = self._get_transaction_params()
            
            # Build transaction
            transaction = self.contract.functions.createRFQ(
                ipfs_hash,
                document_hash
            ).build_transaction(tx_params)
            
            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(
                transaction,
                settings.POLYGON_PRIVATE_KEY
            )
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "transaction_hash": tx_receipt['transactionHash'].hex(),
                "block_number": tx_receipt['blockNumber']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def store_quotation(
        self,
        rfq_id: int,
        quotation_data: Dict[str, Any],
        ipfs_hash: str
    ) -> Dict[str, Any]:
        """Store quotation record on blockchain"""
        try:
            # Hash the quotation document
            document_hash = self._hash_document(quotation_data)
            
            # Prepare transaction
            tx_params = self._get_transaction_params()
            
            # Build transaction
            transaction = self.contract.functions.submitQuotation(
                rfq_id,
                ipfs_hash,
                document_hash
            ).build_transaction(tx_params)
            
            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(
                transaction,
                settings.POLYGON_PRIVATE_KEY
            )
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "transaction_hash": tx_receipt['transactionHash'].hex(),
                "block_number": tx_receipt['blockNumber']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def update_rfq_status(
        self,
        rfq_id: int,
        status: str
    ) -> Dict[str, Any]:
        """Update RFQ status on blockchain"""
        try:
            # Prepare transaction
            tx_params = self._get_transaction_params()
            
            # Build transaction
            transaction = self.contract.functions.updateRFQStatus(
                rfq_id,
                status
            ).build_transaction(tx_params)
            
            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(
                transaction,
                settings.POLYGON_PRIVATE_KEY
            )
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": True,
                "transaction_hash": tx_receipt['transactionHash'].hex(),
                "block_number": tx_receipt['blockNumber']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def verify_document(
        self,
        rfq_id: int,
        document: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Verify document authenticity using blockchain"""
        try:
            # Hash the document
            document_hash = self._hash_document(document)
            
            # Call verify function
            is_valid = self.contract.functions.verifyDocument(
                rfq_id,
                document_hash
            ).call()
            
            return {
                "success": True,
                "is_valid": is_valid
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def get_rfq_history(
        self,
        rfq_id: int
    ) -> Dict[str, Any]:
        """Get RFQ history from blockchain"""
        try:
            # Get RFQ details
            rfq = self.contract.functions.getRFQ(rfq_id).call()
            
            # Get quotations
            quotations = self.contract.functions.getQuotations(rfq_id).call()
            
            return {
                "success": True,
                "rfq": {
                    "id": rfq[0],
                    "ipfs_hash": rfq[1],
                    "buyer": rfq[2],
                    "timestamp": rfq[3],
                    "status": rfq[4],
                    "document_hash": rfq[5].hex()
                },
                "quotations": [
                    {
                        "id": q[0],
                        "rfq_id": q[1],
                        "supplier": q[2],
                        "ipfs_hash": q[3],
                        "timestamp": q[4],
                        "status": q[5],
                        "document_hash": q[6].hex()
                    }
                    for q in quotations
                ]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
