#!/usr/bin/env node

/**
 * Comprehensive Bell24h Application Audit
 * Tests all pages, functionality, and accessibility
 */

const fs = require('fs');
const path = require('path');

// MCP Server Simulation for Testing
class MCPServer {
  constructor() {
    this.results = {
      pages: [],
      functionality: [],
      accessibility: [],
      performance: [],
      errors: []
    };
  }

  async testPage(url, pageName) {
    console.log(`🔍 Testing ${pageName} at ${url}`);
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic checks
      const hasTitle = html.includes('<title>');
      const hasMetaDescription = html.includes('name="description"');
      const hasViewport = html.includes('name="viewport"');
      const hasFavicon = html.includes('rel="icon"') || html.includes('rel="shortcut icon"');
      
      // Accessibility checks
      const hasAltText = (html.match(/alt="[^"]*"/g) || []).length;
      const hasHeadings = (html.match(/<h[1-6][^>]*>/g) || []).length;
      const hasFormLabels = (html.match(/<label[^>]*>/g) || []).length;
      
      // Functionality checks
      const hasButtons = (html.match(/<button[^>]*>/g) || []).length;
      const hasLinks = (html.match(/<a[^>]*href/g) || []).length;
      const hasForms = (html.match(/<form[^>]*>/g) || []).length;
      
      // Contrast and styling checks
      const hasInlineStyles = (html.match(/style="[^"]*"/g) || []).length;
      const hasCSSClasses = (html.match(/class="[^"]*"/g) || []).length;
      
      const pageResult = {
        url,
        pageName,
        status: response.status,
        hasTitle,
        hasMetaDescription,
        hasViewport,
        hasFavicon,
        accessibility: {
          altTextCount: hasAltText,
          headingsCount: hasHeadings,
          formLabelsCount: hasFormLabels,
          score: this.calculateAccessibilityScore(hasAltText, hasHeadings, hasFormLabels)
        },
        functionality: {
          buttonsCount: hasButtons,
          linksCount: hasLinks,
          formsCount: hasForms,
          score: this.calculateFunctionalityScore(hasButtons, hasLinks, hasForms)
        },
        styling: {
          inlineStylesCount: hasInlineStyles,
          cssClassesCount: hasCSSClasses,
          hasProperContrast: this.checkContrast(html)
        }
      };
      
      this.results.pages.push(pageResult);
      return pageResult;
      
    } catch (error) {
      console.error(`❌ Error testing ${pageName}:`, error.message);
      this.results.errors.push({
        page: pageName,
        url,
        error: error.message
      });
      return null;
    }
  }

  calculateAccessibilityScore(altText, headings, formLabels) {
    let score = 0;
    if (altText > 0) score += 30;
    if (headings > 0) score += 30;
    if (formLabels > 0) score += 20;
    if (altText > 5 && headings > 3) score += 20;
    return Math.min(score, 100);
  }

  calculateFunctionalityScore(buttons, links, forms) {
    let score = 0;
    if (buttons > 0) score += 40;
    if (links > 5) score += 30;
    if (forms > 0) score += 30;
    return Math.min(score, 100);
  }

  checkContrast(html) {
    // Check for common contrast issues
    const hasWhiteTextOnWhite = html.includes('color:white') && html.includes('background:white');
    const hasBlackTextOnBlack = html.includes('color:black') && html.includes('background:black');
    const hasLowContrast = html.includes('color:#666') && html.includes('background:#fff');
    
    return !hasWhiteTextOnWhite && !hasBlackTextOnBlack && !hasLowContrast;
  }

  async testAPIEndpoint(endpoint, method = 'GET', data = null) {
    console.log(`🔍 Testing API ${method} ${endpoint}`);
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`http://localhost:3000${endpoint}`, options);
      const result = await response.json();
      
      const apiResult = {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        responseTime: Date.now(),
        data: result
      };
      
      this.results.functionality.push(apiResult);
      return apiResult;
      
    } catch (error) {
      console.error(`❌ Error testing API ${endpoint}:`, error.message);
      this.results.errors.push({
        api: endpoint,
        method,
        error: error.message
      });
      return null;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.results.pages.length,
        workingPages: this.results.pages.filter(p => p && p.status === 200).length,
        totalAPIs: this.results.functionality.length,
        workingAPIs: this.results.functionality.filter(a => a && a.success).length,
        totalErrors: this.results.errors.length
      },
      pages: this.results.pages,
      functionality: this.results.functionality,
      errors: this.results.errors,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for common issues
    const pagesWithoutTitles = this.results.pages.filter(p => p && !p.hasTitle);
    if (pagesWithoutTitles.length > 0) {
      recommendations.push({
        type: 'SEO',
        priority: 'HIGH',
        issue: 'Missing page titles',
        affectedPages: pagesWithoutTitles.map(p => p.pageName),
        fix: 'Add proper <title> tags to all pages'
      });
    }
    
    const lowAccessibilityPages = this.results.pages.filter(p => p && p.accessibility.score < 70);
    if (lowAccessibilityPages.length > 0) {
      recommendations.push({
        type: 'Accessibility',
        priority: 'HIGH',
        issue: 'Low accessibility scores',
        affectedPages: lowAccessibilityPages.map(p => p.pageName),
        fix: 'Add alt text, proper headings, and form labels'
      });
    }
    
    const contrastIssues = this.results.pages.filter(p => p && !p.styling.hasProperContrast);
    if (contrastIssues.length > 0) {
      recommendations.push({
        type: 'Accessibility',
        priority: 'HIGH',
        issue: 'Contrast issues detected',
        affectedPages: contrastIssues.map(p => p.pageName),
        fix: 'Improve text/background contrast ratios'
      });
    }
    
    const nonWorkingAPIs = this.results.functionality.filter(a => a && !a.success);
    if (nonWorkingAPIs.length > 0) {
      recommendations.push({
        type: 'Functionality',
        priority: 'CRITICAL',
        issue: 'Non-working API endpoints',
        affectedAPIs: nonWorkingAPIs.map(a => a.endpoint),
        fix: 'Fix API implementation and error handling'
      });
    }
    
    return recommendations;
  }
}

