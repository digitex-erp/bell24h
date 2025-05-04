/**
 * Bell24h Voice RFQ Test Script
 * 
 * This script tests the Voice RFQ API endpoints.
 */
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUDIO_FILE_PATH = path.join(__dirname, 'test-voice-sample.mp3');

/**
 * Test the voice RFQ upload endpoint
 */
async function testVoiceRfqUpload() {
  try {
    console.log('Testing Voice RFQ upload...');
    
    // Check if test audio file exists
    if (!fs.existsSync(AUDIO_FILE_PATH)) {
      console.error(`Test audio file not found at ${AUDIO_FILE_PATH}`);
      console.log('Please provide a test audio file for the voice RFQ test.');
      return false;
    }
    
    // Create form data with audio file
    const form = new FormData();
    form.append('audio', fs.createReadStream(AUDIO_FILE_PATH));
    form.append('languagePreference', 'auto');
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq/process`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders ? form.getHeaders() : {}
    });
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ upload test successful');
      console.log('Transcription:', data.transcript);
      console.log('Detected Language:', data.detectedLanguage);
      if (data.translation) {
        console.log('Translation:', data.translation);
      }
      console.log('Analyzed RFQ:', JSON.stringify(data.analyzedRfq, null, 2));
      return true;
    } else {
      console.error('Voice RFQ upload test failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ upload:', error.message);
    return false;
  }
}

/**
 * Test the voice RFQ listing endpoint
 */
async function testVoiceRfqListing() {
  try {
    console.log('\nTesting Voice RFQ listing...');
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq`);
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ listing test successful');
      console.log(`Found ${data.rfqs.length} voice RFQs`);
      if (data.rfqs.length > 0) {
        console.log('First RFQ:', JSON.stringify(data.rfqs[0], null, 2));
      }
      return true;
    } else {
      console.error('Voice RFQ listing test failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ listing:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('============================');
  console.log('Bell24h Voice RFQ API Tests');
  console.log('============================\n');
  
  const uploadResult = await testVoiceRfqUpload();
  const listingResult = await testVoiceRfqListing();
  
  console.log('\n============================');
  console.log('Test Results Summary');
  console.log('============================');
  console.log('Voice RFQ Upload Test:', uploadResult ? 'PASSED' : 'FAILED');
  console.log('Voice RFQ Listing Test:', listingResult ? 'PASSED' : 'FAILED');
  console.log('============================');
  
  // Return success status
  return uploadResult && listingResult;
}

// Run tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
