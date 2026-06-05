import React, { useEffect, useState } from 'react';
import { Sparkles, Package } from 'lucide-react';
import { productsAPI, recommendationsAPI } from '../services/api';
import { Product } from '../types';
import { Button, LoadingSpinner, Alert, EmptyState, Badge } from '../components/UI';

const ProductCard: React.FC<{ product: Product; onClick?: () => void; isSelected?: boolean }> = ({
  product, onClick, isSelected
}) => (
  <div
    onClick={onClick}
    className={`
      bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all duration-200 overflow-hidden
      ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
      ${isSelected ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' : 'border-gray-100 dark:border-gray-700'}
    `}
  >
    {/* Image */}
    <div className="h-40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center overflow-hidden">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-4xl opacity-40">
          {product.category === 'Dresses' ? '👗' :
           product.category === 'Shoes' ? '👠' :
           product.category === 'Bags' ? '👜' :
           product.category === 'Accessories' ? '💍' : '🛍️'}
        </span>
      )}
    </div>

    <div className="p-3">
      <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{product.name}</p>
      {product.category && (
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{product.category}</p>
      )}
      {product.color && (
        <p className="text-xs text-gray-400 capitalize mt-0.5">Color: {product.color}</p>
      )}
      {product.tags && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {product.tags.split(',').slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-500 px-1.5 py-0.5 rounded-full">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      <p className="text-base font-bold text-gray-900 dark:text-white mt-2">${product.price.toFixed(2)}</p>
    </div>
  </div>
);

export const RecommendationsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productsAPI.list({ limit: 100 }).then((res) => {
      setProducts(res.data);
    }).catch(() => {
      setError('Failed to load products');
    }).finally(() => {
      setLoadingProducts(false);
    });
  }, []);

  const selectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setRecommendations([]);
    setLoadingRecs(true);
    setError('');
    try {
      const res = await recommendationsAPI.get(product.id, 6);
      setRecommendations(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to fetch recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={22} className="text-purple-500" />
          AI Product Recommendations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select any product to discover similar items using AI-powered cosine similarity on category, tags, color, description, and price range.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
          <Sparkles size={16} /> How the AI Works
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-gray-600 dark:text-gray-400">
          {['Category Weight ×3', 'Tags Weight ×2', 'Color Weight ×2', 'Price Range Bucket'].map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm">
              <span className="font-medium text-purple-600 dark:text-purple-400">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          TF-IDF vectors are built from product features, then cosine similarity finds the most similar products. No purchase history required.
        </p>
      </div>

      {loadingProducts ? (
        <LoadingSpinner text="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState icon={<Package size={28} />} title="No products available" description="Add products to enable AI recommendations" />
      ) : (
        <>
          {/* Product grid to select from */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Select a product to get recommendations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => selectProduct(p)}
                  isSelected={selectedProduct?.id === p.id}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {selectedProduct && (
            <div className="fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent" />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Sparkles size={14} />
                  Similar to "{selectedProduct.name}"
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent" />
              </div>

              {loadingRecs ? (
                <LoadingSpinner text="Finding similar products…" />
              ) : recommendations.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">No similar products found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add more products with similar categories, tags, or colors to improve recommendations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {recommendations.map((p) => (
                    <ProductCard key={p.id} product={p} onClick={() => selectProduct(p)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
