import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Coupon } from '../../types';
import { Plus, Trash2, Save, Tag, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react';
import { suggestCouponDetails } from '../../services/gemini';

export const ManageDeals: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({});
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    if (!formData.link) {
      setAiError('Please enter an affiliate link first so I know which store to analyze.');
      return;
    }

    setIsGenerating(true);
    setAiError(null);
    try {
      // Extract store name from link if possible, or just use a generic prompt
      let storeName = 'this store';
      try {
        const url = new URL(formData.link);
        storeName = url.hostname.replace('www.', '').split('.')[0];
      } catch (e) {
        // Fallback to generic
      }

      const discountType = formData.code ? `using code ${formData.code}` : 'general discount';
      const suggestion = await suggestCouponDetails(storeName, discountType);
      
      setFormData(prev => ({
        ...prev,
        title: suggestion.title,
        description: suggestion.description
      }));
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    addCoupon(formData as Omit<Coupon, 'id'>);
    setIsAdding(false);
    setFormData({});
  };

  const confirmDelete = () => {
    if (dealToDelete) {
      deleteCoupon(dealToDelete);
      setDealToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Manage Deals & Coupons</h2>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Use AI to generate catchy titles and SEO descriptions for your deals
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-stone-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Deal
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 mb-8">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Add New Deal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Coupon Code</label>
              <div className="flex relative">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500">
                  <Tag className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  className="flex-1 p-3 border border-stone-300 rounded-r-xl focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., SAVE20"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">Affiliate Link</label>
              <div className="flex relative">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  className="flex-1 p-3 border border-stone-300 rounded-r-xl focus:ring-emerald-500 focus:border-emerald-500"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the deal..."
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isGenerating || !formData.link}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {isGenerating ? 'Generating Catchy Content...' : '✨ AI Suggest Title & Description'}
              </button>
              {!formData.link && (
                <p className="mt-2 text-[10px] text-stone-400 text-center">Enter a link first to use AI suggestions</p>
              )}
              {aiError && <p className="mt-2 text-xs text-red-500 text-center">{aiError}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Deal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-stone-900">{coupon.title}</h3>
              <button
                onClick={() => setDealToDelete(coupon.id)}
                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-stone-600 mb-4 flex-grow">{coupon.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
              <span className="font-mono bg-emerald-50 px-3 py-1 rounded-md text-emerald-800 font-bold border border-emerald-100">
                {coupon.code}
              </span>
              <span className="text-sm text-stone-500 truncate max-w-[150px]" title={coupon.link}>
                {coupon.link}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {dealToDelete && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 mb-3">Delete Deal</h3>
            <p className="text-stone-600 mb-8">Are you sure you want to delete this deal? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDealToDelete(null)}
                className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