// Main audit function
async function runComprehensiveAudit() {
  console.log('🚀 Starting Comprehensive Bell24h Audit...\n');
  
  const mcp = new MCPServer();
  
  // Test all main pages
  const pages = [
    { url: 'http://localhost:3000', name: 'Home Page' },
    { url: 'http://localhost:3000/about', name: 'About Page' },
    { url: 'http://localhost:3000/contact', name: 'Contact Page' },
    { url: 'http://localhost:3000/login', name: 'Login Page' },
    { url: 'http://localhost:3000/register', name: 'Register Page' },
    { url: 'http://localhost:3000/dashboard', name: 'Dashboard Page' },
    { url: 'http://localhost:3000/suppliers', name: 'Suppliers Page' },
    { url: 'http://localhost:3000/products', name: 'Products Page' },
    { url: 'http://localhost:3000/rfq', name: 'RFQ Page' },
    { url: 'http://localhost:3000/pricing', name: 'Pricing Page' },
    { url: 'http://localhost:3000/help', name: 'Help Page' },
    { url: 'http://localhost:3000/terms', name: 'Terms Page' },
    { url: 'http://localhost:3000/privacy', name: 'Privacy Page' }
  ];
  
  console.log('📄 Testing Pages...');
  for (const page of pages) {
    await mcp.testPage(page.url, page.name);
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
  }
  
  console.log('\n🔌 Testing API Endpoints...');
  const apis = [
    { endpoint: '/api/auth/otp/send', method: 'POST', data: { mobile: '9876543210' } },
    { endpoint: '/api/auth/otp/verify', method: 'POST', data: { mobile: '9876543210', otp: '123456' } },
    { endpoint: '/api/rfq/list', method: 'GET' },
    { endpoint: '/api/suppliers', method: 'GET' },
    { endpoint: '/api/categories', method: 'GET' }
  ];
  
  for (const api of apis) {
    await mcp.testAPIEndpoint(api.endpoint, api.method, api.data);
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
  }
  
  console.log('\n📊 Generating Report...');
  const report = mcp.generateReport();
  
  // Save report
  const reportPath = path.join(__dirname, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n✅ Audit Complete!');
  console.log(`📄 Pages tested: ${report.summary.totalPages}`);
  console.log(`✅ Working pages: ${report.summary.workingPages}`);
  console.log(`🔌 APIs tested: ${report.summary.totalAPIs}`);
  console.log(`✅ Working APIs: ${report.summary.workingAPIs}`);
  console.log(`❌ Errors found: ${report.summary.totalErrors}`);
  console.log(`📋 Recommendations: ${report.recommendations.length}`);
  
  console.log('\n🎯 Top Recommendations:');
  report.recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
    console.log(`   Affected: ${rec.affectedPages?.join(', ') || rec.affectedAPIs?.join(', ')}`);
    console.log(`   Fix: ${rec.fix}\n`);
  });
  
  console.log(`📄 Full report saved to: ${reportPath}`);
  
  return report;
}

// Run the audit
if (require.main === module) {
  runComprehensiveAudit().catch(console.error);
}

module.exports = { MCPServer, runComprehensiveAudit };