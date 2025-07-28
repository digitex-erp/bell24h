import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Message as MessageIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface RFQ {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  status: 'draft' | 'submitted' | 'quoted' | 'expired' | 'cancelled';
  specifications: Array<{ key: string; value: string }>;
  notes: string;
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  supplierId: string;
  supplierName: string;
  quotes: Array<{
    id: string;
    price: number;
    currency: string;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    supplier: {
      id: string;
      name: string;
      companyName: string;
      rating?: number;
    };
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

const statusColors = {
  draft: 'default',
  submitted: 'info',
  quoted: 'success',
  expired: 'warning',
  cancelled: 'error',
} as const;

const RFQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rfq, setRFQ] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRFQ = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/rfqs/${id}`);
      setRFQ(response.data);
    } catch (err) {
      console.error('Failed to fetch RFQ:', err);
      setError(t('rfq.detail.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRFQ();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      await axios.delete(`/api/rfqs/${id}`);
      navigate('/buyer/rfqs');
    } catch (err) {
      console.error('Failed to delete RFQ:', err);
      setError(t('rfq.detail.deleteError'));
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      setProcessing(true);
      await axios.patch(`/api/rfqs/${id}/quotes/${quoteId}/accept`);
      fetchRFQ(); // Refresh the RFQ data
      setAcceptDialogOpen(false);
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setError(t('rfq.detail.acceptError'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      setProcessing(true);
      await axios.patch(`/api/rfqs/${id}/quotes/${quoteId}/reject`, {
        reason: rejectReason,
      });
      fetchRFQ(); // Refresh the RFQ data
      setRejectDialogOpen(false);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject quote:', err);
      setError(t('rfq.detail.rejectError'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPpp');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !rfq) {
    return (
      <Alert severity="error" sx={{ my: 3 }}>
        {error || t('rfq.detail.notFound')}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        <Box>
          {rfq.status === 'draft' && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/buyer/rfqs/${rfq.id}/edit`)}
                sx={{ mr: 1 }}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t('common.delete')}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {rfq.productName}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={t(`rfq.status.${rfq.status}`)}
              color={statusColors[rfq.status]}
              size="small"
            />
            <Typography variant="body2" color="textSecondary">
              {t('rfq.detail.rfqId')}: {rfq.id}
            </Typography>
          </Box>
        </Box>
        <Box textAlign="right">
          <Typography variant="body2" color="textSecondary">
            {t('rfq.detail.created')} {formatDate(rfq.createdAt)}
          </Typography>
          {rfq.expiryDate && (
            <Typography variant="body2" color="textSecondary">
              {t('rfq.detail.expires')} {formatDate(rfq.expiryDate)}
            </Typography>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="details" label={t('rfq.detail.tabs.details')} icon={<ReceiptIcon />} />
          <Tab 
            value="quotes" 
            label={`${t('rfq.detail.tabs.quotes')} (${rfq.quotes.length})`} 
            icon={<MessageIcon />} 
          />
          {rfq.attachments.length > 0 && (
            <Tab 
              value="attachments" 
              label={`${t('rfq.detail.tabs.attachments')} (${rfq.attachments.length})`} 
              icon={<AttachFileIcon />} 
            />
          )}
        </Tabs>
        <Divider />
        
        <Box p={3}>
          {activeTab === 'details' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('rfq.detail.productInfo')}
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.productName')}
                          secondary={rfq.productName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.quantity')}
                          secondary={`${rfq.quantity} ${rfq.unit}`}
                        />
                      </ListItem>
                      {rfq.specifications && rfq.specifications.length > 0 && (
                        <ListItem>
                          <ListItemText
                            primary={t('rfq.detail.specifications')}
                            secondary={
                              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                {rfq.specifications.map((spec, index) => (
                                  <li key={index}>
                                    <strong>{spec.key}:</strong> {spec.value}
                                  </li>
                                ))}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}
                      {rfq.notes && (
                        <ListItem>
                          <ListItemText
                            primary={t('rfq.detail.notes')}
                            secondary={rfq.notes}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('rfq.detail.supplierInfo')}
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.supplier')}
                          secondary={rfq.supplierName || t('common.notSpecified')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.buyer')}
                          secondary={`${rfq.buyerName} (${rfq.buyerCompany})`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('rfq.detail.timeline')}
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.created')}
                          secondary={formatDate(rfq.createdAt)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('rfq.detail.lastUpdated')}
                          secondary={formatDate(rfq.updatedAt)}
                        />
                      </ListItem>
                      {rfq.expiryDate && (
                        <ListItem>
                          <ListItemText
                            primary={t('rfq.detail.expiryDate')}
                            secondary={formatDate(rfq.expiryDate)}
                            secondaryTypographyProps={{
                              color: new Date(rfq.expiryDate) < new Date() ? 'error' : 'inherit',
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 'quotes' && (
            <Box>
              {rfq.quotes.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <MessageIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {t('rfq.detail.noQuotes')}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {t('rfq.detail.noQuotesDescription')}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {rfq.quotes.map((quote) => (
                    <Grid item xs={12} key={quote.id}>
                      <Card 
                        variant="outlined"
                        sx={{
                          borderLeft: `4px solid ${
                            quote.status === 'accepted' 
                              ? 'success.main' 
                              : quote.status === 'rejected'
                              ? 'error.main'
                              : 'divider'
                          }`,
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: 'primary.main', 
                                    width: 40, 
                                    height: 40,
                                    mr: 2,
                                  }}
                                >
                                  {quote.supplier.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {quote.supplier.name}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {quote.supplier.companyName}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box mt={2} mb={2}>
                                <Typography variant="h4" component="span" sx={{ mr: 1 }}>
                                  {quote.currency} {quote.price.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="span">
                                  / {rfq.quantity} {rfq.unit}
                                </Typography>
                                {quote.supplier.rating && (
                                  <Box display="flex" alignItems="center" mt={0.5}>
                                    <Box component="span" mr={1}>
                                      ★ {quote.supplier.rating.toFixed(1)}
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">
                                      ({t('rfq.detail.supplierRating')})
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              {quote.notes && (
                                <Box 
                                  bgcolor="action.hover" 
                                  p={2} 
                                  borderRadius={1}
                                  mb={2}
                                >
                                  <Typography variant="body2">
                                    {quote.notes}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Typography variant="caption" color="textSecondary">
                                {t('rfq.detail.quotedOn')} {formatDate(quote.createdAt)}
                              </Typography>
                            </Box>
                            
                            <Box>
                              {quote.status === 'accepted' ? (
                                <Chip
                                  icon={<CheckIcon />}
                                  label={t('rfq.status.accepted')}
                                  color="success"
                                  variant="outlined"
                                  sx={{ mr: 1 }}
                                />
                              ) : quote.status === 'rejected' ? (
                                <Chip
                                  icon={<CloseIcon />}
                                  label={t('rfq.status.rejected')}
                                  color="error"
                                  variant="outlined"
                                  sx={{ mr: 1 }}
                                />
                              ) : (
                                <Box>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => setAcceptDialogOpen(true)}
                                    sx={{ mr: 1, mb: 1 }}
                                    disabled={processing}
                                  >
                                    {processing ? <CircularProgress size={20} /> : t('rfq.detail.accept')}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setRejectDialogOpen(true)}
                                    disabled={processing}
                                  >
                                    {t('rfq.detail.reject')}
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 'attachments' && (
            <Box>
              <List>
                {rfq.attachments.map((file) => (
                  <ListItem 
                    key={file.id} 
                    button 
                    component="a" 
                    href={file.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`${file.type} • ${formatFileSize(file.size)}`}
                    />
                    <AttachFileIcon color="action" />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('rfq.dialog.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('rfq.dialog.deleteMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={processing}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accept Quote Dialog */}
      <Dialog
        open={acceptDialogOpen}
        onClose={() => setAcceptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('rfq.dialog.acceptTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('rfq.dialog.acceptMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)} disabled={processing}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              const quoteId = rfq.quotes[0]?.id; // Assuming single quote for simplicity
              if (quoteId) handleAcceptQuote(quoteId);
            }}
            color="primary"
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {t('rfq.dialog.accept')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Quote Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('rfq.dialog.rejectTitle')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{t('rfq.dialog.rejectMessage')}</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('rfq.dialog.reasonPlaceholder')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={processing}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              const quoteId = rfq.quotes[0]?.id; // Assuming single quote for simplicity
              if (quoteId) handleRejectQuote(quoteId);
            }}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || processing}
            startIcon={processing ? <CircularProgress size={20} /> : <CloseIcon />}
          >
            {t('rfq.dialog.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RFQDetail;
