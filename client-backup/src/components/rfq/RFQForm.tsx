import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ProductOption {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
  minOrderQuantity: number;
  unit: string;
}

interface RFQFormData {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  specifications: Array<{ key: string; value: string }>;
  notes: string;
}

const RFQForm: React.FC<{ productId?: string }> = ({ productId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RFQFormData>({
    defaultValues: {
      productId: '',
      productName: '',
      quantity: 1,
      unit: 'pcs',
      specifications: [{ key: '', value: '' }],
      notes: '',
    },
  });

  // Fetch products if no productId is provided
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products', {
          params: { limit: 100, status: 'active' },
        });
        setProducts(
          response.data.items.map((p: any) => ({
            id: p.id,
            name: p.name,
            supplierId: p.supplierId,
            supplierName: p.supplier?.name || 'Unknown Supplier',
            minOrderQuantity: p.minOrderQuantity || 1,
            unit: p.unit || 'pcs',
          }))
        );
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    if (!productId) {
      fetchProducts();
    } else {
      // If productId is provided, fetch that specific product
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`/api/products/${productId}`);
          const product = response.data;
          setProducts([
            {
              id: product.id,
              name: product.name,
              supplierId: product.supplierId,
              supplierName: product.supplier?.name || 'Unknown Supplier',
              minOrderQuantity: product.minOrderQuantity || 1,
              unit: product.unit || 'pcs',
            },
          ]);
          setSelectedProduct({
            id: product.id,
            name: product.name,
            supplierId: product.supplierId,
            supplierName: product.supplier?.name || 'Unknown Supplier',
            minOrderQuantity: product.minOrderQuantity || 1,
            unit: product.unit || 'pcs',
          });
          setValue('productId', product.id);
          setValue('productName', product.name);
          setValue('unit', product.unit || 'pcs');
          setValue('quantity', product.minOrderQuantity || 1);
        } catch (err) {
          console.error('Failed to fetch product:', err);
          setError('Failed to load product details');
        }
      };
      fetchProduct();
    }
  }, [productId, setValue]);

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setValue('productId', product.id);
      setValue('productName', product.name);
      setValue('unit', product.unit || 'pcs');
      setValue('quantity', product.minOrderQuantity || 1);
    }
  };

  const addSpecification = () => {
    setValue('specifications', [...watch('specifications'), { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    const specs = [...watch('specifications')];
    specs.splice(index, 1);
    setValue('specifications', specs);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const specs = [...watch('specifications')];
    specs[index] = { ...specs[index], [field]: value };
    setValue('specifications', specs);
  };

  const onSubmit = async (data: RFQFormData) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Filter out empty specifications
      const filteredSpecs = data.specifications.filter(
        (spec) => spec.key.trim() !== '' && spec.value.trim() !== ''
      );

      const payload = {
        ...data,
        specifications: filteredSpecs.length > 0 ? filteredSpecs : undefined,
      };

      await axios.post('/api/rfqs', payload);
      setSuccess(true);
      reset();
      
      // Redirect to RFQ list after a short delay
      setTimeout(() => {
        navigate('/buyer/rfqs');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit RFQ:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to submit RFQ. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        {t('rfq.form.title')}
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('rfq.form.submitSuccess')}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {!productId && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.productId}>
                <InputLabel id="product-select-label">
                  {t('rfq.form.selectProduct')}
                </InputLabel>
                <Controller
                  name="productId"
                  control={control}
                  rules={{ required: t('rfq.form.errors.productRequired') as string }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="product-select-label"
                      label={t('rfq.form.selectProduct')}
                      onChange={(e) => {
                        field.onChange(e);
                        handleProductChange(e.target.value);
                      }}
                      disabled={loading || !!productId}
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} - {product.supplierName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.productId?.message}</FormHelperText>
              </FormControl>
            </Grid>
          )}

          {selectedProduct && (
            <>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{
                    required: t('rfq.form.errors.quantityRequired') as string,
                    min: {
                      value: selectedProduct.minOrderQuantity || 1,
                      message: t('rfq.form.errors.minQuantity', {
                        min: selectedProduct.minOrderQuantity || 1,
                      }),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('rfq.form.quantity')}
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      disabled={loading}
                      inputProps={{
                        min: selectedProduct.minOrderQuantity || 1,
                        step: '1',
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('rfq.form.unit')}
                      fullWidth
                      disabled={true}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('rfq.form.specifications')}
                </Typography>
                {watch('specifications').map((spec, index) => (
                  <Box key={index} display="flex" gap={2} mb={2}>
                    <TextField
                      label={t('rfq.form.specName')}
                      value={spec.key}
                      onChange={(e) =>
                        updateSpecification(index, 'key', e.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label={t('rfq.form.specValue')}
                      value={spec.value}
                      onChange={(e) =>
                        updateSpecification(index, 'value', e.target.value)
                      }
                      fullWidth
                    />
                    <IconButton
                      onClick={() => removeSpecification(index)}
                      color="error"
                      disabled={watch('specifications').length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addSpecification}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  {t('rfq.form.addSpecification')}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('rfq.form.additionalNotes')}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={t('rfq.form.notesPlaceholder')}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? t('common.submitting') : t('rfq.form.submit')}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </form>
    </Paper>
  );
};

export default RFQForm;
