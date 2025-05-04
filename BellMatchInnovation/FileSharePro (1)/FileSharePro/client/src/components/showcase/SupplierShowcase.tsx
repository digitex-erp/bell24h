
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { subscriptionPlanFeatures } from '../../../shared/schema';

interface Product {
  id: number;
  name: string;
  description: string; 
  price: number;
  category: string;
  imageUrl?: string;
  isFeatured: boolean;
}

interface SupplierProfile {
  id: number;
  name: string;
  description: string;
  subscriptionTier: keyof typeof subscriptionPlanFeatures;
  productCount: number;
  featuredProductCount: number;
}

export function SupplierShowcase({ supplierId }: { supplierId: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplierData();
  }, [supplierId]);

  const fetchSupplierData = async () => {
    try {
      const profileRes = await fetch(`/api/showcase/${supplierId}`);
      const profileData = await profileRes.json();
      setProfile(profileData.profile);
      setProducts(profileData.products);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load supplier showcase",
        variant: "destructive"
      });
    }
  };

  const handleAddProduct = async () => {
    if (!canAddMoreProducts()) {
      toast({
        title: "Subscription Limit Reached",
        description: `Upgrade your plan to add more products. Current limit: ${subscriptionPlanFeatures[profile?.subscriptionTier || 'free'].productLimit}`,
        variant: "warning"
      });
      return;
    }
    // Add product implementation
  };

  const handleFeatureProduct = async (productId: number) => {
    if (!canFeatureProduct()) {
      toast({
        title: "Feature Limit Reached",
        description: `Upgrade your plan to feature more products. Current limit: ${subscriptionPlanFeatures[profile?.subscriptionTier || 'free'].featuredProducts}`,
        variant: "warning"
      });
      return;
    }
    // Feature product implementation
  };

  const canAddMoreProducts = () => {
    if (!profile) return false;
    const tier = profile.subscriptionTier;
    return profile.productCount < subscriptionPlanFeatures[tier].productLimit;
  };

  const canFeatureProduct = () => {
    if (!profile) return false;
    const tier = profile.subscriptionTier;
    return profile.featuredProductCount < subscriptionPlanFeatures[tier].featuredProducts;
  };

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return a.name.localeCompare(b.name);
    });
  };

  const filterProducts = (products: Product[]) => {
    if (filterCategory === 'all') return products;
    return products.filter(p => p.category === filterCategory);
  };

  return (
    <div className="container mx-auto p-4">
      {profile && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-600">{profile.description}</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm">Products: {profile.productCount} / {subscriptionPlanFeatures[profile.subscriptionTier].productLimit}</p>
            <p className="text-sm">Featured Products: {profile.featuredProductCount} / {subscriptionPlanFeatures[profile.subscriptionTier].featuredProducts}</p>
            <p className="text-sm text-blue-600">{profile.subscriptionTier.charAt(0).toUpperCase() + profile.subscriptionTier.slice(1)} Plan</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <Select defaultValue={sortBy} onValueChange={setSortBy}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="featured">Sort by Featured</option>
        </Select>

        <Select defaultValue={filterCategory} onValueChange={setFilterCategory}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
        </Select>

        <Button onClick={handleAddProduct} disabled={!canAddMoreProducts()}>
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filterProducts(sortProducts(products)).map((product) => (
          <Card key={product.id} className={`overflow-hidden ${product.isFeatured ? 'ring-2 ring-blue-500' : ''}`}>
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              {product.isFeatured && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Featured</span>
              )}
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-4">₹{product.price}</p>
              <div className="flex gap-2">
                <Button variant="outline">View Details</Button>
                <Button 
                  onClick={() => handleFeatureProduct(product.id)}
                  disabled={!canFeatureProduct() || product.isFeatured}
                >
                  {product.isFeatured ? 'Featured' : 'Feature Product'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
