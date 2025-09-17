#!/usr/bin/env node

/**
 * DNS Verification Script for bell24h.com
 * This script helps verify DNS configuration and domain resolution
 */

const dns = require('dns').promises;
const https = require('https');
const { promisify } = require('util');

const domains = [
  'bell24h.com',
  'www.bell24h.com',
  'bell24h-v1.vercel.app'
];

const vercelIPs = [
  '76.76.19.61',
  '76.76.21.61'
];

async function checkDNS(domain) {
  console.log(`\n🔍 Checking DNS for: ${domain}`);
  console.log('=' .repeat(50));
  
  try {
    // Check A records
    const addresses = await dns.resolve4(domain);
    console.log(`✅ A Records: ${addresses.join(', ')}`);
    
    // Check if any address matches Vercel IPs
    const isVercelIP = addresses.some(addr => vercelIPs.includes(addr));
    if (isVercelIP) {
      console.log('✅ Domain points to Vercel servers');
    } else {
      console.log('⚠️  Domain does not point to Vercel servers');
      console.log(`Expected Vercel IPs: ${vercelIPs.join(', ')}`);
    }
    
    // Check CNAME records
    try {
      const cnames = await dns.resolveCname(domain);
      console.log(`📝 CNAME Records: ${cnames.join(', ')}`);
    } catch (err) {
      console.log('📝 No CNAME records found');
    }
    
  } catch (error) {
    console.log(`❌ DNS Resolution failed: ${error.message}`);
  }
}

async function checkHTTPS(domain) {
  console.log(`\n🌐 Testing HTTPS for: ${domain}`);
  console.log('-'.repeat(30));
  
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ HTTPS Status: ${res.statusCode}`);
      console.log(`🔒 SSL Certificate: ${res.socket.getPeerCertificate().subject.CN}`);
      console.log(`📊 Response Headers:`);
      console.log(`   - Server: ${res.headers.server || 'Unknown'}`);
      console.log(`   - Content-Type: ${res.headers['content-type'] || 'Unknown'}`);
      console.log(`   - X-Vercel-Cache: ${res.headers['x-vercel-cache'] || 'Not set'}`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`❌ HTTPS Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Request timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function checkVercelStatus() {
  console.log('\n🚀 Checking Vercel Status');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://vercel.com/api/status');
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Vercel services are operational');
    } else {
      console.log('⚠️  Vercel services may have issues');
    }
  } catch (error) {
    console.log('❌ Could not check Vercel status');
  }
}

async function runDNSChecks() {
  console.log('🔧 Bell24h DNS Verification Tool');
  console.log('=====================================');
  console.log('This tool helps verify your DNS configuration');
  console.log('for proper Vercel deployment.\n');
  
  // Check Vercel status first
  await checkVercelStatus();
  
  // Check each domain
  for (const domain of domains) {
    await checkDNS(domain);
    await checkHTTPS(domain);
  }
  
  console.log('\n📋 Summary & Recommendations');
  console.log('=' .repeat(50));
  console.log('1. If you see "DNS Change Recommended" in Vercel dashboard:');
  console.log('   - Update DNS records at your domain registrar');
  console.log('   - Use the DNS_RESOLUTION_GUIDE.md for detailed steps');
  console.log('');
  console.log('2. Required DNS Records:');
  console.log('   A Record: @ → 76.76.19.61');
  console.log('   A Record: www → 76.76.19.61');
  console.log('   OR');
  console.log('   CNAME: www → cname.vercel-dns.com');
  console.log('');
  console.log('3. After updating DNS:');
  console.log('   - Wait 5-15 minutes for propagation');
  console.log('   - Click "Refresh" in Vercel dashboard');
  console.log('   - Re-run this script to verify');
  console.log('');
  console.log('4. If issues persist:');
  console.log('   - Check domain registrar settings');
  console.log('   - Verify nameservers are correct');
  console.log('   - Contact domain registrar support');
}

// Run the verification
if (require.main === module) {
  runDNSChecks().catch(console.error);
}

module.exports = {
  checkDNS,
  checkHTTPS,
  checkVercelStatus,
  runDNSChecks
};