import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Stack,
  Text,
  Icon,
  Link,
  HStack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaShippingFast,
  FaChartBar,
  FaMapMarkedAlt,
  FaBoxOpen,
  FaFileInvoice,
  FaPlus,
} from 'react-icons/fa';
import NextLink from 'next/link';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  href: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, href, isActive }) => {
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <NextLink href={href} passHref>
      <Link
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
      >
        <Flex
          align="center"
          p="3"
          mx="2"
          borderRadius="md"
          role="group"
          cursor="pointer"
          color={isActive ? activeColor : undefined}
          bg={isActive ? activeBg : undefined}
          _hover={{
            bg: hoverBg,
          }}
          fontWeight={isActive ? 'semibold' : 'normal'}
        >
          <Icon
            mr="4"
            fontSize="18"
            as={icon}
            color={isActive ? activeColor : undefined}
          />
          {children}
        </Flex>
      </Link>
    </NextLink>
  );
};

const LogisticsNavigation: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      mb={6}
    >
      <Text
        p={4}
        fontSize="lg"
        fontWeight="bold"
        color={useColorModeValue('gray.700', 'white')}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        Logistics
      </Text>

      <Stack spacing={0} py={2}>
        <NavItem
          icon={FaChartBar}
          href="/logistics/dashboard"
          isActive={currentPath === '/logistics/dashboard'}
        >
          Dashboard
        </NavItem>
        
        <NavItem
          icon={FaShippingFast}
          href="/logistics/shipments"
          isActive={currentPath === '/logistics/shipments' || currentPath.startsWith('/logistics/shipment/')}
        >
          Shipments
        </NavItem>
        
        <NavItem
          icon={FaMapMarkedAlt}
          href="/logistics/route-optimization"
          isActive={currentPath === '/logistics/route-optimization'}
        >
          Route Optimization
        </NavItem>
        
        <NavItem
          icon={FaFileInvoice}
          href="/logistics/documents"
          isActive={currentPath === '/logistics/documents'}
        >
          Customs Documents
        </NavItem>
      </Stack>

      <Divider borderColor={borderColor} />

      <Box p={4}>
        <NextLink href="/logistics/shipments" passHref>
          <Link
            p={2}
            fontSize="sm"
            fontWeight="500"
            color={useColorModeValue('blue.600', 'blue.200')}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{
              textDecoration: 'none',
              bg: useColorModeValue('blue.50', 'blue.900'),
            }}
          >
            <Icon as={FaPlus} mr={2} /> Create New Shipment
          </Link>
        </NextLink>
      </Box>
    </Box>
  );
};

export default LogisticsNavigation;
