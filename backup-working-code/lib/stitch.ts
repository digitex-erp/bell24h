import { Stitch, RemoteMongoClient, AnonymousCredential } from 'mongodb-stitch-browser-sdk';

// Initialize the MongoDB Stitch client
const APP_ID = process.env.REACT_APP_STITCH_APP_ID || 'bell24h-stitch-demo';

// Initialize the Stitch client
const stitchApp = Stitch.hasAppClient('bell24h-stitch')
  ? Stitch.getAppClient('bell24h-stitch')
  : Stitch.initializeDefaultAppClient('bell24h-stitch', {
      appId: APP_ID,
    });

// Export the Stitch client and authentication methods
export const initializeStitch = async () => {
  try {
    // Check if user is already authenticated
    if (!stitchApp.auth.isLoggedIn) {
      // Use anonymous authentication (replace with your preferred auth method)
      await stitchApp.auth.loginWithCredential(new AnonymousCredential());
    }
    return stitchApp;
  } catch (error) {
    console.error('Failed to initialize Stitch:', error);
    throw error;
  }
};

export const getStitchClient = () => stitchApp;
export const getStitchDb = (dbName = 'bell24h') => 
  stitchApp.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db(dbName);
