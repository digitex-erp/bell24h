# Bell24H Blockchain Deployment Guide

## 🚀 Complete Setup for Sepolia Deployment

### **Step 1: Environment Variables Setup**

Add the following variables to your `.env` file in the project root:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_sepolia_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
ESCROW_PLATFORM_FEE=200
ESCROW_FEE_COLLECTOR=your_fee_collector_address_here

# Contract Addresses (will be populated after deployment)
ESCROW_CONTRACT_ADDRESS=
TRADE_ESCROW_CONTRACT_ADDRESS=

# Payment Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=your_database_url

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### **Step 2: Get Sepolia Private Key**

1. **Create a MetaMask wallet** (if you don't have one)
2. **Switch to Sepolia testnet**:
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   - Chain ID: 11155111
   - Currency Symbol: ETH
3. **Get Sepolia ETH** from faucets:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/
4. **Export your private key**:
   - MetaMask → Account → Three dots → Account details → Export private key

### **Step 3: Get Infura Project ID**

1. Go to https://infura.io
2. Create a new project
3. Copy the Sepolia endpoint URL
4. Replace `YOUR_PROJECT_ID` in the URL

### **Step 4: Deploy Contracts**

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-escrow.cjs --network sepolia
```

### **Step 5: Update Environment with Deployed Addresses**

After successful deployment, add the contract addresses to your `.env`:

```bash
ESCROW_CONTRACT_ADDRESS=0x... # Address from deployment output
```

### **Step 6: Verify Contracts**

1. Check deployment on Etherscan: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
2. Test with a small transaction
3. Verify platform fee collection works

## 🎯 Success Criteria

- [ ] Contracts deployed to Sepolia
- [ ] Contract addresses saved to .env
- [ ] Contracts verified on Etherscan
- [ ] Test transaction successful
- [ ] Platform fees collecting correctly

## 🚨 Troubleshooting

### **"Insufficient funds" error**
- Get more Sepolia ETH from faucets
- Ensure you have at least 0.01 ETH for deployment

### **"Invalid private key" error**
- Ensure private key starts with 0x
- Check for extra spaces or characters
- Verify it's a valid Sepolia private key

### **"RPC URL not found" error**
- Verify Infura project is active
- Check the URL format
- Ensure you have the correct project ID

## 💰 Next Steps After Deployment

1. **Update blockchain service** with real contract addresses
2. **Test escrow functionality** with real transactions
3. **Fix blockchain tests** to use real contracts
4. **Deploy to production** with working blockchain integration

---

**Ready to deploy? Set your environment variables and run the deployment command!** 🚀 