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
      setNetwork({
        chainId,
        name: chainId === 1 ? 'Ethereum Mainnet' : 
             chainId === 5 ? 'Goerli Testnet' : 
             chainId === 137 ? 'Polygon Mainnet' : 'Unknown Network'
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
              {network.chainId && (
                <Chip 
                  label={network.name} 
                  size="small" 
                  sx={{ ml: 1 }} 
                  variant="outlined"
                />
              )}
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

export default BlockchainInteractionUI;
