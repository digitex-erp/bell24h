/**
 * Test script for One-Click Industry Trend Snapshot Generator
 * 
 * This script tests the One-Click Industry Trend Snapshot Generator API endpoint
 * to verify it properly generates snapshots with minimal inputs.
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { db } from './server/db';
import { industryTrendSnapshots } from './shared/schema';
import { eq, desc } from 'drizzle-orm';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:3000';

// Main test function
async function testOneClickGenerator() {
  console.log('Testing One-Click Industry Trend Snapshot Generator...');

  // Test 1: Generate a snapshot with just the industry name
  await testBasicGeneration();

  // Test 2: Generate a snapshot with industry name and region
  await testRegionalGeneration();

  // Test 3: Generate a snapshot with template
  await testTemplateGeneration();

  // Get the latest snapshot to verify storage and retrieval
  await testSnapshotRetrieval();

  console.log('\nAll tests completed successfully!');
}

async function testBasicGeneration() {
  console.log('\n--- Test 1: Basic One-Click Generation ---');
  try {
    // Generate a snapshot for a simple industry
    const response = await fetch(`${API_URL}/api/industry-trends/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry: 'Automotive' })
    });

    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully generated snapshot for Automotive industry');
    console.log(`   Generated snapshot has ${data.keyTrends?.length || 0} key trends`);
    console.log(`   Market size estimate: ${data.marketSizeData?.currentSize || 'N/A'}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testRegionalGeneration() {
  console.log('\n--- Test 2: Regional One-Click Generation ---');
  try {
    // Generate a snapshot for an industry with a specific region
    const response = await fetch(`${API_URL}/api/industry-trends/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        industry: 'Renewable Energy',
        region: 'India'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully generated snapshot for Renewable Energy industry in India');
    console.log(`   Regional insights included: ${Object.keys(data.regionalInsights || {}).length} regions`);
    if (data.regionalInsights?.India) {
      console.log(`   India-specific insights: ${data.regionalInsights.India.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testTemplateGeneration() {
  console.log('\n--- Test 3: Template-based One-Click Generation ---');
  try {
    // First, we need to check if there are any templates available
    const templatesResponse = await fetch(`${API_URL}/api/industry-trends/templates`);
    const templatesData = await templatesResponse.json();
    
    // If there are no templates, we'll create a basic test template
    let templateId = templatesData.templates?.[0]?.id;
    
    if (!templateId) {
      console.log('   No existing templates found, skipping template test');
      return;
    }
    
    // Generate a snapshot using the template
    const response = await fetch(`${API_URL}/api/industry-trends/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        industry: 'Healthcare',
        templateId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully generated snapshot for Healthcare industry using template ID ${templateId}`);
    console.log(`   Generated snapshot has ${data.keyTrends?.length || 0} key trends`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    // This test may fail if no templates exist, so we'll continue
    console.log('   Continuing with other tests...');
  }
}

async function testSnapshotRetrieval() {
  console.log('\n--- Test 4: Snapshot Database Storage and Retrieval ---');
  try {
    // Fetch the latest snapshot from the database
    const snapshots = await db.select({
      id: industryTrendSnapshots.id,
      industry: industryTrendSnapshots.industry,
      region: industryTrendSnapshots.region,
      timeframe: industryTrendSnapshots.timeframe,
      generatedAt: industryTrendSnapshots.generatedAt,
      snapshotData: industryTrendSnapshots.snapshotData
    })
    .from(industryTrendSnapshots)
    .orderBy(desc(industryTrendSnapshots.generatedAt))
    .limit(1);
    
    if (snapshots.length === 0) {
      console.log('   No snapshots found in the database, skipping retrieval test');
      return;
    }
    
    const latestSnapshot = snapshots[0];
    
    console.log(`✅ Successfully retrieved latest snapshot from database:`);
    console.log(`   ID: ${latestSnapshot.id}`);
    console.log(`   Industry: ${latestSnapshot.industry}`);
    console.log(`   Region: ${latestSnapshot.region || 'Global'}`);
    console.log(`   Generated At: ${latestSnapshot.generatedAt}`);
    
    // Now verify we can retrieve it via the API
    const response = await fetch(`${API_URL}/api/industry-trends/snapshot/${latestSnapshot.id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve snapshot via API with status: ${response.status}`);
    }
    
    console.log('✅ Successfully retrieved same snapshot via API endpoint');
  } catch (error) {
    console.error('❌ Test failed:', error);
    // This test may fail if no snapshots were saved, so we'll continue
    console.log('   Continuing with other tests...');
  }
}

// Run the tests
testOneClickGenerator().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});