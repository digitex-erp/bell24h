import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiExternalLink, FiInfo } from 'react-icons/fi';

interface Product {
  name: string;
  score: number;
  imageUri?: string;
  price?: string;
  description?: string;
  referenceUrl?: string;
}

interface ProductResultsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  className?: string;
}

const ProductResults: React.FC<ProductResultsProps> = ({
  products,
  onSelectProduct,
  className = '',
}) => {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t('rfq.noProductsFound')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('rfq.tryDifferentImage')}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">
        {t('rfq.detectedProducts')}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center">
                {product.imageUri ? (
                  <img
                    src={product.imageUri}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <FiShoppingCart className="text-gray-400" />
                  </div>
                )}
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h4>
                  {product.price && (
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {product.price}
                    </p>
                  )}
                  {product.score && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${product.score * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('rfq.confidence')}: {Math.round(product.score * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('rfq.selectProduct')}
                </button>
                {product.referenceUrl && (
                  <a
                    href={product.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center py-2 px-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductResults;
