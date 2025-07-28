// src/components/suppliers/SupplierDetails.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  VerifiedUser as QualityIcon,
  Message as CommunicationIcon,
  AttachMoney as PricingIcon,
  EventAvailable as ReliabilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Payments as RevenueIcon,
  VerifiedUser as CertificationIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  Supplier, 
  SupplierTier, 
  PerformanceCategory, 
  getTierBenefits, 
  getTierColor,
  addPerformanceRating
} from '../../utils/supplierRatingService.js';
import { sendNotification, NotificationType } from '../../utils/notificationService.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supplier-detail-tabpanel-${index}`}
      aria-labelledby={`supplier-detail-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `supplier-detail-tab-${index}`,
    'aria-controls': `supplier-detail-tabpanel-${index}`,
  };
}

interface SupplierDetailsProps {
  supplier: Supplier;
  onClose: () => void;
  onUpdate: () => void;
}

const SupplierDetails: React.FC<SupplierDetailsProps> = ({ 
  supplier, 
  onClose,
  onUpdate
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingCategory, setRatingCategory] = useState<PerformanceCategory>(PerformanceCategory.QUALITY);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRatingDialogOpen = () => {
    setRatingDialogOpen(true);
  };

  const handleRatingDialogClose = () => {
    setRatingDialogOpen(false);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setRatingCategory(event.target.value as PerformanceCategory);
  };

  const handleScoreChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setRatingScore(newValue || 5);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRatingComment(event.target.value);
  };

  const handleSubmitRating = () => {
    addPerformanceRating(
      supplier.id,
      ratingCategory,
      ratingScore,
      ratingComment,
      undefined,
      undefined,
      'admin'
    );

    // Send notification
    sendNotification(
      NotificationType.SYSTEM,
      `New ${ratingCategory} rating added for ${supplier.name}`
    );

    // Reset form
    setRatingCategory(PerformanceCategory.QUALITY);
    setRatingScore(5);
    setRatingComment('');
    setRatingDialogOpen(false);

    // Update parent component
    onUpdate();
  };

  const getCategoryIcon = (category: PerformanceCategory) => {
    switch (category) {
      case PerformanceCategory.DELIVERY:
        return <ShippingIcon />;
      case PerformanceCategory.QUALITY:
        return <QualityIcon />;
      case PerformanceCategory.COMMUNICATION:
        return <CommunicationIcon />;
      case PerformanceCategory.PRICING:
        return <PricingIcon />;
      case PerformanceCategory.RELIABILITY:
        return <ReliabilityIcon />;
      default:
        return <StarIcon />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ position: 'relative', p: 3 }}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          alt={supplier.name}
          src={supplier.logo}
          sx={{ 
            width: 64, 
            height: 64, 
            mr: 2,
            border: `3px solid ${getTierColor(supplier.rating.tier)}`,
            bgcolor: supplier.logo ? 'transparent' : 'primary.main'
          }}
        >
          {!supplier.logo && <BusinessIcon fontSize="large" />}
        </Avatar>
        <Box>
          <Typography variant="h5" component="h2">
            {supplier.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip 
              label={supplier.rating.tier.toUpperCase()} 
              size="small" 
              sx={{ 
                backgroundColor: getTierColor(supplier.rating.tier),
                color: supplier.rating.tier === SupplierTier.GOLD ? '#000' : '#fff',
                fontWeight: 'bold',
                mr: 1
              }}
            />
            <Rating 
              value={supplier.rating.overallScore} 
              precision={0.1} 
              readOnly 
              size="small"
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({supplier.rating.overallScore.toFixed(1)})
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="supplier details tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Performance" {...a11yProps(1)} />
          <Tab label="Tier Benefits" {...a11yProps(2)} />
          <Tab label="Ratings History" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Contact Information" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={supplier.email} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={supplier.phone} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Address" 
                      secondary={`${supplier.address.street}, ${supplier.address.city}, ${supplier.address.state}, ${supplier.address.postalCode}, ${supplier.address.country}`} 
                    />
                  </ListItem>
                  {supplier.website && (
                    <ListItem>
                      <ListItemIcon>
                        <WebsiteIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Website" 
                        secondary={
                          <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                            {supplier.website}
                          </a>
                        } 
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Company Information" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Categories" 
                      secondary={supplier.categories.join(', ')} 
                    />
                  </ListItem>
                  {supplier.establishedYear && (
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Established" 
                        secondary={supplier.establishedYear} 
                      />
                    </ListItem>
                  )}
                  {supplier.employeeCount && (
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Employees" 
                        secondary={supplier.employeeCount} 
                      />
                    </ListItem>
                  )}
                  {supplier.annualRevenue && (
                    <ListItem>
                      <ListItemIcon>
                        <RevenueIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Annual Revenue" 
                        secondary={supplier.annualRevenue} 
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {supplier.certifications && supplier.certifications.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Certifications" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {supplier.certifications.map((cert, index) => (
                      <Chip 
                        key={index}
                        icon={<CertificationIcon />}
                        label={cert}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader title="Description" />
              <CardContent>
                <Typography variant="body1">
                  {supplier.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Performance Metrics" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Total Orders" 
                      secondary={supplier.rating.totalOrders} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Completed Orders" 
                      secondary={`${supplier.rating.completedOrders} (${Math.round(supplier.rating.completedOrders / supplier.rating.totalOrders * 100)}%)`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="On-Time Delivery Rate" 
                      secondary={`${supplier.rating.onTimeDeliveryRate}%`} 
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={supplier.rating.onTimeDeliveryRate} 
                      sx={{ width: '100px', ml: 2 }}
                      color={supplier.rating.onTimeDeliveryRate > 90 ? "success" : supplier.rating.onTimeDeliveryRate > 70 ? "warning" : "error"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Quality Issue Rate" 
                      secondary={`${supplier.rating.qualityIssueRate}%`} 
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={100 - supplier.rating.qualityIssueRate} 
                      sx={{ width: '100px', ml: 2 }}
                      color={supplier.rating.qualityIssueRate < 5 ? "success" : supplier.rating.qualityIssueRate < 15 ? "warning" : "error"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Average Response Time" 
                      secondary={`${supplier.rating.responseTime} hours`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader 
                title="Category Ratings" 
                action={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleRatingDialogOpen}
                  >
                    Add Rating
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {Object.values(PerformanceCategory).map((category) => (
                    <ListItem key={category}>
                      <ListItemIcon>
                        {getCategoryIcon(category)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={category.charAt(0).toUpperCase() + category.slice(1)} 
                      />
                      <Rating 
                        value={supplier.rating.categoryScores[category]} 
                        precision={0.1} 
                        readOnly 
                      />
                      <Typography variant="body2" sx={{ ml: 1, minWidth: '40px' }}>
                        ({supplier.rating.categoryScores[category].toFixed(1)})
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card variant="outlined">
          <CardHeader 
            title={`${supplier.rating.tier.toUpperCase()} Tier Benefits`}
            sx={{
              backgroundColor: getTierColor(supplier.rating.tier),
              color: supplier.rating.tier === SupplierTier.GOLD ? '#000' : '#fff',
            }}
          />
          <CardContent>
            <List>
              {getTierBenefits(supplier.rating.tier).map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <StarIcon sx={{ color: getTierColor(supplier.rating.tier) }} />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleRatingDialogOpen}
          >
            Add New Rating
          </Button>
        </Box>
        
        {supplier.rating.ratings.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No ratings have been added for this supplier yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {supplier.rating.ratings.map((rating) => (
              <Grid item xs={12} key={rating.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {getCategoryIcon(rating.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {rating.category.charAt(0).toUpperCase() + rating.category.slice(1)} Rating
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(rating.createdAt)} • {rating.orderId ? `Order #${rating.orderId}` : 'System Rating'}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Rating value={rating.score} readOnly />
                      </Box>
                    </Box>
                    {rating.comment && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        "{rating.comment}"
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Add Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={handleRatingDialogClose}>
        <DialogTitle>Add Performance Rating</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="rating-category-label">Category</InputLabel>
              <Select
                labelId="rating-category-label"
                id="rating-category"
                value={ratingCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                {Object.values(PerformanceCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCategoryIcon(category)}
                      <Typography sx={{ ml: 1 }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography component="legend">Score</Typography>
              <Rating
                name="rating-score"
                value={ratingScore}
                onChange={handleScoreChange}
                precision={1}
                size="large"
              />
            </Box>

            <TextField
              autoFocus
              margin="dense"
              id="comment"
              label="Comment"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={ratingComment}
              onChange={handleCommentChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRatingDialogClose}>Cancel</Button>
          <Button onClick={handleSubmitRating} variant="contained">Submit Rating</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierDetails;
