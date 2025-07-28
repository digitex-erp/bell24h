# Milestone Contract Testing Guide

This guide will walk you through testing the Bell24H Milestone Contracts system with real wallet addresses on the Polygon Mumbai testnet.

## Prerequisites

- MetaMask extension installed in your browser
- Node.js and npm/yarn installed
- Basic familiarity with Ethereum/Polygon transactions

## 1. Setting Up Test Wallets

### Create Test Wallets in MetaMask

1. Open MetaMask and click on your account icon in the top-right corner
2. Select "Create Account" to create a new test account for the buyer
3. Repeat to create another account for the seller
4. For each account, click on the three dots menu, select "Account details" and then "Export Private Key"
5. Enter your password to reveal the private key
6. Securely copy these private keys for later use in testing

### Configure Mumbai Testnet in MetaMask

1. Open MetaMask and click on the network dropdown at the top
2. Select "Add Network" and then "Add a network manually"
3. Enter the following details:
   - Network Name: `Polygon Mumbai`
   - New RPC URL: `https://rpc-mumbai.maticvigil.com/`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`
   - Block Explorer URL: `https://mumbai.polygonscan.com/`
4. Click "Save"

### Get Testnet MATIC

1. Go to the [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Mumbai" network
3. Paste your wallet address and complete the verification
4. Click "Submit" to receive test MATIC
5. Repeat for both buyer and seller wallets

## 2. Updating Test Configuration

Edit the `.env.test` file in the project root:

```
# Replace with your actual test wallet private key (buyer's wallet)
POLYGON_PRIVATE_KEY=your_test_private_key_here

# Test wallet addresses
TEST_BUYER_ADDRESS=your_buyer_wallet_address_here
TEST_SELLER_ADDRESS=your_seller_wallet_address_here

# Update with your deployed contract address if needed
POLYGON_MILESTONE_CONTRACT_ADDRESS=your_contract_address_here
```

> ⚠️ **IMPORTANT**: Never use real production private keys or wallets containing valuable assets for testing!

## 3. Deploying the Test Contract (if needed)

If you need to deploy a fresh contract to Mumbai testnet:

```bash
# Copy test environment to .env
copy .env.test .env

# Deploy the contract
npx hardhat run --network mumbai scripts/deploy-milestone-contract.js
```

This will output the deployed contract address, which you should update in the `.env.test` file.

## 4. Running the Tests

### Using the Automated Script (Windows)

1. Ensure all configuration is set in `.env.test`
2. Open a command prompt in the project root
3. Run the test script:

```bash
scripts\run-milestone-tests.bat
```

### Manual Testing

1. Copy the test environment:

```bash
copy .env.test .env
```

2. Run the test script:

```bash
npx hardhat run --network mumbai scripts/test-milestone-contracts.js
```

## 5. Understanding Test Results

The tests will output detailed logs in the console and save a JSON file with the test results in the `test-results` directory.

Each test performs the following operations:

1. Creates a new milestone contract with three milestones
2. Starts the first milestone
3. Marks the first milestone as complete
4. Approves the first milestone (releasing payment)
5. Retrieves contract and milestone details

### Example Output

```
[INFO] Connected to Polygon Mumbai with wallet: 0x1234...
[INFO] Connected to Milestone Contract at: 0xabcd...
[INFO] Creating contract with ID: TEST-1652345678
[SUCCESS] Contract created successfully!
[INFO] Starting the first milestone
[SUCCESS] Milestone 0 started successfully!
...
```

## 6. Troubleshooting

### Common Issues

- **Transaction Errors**: Ensure your test wallets have sufficient MATIC for gas fees
- **Invalid Contract Address**: Verify the contract is deployed correctly on Mumbai testnet
- **Authentication Errors**: Check that you're using the correct private keys
- **RPC Connection Issues**: Try using an alternative Mumbai RPC URL

### Checking Transaction Status

You can verify transactions on the Mumbai Polygon Explorer:
https://mumbai.polygonscan.com/

Enter the transaction hash from the test output to view details.

## 7. Integration Testing with Frontend

After confirming the contract functions work correctly:

1. Update the contract address in your development environment:

```
POLYGON_MILESTONE_CONTRACT_ADDRESS=your_verified_contract_address
```

2. Start the application in development mode:

```bash
npm run dev
```

3. Open the application and navigate to the Blockchain Hub
4. Test the milestone contract creation and management through the UI

## 8. Cleaning Up

After testing, make sure to:

1. Restore your original environment files
2. Avoid using test wallets for production
3. Document any issues or edge cases for further improvement

## Need Help?

Contact the Bell24H development team at dev@bell24h.com if you encounter any issues not covered in this guide.
