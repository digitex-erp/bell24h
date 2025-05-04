/**
 * Test script for Bell24h RFQ Analytics PDF export functionality
 * 
 * This script tests the PDF generation utility with sample data
 * to verify it works correctly without needing the frontend UI.
 */

import { generateRfqAnalyticsPdf } from './client/src/lib/pdf-generator.js';

// Sample data for testing PDF generation
const sampleData = {
  rfq: {
    id: 12345,
    title: "Industrial Pump Components Procurement",
    status: "Published",
    createdAt: "2023-11-15T10:30:00.000Z",
    buyerName: "Global Manufacturing Inc.",
    category: "Industrial Equipment",
    quoteCount: 5,
    deadline: "2023-12-15T23:59:59.000Z"
  },
  quotes: [
    { supplierId: 1, supplierName: "PumpTech Solutions", price: 45000, deliveryDays: 21, status: "Submitted" },
    { supplierId: 2, supplierName: "Hydra Components", price: 52500, deliveryDays: 14, status: "Submitted" },
    { supplierId: 3, supplierName: "FluidSystems Inc.", price: 48750, deliveryDays: 18, status: "Submitted" },
    { supplierId: 4, supplierName: "IndustrialParts Co.", price: 51200, deliveryDays: 15, status: "Submitted" },
    { supplierId: 5, supplierName: "MechSupply Ltd.", price: 47800, deliveryDays: 20, status: "Submitted" }
  ],
  supplierComparison: [
    { 
      id: 1, 
      name: "PumpTech Solutions", 
      avgPrice: 45000, 
      avgDeliveryDays: 21, 
      quoteCount: 153, 
      acceptanceRate: 0.87 
    },
    { 
      id: 2, 
      name: "Hydra Components", 
      avgPrice: 52500, 
      avgDeliveryDays: 14, 
      quoteCount: 98, 
      acceptanceRate: 0.92 
    },
    { 
      id: 3, 
      name: "FluidSystems Inc.", 
      avgPrice: 48750, 
      avgDeliveryDays: 18, 
      quoteCount: 127, 
      acceptanceRate: 0.75 
    },
    { 
      id: 4, 
      name: "IndustrialParts Co.", 
      avgPrice: 51200, 
      avgDeliveryDays: 15, 
      quoteCount: 112, 
      acceptanceRate: 0.81 
    },
    { 
      id: 5, 
      name: "MechSupply Ltd.", 
      avgPrice: 47800, 
      avgDeliveryDays: 20, 
      quoteCount: 87, 
      acceptanceRate: 0.79 
    }
  ],
  marketTrends: {
    overview: "The market for industrial pump components has shown moderate price stability over the past 6 months, with a slight downward trend in pricing due to increased supplier competition and improved manufacturing efficiencies.",
    priceTrends: [
      { period: "Jul 2023", avgPrice: 51200, change: 0 },
      { period: "Aug 2023", avgPrice: 50800, change: -0.0078 },
      { period: "Sep 2023", avgPrice: 49500, change: -0.0256 },
      { period: "Oct 2023", avgPrice: 48900, change: -0.0121 },
      { period: "Nov 2023", avgPrice: 48750, change: -0.0031 },
      { period: "Dec 2023", avgPrice: 48200, change: -0.0113 }
    ],
    insights: [
      { 
        title: "Increased Supplier Competition", 
        text: "The number of suppliers offering industrial pump components has increased by 12% in the last quarter, leading to more competitive pricing." 
      },
      { 
        title: "Lead Time Reduction", 
        text: "Average delivery times have decreased from 23 days to 18 days over the past 6 months, indicating improved supply chain efficiency." 
      },
      { 
        title: "Quality Considerations", 
        text: "Despite price competition, high-quality components from tier-1 suppliers still command a 15-20% premium, which buyers should factor into their procurement decisions." 
      }
    ]
  }
};

// Function to initialize and run the test
async function runTest() {
  console.log('Testing RFQ Analytics PDF Export...');
  
  try {
    // Mock browser environment for Canvas
    global.document = {
      createElement: () => ({
        getContext: () => ({
          fillRect: () => {},
          clearRect: () => {},
          getImageData: (x, y, w, h) => ({
            data: new Array(w * h * 4)
          }),
          putImageData: () => {},
          createImageData: () => ([]),
          setTransform: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          rotate: () => {},
          translate: () => {},
          transform: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          bezierCurveTo: () => {},
          closePath: () => {},
          stroke: () => {},
          fill: () => {},
          measureText: () => ({ width: 0 }),
          arc: () => {},
          setLineDash: () => {}
        }),
        setAttribute: () => {},
        width: 500,
        height: 250,
        toDataURL: () => 'data:image/png;base64,...'
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {}
      }
    };
    
    // Generate PDF with sample data
    const filename = 'test-rfq-analytics-report.pdf';
    const title = 'Test RFQ Analytics Report';
    
    // Skip charts since we're running in a Node.js environment
    console.log(`Generating PDF with filename: ${filename}`);
    const doc = generateRfqAnalyticsPdf(sampleData, title, filename);
    
    console.log('PDF generation successful!');
    console.log(`PDF would have been saved as: ${filename}`);
    console.log(`Total pages in the document: ${doc.internal.getNumberOfPages()}`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

// Run the test
runTest()
  .then(success => {
    if (success) {
      console.log('Test completed successfully!');
    } else {
      console.error('Test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });