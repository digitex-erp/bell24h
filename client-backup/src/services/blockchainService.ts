import { ethers } from 'ethers';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';

export interface ContractCallOptions {
  value?: string;
  gasLimit?: number;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  status: number;
  gasUsed: bigint;
  logs: any[];
}

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private contractCache: Map<string, Contract> = new Map();

  private constructor() {}

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  public async connect(): Promise<{
    address: string;
    chainId: bigint;
  }> {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found. Please install MetaMask.');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = await this.provider.getSigner();

    const address = await this.signer.getAddress();
    const network = await this.provider.getNetwork();

    return { address, chainId: network.chainId };
  }

  public async getContract(
    contractAddress: string,
    abi: any[]
  ): Promise<Contract> {
    if (!this.signer) {
      throw new Error('Not connected to wallet');
    }

    const cacheKey = `${contractAddress}-${JSON.stringify(abi)}`;
    if (this.contractCache.has(cacheKey)) {
      return this.contractCache.get(cacheKey)!;
    }

    const contract = new ethers.Contract(contractAddress, abi, this.signer);
    this.contractCache.set(cacheKey, contract);
    return contract;
  }

  public async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    options: ContractCallOptions = {}
  ): Promise<any> {
    const contract = await this.getContract(contractAddress, abi);
    const contractMethod = contract[methodName];

    if (!contractMethod) {
      throw new Error(`Method ${methodName} not found in contract`);
    }

    try {
      const tx = await contractMethod(...args, {
        value: options.value ? ethers.parseEther(options.value) : undefined,
        gasLimit: options.gasLimit,
      });

      if (typeof tx === 'function') {
        // Handle view/pure functions
        return await tx();
      }

      // Handle transactions
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed,
        logs: receipt.logs,
      };
    } catch (error: any) {
      console.error('Contract call failed:', error);
      throw new Error(
        error.reason || error.message || 'Contract interaction failed'
      );
    }
  }

  public async getTransactionHistory(
    address: string,
    fromBlock: number = 0,
    toBlock: number = 'latest'
  ): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const filter = {
      address,
      fromBlock,
      toBlock,
    };

    return await this.provider.getLogs(filter);
  }

  public async verifyContract(
    contractAddress: string,
    sourceCode: string,
    contractName: string,
    constructorArgs?: any[]
  ): Promise<boolean> {
    // Implementation for contract verification
    // This would typically interact with a blockchain explorer API
    console.log('Verifying contract:', { contractAddress, contractName });
    return true; // Mock implementation
  }

  public async getTokenBalance(
    tokenAddress: string,
    walletAddress: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    // Standard ERC20 ABI
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const tokenContract = new ethers.Contract(
      tokenAddress,
      erc20Abi,
      this.provider
    );

    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals(),
    ]);

    return ethers.formatUnits(balance, decimals);
  }
}

export const blockchainService = BlockchainService.getInstance();
