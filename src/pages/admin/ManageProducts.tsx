import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Link as LinkIcon, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { suggestProductDetails } from '../../services/gemini';
import { resizeImage } from '../../utils/imageUtils';

export const ManageProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { formatPrice, isLoading: isCurrencyLoading } = useCurrency();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({ imageUrls: [] });
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    const images = formData.imageUrls || [];
    if (images.length === 0) {
      setAiError('Please upload or paste at least one image URL first.');
      return;
    }

    setIsGenerating(true);
    setAiError(null);
    try {
      let imageData = images[0];
      let mimeType = 'image/jpeg';

      // If it's a data URL, extract the base64 part
      if (imageData.startsWith('data:')) {
        const parts = imageData.split(',');
        mimeType = parts[0].split(':')[1].split(';')[0];
        imageData = parts[1];
      } else {
        throw new Error("AI suggestions require an uploaded image file. Please use the 'Add Image' button to upload a photo from your device.");
      }

      console.log("Requesting AI suggestion for product...");
      const suggestion = await suggestProductDetails(imageData, mimeType);
      console.log("AI suggestion received:", suggestion);
      
      setFormData(prev => ({
        ...prev,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category
      }));
    } catch (err: any) {
      console.error("AI Suggestion Error:", err);
      setAiError(err.message || 'Failed to generate suggestions. Please try again or check your internet connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setFormData({
      ...product,
      imageUrls: product.imageUrls || []
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.affiliateLink) {
      setSaveError('Please fill in all required fields.');
      return;
    }

    if (!formData.imageUrls || formData.imageUrls.length === 0) {
      setSaveError('Please add at least one image.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const { id, ...dataToSave } = formData;
    
    // Clean up empty strings for optional fields
    const cleanedData: any = { ...dataToSave };
    if (cleanedData.price === '') delete cleanedData.price;
    
    const finalData = {
      ...cleanedData,
      imageUrl: formData.imageUrls?.[0] || '',
      imageUrls: formData.imageUrls || [],
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditing) {
        await updateProduct(isEditing, finalData);
        setIsEditing(null);
      } else {
        await addProduct({ ...finalData, createdAt: new Date().toISOString() } as any);
        setIsAdding(false);
      }
      setFormData({ imageUrls: [] });
    } catch (err: any) {
      console.error("Save error:", err);
      let errorMessage = 'Failed to save product.';
      
      // Try to parse Firestore error if it's JSON
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error.includes('Missing or insufficient permissions')) {
          const email = parsed.authInfo?.email || 'not logged in';
          errorMessage = `Permission denied. You are logged in as ${email}. Please make sure this is the admin email (tersooaker@gmail.com).`;
        } else {
          errorMessage = `Database error: ${parsed.error}`;
        }
      } catch {
        // Not a JSON error, use raw message or generic size warning
        if (err.message?.includes('quota')) {
          errorMessage = 'Storage quota exceeded. Please try again later.';
        } else {
          errorMessage = 'Failed to save. This might be because the images are too large (max 1MB total) or there is a connection issue.';
        }
      }
      
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const addImageUrl = (url: string) => {
    if (!url) return;
    setFormData(prev => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), url]
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index)
    }));
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const renderForm = () => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 mb-8">
      <h3 className="text-xl font-bold text-stone-900 mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
          <input
            type="text"
            className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Classic Navy Blazer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
          <input
            type="text"
            className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Blazers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Price (Optional)</label>
          <input
            type="text"
            className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., $89.99"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">Product Images (Slideshow)</label>
          
          {/* Image Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {(formData.imageUrls || []).map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                <img 
                  src={url} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=Invalid+URL';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className={`cursor-pointer aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-stone-50 transition-all ${isResizing ? 'opacity-50 cursor-wait' : ''}`}>
              {isResizing ? (
                <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
              ) : (
                <Plus className="h-6 w-6 text-stone-400" />
              )}
              <span className="text-xs text-stone-500 mt-1">{isResizing ? 'Resizing...' : 'Add Image'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                disabled={isResizing}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsResizing(true);
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      try {
                        const resized = await resizeImage(reader.result as string);
                        addImageUrl(resized);
                      } catch (err) {
                        console.error("Resize error:", err);
                        addImageUrl(reader.result as string); // Fallback to original if resize fails
                      } finally {
                        setIsResizing(false);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex relative">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500">
                <LinkIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                id="url-input"
                className="flex-1 p-3 border border-stone-300 rounded-r-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="Or paste an image URL here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('url-input') as HTMLInputElement;
                addImageUrl(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 font-medium transition-colors"
            >
              Add URL
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={isGenerating || (formData.imageUrls || []).length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isGenerating ? 'Analyzing Image...' : '✨ AI Suggest Title & Description'}
            </button>
            {(formData.imageUrls || []).length === 0 && (
              <p className="mt-2 text-[10px] text-stone-400 text-center">Upload an image first to use AI suggestions</p>
            )}
            {aiError && <p className="mt-2 text-xs text-red-500 text-center">{aiError}</p>}
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
              value={formData.affiliateLink || ''}
              onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">This link will be hidden behind the "View Details" button.</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
          <textarea
            className="w-full p-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Short description of the product..."
          />
        </div>
      </div>
      {saveError && <p className="mt-4 text-sm text-red-500 text-center">{saveError}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => { setIsEditing(null); setIsAdding(false); setFormData({ imageUrls: [] }); setSaveError(null); }}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Manage Products</h2>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Use AI to generate titles and descriptions by uploading images
          </p>
        </div>
        {!isAdding && !isEditing && (
          <button
            onClick={() => { setIsAdding(true); setFormData({ imageUrls: [] }); }}
            className="bg-stone-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        )}
      </div>

      {(isAdding || isEditing) && renderForm()}

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden relative">
                        <img 
                          className="h-12 w-12 object-cover" 
                          src={product.imageUrls?.[0]} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                          }}
                        />
                        {product.imageUrls?.length > 1 && (
                          <div className="absolute bottom-0 right-0 bg-stone-900/70 text-white text-[8px] px-1 rounded-tl">
                            {product.imageUrls.length}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">{product.title}</div>
                        <div className="text-sm text-stone-500 truncate max-w-[200px]">{product.affiliateLink}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-100 text-stone-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {product.price ? (
                      isCurrencyLoading ? '...' : formatPrice(product.price)
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-2 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 mb-3">Delete Product</h3>
            <p className="text-stone-600 mb-8">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
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
