import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export const ManageProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const { formatPrice, isLoading: isCurrencyLoading } = useCurrency();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setFormData(product);
  };

  const handleSave = () => {
    if (isEditing) {
      updateProduct(isEditing, formData);
      setIsEditing(null);
    } else {
      addProduct(formData as Omit<Product, 'id'>);
      setIsAdding(false);
    }
    setFormData({});
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
          <label className="block text-sm font-medium text-stone-700 mb-2">Product Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-stone-50">
            <div className="space-y-1 text-center w-full">
              {formData.imageUrl ? (
                <div className="relative inline-block">
                  <img src={formData.imageUrl} alt="Preview" className="mx-auto h-48 object-cover rounded-lg shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 shadow-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-stone-400 mb-3" />
                  <div className="flex text-sm text-stone-600 justify-center items-center gap-1">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-3 py-1 border border-emerald-200 shadow-sm transition-colors"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex relative">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500">
              <LinkIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              className="flex-1 p-3 border border-stone-300 rounded-r-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Or paste an image URL here..."
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
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => { setIsEditing(null); setIsAdding(false); setFormData({}); }}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Product
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Manage Products</h2>
        {!isAdding && !isEditing && (
          <button
            onClick={() => { setIsAdding(true); setFormData({}); }}
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
                      <div className="h-12 w-12 flex-shrink-0">
                        <img className="h-12 w-12 rounded-lg object-cover" src={product.imageUrl} alt="" />
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
