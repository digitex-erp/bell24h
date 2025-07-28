import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  Link, 
  HStack,
  Icon,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaFileDownload, FaFileSignature, FaPlus, FaChevronDown, FaSync } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { DocumentType } from '../../services/logistics/logistics-tracking-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: number;
  shipmentId: number;
  documentType: DocumentType;
  documentUrl: string;
  createdAt: string;
}

interface CustomsDocumentListProps {
  shipmentId: number;
  documents: Document[];
  onRefresh: () => void;
}

const DocumentTypeBadgeColors: Record<DocumentType, string> = {
  [DocumentType.INVOICE]: 'blue',
  [DocumentType.PACKING_LIST]: 'green',
  [DocumentType.BILL_OF_LADING]: 'purple',
  [DocumentType.CUSTOMS_DECLARATION]: 'red',
  [DocumentType.CERTIFICATE_OF_ORIGIN]: 'orange',
  [DocumentType.DANGEROUS_GOODS]: 'pink',
  [DocumentType.INSURANCE]: 'teal'
};

// Get document type display name
const getDocumentTypeDisplayName = (type: DocumentType) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Formatting function for dates
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
  } catch (e) {
    return 'Invalid Date';
  }
};

const CustomsDocumentList: React.FC<CustomsDocumentListProps> = ({ shipmentId, documents, onRefresh }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(DocumentType.INVOICE);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Mutation for generating a new document
  const generateDocumentMutation = useMutation({
    mutationFn: async ({ documentType, customData }: { documentType: DocumentType, customData: Record<string, string> }) => {
      const response = await fetch(`/api/logistics/documents/${shipmentId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentType, customData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document generated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onRefresh();
      onClose();
      setCustomData({});
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating document',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  // Handle document generation
  const handleGenerateDocument = async () => {
    try {
      setIsGenerating(true);
      await generateDocumentMutation.mutateAsync({
        documentType: selectedDocumentType,
        customData
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle input change for custom data
  const handleCustomDataChange = (key: string, value: string) => {
    setCustomData(prev => ({ ...prev, [key]: value }));
  };

  // Get custom fields based on document type
  const getCustomFields = () => {
    switch (selectedDocumentType) {
      case DocumentType.INVOICE:
        return [
          { key: 'invoiceNumber', label: 'Invoice Number', required: true },
          { key: 'currency', label: 'Currency', required: true },
          { key: 'paymentTerms', label: 'Payment Terms', required: false }
        ];
      case DocumentType.CUSTOMS_DECLARATION:
        return [
          { key: 'declarationType', label: 'Declaration Type', required: true },
          { key: 'hsCode', label: 'HS Code', required: true },
          { key: 'originCountry', label: 'Country of Origin', required: true }
        ];
      case DocumentType.CERTIFICATE_OF_ORIGIN:
        return [
          { key: 'issuingAuthority', label: 'Issuing Authority', required: true },
          { key: 'exporterRegistration', label: 'Exporter Registration No.', required: true }
        ];
      case DocumentType.DANGEROUS_GOODS:
        return [
          { key: 'unNumber', label: 'UN Number', required: true },
          { key: 'hazardClass', label: 'Hazard Class', required: true },
          { key: 'properShippingName', label: 'Proper Shipping Name', required: true }
        ];
      default:
        return [];
    }
  };

  return (
    <Box>
      <HStack justifyContent="space-between" mb={4}>
        <Heading as="h3" size="md">
          Customs Documents
        </Heading>
        <HStack>
          <Button 
            leftIcon={<Icon as={FaSync} />} 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            colorScheme="blue" 
            size="sm"
            onClick={onOpen}
          >
            Generate Document
          </Button>
        </HStack>
      </HStack>
      
      {documents.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No documents available for this shipment. Generate customs documents using the button above.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Document Type</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {documents.map(doc => (
                <Tr key={doc.id}>
                  <Td>
                    <Badge colorScheme={DocumentTypeBadgeColors[doc.documentType]}>
                      {getDocumentTypeDisplayName(doc.documentType)}
                    </Badge>
                  </Td>
                  <Td>{formatDate(doc.createdAt)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Link 
                        href={doc.documentUrl} 
                        isExternal
                        color="blue.500" 
                        display="inline-flex" 
                        alignItems="center"
                      >
                        <Icon as={FaFileDownload} mr={1} />
                        Download <ExternalLinkIcon mx="2px" />
                      </Link>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Generate Document Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Customs Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Document Type</FormLabel>
              <Select 
                value={selectedDocumentType} 
                onChange={(e) => setSelectedDocumentType(e.target.value as DocumentType)}
              >
                {Object.values(DocumentType).map(type => (
                  <option key={type} value={type}>{getDocumentTypeDisplayName(type)}</option>
                ))}
              </Select>
            </FormControl>
            
            {getCustomFields().map(field => (
              <FormControl key={field.key} mb={4} isRequired={field.required}>
                <FormLabel>{field.label}</FormLabel>
                <Input 
                  value={customData[field.key] || ''} 
                  onChange={(e) => handleCustomDataChange(field.key, e.target.value)}
                />
              </FormControl>
            ))}
            
            {getCustomFields().length === 0 && (
              <Text color="gray.500">No additional information required for this document type.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              leftIcon={<Icon as={FaFileSignature} />}
              onClick={handleGenerateDocument}
              isLoading={isGenerating}
              loadingText="Generating..."
            >
              Generate Document
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomsDocumentList;
