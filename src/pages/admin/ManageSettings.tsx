import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SiteSettings } from '../../types';
import { Save, CheckCircle2 } from 'lucide-react';

export const ManageSettings: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Site Settings</h2>
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {isSaved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {isSaved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-8">
        <div>
          <label className="block text-lg font-bold text-stone-900 mb-2">About Us Content</label>
          <p className="text-sm text-stone-500 mb-4">This text will appear on the About Us page.</p>
          <textarea
            className="w-full p-4 border border-stone-300 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 min-h-[150px]"
            value={formData.aboutText}
            onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
            placeholder="Write about your brand..."
          />
        </div>

        <div className="pt-8 border-t border-stone-100">
          <label className="block text-lg font-bold text-stone-900 mb-2">WhatsApp Contact Number</label>
          <p className="text-sm text-stone-500 mb-4">Include country code (e.g., +1234567890). Used for the Contact page button.</p>
          <input
            type="text"
            className="w-full md:w-1/2 p-4 border border-stone-300 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            value={formData.contactWhatsApp}
            onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
            placeholder="+1234567890"
          />
        </div>

        <div className="pt-8 border-t border-stone-100">
          <label className="block text-lg font-bold text-stone-900 mb-2">Privacy Policy Content</label>
          <p className="text-sm text-stone-500 mb-4">This text will appear on the Privacy page.</p>
          <textarea
            className="w-full p-4 border border-stone-300 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500 min-h-[150px]"
            value={formData.privacyText}
            onChange={(e) => setFormData({ ...formData, privacyText: e.target.value })}
            placeholder="Write your privacy policy..."
          />
        </div>
      </div>
    </div>
  );
};
