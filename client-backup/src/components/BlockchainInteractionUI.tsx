import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  styled,
  useTheme,
  SelectChangeEvent,
  TabsProps,
} from '@mui/material';
import { blockchainService } from '../services/blockchainService';

// Types
interface ContractFunctionArg {
  name: string;
  type: string;
  value: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  method?: string;
}

interface ContractFunction {
  name: string;
  inputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  type: 'function' | 'constructor' | 'receive' | 'fallback';
}

interface BlockchainInteractionUIProps {
  contractAddress: string;
  abi: any[];
  userAddress?: string;
  onConnected?: (address: string) => void;
  onError?: (error: string) => void;
  showHeader?: boolean;
  defaultExpanded?: boolean;
}

const BlockchainInteractionUI: React.FC<BlockchainInteractionUIProps> = ({
  contractAddress,
  abi,
  userAddress = '',
  onConnected,
  onError,
  showHeader = true,
  defaultExpanded = false,
}) => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [connectedAddress, setConnectedAddress] = useState(userAddress);
  const [functionName, setFunctionName] = useState('');
  const [functionArgs, setFunctionArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [network, setNetwork] = useState<{ chainId: number | null; name: string }>({
    chainId: null,
    name: 'Unknown',
  });
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  // Memoized values
  const functions = useMemo(
    () => abi.filter((item) => item.type === 'function') as ContractFunction[],
    [abi]
  );

  const selectedFunction = useMemo(
    () => functions.find((fn) => fn.name === functionName),
    [functions, functionName]
  );

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      const { address, chainId } = await blockchainService.connect();
      setConnectedAddress(address);
      onConnected?.(address);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to wallet';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFunctionChange = (event: SelectChangeEvent) => {
    const selectedFn = event.target.value as string;
    setFunctionName(selectedFn);
    setFunctionArgs({});
    setResult(null);
  };

  const handleArgChange = (inputName: string, value: string) => {
    setFunctionArgs((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const handleCall = async () => {
    if (!selectedFunction) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await blockchainService.callContractMethod(
        contractAddress,
        abi,
        selectedFunction.name,
        Object.values(functionArgs)
      );
      
      setResult(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to call contract function';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Render functions
  const renderFunctionInputs = () => {
    if (!selectedFunction?.inputs.length) return null;

    return (
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Inputs
        </Typography>
        {selectedFunction.inputs.map((input, index) => (
          <TextField
            key={`${input.name}-${index}`}
            fullWidth
            label={`${input.name} (${input.type})`}
            variant="outlined"
            value={functionArgs[input.name] || ''}
            onChange={(e) => handleArgChange(input.name, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}
      </Box>
    );
  };

  const renderTransactionHistory = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!transactions.length) {
      return (
        <Typography color="textSecondary" align="center" p={3}>
          No transactions found
        </Typography>
      );
    }

    return (
      <Box>
        {transactions.map((tx, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: `4px solid ${
                tx.status === 'success'
                  ? theme.palette.success.main
                  : tx.status === 'failed'
                  ? theme.palette.error.main
                  : theme.palette.warning.main
              }`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">
                {tx.method || 'Transaction'}
              </Typography>
              <Chip
                label={tx.status}
                size="small"
                color={
                  tx.status === 'success'
                    ? 'success'
                    : tx.status === 'failed'
                    ? 'error'
                    : 'warning'
                }
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              From: {formatAddress(tx.from)}
              <br />
              To: {formatAddress(tx.to)}
              <br />
              Value: {tx.value}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {showHeader && (
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Blockchain Interaction
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Interact with smart contracts on the blockchain
          </Typography>
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6">Wallet Connection</Typography>
            <Typography variant="body2" color="textSecondary">
              {connectedAddress ? `Connected: ${formatAddress(connectedAddress)}` : 'Not connected'}
            </Typography>
          </Box>
          <Button
            variant={connectedAddress ? 'outlined' : 'contained'}
            color="primary"
            onClick={handleConnectWallet}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {connectedAddress ? 'Disconnect' : 'Connect Wallet'}
          </Button>
        </Box>
      </Paper>


      <Paper sx={{ p: 3 }}>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="blockchain interaction tabs"
        >
          <StyledTab label="Interact" {...a11yProps(0)} />
          <StyledTab label="Transactions" {...a11yProps(1)} />
        </StyledTabs>

        <TabPanel value={activeTab} index={0}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="function-select-label">Select Function</InputLabel>
            <Select
              labelId="function-select-label"
              id="function-select"
              value={functionName}
              label="Select Function"
              onChange={handleFunctionChange}
              disabled={isLoading || !connectedAddress}
            >
              {functions.map((fn) => (
                <MenuItem key={fn.name} value={fn.name}>
                  {fn.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedFunction && (
            <>
              {renderFunctionInputs()}
              <Button
                variant="contained"
                color="primary"
                onClick={handleCall}
                disabled={isLoading || !connectedAddress}
                fullWidth
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {selectedFunction.stateMutability === 'view' ? 'Call' : 'Send Transaction'}
              </Button>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {result !== null && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Result:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Paper>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {!connectedAddress ? (
            <Box textAlign="center" p={3}>
              <Typography variant="body1" gutterBottom>
                Connect your wallet to view transactions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConnectWallet}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                Connect Wallet
              </Button>
            </Box>
          ) : (
            renderTransactionHistory()
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

// Styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: theme.typography.fontWeightRegular,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const StyledTabs = styled((props: TabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

// Custom TabPanel component
function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children: React.ReactNode;
  index: number;
  value: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function for tab accessibility
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(4),
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const StyledTabs = styled((props: TabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

// Custom TabPanel component
function TabPanel(props: TabProps & { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function to check if wallet is connected
const isWalletConnected = async (): Promise<boolean> => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  }
  return false;
};

// Interface for contract function arguments
interface ContractFunctionArg {
  name: string;
  type: string;
  value: string;
}

// Interface for transaction
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  method?: string;
}

// Interface for contract function
interface ContractFunction {
  name: string;
  inputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  type: 'function' | 'constructor' | 'receive' | 'fallback';
}

// Interface for component props
interface BlockchainInteractionUIProps {
  contractAddress: string;
  abi: any[];
  userAddress?: string;
  onConnected?: (address: string) => void;
  onError?: (error: string) => void;
  showHeader?: boolean;
  defaultExpanded?: boolean;
  theme?: any;
}

// Main component
const BlockchainInteractionUI: React.FC<BlockchainInteractionUIProps> = ({
  contractAddress,
  abi,
  userAddress = '',
  onConnected,
  onError,
  showHeader = true,
  defaultExpanded = false,
  theme = {},
}) => {
  // Component state
  const [connectedAddress, setConnectedAddress] = useState<string>(userAddress);
  const [functionName, setFunctionName] = useState<string>('');
  const [functionArgs, setFunctionArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    message: string;
  } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [network, setNetwork] = useState<{
    chainId: number | null;
    name: string;
  }>({ chainId: null, name: 'Unknown' });

  // Extract functions from ABI
  const functions = React.useMemo(() => 
    abi.filter((item) => item.type === 'function') as ContractFunction[],
    [abi]
  );

  // Connect to wallet handler
  const handleConnectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const { address, chainId } = await blockchainService.connect();
      setConnectedAddress(address);
      setIsConnected(true);
      setNetwork({
        chainId: Number(chainId),
        name: getNetworkName(Number(chainId)),
      });
      onConnected?.(address);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to wallet';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onConnected, onError]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setConnectedAddress('');
    setIsConnected(false);
    setFunctionName('');
    setFunctionArgs({});
    setResult(null);
    setError(null);
    setTransactions([]);
    setVerificationStatus(null);
  }, []);

  // Toggle wallet connection
  const toggleWalletConnection = useCallback(() => {
    if (isConnected) {
      handleDisconnect();
    } else {
      handleConnectWallet();
    }
  }, [isConnected, handleConnectWallet, handleDisconnect]);

  // Handle function selection
  const handleFunctionChange = useCallback((event: SelectChangeEvent<string>) => {
    const selectedFn = event.target.value as string;
    setFunctionName(selectedFn);
    setFunctionArgs({});
    setResult(null);
    setError(null);
  }, []);

  // Handle argument input change
  const handleArgChange = useCallback((name: string, value: string) => {
    setFunctionArgs(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle function call
  const handleCall = useCallback(async () => {
    if (!selectedFunction) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare arguments
      const args = selectedFunction.inputs.map(input => {
        const value = functionArgs[input.name] || '';
        // Simple type conversion (extend as needed)
        if (input.type.includes('int')) return BigInt(value) || 0n;
        if (input.type.includes('bool')) return value === 'true';
        if (input.type.includes('address')) return value;
        if (input.type.includes('bytes')) return value;
        return value;
      });

      // Call the contract method
      const result = await blockchainService.callContractMethod(
        contractAddress,
        abi,
        selectedFunction.name,
        args
      );

      // Format the result based on output types
      if (selectedFunction.outputs.length === 1) {
        setResult(formatOutputValue(result, selectedFunction.outputs[0].type));
      } else if (selectedFunction.outputs.length > 1) {
        const formattedResult = selectedFunction.outputs.reduce(
          (acc, output, index) => ({
            ...acc,
            [output.name || `output${index}`]: formatOutputValue(
              Array.isArray(result) ? result[index] : null,
              output.type
            ),
          }),
          {} as Record<string, any>
        );
        setResult(formattedResult);
      } else {
        setResult('Transaction successful');
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Contract interaction failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFunction, functionArgs, contractAddress, abi, onError]);

  // Format output value based on type
  const formatOutputValue = useCallback((value: any, type: string): any => {
    if (value === null || value === undefined) return null;
    
    // Handle big numbers
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle address
    if (type === 'address') {
      return value;
    }
    
    // Handle bytes
    if (type.startsWith('bytes')) {
      return value;
    }
    
    // Handle numeric types
    if (type.startsWith('uint') || type.startsWith('int')) {
      return value.toString();
    }
    
    // Handle boolean
    if (type === 'bool') {
      return value ? 'true' : 'false';
    }
    
    // Default to string representation
    return String(value);
  }, []);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async () => {
    if (!connectedAddress) return;
    
    try {
      setIsLoading(true);
      // In a real app, you would fetch this from an API or blockchain
      const mockTransactions: Transaction[] = [
        {
          hash: '0x123...abc',
          from: connectedAddress,
          to: contractAddress,
          value: '0.1 ETH',
          timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          status: 'success',
          method: 'transfer'
        },
        // Add more mock transactions as needed
      ];
      
      setTransactions(mockTransactions);
    } catch (err: any) {
      setError('Failed to fetch transaction history');
      console.error('Error fetching transaction history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectedAddress, contractAddress]);

  // Verify contract
  const verifyContract = useCallback(async () => {
    try {
      setIsLoading(true);
      const verified = await blockchainService.verifyContract(
        contractAddress,
        '/* Contract source code */',
        'YourContractName'
      );
      setVerificationStatus({
        verified,
        message: verified
          ? 'Contract verified successfully!'
          : 'Contract verification failed',
      });
    } catch (err: any) {
      setError('Verification failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Format value for display
  const formatValue = useCallback((value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }, []);

  // Effect to fetch transaction history when tab changes
  useEffect(() => {
    if (activeTab === 1) {
      fetchTransactionHistory();
    }
  }, [activeTab, fetchTransactionHistory]);

  // Effect to check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          //@ts-ignore
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const { chainId } = await provider.getNetwork();
            setConnectedAddress(accounts[0]);
            setIsConnected(true);
            setNetwork({
              chainId: Number(chainId),
              name: getNetworkName(Number(chainId)),
            });
            onConnected?.(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setConnectedAddress('');
        setIsConnected(false);
      } else {
        setConnectedAddress(accounts[0]);
        onConnected?.(accounts[0]);
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      const chainIdNum = parseInt(chainId, 16);
      setNetwork({
        chainId: chainIdNum,
        name: getNetworkName(chainIdNum),
      });
      window.location.reload();
    };

    if (window.ethereum) {
      //@ts-ignore
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      //@ts-ignore
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        //@ts-ignore
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        //@ts-ignore
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [onConnected]);

  // Helper function to get network name from chain ID
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Mumbai Testnet';
      case 56: return 'Binance Smart Chain';
      case 97: return 'BSC Testnet';
      case 42161: return 'Arbitrum One';
      case 421613: return 'Arbitrum Goerli';
      case 10: return 'Optimism';
      case 420: return 'Optimism Goerli';
      case 43114: return 'Avalanche C-Chain';
      case 43113: return 'Avalanche Fuji Testnet';
      default: return `Chain ID: ${chainId}`;
    }
  };

  // Format function signature for display
  const formatFunctionSignature = useCallback((fn: ContractFunction): string => {
    const inputs = fn.inputs
      .map(input => `${input.name || 'arg'}: ${input.type}`)
      .join(', ');
    const outputs = fn.outputs
      .map(output => output.type)
      .join(', ');
    return `${fn.name}(${inputs})${outputs ? `: ${outputs}` : ''}`;
  }, []);

  // Format address for display
  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  }, []);

  // Render the component
  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', my: 4 }}>
      {showHeader && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Blockchain Interaction
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Interact with smart contracts directly from your browser
          </Typography>
        </Box>
      )}

      {/* Connection Status Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Wallet Connection
            </Typography>
            {connectedAddress ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="body1">
                  Connected: {formatAddress(connectedAddress)}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(connectedAddress)}
                    sx={{ ml: 1 }}
                  >
                    {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Not connected
              </Typography>
            )}
            {network.chainId && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Network: {network.name}
              </Typography>
            )}
          </Box>
          <Button
            variant={connectedAddress ? 'outlined' : 'contained'}
            color="primary"
            onClick={connectWallet}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {connectedAddress ? 'Disconnect' : 'Connect Wallet'}
          </Button>
        </Box>
      </Paper>


      {/* Main Content */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="blockchain interaction tabs"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <StyledTab label="Interact" {...a11yProps(0)} />
          <StyledTab label="Transactions" {...a11yProps(1)} />
          <StyledTab label="Verify" {...a11yProps(2)} />
        </StyledTabs>

        {/* Interaction Tab */}
        <TabPanel value={activeTab} index={0}>
          {!connectedAddress ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Connect your wallet to interact with the contract
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={connectWallet}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ mt: 2 }}
              >
                Connect Wallet
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="function-select-label">Select Function</InputLabel>
                <Select
                  labelId="function-select-label"
                  id="function-select"
                  value={functionName}
                  label="Select Function"
                  onChange={handleFunctionChange}
                  disabled={isLoading}
                >
                  {functions.map((fn) => (
                    <MenuItem key={fn.name} value={fn.name}>
                      {formatFunctionSignature(fn)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedFunction && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedFunction.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedFunction.stateMutability}
                  </Typography>
                  
                  {selectedFunction.inputs.length > 0 && (
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Inputs
                      </Typography>
                      {selectedFunction.inputs.map((input, index) => (
                        <TextField
                          key={`${input.name}-${index}`}
                          fullWidth
                          label={`${input.name} (${input.type})`}
                          variant="outlined"
                          value={functionArgs[input.name] || ''}
                          onChange={(e) =>
                            handleArgChange(input.name, e.target.value)
                          }
                          sx={{ mb: 2 }}
                          placeholder={`Enter ${input.type}`}
                        />
                      ))}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCall}
                    disabled={isLoading}
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {selectedFunction.stateMutability === 'view' ||
                    selectedFunction.stateMutability === 'pure'
                      ? 'Call'
                      : 'Send Transaction'}
                  </Button>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {result !== null && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Result:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {formatValue(result)}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={activeTab} index={1}>
          {!connectedAddress ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Connect your wallet to view transactions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={connectWallet}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ mt: 2 }}
              >
                Connect Wallet
              </Button>
            </Box>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No transactions found
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchTransactionHistory}
                  startIcon={<Refresh />}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </Box>
              {transactions.map((tx, index) => (
                <Paper
                  key={`${tx.hash}-${index}`}
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderLeft: 3,
                    borderColor:
                      tx.status === 'success'
                        ? 'success.main'
                        : tx.status === 'failed'
                        ? 'error.main'
                        : 'warning.main',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2">
                        {tx.method || 'Transaction'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTimestamp(tx.timestamp)}
                      </Typography>
                    </Box>
                    <Chip
                      label={tx.status}
                      size="small"
                      color={
                        tx.status === 'success'
                          ? 'success'
                          : tx.status === 'failed'
                          ? 'error'
                          : 'warning'
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        From:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatAddress(tx.from)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        To:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatAddress(tx.to)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        Value:
                      </Typography>
                      <Typography variant="body2">{tx.value}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={() =>
                        window.open(
                          `https://etherscan.io/tx/${tx.hash}`,
                          '_blank'
                        )
                      }
                    >
                      View on Explorer
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Verify Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Verify Contract
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Verify and publish your contract source code
            </Typography>
            
            {verificationStatus ? (
              <Alert
                severity={verificationStatus.verified ? 'success' : 'error'}
                sx={{ mb: 3, textAlign: 'left' }}
              >
                {verificationStatus.message}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                Contract verification helps establish trust with users by making the source code publicly
                verifiable on the blockchain explorer.
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={verifyContract}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Verify Contract
            </Button>
          </Box>
        </TabPanel>
      </Paper>

    </Box>
  );
};

// Helper function for tab accessibility
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default BlockchainInteractionUI;
      const errorMessage = err.message || 'Failed to connect to wallet';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle function selection
  const handleFunctionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const fnName = event.target.value as string;
    setFunctionName(fnName);
    setArgs({});
    setResult(null);
    setError(null);
  };

  // Handle argument input change
  const handleArgChange = (inputName: string, value: string) => {
    setArgs((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  // Handle function call
  const handleCall = async () => {
    if (!functionName || !selectedFunction) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Prepare arguments
      const argsArray = selectedFunction.inputs.map((input) => {
        const value = args[input.name] || '';
        // Simple type conversion (extend as needed)
        if (input.type.includes('int')) return parseInt(value) || 0;
        if (input.type.includes('bool')) return value === 'true';
        return value;
      });

      // Call the contract method
      const result = await blockchainService.callContractMethod(
        contractAddress,
        abi,
        functionName,
        argsArray
      );

      // Format the result based on output types
      if (selectedFunction.outputs.length === 1) {
        setResult(result);
      } else if (selectedFunction.outputs.length > 1) {
        const formattedResult = selectedFunction.outputs.reduce(
          (acc, output, index) => {
            acc[output.name || `output${index}`] = result ? result[index] : null;
            return acc;
          },
          {} as Record<string, any>
        );
        setResult(formattedResult);
      } else {
        setResult('Transaction successful');
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Contract interaction failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    if (!connectedAddress) return;
    
    try {
      setLoading(true);
      const history = await blockchainService.getTransactionHistory(contractAddress);
      setTransactionHistory(history);
    } catch (err: any) {
      setError('Failed to fetch transaction history');
      console.error('Error fetching transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify contract
  const verifyContract = async () => {
    try {
      setLoading(true);
      const verified = await blockchainService.verifyContract(
        contractAddress,
        '/* Contract source code */',
        'YourContractName'
      );
      setVerificationStatus({
        verified,
        message: verified
          ? 'Contract verified successfully!'
          : 'Contract verification failed',
      });
    } catch (err: any) {
      setError('Verification failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Effect to fetch transaction history when tab changes
  useEffect(() => {
    if (activeTab === 1) {
      fetchTransactionHistory();
    }
  }, [activeTab, connectedAddress]);

  // Effect to handle initial connection
  useEffect(() => {
    if (userAddress) {
      setConnectedAddress(userAddress);
    }
  }, [userAddress]);
    }
    setLoading(false);
  };

  // List contract functions from ABI
  const functions = abi.filter((item: any) => item.type === 'function');
  const selectedFn = functions.find((fn: any) => fn.name === functionName);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.11)', fontFamily: 'Inter, Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#2d3748' }}>Blockchain Contract Interaction</h2>
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="functionSelect" style={{ fontWeight: 500, marginRight: 12 }}>Function:</label>
        <select id="functionSelect" value={functionName} onChange={e => handleFunctionChange(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 160 }}>
          <option value="">Select function</option>
          {functions.map((fn: any) => (
            <option key={fn.name} value={fn.name}>{fn.name}</option>
          ))}
        </select>
      </div>
      {selectedFn && (
        <div style={{ marginBottom: 20 }}>
          {selectedFn.inputs.map((input: any, idx: number) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <input
                placeholder={input.name || `arg${idx}`}
                value={args[idx] || ''}
                onChange={e => handleArgChange(idx, e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '90%' }}
                aria-label={input.name || `Argument ${idx+1}`}
                title={input.type ? `Type: ${input.type}` : ''}
              />
            </div>
          ))}
        </div>
      )}
      <button onClick={handleCall} disabled={loading || !functionName} style={{
        marginTop: 8,
        background: loading || !functionName ? '#cbd5e1' : 'linear-gradient(90deg,#667eea,#764ba2)',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '12px 32px',
        fontWeight: 600,
        fontSize: 16,
        cursor: loading || !functionName ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(102,126,234,0.13)'
      }}>
        {loading ? 'Calling...' : 'Call Function'}
      </button>
      {result && <div style={{ marginTop: 24, color: '#22c55e', fontWeight: 500, wordBreak: 'break-all', background: '#f0fdf4', padding: 12, borderRadius: 8 }}>Result: {JSON.stringify(result)}</div>}
      {error && <div style={{ marginTop: 24, color: '#ef4444', fontWeight: 500, background: '#fef2f2', padding: 12, borderRadius: 8, border: '1px solid #fecaca' }}>Error: {error}</div>}
    </div>
  );
};

export default BlockchainInteractionUI;
