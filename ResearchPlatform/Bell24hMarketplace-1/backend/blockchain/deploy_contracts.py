
from web3 import Web3
from eth_account import Account
import json
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

def deploy_contracts():
    # Connect to Polygon Mumbai testnet
    w3 = Web3(Web3.HTTPProvider(os.getenv('POLYGON_RPC_URL')))
    account = Account.from_key(os.getenv('PRIVATE_KEY'))
    
    print(f"Deploying contracts from account: {account.address}")
    
    # Deploy Bell24Token
    with open(Path(__file__).parent / "contracts" / "Bell24Token.json") as f:
        token_contract_json = json.load(f)
    
    Token = w3.eth.contract(abi=token_contract_json['abi'], bytecode=token_contract_json['bytecode'])
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Deploy token contract
    transaction = Token.constructor().build_transaction({
        'chainId': 80001,  # Mumbai testnet
        'gas': 2000000,
        'nonce': nonce,
    })
    
    signed_txn = w3.eth.account.sign_transaction(transaction, account.key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    token_address = tx_receipt.contractAddress
    print(f"Bell24Token deployed at: {token_address}")
    
    # Deploy RFQContract
    with open(Path(__file__).parent / "contracts" / "RFQContract.json") as f:
        rfq_contract_json = json.load(f)
    
    RFQ = w3.eth.contract(abi=rfq_contract_json['abi'], bytecode=rfq_contract_json['bytecode'])
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Deploy RFQ contract
    transaction = RFQ.constructor().build_transaction({
        'chainId': 80001,
        'gas': 3000000,
        'nonce': nonce,
    })
    
    signed_txn = w3.eth.account.sign_transaction(transaction, account.key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    rfq_address = tx_receipt.contractAddress
    print(f"RFQContract deployed at: {rfq_address}")
    
    return token_address, rfq_address

if __name__ == "__main__":
    deploy_contracts()
