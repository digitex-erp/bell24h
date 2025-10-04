'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Edit2, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  product_name: string;
  description?: string;
  image_urls?: string[];
  price_range?: string;
  moq?: string;
  unit?: string;
  is_featured?: boolean;
}

interface ProductShowcaseGridProps {
  products: Product[];
  supplierId: string;
  isOwner: boolean;
  categoryPlaceholder?: string;
}

export default function ProductShowcaseGrid({
  products,
  supplierId,
  isOwner,
  categoryPlaceholder = 'Product',
}: ProductShowcaseGridProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Generate placeholder image based on category
  const getPlaceholderImage = (productName: string) => {
    // Map category to placeholder images
    const placeholders: Record<string, string> = {
      'Textiles': '/placeholders/textiles.jpg',
      'Electronics': '/placeholders/electronics.jpg',
      'Chemicals': '/placeholders/chemicals.jpg',
      'Machinery': '/placeholders/machinery.jpg',
      'Food': '/placeholders/food.jpg',
      'default': '/placeholders/product-default.jpg',
    };

    return placeholders[categoryPlaceholder] || placeholders.default;
  };

  // Fill empty slots with placeholder products
  const displayProducts = [...products];
  while (displayProducts.length < 12) {
    displayProducts.push({
      id: `placeholder-${displayProducts.length}`,
      product_name: `Add ${categoryPlaceholder} ${displayProducts.length + 1}`,
      description: 'Click to add product details',
      image_urls: [],
      price_range: 'Contact for pricing',
      moq: 'TBD',
      unit: 'piece',
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {displayProducts.slice(0, 12).map((product) => {
        const isPlaceholder = product.id.startsWith('placeholder-');
        const productImage = product.image_urls?.[0] || getPlaceholderImage(product.product_name);

        return (
          <Card
            key={product.id}
            className={cn(
              "group relative overflow-hidden hover:shadow-lg transition-all duration-300",
              isPlaceholder && isOwner && "border-dashed border-2 cursor-pointer hover:border-blue-500",
              product.is_featured && "ring-2 ring-blue-500"
            )}
          >
            {/* Featured Badge */}
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 z-10 bg-blue-500">
                Featured
              </Badge>
            )}

            {/* Edit Button for Owners */}
            {isOwner && !isPlaceholder && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingProduct(product.id)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}

            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
              {!isPlaceholder ? (
                <Image
                  src={productImage}
                  alt={product.product_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Package className="h-12 w-12 text-gray-400 mb-2" />
                  {isOwner && (
                    <Upload className="h-6 w-6 text-gray-500" />
                  )}
                </div>
              )}
              
              {/* Upload overlay for owners */}
              {isOwner && !product.image_urls?.length && !isPlaceholder && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {product.product_name}
              </h3>
              
              {!isPlaceholder && (
                <>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-1">
                    {product.price_range && (
                      <p className="text-sm">
                        <span className="text-gray-500">Price:</span>{' '}
                        <span className="font-medium">{product.price_range}</span>
                      </p>
                    )}
                    {product.moq && (
                      <p className="text-sm">
                        <span className="text-gray-500">MOQ:</span>{' '}
                        <span className="font-medium">{product.moq} {product.unit}</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {isPlaceholder && isOwner && (
                <p className="text-sm text-gray-500 mt-2">
                  Click to add product
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
