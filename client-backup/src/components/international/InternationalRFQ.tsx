import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { FiUpload, FiCamera, FiX, FiSearch, FiImage } from 'react-icons/fi';
import { visionService, ProductResult } from '../../services/vision.service.js';
import ProductSearchResults from '../ProductSearchResults.js';
import ImageSearch from '../ImageSearch.js';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import CurrencyConverter from './CurrencyConverter.js';
import PaymentGatewaySelector from './PaymentGatewaySelector.js';

interface InternationalRFQProps {
  className?: string;
}

interface FormData {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
  country: string;
  targetCountry: string;
  shippingAddress: string;
  shippingPreference: string;
  paymentTerms: string;
  files: FileList | null;
  budget: number;
  imageSearchResults?: any[];
  selectedProduct?: ProductResult | null;
  searchImage?: File | null;
  category?: string;
  subcategory?: string;
}

const InternationalRFQ: React.FC<InternationalRFQProps> = ({ className }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [locating, setLocating] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    targetPrice: 0,
    currency: 'USD',
    country: '',
    targetCountry: '',
    shippingAddress: '',
    shippingPreference: 'standard',
    paymentTerms: '',
    files: null,
    budget: 0,
    selectedProduct: null,
    searchImage: null,
    category: '',
    subcategory: ''
  });

  // Handler for 'Search Near Me' button
  // Uses browser Geolocation API to fetch user's coordinates
  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(`${latitude},${longitude}`);
        setLocating(false);
      },
      (error) => {
        setUserLocation(t('rfq.locationError', 'Unable to get location'));
        setLocating(false);
      }
    );
  };

  // --- End Search Near Me logic ---

  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const countries = [
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'EU', name: 'European Union', currency: 'EUR' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
  ];

  const shippingOptions = [
    { value: 'standard', label: t('shipping.methods.standard') },
    { value: 'express', label: t('shipping.methods.express') },
    { value: 'local', label: t('shipping.methods.local') },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = countries.find(c => c.code === e.target.value);
    if (country) {
      setFormData(prev => ({
        ...prev,
        targetCountry: country.code,
        currency: country.currency,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Implement file upload logic
      console.log('File selected:', files[0].name);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input logic using browser's Web Speech API
    console.log('Voice input clicked');
  };

  const handleImageSearch = useCallback(async (products: ProductResult[]) => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Store the search results for display
      setSearchResults({
        products,
        labels: [],
        webEntities: []
      });
      
      // If we found products, pre-fill the form with the first result
      if (products && products.length > 0) {
        const topProduct = products[0];
        
        // Update form data with the product information
        setFormData(prev => ({
          ...prev,
          productName: topProduct.name,
          description: topProduct.description || '',
          selectedProduct: topProduct,
          // Extract numeric price if available
          targetPrice: topProduct.price ? 
            parseFloat(topProduct.price.replace(/[^0-9.]/g, '')) || prev.targetPrice : 
            prev.targetPrice
        }));
        
        // If product has a category, try to set it
        if (topProduct.category) {
          // Here you would match the category from your system
          console.log(`Product category: ${topProduct.category}`);
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || t('rfq.create.imageSearchSection.error'));
    } finally {
      setIsSearching(false);
    }
  }, [t]);
  
  // This function handles the actual image upload and processing
  const processImageSearch = useCallback(async (imageFile: File) => {
    if (!imageFile) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Set the searchImage in formData
      setFormData(prev => ({
        ...prev,
        searchImage: imageFile
      }));
      
      // Call the vision service
      const results = await visionService.detectProducts(imageFile);
      
      if (results.error) {
        throw new Error(results.error);
      }
      
      // Pass the products to the main handler
      handleImageSearch(results.products);
      
    } catch (error: any) {
      console.error('Image processing error:', error);
      setSearchError(error.message || t('rfq.create.imageSearchSection.error'));
      setIsSearching(false);
    }
  }, [handleImageSearch, t]);

  const handleRetrySearch = () => {
    if (formData.searchImage) {
      processImageSearch(formData.searchImage);
    }
  };

  const handleSelectProduct = (product: ProductResult) => {
    // Extract category information if available
    let category = '';
    let subcategory = '';
    
    // Try to match category from product.category or name
    if (product.category) {
      // In a real implementation, you would match this with your category system
      // For now, we'll just use it directly
      category = product.category;
    }
    
    // Extract price as number
    const price = product.price ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : 0;
    
    // Update form data with product details
    setFormData(prev => ({
      ...prev,
      productName: product.name,
      description: product.description || prev.description,
      selectedProduct: product,
      targetPrice: !isNaN(price) ? price : prev.targetPrice,
      category,
      subcategory
    }));
    
    // Show success message or visual indicator
    // In a real app, you would use a toast/snackbar here
    console.log(`Selected product: ${product.name}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic validation
      if (!formData.productName.trim()) {
        throw new Error(t('rfq.create.productNameRequired'));
      }
      
      if (formData.quantity <= 0) {
        throw new Error(t('rfq.create.invalidQuantity'));
      }
      
      // Prepare form data for submission
      const submitData = new FormData();
      
      // Add basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'files' && key !== 'selectedProduct' && key !== 'searchImage') {
          submitData.append(key, String(value));
        }
      });
      
      // Add files if any
      if (formData.files) {
        Array.from(formData.files).forEach(file => {
          submitData.append('files', file);
        });
      }
      
      // Add selected product data if any
      if (formData.selectedProduct) {
        submitData.append('selectedProduct', JSON.stringify(formData.selectedProduct));
      }
      
      // Add search image if any
      if (formData.searchImage) {
        submitData.append('searchImage', formData.searchImage);
      }
      
      // TODO: Send to your API
      console.log('Submitting RFQ with the following data:');
      for (const [key, value] of submitData.entries()) {
        console.log(key, ':', typeof value === 'string' ? value : 'File/Object');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      alert(t('rfq.create.success'));
      
      // Reset the form
      setFormData({
        productName: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        targetPrice: 0,
        currency: 'USD',
        country: formData.country, // Keep the user's country
        targetCountry: formData.country, // Default to same country
        shippingAddress: '',
        shippingPreference: 'standard',
        paymentTerms: '',
        files: null,
        budget: 0,
        selectedProduct: null,
        searchImage: null,
        category: '',
        subcategory: ''
      });
      
      // Clear search results
      setSearchResults(null);
      setSearchError(null);
      
    } catch (error: any) {
      console.error('Error submitting RFQ:', error);
      alert(error.message || t('rfq.create.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={className}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t('rfq.create.title')}
          </Typography>
          <form onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    {t('rfq.create.searchByImage')}
                  </Typography>
                  <ImageSearch 
                    onSearchResults={(products: ProductResult[]) => handleImageSearch(products)}
                    onError={(error: Error) => {
                      console.error('Image search error:', error);
                      setSearchError(error.message);
                    }}
                    onLoading={setIsSearching}
                    className="mb-4"
                  />
                  
                  {(isSearching || searchResults || searchError) && (
                    <Box mt={3} id="search-results-container">
                      <Typography variant="h6" gutterBottom color="primary">
                        {t('rfq.create.detectedProducts')}
                      </Typography>
                      <ProductSearchResults
                        results={searchResults || { products: [], labels: [], webEntities: [] }}
                        loading={isSearching}
                        error={searchError || undefined}
                        onSelectProduct={handleSelectProduct}
                        onRetry={handleRetrySearch}
                      />
                      
                      {searchResults && searchResults.products && searchResults.products.length > 0 && (
                        <Box mt={3} textAlign="center">
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {t('rfq.create.selectProductHelp')}
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleSelectProduct(searchResults.products[0])}
                          >
                            {t('rfq.create.autoSelectTop')}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {formData.selectedProduct && (
                    <Box mt={3} p={2} bgcolor="success.light" borderRadius={1}>
                      <Typography variant="subtitle2" color="success.dark" gutterBottom>
                        {t('rfq.create.selectedProduct')}:
                      </Typography>
                      <Box display="flex" alignItems="center">
                        {formData.selectedProduct.imageUri && (
                          <img 
                            src={formData.selectedProduct.imageUri} 
                            alt={formData.selectedProduct.name}
                            style={{ width: 60, height: 60, objectFit: 'contain', marginRight: 16 }}
                          />
                        )}
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {formData.selectedProduct.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formData.selectedProduct.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                {formData.selectedProduct && (
                  <Box mb={3} p={2} bgcolor="#f8f9fa" borderRadius={1} boxShadow={1}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {t('rfq.create.selectedProduct')}
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      {formData.selectedProduct.imageUri && (
                        <Grid item xs={4}>
                          <img 
                            src={formData.selectedProduct.imageUri} 
                            alt={formData.selectedProduct.name}
                            style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} 
                          />
                        </Grid>
                      )}
                      <Grid item xs={formData.selectedProduct.imageUri ? 8 : 12}>
                        <Typography variant="subtitle1" gutterBottom>
                          {formData.selectedProduct.name}
                        </Typography>
                        {formData.selectedProduct.price && (
                          <Typography variant="body2" color="textSecondary">
                            {t('rfq.create.estimatedPrice')}: {formData.selectedProduct.price}
                          </Typography>
                        )}
                        {formData.selectedProduct.category && (
                          <Typography variant="body2" color="textSecondary">
                            {t('rfq.create.category')}: {formData.selectedProduct.category}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label={t('rfq.create.product')}
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  required
                />
                
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('rfq.create.quantity')}
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label={t('common.country')}
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleCountryChange}
                  required
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name} ({country.currency})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CurrencyConverter
                  className=""
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('rfq.create.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label={t('shipping.methods.title')}
                  name="shippingPreference"
                  value={formData.shippingPreference}
                  onChange={handleInputChange}
                  required
                >
                  {shippingOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <PaymentGatewaySelector
                  onSelect={(method) =>
                    handlePaymentMethodChange(method)
                  }
                /> */}
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<FiUpload />}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('rfq.create.attachment')}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </Button>
                  <Tooltip title={t('rfq.create.voice')}>
                    <IconButton
                      color="primary"
                      onClick={handleVoiceInput}
                      aria-label="voice input"
                    >
                      <MicIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    t('rfq.create.submit')
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InternationalRFQ;
