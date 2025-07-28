import { CategoryConfig } from '../types/rfq';

export const categories: CategoryConfig[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Agricultural equipment, fresh flowers, seeds, tractor parts, and farming supplies',
    icon: 'agriculture',
    subcategories: [
      'Agriculture Equipment',
      'Fresh Flowers',
      'Seeds & Saplings',
      'Tractor Parts',
      'Animal Feed',
      'Irrigation Systems',
      'Fertilizers & Pesticides',
      'Organic Farming Tools'
    ],
    mockupRFQs: [
      {
        category: 'agriculture',
        title: 'Bulk Tractor Parts Order',
        description: 'Looking for reliable supplier of tractor parts for agricultural machinery maintenance.',
        quantity: 500,
        unit: 'units',
        specifications: [
          'Genuine OEM parts',
          'Compatible with major tractor brands',
          'Minimum 1-year warranty',
          'Bulk packaging required'
        ],
        timeline: '2 months',
        budget: {
          min: 25000,
          max: 35000,
          currency: 'USD'
        },
        location: {
          country: 'India'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'apparel-fashion',
    name: 'Apparel & Fashion',
    description: 'Sarees, sunglasses, unisex clothing, and fashion accessories',
    icon: 'style',
    subcategories: [
      'Sarees',
      'Sunglasses',
      'Unisex Clothing',
      'Suitcases & Briefcases',
      'Footwear',
      'Textiles & Fabrics',
      'Sportswear',
      'Fashion Accessories'
    ],
    mockupRFQs: [
      {
        category: 'apparel-fashion',
        title: 'Bulk Saree Collection',
        description: 'Seeking premium quality sarees for retail chain expansion.',
        quantity: 1000,
        unit: 'pieces',
        specifications: [
          'Premium silk and cotton blend',
          'Traditional and contemporary designs',
          'Size range: 5.5m to 6.5m',
          'Quality certification required'
        ],
        timeline: '3 months',
        budget: {
          min: 50000,
          max: 75000,
          currency: 'USD'
        },
        location: {
          country: 'India'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Auto parts, commercial vehicles, and automotive accessories',
    icon: 'directions_car',
    subcategories: [
      'Auto Electrical Parts',
      'Engine Parts',
      'Commercial Vehicles',
      'Coach Building',
      'Car Accessories',
      'Tires & Tubes',
      'Lubricants & Greases'
    ],
    mockupRFQs: [
      {
        category: 'automobile',
        title: 'Commercial Vehicle Fleet',
        description: 'Bulk purchase of commercial vehicles for logistics operations.',
        quantity: 50,
        unit: 'vehicles',
        specifications: [
          'Load capacity: 5-7 tons',
          'Fuel efficient engines',
          'Standard safety features',
          'Warranty coverage required'
        ],
        timeline: '6 months',
        budget: {
          min: 2000000,
          max: 2500000,
          currency: 'USD'
        },
        location: {
          country: 'India'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    description: 'Custom manufacturing, industrial machinery, and electronic components',
    icon: 'factory',
    mockupRFQs: [
      {
        category: 'manufacturing',
        title: 'Custom Steel Fabrication',
        description: 'Looking for a reliable supplier for custom steel fabrication services. Monthly requirement of 50 tons.',
        quantity: 50,
        unit: 'tons',
        specifications: [
          'ASTM A36 steel grade',
          'Custom cutting and welding required',
          'ISO 9001 certified manufacturer',
          'Monthly delivery schedule'
        ],
        timeline: '3 months',
        budget: {
          min: 50000,
          max: 75000,
          currency: 'USD'
        },
        location: {
          country: 'United States',
          city: 'Chicago'
        },
        status: 'open'
      },
      {
        category: 'manufacturing',
        title: 'Industrial Machinery Parts',
        description: 'Bulk order of industrial machinery parts for manufacturing facility.',
        quantity: 500,
        unit: 'units',
        specifications: [
          'High precision machining required',
          'Stainless steel material',
          'Tolerance: ±0.01mm',
          'Surface finish: Ra 0.8'
        ],
        timeline: '2 months',
        budget: {
          min: 25000,
          max: 35000,
          currency: 'USD'
        },
        location: {
          country: 'Germany'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Software',
    description: 'Software development, IT infrastructure, and mobile applications',
    icon: 'computer',
    mockupRFQs: [
      {
        category: 'technology',
        title: 'Custom Software Development',
        description: 'Enterprise solution for inventory management and order processing.',
        quantity: 1,
        unit: 'project',
        specifications: [
          'Cloud-based solution',
          'Real-time inventory tracking',
          'Integration with existing ERP',
          'Mobile app support'
        ],
        timeline: '6 months',
        budget: {
          min: 100000,
          max: 150000,
          currency: 'USD'
        },
        location: {
          country: 'United Kingdom'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Medical equipment, pharmaceutical supplies, and healthcare IT',
    icon: 'medical_services',
    mockupRFQs: [
      {
        category: 'healthcare',
        title: 'Medical Equipment Procurement',
        description: 'Hospital-grade medical equipment for new healthcare facility.',
        quantity: 1,
        unit: 'set',
        specifications: [
          'FDA approved equipment',
          'Warranty period: 2 years',
          'Training included',
          'Installation support required'
        ],
        timeline: '3 months',
        budget: {
          min: 200000,
          max: 300000,
          currency: 'USD'
        },
        location: {
          country: 'Canada'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'food',
    name: 'Food & Agriculture',
    description: 'Organic produce, food processing equipment, and agricultural machinery',
    icon: 'agriculture',
    mockupRFQs: [
      {
        category: 'food',
        title: 'Organic Produce Supply',
        description: 'Regular supply of organic produce for restaurant chain.',
        quantity: 1000,
        unit: 'kg',
        specifications: [
          'Certified organic produce',
          'Weekly delivery schedule',
          'Temperature-controlled transport',
          'Quality inspection required'
        ],
        timeline: '12 months',
        budget: {
          min: 50000,
          max: 75000,
          currency: 'USD'
        },
        location: {
          country: 'Australia'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'construction',
    name: 'Construction & Real Estate',
    description: 'Construction materials, equipment rental, and architectural services',
    icon: 'construction',
    mockupRFQs: [
      {
        category: 'construction',
        title: 'Construction Materials',
        description: 'Bulk order of construction materials for large commercial project.',
        quantity: 1,
        unit: 'project',
        specifications: [
          'High-quality materials',
          'Certified suppliers only',
          'Just-in-time delivery',
          'Quality assurance required'
        ],
        timeline: '12 months',
        budget: {
          min: 1000000,
          max: 1500000,
          currency: 'USD'
        },
        location: {
          country: 'United Arab Emirates'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'textiles',
    name: 'Textiles & Fashion',
    description: 'Bulk fabric orders, garment manufacturing, and textile machinery',
    icon: 'style',
    mockupRFQs: [
      {
        category: 'textiles',
        title: 'Bulk Fabric Orders',
        description: 'Premium quality fabric for fashion brand collection.',
        quantity: 5000,
        unit: 'meters',
        specifications: [
          'Premium cotton blend',
          'Multiple color options',
          'Minimum order quantity: 1000m',
          'Quality certification required'
        ],
        timeline: '2 months',
        budget: {
          min: 25000,
          max: 35000,
          currency: 'USD'
        },
        location: {
          country: 'Italy'
        },
        status: 'open'
      }
    ]
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence & Automation Tools',
    description: 'AI software, robotics, machine learning tools, and automation solutions',
    icon: 'smart_toy',
    subcategories: [
      'AI Software',
      'Robotics',
      'Machine Learning Tools',
      'AI Hardware'
    ],
    mockupRFQs: [
      {
        category: 'artificial-intelligence',
        title: 'Enterprise AI Solution',
        description: 'Seeking comprehensive AI solution for business process automation.',
        quantity: 1,
        unit: 'solution',
        specifications: [
          'Custom AI model development',
          'Integration with existing systems',
          'Real-time data processing',
          '24/7 technical support'
        ],
        timeline: '12 months',
        budget: {
          min: 100000,
          max: 150000,
          currency: 'USD'
        },
        location: {
          country: 'Global'
        },
        status: 'open'
      }
    ]
  }
];

// Export a function to get all subcategories
export const getAllSubcategories = () => {
  return categories.flatMap(category => 
    category.subcategories.map(subcategory => ({
      id: `${category.id}-${subcategory.toLowerCase().replace(/\s+/g, '-')}`,
      name: subcategory,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
};

// Export a function to get category by ID
export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id);
};

// Export a function to get subcategories by category ID
export const getSubcategoriesByCategoryId = (categoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
}; 