/**
 * Simple script to check if the necessary API keys are configured
 */

// List of required environment variables for external APIs
const requiredEnvVars = [
  'KOTAK_SECURITIES_API_KEY',
  'KOTAK_SECURITIES_API_SECRET',
  'KREDX_API_KEY',
  'KREDX_API_SECRET',
  'RAZORPAYX_API_KEY',
  'RAZORPAYX_API_SECRET',
  'FSAT_API_KEY',
  'FSAT_API_SECRET',
  'FSAT_BASE_URL'
];

// List of API names and their required environment variables
const externalApis = {
  'Kotak Securities': ['KOTAK_SECURITIES_API_KEY', 'KOTAK_SECURITIES_API_SECRET'],
  'KredX': ['KREDX_API_KEY', 'KREDX_API_SECRET'],
  'RazorpayX': ['RAZORPAYX_API_KEY', 'RAZORPAYX_API_SECRET'],
  'FSAT': ['FSAT_API_KEY', 'FSAT_API_SECRET', 'FSAT_BASE_URL']
};

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Check API configuration status
const apiStatus = Object.entries(externalApis).map(([apiName, requiredVars]) => {
  const allVarsPresent = requiredVars.every(varName => process.env[varName]);
  return {
    apiName,
    isConfigured: allVarsPresent,
    missingVars: allVarsPresent ? [] : requiredVars.filter(varName => !process.env[varName])
  };
});

// Print the results
console.log('External API Configuration Status:');
console.log('==================================');
apiStatus.forEach(api => {
  console.log(`${api.apiName}: ${api.isConfigured ? 'Configured ✓' : 'Not configured ✗'}`);
  if (!api.isConfigured) {
    console.log('  Missing environment variables:');
    api.missingVars.forEach(varName => console.log(`    - ${varName}`));
  }
});

// Print summary
console.log('\nSummary:');
console.log('========');
const configuredApisCount = apiStatus.filter(api => api.isConfigured).length;
console.log(`${configuredApisCount} of ${apiStatus.length} external APIs are fully configured`);

if (missingVars.length > 0) {
  console.log('\nAction Required:');
  console.log('===============');
  console.log('Please set the following environment variables to enable all features:');
  missingVars.forEach(varName => console.log(`  - ${varName}`));
}