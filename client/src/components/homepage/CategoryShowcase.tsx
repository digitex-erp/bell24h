'use client';

import { useState } from 'react';

interface Category {
  name: string;
  suppliers: number;
  subcategories: string[];
  icon: string;
}

interface CategoryGroup {
  title: string;
  categories: Category[];
}

const categoryData: CategoryGroup[] = [
  {
    title: "Raw Materials & Metals",
    categories: [
      { name: "Steel & Metals", suppliers: 1200, subcategories: ["TMT Bars", "Steel Sheets", "Aluminum", "Copper", "Brass"], icon: "🔩" },
      { name: "Construction Materials", suppliers: 800, subcategories: ["Cement", "Bricks", "Sand", "Tiles", "Pipes"], icon: "🏗️" },
      { name: "Chemicals & Polymers", suppliers: 950, subcategories: ["Industrial Chemicals", "Plastics", "Rubber", "Adhesives"], icon: "🧪" },
      { name: "Textiles & Fabrics", suppliers: 1100, subcategories: ["Cotton", "Synthetic", "Wool", "Silk", "Jute"], icon: "🧵" },
      { name: "Paper & Packaging", suppliers: 650, subcategories: ["Corrugated", "Kraft Paper", "Labels", "Tapes"], icon: "📦" }
    ]
  },
  {
    title: "Industrial Equipment",
    categories: [
      { name: "Manufacturing Machinery", suppliers: 1500, subcategories: ["CNC Machines", "Lathes", "Mills", "Presses"], icon: "⚙️" },
      { name: "Automation & Robotics", suppliers: 750, subcategories: ["Robotic Arms", "Sensors", "Controllers", "Vision Systems"], icon: "🤖" },
      { name: "Power & Energy", suppliers: 900, subcategories: ["Generators", "Transformers", "Solar Panels", "Batteries"], icon: "⚡" },
      { name: "HVAC & Climate Control", suppliers: 600, subcategories: ["Air Conditioners", "Ventilation", "Heating", "Cooling"], icon: "❄️" },
      { name: "Material Handling", suppliers: 850, subcategories: ["Conveyors", "Cranes", "Forklifts", "Hoists"], icon: "🏗️" }
    ]
  },
  {
    title: "Electronics & Technology",
    categories: [
      { name: "Electronic Components", suppliers: 1800, subcategories: ["Semiconductors", "Resistors", "Capacitors", "PCBs"], icon: "🔌" },
      { name: "Computing & IT", suppliers: 1200, subcategories: ["Servers", "Laptops", "Networking", "Storage"], icon: "💻" },
      { name: "Telecommunications", suppliers: 700, subcategories: ["Mobile Devices", "Network Equipment", "Satellite", "Fiber Optics"], icon: "📱" },
      { name: "IoT & Smart Devices", suppliers: 550, subcategories: ["Sensors", "Controllers", "Smart Home", "Wearables"], icon: "🌐" },
      { name: "Audio & Video", suppliers: 400, subcategories: ["Speakers", "Microphones", "Cameras", "Displays"], icon: "📺" }
    ]
  },
  {
    title: "Automotive & Transportation",
    categories: [
      { name: "Automotive Parts", suppliers: 1600, subcategories: ["Engine Parts", "Brake Systems", "Suspension", "Electrical"], icon: "🚗" },
      { name: "Commercial Vehicles", suppliers: 450, subcategories: ["Trucks", "Buses", "Tractors", "Trailers"], icon: "🚛" },
      { name: "Aerospace & Aviation", suppliers: 300, subcategories: ["Aircraft Parts", "Avionics", "Ground Support", "Simulation"], icon: "✈️" },
      { name: "Marine & Shipping", suppliers: 250, subcategories: ["Ship Parts", "Navigation", "Safety Equipment", "Port Machinery"], icon: "🚢" },
      { name: "Railway Equipment", suppliers: 180, subcategories: ["Locomotives", "Coaches", "Signaling", "Track Equipment"], icon: "🚆" }
    ]
  },
  {
    title: "Healthcare & Medical",
    categories: [
      { name: "Medical Devices", suppliers: 800, subcategories: ["Diagnostic Equipment", "Surgical Tools", "Monitoring", "Therapy"], icon: "🏥" },
      { name: "Pharmaceuticals", suppliers: 1200, subcategories: ["Active Ingredients", "Excipients", "Formulations", "Packaging"], icon: "💊" },
      { name: "Laboratory Equipment", suppliers: 600, subcategories: ["Analytical Instruments", "Glassware", "Reagents", "Safety"], icon: "🧬" },
      { name: "Dental Equipment", suppliers: 350, subcategories: ["Dental Chairs", "Handpieces", "Imaging", "Sterilization"], icon: "🦷" },
      { name: "Veterinary Supplies", suppliers: 280, subcategories: ["Animal Health", "Surgical Equipment", "Diagnostics", "Medicines"], icon: "🐾" }
    ]
  },
  {
    title: "Food & Agriculture",
    categories: [
      { name: "Agricultural Machinery", suppliers: 950, subcategories: ["Tractors", "Harvesters", "Irrigation", "Processing"], icon: "🚜" },
      { name: "Food Processing", suppliers: 1100, subcategories: ["Baking Equipment", "Packaging", "Refrigeration", "Quality Control"], icon: "🍞" },
      { name: "Beverage Production", suppliers: 650, subcategories: ["Brewing", "Bottling", "Filtration", "Carbonation"], icon: "🍺" },
      { name: "Dairy Equipment", suppliers: 420, subcategories: ["Milking Machines", "Pasteurization", "Cheese Making", "Storage"], icon: "🥛" },
      { name: "Seeds & Fertilizers", suppliers: 780, subcategories: ["Hybrid Seeds", "Organic Fertilizers", "Pesticides", "Growth Promoters"], icon: "🌱" }
    ]
  },
  {
    title: "Textiles & Apparel",
    categories: [
      { name: "Fabric Manufacturing", suppliers: 1400, subcategories: ["Cotton", "Synthetic", "Wool", "Silk", "Blends"], icon: "🧵" },
      { name: "Garment Production", suppliers: 2200, subcategories: ["Cutting", "Sewing", "Finishing", "Quality Control"], icon: "👕" },
      { name: "Footwear & Leather", suppliers: 850, subcategories: ["Shoes", "Bags", "Belts", "Accessories"], icon: "👟" },
      { name: "Home Textiles", suppliers: 720, subcategories: ["Bedding", "Curtains", "Towels", "Carpets"], icon: "🛏️" },
      { name: "Technical Textiles", suppliers: 380, subcategories: ["Industrial Fabrics", "Medical Textiles", "Sports", "Protective"], icon: "🛡️" }
    ]
  },
  {
    title: "Construction & Real Estate",
    categories: [
      { name: "Building Materials", suppliers: 1800, subcategories: ["Cement", "Steel", "Bricks", "Tiles", "Paints"], icon: "🏠" },
      { name: "Construction Equipment", suppliers: 1200, subcategories: ["Excavators", "Cranes", "Concrete Mixers", "Scaffolding"], icon: "🏗️" },
      { name: "Electrical & Plumbing", suppliers: 950, subcategories: ["Wiring", "Switches", "Pipes", "Fittings"], icon: "🔌" },
      { name: "Interior Design", suppliers: 680, subcategories: ["Furniture", "Lighting", "Flooring", "Decor"], icon: "🪑" },
      { name: "Smart Building", suppliers: 320, subcategories: ["Automation", "Security", "Energy Management", "IoT"], icon: "🏢" }
    ]
  },
  {
    title: "Energy & Utilities",
    categories: [
      { name: "Renewable Energy", suppliers: 850, subcategories: ["Solar Panels", "Wind Turbines", "Biomass", "Hydroelectric"], icon: "☀️" },
      { name: "Oil & Gas Equipment", suppliers: 650, subcategories: ["Drilling", "Refining", "Storage", "Transportation"], icon: "⛽" },
      { name: "Nuclear Power", suppliers: 120, subcategories: ["Reactors", "Safety Systems", "Waste Management", "Monitoring"], icon: "⚛️" },
      { name: "Water Treatment", suppliers: 480, subcategories: ["Filtration", "Purification", "Desalination", "Wastewater"], icon: "💧" },
      { name: "Waste Management", suppliers: 350, subcategories: ["Recycling", "Incineration", "Composting", "Landfill"], icon: "♻️" }
    ]
  },
  {
    title: "Defense & Security",
    categories: [
      { name: "Military Equipment", suppliers: 280, subcategories: ["Weapons", "Armor", "Communication", "Surveillance"], icon: "🛡️" },
      { name: "Cybersecurity", suppliers: 420, subcategories: ["Firewalls", "Encryption", "Threat Detection", "Compliance"], icon: "🔒" },
      { name: "Surveillance Systems", suppliers: 380, subcategories: ["Cameras", "Sensors", "Analytics", "Storage"], icon: "📹" },
      { name: "Access Control", suppliers: 290, subcategories: ["Biometrics", "Card Readers", "Gates", "Software"], icon: "🚪" },
      { name: "Emergency Response", suppliers: 180, subcategories: ["Fire Safety", "Medical Equipment", "Communication", "Vehicles"], icon: "🚨" }
    ]
  }
];

