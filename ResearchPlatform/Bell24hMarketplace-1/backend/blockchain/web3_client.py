
```python
from web3 import Web3
from eth_account import Account
import json
import os
from pathlib import Path

class Web3Client:
    def __init__(self):
        # Connect to Polygon Mumbai testnet
        self.w3 = Web3(Web3.HTTPProvider(os.getenv('POLYGON_RPC_URL')))
        self.account = Account.from_key(os.getenv('PRIVATE_KEY'))
        
        # Load contract ABIs
        contracts_dir = Path(__file__).parent / "contracts"
        
        with open(contracts_dir / "RFQContract.json") as f:
            rfq_contract_json = json.load(f)
            self.rfq_contract = self.w3.eth.contract(
                address=os.getenv('RFQ_CONTRACT_ADDRESS'),
                abi=rfq_contract_json['abi']
            )
            
        with open(contracts_dir / "Bell24Token.json") as f:
            token_contract_json = json.load(f)
            self.token_contract = self.w3.eth.contract(
                address=os.getenv('TOKEN_CONTRACT_ADDRESS'),
                abi=token_contract_json['abi']
            )

    async def create_rfq(self, rfq_data):
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.rfq_contract.functions.createRFQ(
                rfq_data['id'],
                rfq_data['title'],
                rfq_data['description'],
                int(rfq_data['budget']),
                int(rfq_data['quantity']),
                int(rfq_data['delivery_days'])
            ).build_transaction({
                'chainId': 80001,  # Mumbai testnet
                'gas': 2000000,
                'nonce': nonce,
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return self.w3.eth.wait_for_transaction_receipt(tx_hash)
        except Exception as e:
            print(f"Error creating RFQ on blockchain: {str(e)}")
            raise

    async def submit_bid(self, bid_data):
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.rfq_contract.functions.submitBid(
                bid_data['rfq_id'],
                bid_data['id'],
                int(bid_data['price']),
                int(bid_data['delivery_days']),
                bid_data['notes']
            ).build_transaction({
                'chainId': 80001,
                'gas': 2000000,
                'nonce': nonce,
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return self.w3.eth.wait_for_transaction_receipt(tx_hash)
        except Exception as e:
            print(f"Error submitting bid on blockchain: {str(e)}")
            raise

    async def reward_user(self, user_address: str, action_type: str):
        """Reward user with Bell24 tokens based on action type"""
        try:
            reward_amounts = {
                'bid_accepted': int(os.getenv('REWARD_AMOUNT', '100000000000000000000')),  # 100 tokens
                'rfq_completed': int(os.getenv('REWARD_AMOUNT', '200000000000000000000')), # 200 tokens
            }
            
            amount = reward_amounts.get(action_type, int(os.getenv('REWARD_AMOUNT', '50000000000000000000')))  # Default 50 tokens
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.token_contract.functions.transfer(
                user_address,
                amount
            ).build_transaction({
                'chainId': 80001,
                'gas': 100000,
                'nonce': nonce,
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            print(f"Rewarded {amount} tokens to {user_address} for {action_type}")
            return receipt
        except Exception as e:
            print(f"Error rewarding user with tokens: {str(e)}")
            raise

    async def verify_document(self, document_hash: str):
        """Store document hash on blockchain for verification"""
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            # Create a simple transaction with document hash in data field
            transaction = {
                'nonce': nonce,
                'gasPrice': self.w3.eth.gas_price,
                'gas': 21000,
                'to': self.account.address,
                'value': 0,
                'data': self.w3.to_hex(text=document_hash),
                'chainId': 80001
            }
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return self.w3.eth.wait_for_transaction_receipt(tx_hash)
        except Exception as e:
            print(f"Error verifying document on blockchain: {str(e)}")
            raise
```
