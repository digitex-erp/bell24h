import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { 
  EscrowContract, 
  CreateEscrowRequest
} from '../../types/blockchain.js';
import { escrowService } from '../../services/escrowService.js';

interface EscrowPanelProps {
  userId: string;
  onEscrowCreated?: (escrow: EscrowContract) => void;
}

const statusColors: Record<EscrowContract['status'], string> = {
  'created': 'default',
  'funded': 'primary',
  'released': 'success',
  'refunded': 'warning',
  'disputed': 'error',
  'resolved': 'info'
};

const EscrowPanel: React.FC<EscrowPanelProps> = ({ userId, onEscrowCreated }) => {
  // State for escrow creation
  const [counterpartyId, setCounterpartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ETH');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for escrow list
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Available currencies (for demo)
  const currencies = ['ETH', 'USDC', 'DAI', 'USDT'];
  
  // Load user's escrows on component mount
  useEffect(() => {
    loadUserEscrows();
  }, [userId]);
  
  const loadUserEscrows = async () => {
    setIsLoading(true);
    try {
      const userEscrows = await escrowService.getUserEscrows(userId);
      setEscrows(userEscrows);
    } catch (err) {
      setError('Failed to load escrows. Please try again later.');
      console.error('Error loading escrows:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateEscrow = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    // Validate inputs
    if (!counterpartyId || !amount || parseFloat(amount) <= 0) {
      setError('Please fill all required fields with valid values.');
      setIsCreating(false);
      return;
    }
    
    try {
      // Determine if current user is buyer or seller
      const isBuyer = true; // This would be determined based on context
      
      const request: CreateEscrowRequest = {
        buyerId: isBuyer ? userId : counterpartyId,
        sellerId: isBuyer ? counterpartyId : userId,
        amount,
        currency,
        expiresInDays,
        metadata: {
          createdBy: userId,
          role: isBuyer ? 'buyer' : 'seller'
        }
      };
      
      const response = await escrowService.createEscrow(request);
      
      if (response.success && response.escrow) {
        setSuccess(`Escrow created successfully! Transaction hash: ${response.transactionHash?.substring(0, 10)}...`);
        
        // Add to escrow list
        setEscrows(prev => [response.escrow!, ...prev]);
        
        // Reset form
        setCounterpartyId('');
        setAmount('');
        
        if (onEscrowCreated) {
          onEscrowCreated(response.escrow);
        }
        
        // Refresh escrows list
        loadUserEscrows();
      } else {
        setError(response.error || 'Failed to create escrow. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Error creating escrow:', err);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleReleaseEscrow = async (escrow: EscrowContract) => {
    setIsActionLoading(true);
    try {
      const response = await escrowService.releaseEscrow({
        escrowId: escrow.id,
        releaserAddress: userId
      });
      
      if (response.success) {
        setSuccess('Funds released successfully!');
        loadUserEscrows();
      } else {
        setError(response.error || 'Failed to release funds');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error releasing escrow:', err);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleRefundEscrow = async (escrow: EscrowContract) => {
    setIsActionLoading(true);
    try {
      const response = await escrowService.refundEscrow({
        escrowId: escrow.id,
        refunderAddress: userId
      });
      
      if (response.success) {
        setSuccess('Funds refunded successfully!');
        loadUserEscrows();
      } else {
        setError(response.error || 'Failed to refund funds');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error refunding escrow:', err);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleDisputeEscrow = async (escrow: EscrowContract) => {
    setIsActionLoading(true);
    try {
      const response = await escrowService.disputeEscrow({
        escrowId: escrow.id,
        disputerAddress: userId,
        reason: 'Dispute initiated from UI'
      });
      
      if (response.success) {
        setSuccess('Dispute filed successfully!');
        loadUserEscrows();
      } else {
        setError(response.error || 'Failed to file dispute');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error disputing escrow:', err);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  return (
    <Box>
      {/* Create New Escrow Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create Secure Escrow
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Create an escrow to securely transact with another party. Funds will be held in a smart contract until conditions are met.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Counterparty ID"
                value={counterpartyId}
                onChange={(e) => setCounterpartyId(e.target.value)}
                margin="normal"
                variant="outlined"
                helperText="Blockchain address of the other party"
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                margin="normal"
                variant="outlined"
              >
                {currencies.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expires In (Days)"
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 1, max: 365 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateEscrow}
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : undefined}
                fullWidth
              >
                {isCreating ? 'Creating...' : 'Create Escrow'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* My Escrows Card */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Escrows
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {escrows.length} active and past escrows
            </Typography>
            
            <Button 
              size="small" 
              onClick={loadUserEscrows}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </Box>
          
          {escrows.length === 0 && !isLoading ? (
            <Alert severity="info">
              You don't have any escrows yet. Create one to get started.
            </Alert>
          ) : (
            <Box>
              {escrows.map((escrow) => (
                <Card 
                  key={escrow.id} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    border: selectedEscrow?.id === escrow.id ? '2px solid' : '1px solid',
                    borderColor: selectedEscrow?.id === escrow.id ? 'primary.main' : 'divider'
                  }}
                  onClick={() => setSelectedEscrow(selectedEscrow?.id === escrow.id ? null : escrow)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {escrow.amount} {escrow.currency}
                      </Typography>
                      
                      <Chip 
                        label={escrow.status.toUpperCase()} 
                        color={statusColors[escrow.status] as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID: {escrow.id}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Created:</strong> {new Date(escrow.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Expires:</strong> {new Date(escrow.expiresAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {selectedEscrow?.id === escrow.id && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Transaction Details
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          <strong>Contract:</strong> {escrow.contractAddress}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Tx Hash:</strong> {escrow.transactionHash?.substring(0, 16)}...
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Parties
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            <strong>Buyer:</strong> {escrow.buyerId.substring(0, 16)}...
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Seller:</strong> {escrow.sellerId.substring(0, 16)}...
                          </Typography>
                        </Box>
                        
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          {/* Show actions based on status and user role */}
                          {escrow.status === 'funded' && (
                            <>
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="success"
                                onClick={() => handleReleaseEscrow(escrow)}
                                disabled={isActionLoading}
                              >
                                Release Funds
                              </Button>
                              
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="warning"
                                onClick={() => handleRefundEscrow(escrow)}
                                disabled={isActionLoading}
                              >
                                Refund
                              </Button>
                            </>
                          )}
                          
                          {(escrow.status === 'funded' || escrow.status === 'created') && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleDisputeEscrow(escrow)}
                              disabled={isActionLoading}
                            >
                              Dispute
                            </Button>
                          )}
                          
                          {isActionLoading && (
                            <CircularProgress size={20} sx={{ ml: 1 }} />
                          )}
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EscrowPanel;