export default function CategoryShowcase() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const totalSuppliers = categoryData.reduce((sum, group) => 
    sum + group.categories.reduce((groupSum, cat) => groupSum + cat.suppliers, 0), 0
  );

  const displayedGroups = showAll ? categoryData : categoryData.slice(0, 3);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete B2B Marketplace
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Discover 51+ categories with <span className="font-semibold text-blue-600">{totalSuppliers.toLocaleString()}+ verified suppliers</span>
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Verified Suppliers
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Quality Assured
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              GST Compliant
            </div>
          </div>
        </div>

        {/* Category Groups */}
        <div className="space-y-8">
          {displayedGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">{group.title}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {group.categories.length} Categories
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {group.categories.map((category, catIndex) => (
                  <div key={catIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {category.suppliers.toLocaleString()}+ suppliers
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                        <div key={subIndex} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {sub}
                        </div>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className="text-xs text-blue-600">
                          +{category.subcategories.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            {showAll ? 'Show Less Categories' : `Show All ${categoryData.length} Categories`}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{categoryData.length}</div>
            <div className="text-gray-600">Business Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalSuppliers.toLocaleString()}+</div>
            <div className="text-gray-600">Verified Suppliers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">₹500Cr+</div>
            <div className="text-gray-600">Monthly Trade Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
} 