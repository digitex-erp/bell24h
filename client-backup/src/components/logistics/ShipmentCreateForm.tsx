import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Checkbox,
  Divider,
  Text,
  Heading,
  useColorModeValue,
  FormErrorMessage,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FaShippingFast, FaPlus, FaTrash } from 'react-icons/fa';
import { LogisticsProvider } from '../../services/logistics/logistics-tracking-service';

interface ShipmentCreateFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface CustomsInfoForm {
  declarationType: string;
  declarationValue: number;
  currency: string;
  contentDescription: string;
  hsCode: string;
  originCountry: string;
}

interface PackageForm {
  weight: number;
  length: number;
  width: number;
  height: number;
  description: string;
  value: number;
  currency: string;
}

interface ShipmentForm {
  orderId: string;
  provider: LogisticsProvider;
  pickup: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
  };
  delivery: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
  };
  packages: PackageForm[];
  isInternational: boolean;
  customsInfo?: CustomsInfoForm;
  serviceType: string;
  isExpress: boolean;
}

// Initial form values
const initialFormValues: ShipmentForm = {
  orderId: '',
  provider: LogisticsProvider.SHIPROCKET,
  pickup: {
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    contactName: '',
    contactPhone: '',
  },
  delivery: {
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    contactName: '',
    contactPhone: '',
  },
  packages: [
    {
      weight: 1,
      length: 10,
      width: 10,
      height: 10,
      description: '',
      value: 100,
      currency: 'INR',
    }
  ],
  isInternational: false,
  customsInfo: {
    declarationType: 'Commercial',
    declarationValue: 0,
    currency: 'INR',
    contentDescription: '',
    hsCode: '',
    originCountry: 'India',
  },
  serviceType: 'Standard',
  isExpress: false,
};

// List of available currencies
const currencies = [
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

// List of common countries
const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'United Arab Emirates',
  'Germany',
  'France',
  'Japan',
  'China',
];

// Service types
const serviceTypes = [
  'Standard',
  'Express',
  'Priority',
  'Economy',
  'Same Day',
  'Next Day',
];

