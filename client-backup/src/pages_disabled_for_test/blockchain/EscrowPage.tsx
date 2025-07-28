import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Alert,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import EscrowPanel from '../../components/blockchain/EscrowPanel.js';
import { EscrowContract } from '../../types/blockchain.js';
import { blockchainService } from '../../services/blockchainService.js';

/**
 * Page for interacting with blockchain escrow system
 */
const EscrowPage: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [recentEscrows, setRecentEscrows] = useState<EscrowContract[]>([]);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const { address, chainId } = await blockchainService.connect();
      setWalletConnected(true);
      setWalletAddress(address);
      setChainId(chainId.toString());
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle new escrow creation
  const handleEscrowCreated = (escrow: EscrowContract) => {
    setRecentEscrows(prev => [escrow, ...prev].slice(0, 5));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Blockchain Escrow System
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Securely transact with Bell24H partners using our blockchain-based escrow system
      </Typography>

      {/* Wallet Connection Card */}
      {!walletConnected ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Connect your Ethereum wallet to use the escrow system. We support MetaMask, WalletConnect, and other Ethereum-compatible wallets.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            onClick={handleConnectWallet}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1">
              Wallet Connected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Chain ID: {chainId}
            </Typography>
          </Box>
        </Paper>
      )}

      {walletConnected && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="escrow tabs">
              <Tab label="Escrow System" />
              <Tab label="Transaction History" />
              <Tab label="Settings" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && (
            <EscrowPanel 
              userId={walletAddress || ''}
              onEscrowCreated={handleEscrowCreated}
            />
          )}
          
          {activeTab === 1 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction History
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  View your recent transaction history on the blockchain.
                </Typography>
                
                <Alert severity="info">
                  Transaction history feature will be available in the next update.
                </Alert>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 2 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blockchain Settings
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure your blockchain settings and preferences.
                </Typography>
                
                <Alert severity="info">
                  Settings configuration will be available in the next update.
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* FAQ Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What is an escrow?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                An escrow is a financial arrangement where a third party holds and regulates payment 
                of funds for two parties in a transaction. It helps make transactions more secure by 
                keeping the payment in a secure escrow account until the specified conditions are met.
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How does blockchain escrow work?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Blockchain escrow uses smart contracts to automatically hold funds until predefined 
                conditions are met. The funds are locked in the contract until the buyer confirms receipt 
                of goods/services or a dispute is resolved, ensuring security for both parties.
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What if there's a dispute?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If there's a dispute, either party can initiate the dispute resolution process. 
                Our system will review the case, examine evidence, and make a determination on how to 
                distribute the funds fairly based on the terms of the transaction.
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What cryptocurrencies are supported?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently, our escrow system supports ETH, USDC, DAI, and USDT on the Ethereum network. 
                We plan to expand support to additional cryptocurrencies and networks in future updates.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default EscrowPage;
