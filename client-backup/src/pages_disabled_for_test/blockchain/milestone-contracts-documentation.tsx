import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex, 
  SimpleGrid, 
  Button, 
  Icon,
  List,
  ListItem,
  ListIcon,
  Code,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Badge,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { 
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  QuestionIcon,
  ExternalLinkIcon,
  LockIcon,
} from '@chakra-ui/icons';
import { FaFileContract, FaEthereum, FaMoneyBillWave, FaUserShield, FaLock, FaCode, FaWallet, FaServer, FaExchangeAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/common/DashboardLayout.js';
import { GetServerSideProps } from 'next';
import { requireAuthentication } from '../../server/middleware/auth.js';
import Head from 'next/head';
import NextLink from 'next/link';

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {},
  };
});

const MilestoneContractsDocumentation = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <DashboardLayout>
      <Head>
        <title>Milestone Contracts Documentation | Bell24H</title>
      </Head>
      
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <NextLink href="/blockchain" passHref>
            <Button leftIcon={<Icon as={FaFileContract} />} variant="outline" mb={4}>
              Back to Blockchain Hub
            </Button>
          </NextLink>
          
          <Heading as="h1" size="xl" mb={2}>Milestone Contracts Documentation</Heading>
          <Text fontSize="lg" color="gray.500">
            Complete guide to using Bell24H's blockchain-based milestone payment system
          </Text>
        </Box>
        
        <Divider mb={8} />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={12}>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="md" 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Flex mb={4} alignItems="center">
              <Icon as={FaFileContract} boxSize={8} color="blue.500" mr={4} />
              <Heading as="h2" size="md">What are Milestone Contracts?</Heading>
            </Flex>
            <Text>
              Milestone contracts are blockchain-based smart contracts that allow payments to be released gradually as specific 
              project milestones are completed. This creates secure, transparent transactions between buyers and sellers where 
              funds are held in escrow until work is verified.
            </Text>
          </Box>
          
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="md"
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Flex mb={4} alignItems="center">
              <Icon as={FaEthereum} boxSize={8} color="purple.500" mr={4} />
              <Heading as="h2" size="md">Key Benefits</Heading>
            </Flex>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Secure Payments:</strong> Funds are held in escrow on the Polygon blockchain
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Reduced Risk:</strong> Pay only for completed and approved work
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Transparency:</strong> All transactions and approvals are recorded on-chain
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Dispute Resolution:</strong> Built-in system for handling disagreements
              </ListItem>
            </List>
          </Box>
        </SimpleGrid>
        
        <Heading as="h2" size="lg" mb={6}>How to Use Milestone Contracts</Heading>
        
        <Accordion allowToggle mb={12}>
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Text as="span" bg="blue.500" color="white" w={8} h={8} borderRadius="full" display="flex" alignItems="center" justifyContent="center" mr={4}>1</Text>
                    Creating a New Contract
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                To create a new milestone-based contract:
              </Text>
              <List spacing={2} mb={4}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Navigate to the Milestone Contracts page
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Click "Create New Contract"
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Fill in the contract details including seller's wallet address
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Add milestones with descriptions, amounts, and due dates
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Review and submit - this will create a smart contract on the Polygon network
                </ListItem>
              </List>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    You'll need to have sufficient funds in your wallet to cover the contract total plus gas fees.
                  </AlertDescription>
                </Box>
              </Alert>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Text as="span" bg="blue.500" color="white" w={8} h={8} borderRadius="full" display="flex" alignItems="center" justifyContent="center" mr={4}>2</Text>
                    Managing Milestones (Seller)
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                As a seller, you're responsible for marking milestones as complete:
              </Text>
              <List spacing={2} mb={4}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Open the specific contract from your dashboard
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Navigate to the milestone you've completed
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Click "Mark as Complete"
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Add any completion notes or evidence
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Submit the completion request
                </ListItem>
              </List>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Important!</AlertTitle>
                  <AlertDescription>
                    Only mark milestones as complete when the work truly meets the requirements. Submitting incomplete work can lead to disputes.
                  </AlertDescription>
                </Box>
              </Alert>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Text as="span" bg="blue.500" color="white" w={8} h={8} borderRadius="full" display="flex" alignItems="center" justifyContent="center" mr={4}>3</Text>
                    Reviewing & Approving Milestones (Buyer)
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                As a buyer, you'll be notified when a milestone is marked as complete:
              </Text>
              <List spacing={2} mb={4}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Review the completed milestone and any provided evidence
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  If satisfied, click "Approve & Release Payment"
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  If not satisfied, click "Reject" and provide feedback
                </ListItem>
              </List>
              <Text mb={4}>
                Once approved, funds for that milestone will be automatically released to the seller's wallet.
              </Text>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Time-based Auto-approval</AlertTitle>
                  <AlertDescription>
                    If you don't take any action within 7 days, the milestone may be automatically approved. Make sure to review completed milestones promptly.
                  </AlertDescription>
                </Box>
              </Alert>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Text as="span" bg="blue.500" color="white" w={8} h={8} borderRadius="full" display="flex" alignItems="center" justifyContent="center" mr={4}>4</Text>
                    Handling Disputes
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                If there's a disagreement about a milestone:
              </Text>
              <List spacing={2} mb={4}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Either party can click "Create Dispute" on the milestone
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Provide details about the issue and any supporting evidence
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  A Bell24H administrator will review the dispute
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Based on the evidence, the admin will decide to approve, reject, or suggest a compromise
                </ListItem>
              </List>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Fair Resolution</AlertTitle>
                  <AlertDescription>
                    Our goal is to ensure fair outcomes based on contract terms and evidence. The dispute process typically takes 3-5 business days.
                  </AlertDescription>
                </Box>
              </Alert>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        
        <Box 
          bg={bgColor} 
          p={6} 
          borderRadius="md" 
          boxShadow="md"
          borderWidth="1px" 
          borderColor={borderColor}
          mb={12}
        >
          <Flex mb={4} alignItems="center">
            <Icon as={FaUserShield} boxSize={8} color="orange.500" mr={4} />
            <Heading as="h2" size="md">Security & Best Practices</Heading>
          </Flex>
          
          <List spacing={4}>
            <ListItem>
              <Flex>
                <ListIcon as={InfoIcon} color="blue.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Clear Milestone Definitions</Text>
                  <Text>Define each milestone with specific, measurable deliverables to avoid confusion.</Text>
                </Box>
              </Flex>
            </ListItem>
            
            <ListItem>
              <Flex>
                <ListIcon as={InfoIcon} color="blue.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Secure Your Wallet</Text>
                  <Text>Always keep your wallet credentials secure and never share your private keys.</Text>
                </Box>
              </Flex>
            </ListItem>
            
            <ListItem>
              <Flex>
                <ListIcon as={InfoIcon} color="blue.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Verify Addresses</Text>
                  <Text>Double-check all wallet addresses before creating contracts to ensure funds go to the correct party.</Text>
                </Box>
              </Flex>
            </ListItem>
            
            <ListItem>
              <Flex>
                <ListIcon as={InfoIcon} color="blue.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Document Everything</Text>
                  <Text>Keep records of all communications and deliverables outside the blockchain as additional evidence.</Text>
                </Box>
              </Flex>
            </ListItem>
          </List>
        </Box>
        
        <Heading as="h2" size="lg" mb={6}>Integration with Financial Services</Heading>
        
        <Heading as="h2" size="lg" mb={6}>Testing Milestone Contracts</Heading>
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Always test your milestone contracts on the Mumbai testnet before deploying to production.
              This guide explains how to set up test wallets and run comprehensive tests.
            </AlertDescription>
          </Box>
        </Alert>
        
        <Accordion allowToggle mb={8}>
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Icon as={FaWallet} color="blue.500" mr={3} />
                    Setting Up Test Wallets
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                To properly test milestone contracts, you'll need dedicated test wallets on the Polygon Mumbai testnet:
              </Text>
              <List spacing={3} mb={5}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Create separate test accounts in MetaMask for buyer and seller roles
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Configure MetaMask for Mumbai testnet (Chain ID: 80001)
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Get testnet MATIC from the <Link href="https://faucet.polygon.technology/" isExternal color="blue.500">Polygon Faucet <ExternalLinkIcon mx="2px" /></Link>
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Update your <Code>.env.test</Code> file with test wallet addresses and private keys
                </ListItem>
              </List>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Never use production private keys or wallets with real assets for testing.
                    Keep test environment credentials separate from production.
                  </AlertDescription>
                </Box>
              </Alert>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Icon as={FaCode} color="purple.500" mr={3} />
                    Running Contract Tests
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                Bell24H provides a comprehensive testing framework for milestone contracts:
              </Text>
              <List spacing={3} mb={5}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Navigate to your project directory
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Run <Code>scripts\run-milestone-tests.bat</Code> (Windows) or <Code>./scripts/Run-ComprehensiveTests.ps1</Code> (PowerShell)
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  The tests will verify contract creation, milestone management, and approval workflows
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Test results are saved to the <Code>test-results</Code> folder
                </ListItem>
              </List>
              <TableContainer mb={5}>
                <Table variant="simple" size="sm">
                  <TableCaption placement="top">Milestone Contract Test Scenarios</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Test</Th>
                      <Th>Description</Th>
                      <Th>Expected Outcome</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Contract Creation</Td>
                      <Td>Creates a new milestone contract</Td>
                      <Td>Contract ID registered on blockchain</Td>
                    </Tr>
                    <Tr>
                      <Td>Milestone Startup</Td>
                      <Td>Initialize first milestone</Td>
                      <Td>Milestone status changed to "In Progress"</Td>
                    </Tr>
                    <Tr>
                      <Td>Milestone Completion</Td>
                      <Td>Mark milestone as complete</Td>
                      <Td>Milestone status changed to "Completed"</Td>
                    </Tr>
                    <Tr>
                      <Td>Milestone Approval</Td>
                      <Td>Approve completed milestone</Td>
                      <Td>Payment released to seller wallet</Td>
                    </Tr>
                    <Tr>
                      <Td>Dispute Creation</Td>
                      <Td>Raise dispute on a milestone</Td>
                      <Td>Dispute logged with timestamp</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h3>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Flex alignItems="center">
                    <Icon as={FaExchangeAlt} color="green.500" mr={3} />
                    Financial Integration Testing
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4} pl={16}>
              <Text mb={4}>
                You can also test the financial integrations with KredX and M1Exchange:
              </Text>
              <List spacing={3} mb={5}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Ensure your <Code>.env.test</Code> file includes API credentials for financial services
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Run <Code>node scripts/test-financial-integration.js</Code>
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  The script will simulate financing requests without executing actual transactions
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Compare financing rates between providers in the test results
                </ListItem>
              </List>
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} mb={4}>
                <Flex mb={2} justify="space-between" align="center">
                  <Text fontWeight="bold">Provider</Text>
                  <Text fontWeight="bold">Typical Fee</Text>
                </Flex>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text>KredX</Text>
                  <Badge colorScheme="green">0.5% fixed</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text>M1Exchange</Text>
                  <Badge colorScheme="blue">0.4-0.6% variable</Badge>
                </Flex>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={12}>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="md"
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Flex mb={4} alignItems="center">
              <Icon as={FaMoneyBillWave} boxSize={8} color="green.500" mr={4} />
              <Heading as="h2" size="md">KredX Integration</Heading>
            </Flex>
            <Text mb={4}>
              Bell24H milestone contracts can be integrated with KredX for invoice financing:
            </Text>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Connect your KredX account in Financial Services settings
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Use the "Finance This Milestone" option on any approved milestone
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Receive advance payment (typically 80% of milestone value)
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                KredX fee: 0.5% of the milestone amount
              </ListItem>
            </List>
            <Button 
              mt={4} 
              colorScheme="green" 
              variant="outline"
              as={NextLink} 
              href="/financial-services?service=kredx"
            >
              Set Up KredX Integration
            </Button>
          </Box>
          
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="md" 
            boxShadow="md"
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Flex mb={4} alignItems="center">
              <Icon as={FaMoneyBillWave} boxSize={8} color="blue.500" mr={4} />
              <Heading as="h2" size="md">M1Exchange Integration</Heading>
            </Flex>
            <Text mb={4}>
              M1Exchange provides alternative invoice financing options for your milestone contracts:
            </Text>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Connect your M1Exchange account in Financial Services settings
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Select "M1Exchange Financing" on any approved milestone
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                Compare rates between KredX and M1Exchange
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                M1Exchange fee: Varies based on milestone size (0.4-0.6%)
              </ListItem>
            </List>
            <Button 
              mt={4} 
              colorScheme="blue" 
              variant="outline"
              as={NextLink} 
              href="/financial-services?service=m1exchange"
            >
              Set Up M1Exchange Integration
            </Button>
          </Box>
        </SimpleGrid>
        
        <Heading as="h2" size="lg" mb={6}>Production Deployment Guide</Heading>

        <Box p={6} borderWidth="1px" borderRadius="md" borderColor={borderColor} mb={8} bg={bgColor}>
          <Flex mb={4} alignItems="center">
            <Icon as={FaServer} boxSize={8} color="red.500" mr={4} />
            <Heading as="h3" size="md">AWS Mumbai Deployment Checklist</Heading>
          </Flex>
          
          <Text mb={4}>
            Before deploying the milestone contracts system to AWS Mumbai production environment, ensure you've completed the following steps:
          </Text>
          
          <List spacing={3} mb={5}>
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Environment Configuration</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Set up all required environment variables in AWS Parameter Store. Never hardcode API keys or private keys.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Smart Contract Deployment</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Deploy the verified MilestonePayments.sol contract to Polygon Mainnet and update contract addresses in environment variables.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Security Audits</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Complete security scanning of smart contracts and API endpoints before production deployment.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Database Migrations</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Run database migrations on production database to ensure all required tables are created.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Financial API Integration</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Verify KredX and M1Exchange API credentials and permissions for the production environment.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Load Testing</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Perform load testing to ensure system can handle expected transaction volume.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Analytics Configuration</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Configure PostHog or other analytics services to track production usage metrics.
              </Text>
            </ListItem>
            
            <ListItem>
              <Flex align="center">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <Text fontWeight="bold">Backup Strategy</Text>
              </Flex>
              <Text ml={10} fontSize="sm">
                Implement automated backups for database and critical configurations.
              </Text>
            </ListItem>
          </List>
          
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Security First</AlertTitle>
              <AlertDescription>
                Always follow the principle of least privilege when configuring IAM roles and policies.
                Limit access to production resources and implement proper monitoring and alerting.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>

        <Flex justifyContent="space-between" mt={12}>
          <Button 
            leftIcon={<Icon as={FaFileContract} />}
            as={NextLink}
            href="/blockchain/milestone-contracts"
            colorScheme="blue"
          >
            Go to Milestone Contracts
          </Button>
          
          <Button 
            leftIcon={<Icon as={QuestionIcon} />}
            as={NextLink}
            href="/support"
            variant="outline"
          >
            Get Help
          </Button>
        </Flex>
      </Container>
    </DashboardLayout>
  );
};

export default MilestoneContractsDocumentation;
