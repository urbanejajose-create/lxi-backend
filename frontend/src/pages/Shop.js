import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import ProductCard from '../components/products/ProductCard';
import { productService } from '../services/api';
import { useSiteContent } from '../context/SiteContentContext';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const { globalContent } = useSiteContent();

  const categories = ['ALL', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const requestedCategory = (searchParams.get('category') || 'ALL').toUpperCase();
    setSelectedCategory(requestedCategory);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'ALL') {
      setSearchParams({});
      return;
    }
    setSearchParams({ category });
  };

  return (
    <div className="bg-[#0a0e17] min-h-screen pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-[#f5f5f0] font-serif text-4xl sm:text-5xl lg:text-6xl font-light">
            {globalContent.shop_title}
          </h1>
          <p className="micro-label mt-4">
            {globalContent.shop_count_label_template.replace('{count}', filteredProducts.length)}
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a2332] border-[#2a3444] text-[#f5f5f0] placeholder-[#5a6a7a]"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-6 mb-12 border-b border-[#2a3444] pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`text-[11px] tracking-[0.2em] font-sans transition-colors duration-300 ${
                selectedCategory === category
                  ? 'text-[#d4af37]'
                  : 'text-[#8a8a8a] hover:text-[#f5f5f0]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Price Range */}
        <div className="mb-8 pb-6 border-b border-[#2a3444]">
          <label className="text-[#b0b0b0] text-sm mb-3 block">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="flex-1"
              style={{ accentColor: '#C9A961' }}
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="flex-1"
              style={{ accentColor: '#C9A961' }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center text-[#b0b0b0]">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-[#b0b0b0] py-12">
            {globalContent.shop_empty_text}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Drop Banner */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-24 py-12 border-t border-b border-[#d4af37] text-center">
            <span className="micro-label">{globalContent.shop_banner_label}</span>
            <p className="text-[#8a8a8a] text-sm mt-4 tracking-wider">
              {globalContent.shop_banner_text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
