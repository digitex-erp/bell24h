import React from 'react';
import { useLocation } from 'wouter';
import { 
  ShoppingBag, 
  Truck, 
  Cpu, 
  Hammer, 
  Leaf, 
  Pill, 
  Shirt, 
  Wrench 
} from 'lucide-react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Components, devices & equipment',
    icon: <Cpu size={28} />,
    color: '#0077b6'
  },
  {
    id: 'machinery',
    name: 'Machinery',
    description: 'Industrial & manufacturing',
    icon: <Wrench size={28} />,
    color: '#00b4d8'
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Materials & equipment',
    icon: <Hammer size={28} />,
    color: '#0096c7'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Transportation & shipping',
    icon: <Truck size={28} />,
    color: '#48cae4'
  },
  {
    id: 'textiles',
    name: 'Textiles',
    description: 'Fabrics & garments',
    icon: <Shirt size={28} />,
    color: '#90e0ef'
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    description: 'Medicines & healthcare',
    icon: <Pill size={28} />,
    color: '#ade8f4'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Farming & food production',
    icon: <Leaf size={28} />,
    color: '#caf0f8'
  },
  {
    id: 'retail',
    name: 'Retail',
    description: 'Consumer goods & products',
    icon: <ShoppingBag size={28} />,
    color: '#023e8a'
  }
];

const ProductCategories: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleCategoryClick = (categoryId: string) => {
    setLocation(`/category/${categoryId}`);
  };

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <p className="section-subtitle">Find suppliers and RFQs in your industry</p>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <div className="category-icon" style={{ backgroundColor: `${category.color}15` }}>
                {category.icon}
              </div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
