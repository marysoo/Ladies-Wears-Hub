import React, { useState, useMemo } from 'react';
import { Search, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { products, coupons } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleBuyClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-4">
          Elevate Your <span className="text-emerald-600">Office Wardrobe</span>
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Discover curated professional attire, from classic blazers to elegant office dresses. Look confident and feel comfortable all day long.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-12 space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-stone-200 rounded-2xl leading-5 bg-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
            placeholder="Search for blazers, skirts, dresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Active Deals Section */}
      {coupons.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-stone-900">Exclusive Deals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">{coupon.title}</h3>
                <p className="text-emerald-700 mb-4 flex-grow">{coupon.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-mono bg-white px-3 py-1 rounded-md text-emerald-800 font-bold border border-emerald-200">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleBuyClick(coupon.link)}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Get Deal <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            Featured Collection
          </h2>
          <span className="text-sm text-stone-500">{filteredProducts.length} items found</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
            <Search className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-1">No products found</h3>
            <p className="text-stone-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col">
                <div className="aspect-[4/5] overflow-hidden bg-stone-100 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-stone-800 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-stone-900 leading-tight">{product.title}</h3>
                    {product.price && (
                      <span className="font-semibold text-emerald-700">{product.price}</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 mb-6 line-clamp-2 flex-grow">{product.description}</p>
                  
                  {/* Affiliate link hidden behind button */}
                  <button
                    onClick={() => handleBuyClick(product.affiliateLink)}
                    className="w-full bg-stone-900 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-auto"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
