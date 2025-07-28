/**
 * Application configuration
 * Loads environment variables with defaults
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Configuration object with typed properties
interface Config {
  // Server configuration
  PORT: number;
  NODE_ENV: string;
  SESSION_SECRET: string;
  
  // Database configuration
  DATABASE_URL: string;
  
  // Polygon blockchain configuration
  POLYGON_RPC_URL: string;
  POLYGON_CHAIN_ID: string;
  POLYGON_PRIVATE_KEY: string;
  POLYGON_CONTRACT_ADDRESS: string;
  POLYGON_CREDENTIAL_CONTRACT_ADDRESS: string;
  POLYGON_MILESTONE_CONTRACT_ADDRESS: string;
  POLYGON_OWNER_ADDRESS: string;
  
  // API keys and secrets
  JWT_SECRET: string;
}

// Configuration with defaults
export const config: Config = {
  // Server configuration
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'bell24h-secret-key',
  
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/bell24h',
  
  // Polygon blockchain configuration
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-mumbai.infura.io/v3/your-infura-key',
  POLYGON_CHAIN_ID: process.env.POLYGON_CHAIN_ID || '80001', // Mumbai testnet by default
  POLYGON_PRIVATE_KEY: process.env.POLYGON_PRIVATE_KEY || '',
  POLYGON_CONTRACT_ADDRESS: process.env.POLYGON_CONTRACT_ADDRESS || '',
  POLYGON_CREDENTIAL_CONTRACT_ADDRESS: process.env.POLYGON_CREDENTIAL_CONTRACT_ADDRESS || '',
  POLYGON_MILESTONE_CONTRACT_ADDRESS: process.env.POLYGON_MILESTONE_CONTRACT_ADDRESS || '',
  POLYGON_OWNER_ADDRESS: process.env.POLYGON_OWNER_ADDRESS || '',
  
  // API keys and secrets
  JWT_SECRET: process.env.JWT_SECRET || 'bell24h-jwt-secret',
};

// Export default config
export default config;