const ShipmentCreateForm: React.FC<ShipmentCreateFormProps> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<ShipmentForm>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Update form field
  const updateField = (path: string, value: any) => {
    const pathArray = path.split('.');
    setForm(prevForm => {
      const newForm = { ...prevForm };
      let current: any = newForm;
      
      // Navigate to the nested property
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      
      // Set the value
      current[pathArray[pathArray.length - 1]] = value;
      return newForm;
    });
    
    // Clear error for this field if it exists
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };
  
  // Add a new package
  const addPackage = () => {
    setForm(prevForm => ({
      ...prevForm,
      packages: [
        ...prevForm.packages,
        {
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
          description: '',
          value: 100,
          currency: 'INR',
        }
      ]
    }));
  };
  
  // Remove a package
  const removePackage = (index: number) => {
    if (form.packages.length <= 1) return; // Keep at least one package
    
    setForm(prevForm => ({
      ...prevForm,
      packages: prevForm.packages.filter((_, i) => i !== index)
    }));
  };
  
  // Update package field
  const updatePackageField = (index: number, field: keyof PackageForm, value: any) => {
    setForm(prevForm => ({
      ...prevForm,
      packages: prevForm.packages.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation for required fields
    if (!form.orderId) newErrors['orderId'] = 'Order ID is required';
    if (!form.pickup.address) newErrors['pickup.address'] = 'Pickup address is required';
    if (!form.pickup.city) newErrors['pickup.city'] = 'Pickup city is required';
    if (!form.pickup.postalCode) newErrors['pickup.postalCode'] = 'Pickup postal code is required';
    if (!form.pickup.contactName) newErrors['pickup.contactName'] = 'Pickup contact name is required';
    if (!form.pickup.contactPhone) newErrors['pickup.contactPhone'] = 'Pickup contact phone is required';
    
    if (!form.delivery.address) newErrors['delivery.address'] = 'Delivery address is required';
    if (!form.delivery.city) newErrors['delivery.city'] = 'Delivery city is required';
    if (!form.delivery.postalCode) newErrors['delivery.postalCode'] = 'Delivery postal code is required';
    if (!form.delivery.contactName) newErrors['delivery.contactName'] = 'Delivery contact name is required';
    if (!form.delivery.contactPhone) newErrors['delivery.contactPhone'] = 'Delivery contact phone is required';
    
    // Validate packages
    form.packages.forEach((pkg, index) => {
      if (!pkg.description) newErrors[`packages[${index}].description`] = 'Package description is required';
      if (pkg.weight <= 0) newErrors[`packages[${index}].weight`] = 'Weight must be greater than 0';
      if (pkg.value <= 0) newErrors[`packages[${index}].value`] = 'Value must be greater than 0';
    });
    
    // Validate customs info for international shipments
    if (form.isInternational && form.customsInfo) {
      if (!form.customsInfo.contentDescription) 
        newErrors['customsInfo.contentDescription'] = 'Content description is required';
      if (form.customsInfo.declarationValue <= 0) 
        newErrors['customsInfo.declarationValue'] = 'Declaration value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate total declared value based on packages
      if (form.isInternational && form.customsInfo) {
        const totalValue = form.packages.reduce((sum, pkg) => sum + pkg.value, 0);
        form.customsInfo.declarationValue = totalValue;
      }
      
      // Prepare data for submission
      const formData = {
        ...form,
        // Only include customs info if international
        customsInfo: form.isInternational ? form.customsInfo : undefined
      };
      
      onSubmit(formData);
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isRequired isInvalid={!!errors.orderId}>
            <FormLabel>Order ID / Reference</FormLabel>
            <Input 
              value={form.orderId} 
              onChange={(e) => updateField('orderId', e.target.value)}
              placeholder="Order ID or Reference Number"
            />
            {errors.orderId && <FormErrorMessage>{errors.orderId}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Logistics Provider</FormLabel>
            <Select 
              value={form.provider} 
              onChange={(e) => updateField('provider', e.target.value)}
            >
              <option value={LogisticsProvider.SHIPROCKET}>Shiprocket</option>
              <option value={LogisticsProvider.DHL}>DHL</option>
              <option value={LogisticsProvider.OTHER}>Other</option>
            </Select>
          </FormControl>
        </SimpleGrid>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Service Type</FormLabel>
            <Select 
              value={form.serviceType} 
              onChange={(e) => updateField('serviceType', e.target.value)}
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Shipping Speed</FormLabel>
            <Checkbox 
              isChecked={form.isExpress} 
              onChange={(e) => updateField('isExpress', e.target.checked)}
              colorScheme="blue"
            >
              Express Shipping
            </Checkbox>
          </FormControl>
        </SimpleGrid>
        
        <Divider />
        
        <Heading size="sm">Pickup Information</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired isInvalid={!!errors['pickup.contactName']}>
            <FormLabel>Contact Name</FormLabel>
            <Input 
              value={form.pickup.contactName} 
              onChange={(e) => updateField('pickup.contactName', e.target.value)}
              placeholder="Contact Person Name"
            />
            {errors['pickup.contactName'] && <FormErrorMessage>{errors['pickup.contactName']}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired isInvalid={!!errors['pickup.contactPhone']}>
            <FormLabel>Contact Phone</FormLabel>
            <Input 
              value={form.pickup.contactPhone} 
              onChange={(e) => updateField('pickup.contactPhone', e.target.value)}
              placeholder="Contact Phone Number"
            />
            {errors['pickup.contactPhone'] && <FormErrorMessage>{errors['pickup.contactPhone']}</FormErrorMessage>}
          </FormControl>
        </SimpleGrid>
        
        <FormControl isRequired isInvalid={!!errors['pickup.address']}>
          <FormLabel>Address</FormLabel>
          <Input 
            value={form.pickup.address} 
            onChange={(e) => updateField('pickup.address', e.target.value)}
            placeholder="Street Address"
          />
          {errors['pickup.address'] && <FormErrorMessage>{errors['pickup.address']}</FormErrorMessage>}
        </FormControl>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isRequired isInvalid={!!errors['pickup.city']}>
            <FormLabel>City</FormLabel>
            <Input 
              value={form.pickup.city} 
              onChange={(e) => updateField('pickup.city', e.target.value)}
              placeholder="City"
            />
            {errors['pickup.city'] && <FormErrorMessage>{errors['pickup.city']}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isInvalid={!!errors['pickup.state']}>
            <FormLabel>State/Province</FormLabel>
            <Input 
              value={form.pickup.state} 
              onChange={(e) => updateField('pickup.state', e.target.value)}
              placeholder="State/Province"
            />
            {errors['pickup.state'] && <FormErrorMessage>{errors['pickup.state']}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired isInvalid={!!errors['pickup.postalCode']}>
            <FormLabel>Postal Code</FormLabel>
            <Input 
              value={form.pickup.postalCode} 
              onChange={(e) => updateField('pickup.postalCode', e.target.value)}
              placeholder="Postal/ZIP Code"
            />
            {errors['pickup.postalCode'] && <FormErrorMessage>{errors['pickup.postalCode']}</FormErrorMessage>}
          </FormControl>
        </SimpleGrid>
        
        <FormControl isRequired>
          <FormLabel>Country</FormLabel>
          <Select 
            value={form.pickup.country} 
            onChange={(e) => updateField('pickup.country', e.target.value)}
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </Select>
        </FormControl>
        
        <Divider />
        
        <Heading size="sm">Delivery Information</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired isInvalid={!!errors['delivery.contactName']}>
            <FormLabel>Contact Name</FormLabel>
            <Input 
              value={form.delivery.contactName} 
              onChange={(e) => updateField('delivery.contactName', e.target.value)}
              placeholder="Contact Person Name"
            />
            {errors['delivery.contactName'] && <FormErrorMessage>{errors['delivery.contactName']}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired isInvalid={!!errors['delivery.contactPhone']}>
            <FormLabel>Contact Phone</FormLabel>
            <Input 
              value={form.delivery.contactPhone} 
              onChange={(e) => updateField('delivery.contactPhone', e.target.value)}
              placeholder="Contact Phone Number"
            />
            {errors['delivery.contactPhone'] && <FormErrorMessage>{errors['delivery.contactPhone']}</FormErrorMessage>}
          </FormControl>
        </SimpleGrid>
        
        <FormControl isRequired isInvalid={!!errors['delivery.address']}>
          <FormLabel>Address</FormLabel>
          <Input 
            value={form.delivery.address} 
            onChange={(e) => updateField('delivery.address', e.target.value)}
            placeholder="Street Address"
          />
          {errors['delivery.address'] && <FormErrorMessage>{errors['delivery.address']}</FormErrorMessage>}
        </FormControl>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isRequired isInvalid={!!errors['delivery.city']}>
            <FormLabel>City</FormLabel>
            <Input 
              value={form.delivery.city} 
              onChange={(e) => updateField('delivery.city', e.target.value)}
              placeholder="City"
            />
            {errors['delivery.city'] && <FormErrorMessage>{errors['delivery.city']}</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>State/Province</FormLabel>
            <Input 
              value={form.delivery.state} 
              onChange={(e) => updateField('delivery.state', e.target.value)}
              placeholder="State/Province"
            />
          </FormControl>
          
          <FormControl isRequired isInvalid={!!errors['delivery.postalCode']}>
            <FormLabel>Postal Code</FormLabel>
            <Input 
              value={form.delivery.postalCode} 
              onChange={(e) => updateField('delivery.postalCode', e.target.value)}
              placeholder="Postal/ZIP Code"
            />
            {errors['delivery.postalCode'] && <FormErrorMessage>{errors['delivery.postalCode']}</FormErrorMessage>}
          </FormControl>
        </SimpleGrid>
        
        <FormControl isRequired>
          <FormLabel>Country</FormLabel>
          <Select 
            value={form.delivery.country} 
            onChange={(e) => {
              const country = e.target.value;
              updateField('delivery.country', country);
              // Set international flag if countries are different
              updateField('isInternational', country !== form.pickup.country);
            }}
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </Select>
        </FormControl>
        
        <Divider />
        
        <Box>
          <Heading size="sm" mb={4}>Package Information</Heading>
          
          {form.packages.map((pkg, index) => (
            <Box 
              key={index} 
              p={4} 
              mb={4} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor={borderColor}
            >
              <HStack justifyContent="space-between" mb={4}>
                <Text fontWeight="medium">Package {index + 1}</Text>
                {form.packages.length > 1 && (
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    variant="ghost"
                    leftIcon={<Icon as={FaTrash} />}
                    onClick={() => removePackage(index)}
                  >
                    Remove
                  </Button>
                )}
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired isInvalid={!!errors[`packages[${index}].description`]}>
                  <FormLabel>Description</FormLabel>
                  <Input 
                    value={pkg.description} 
                    onChange={(e) => updatePackageField(index, 'description', e.target.value)}
                    placeholder="Package Content Description"
                  />
                  {errors[`packages[${index}].description`] && (
                    <FormErrorMessage>{errors[`packages[${index}].description`]}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors[`packages[${index}].weight`]}>
                  <FormLabel>Weight (kg)</FormLabel>
                  <NumberInput 
                    value={pkg.weight} 
                    onChange={(_, value) => updatePackageField(index, 'weight', value)}
                    min={0.1} 
                    precision={2}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {errors[`packages[${index}].weight`] && (
                    <FormErrorMessage>{errors[`packages[${index}].weight`]}</FormErrorMessage>
                  )}
                </FormControl>
              </SimpleGrid>
              
              <Text mt={4} mb={2} fontWeight="medium">Dimensions (cm)</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Length</FormLabel>
                  <NumberInput 
                    value={pkg.length} 
                    onChange={(_, value) => updatePackageField(index, 'length', value)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Width</FormLabel>
                  <NumberInput 
                    value={pkg.width} 
                    onChange={(_, value) => updatePackageField(index, 'width', value)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Height</FormLabel>
                  <NumberInput 
                    value={pkg.height} 
                    onChange={(_, value) => updatePackageField(index, 'height', value)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                <FormControl isRequired isInvalid={!!errors[`packages[${index}].value`]}>
                  <FormLabel>Value</FormLabel>
                  <NumberInput 
                    value={pkg.value} 
                    onChange={(_, value) => updatePackageField(index, 'value', value)}
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {errors[`packages[${index}].value`] && (
                    <FormErrorMessage>{errors[`packages[${index}].value`]}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    value={pkg.currency} 
                    onChange={(e) => updatePackageField(index, 'currency', e.target.value)}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>
          ))}
          
          <Button
            leftIcon={<Icon as={FaPlus} />}
            variant="outline"
            onClick={addPackage}
            mb={6}
          >
            Add Package
          </Button>
        </Box>
        
        {/* Customs Information (show only for international shipments) */}
        {form.isInternational && form.customsInfo && (
          <>
            <Divider />
            <Box>
              <Heading size="sm" mb={4}>Customs Information</Heading>
              
              <Accordion allowToggle defaultIndex={[0]}>
                <AccordionItem border="none">
                  <h2>
                    <AccordionButton pl={0}>
                      <Box flex="1" textAlign="left">
                        <Text color="blue.600" fontWeight="medium">
                          International Shipment Details (Required)
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} pl={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Declaration Type</FormLabel>
                        <Select 
                          value={form.customsInfo.declarationType} 
                          onChange={(e) => updateField('customsInfo.declarationType', e.target.value)}
                        >
                          <option value="Commercial">Commercial</option>
                          <option value="Gift">Gift</option>
                          <option value="Sample">Sample</option>
                          <option value="ReturnedGoods">Returned Goods</option>
                          <option value="Documents">Documents</option>
                          <option value="Other">Other</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Origin Country</FormLabel>
                        <Select 
                          value={form.customsInfo.originCountry} 
                          onChange={(e) => updateField('customsInfo.originCountry', e.target.value)}
                        >
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl mt={4} isRequired isInvalid={!!errors['customsInfo.contentDescription']}>
                      <FormLabel>Content Description (for Customs)</FormLabel>
                      <Input 
                        value={form.customsInfo.contentDescription} 
                        onChange={(e) => updateField('customsInfo.contentDescription', e.target.value)}
                        placeholder="Detailed description of contents"
                      />
                      {errors['customsInfo.contentDescription'] && (
                        <FormErrorMessage>{errors['customsInfo.contentDescription']}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <FormControl mt={4}>
                      <FormLabel>HS Code (if known)</FormLabel>
                      <Input 
                        value={form.customsInfo.hsCode} 
                        onChange={(e) => updateField('customsInfo.hsCode', e.target.value)}
                        placeholder="Harmonized System Code"
                      />
                    </FormControl>
                    
                    <Text mt={4} fontSize="sm" color="gray.600">
                      Note: The declaration value will be calculated from the total value of all packages.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </>
        )}
        
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          leftIcon={<Icon as={FaShippingFast} />}
          isLoading={isLoading}
          loadingText="Creating Shipment..."
          mt={4}
        >
          Create Shipment
        </Button>
      </VStack>
    </Box>
  );
};

export default ShipmentCreateForm;
