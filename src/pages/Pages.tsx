import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Info, MessageCircle, Shield } from 'lucide-react';

export const About: React.FC = () => {
  const { settings } = useAppContext();
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <Info className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">About Us</h1>
        </div>
        <div className="prose prose-stone prose-lg max-w-none">
          <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
            {settings.aboutText}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Contact: React.FC = () => {
  const { settings } = useAppContext();
  
  const handleWhatsAppClick = () => {
    const formattedNumber = settings.contactWhatsApp.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center bg-emerald-100 p-4 rounded-full mb-6">
          <MessageCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-4">Contact Us</h1>
        <p className="text-stone-600 mb-8 max-w-md mx-auto">
          Have questions about our office wear collection or need help finding the perfect fit? We're here to help!
        </p>
        
        <button
          onClick={handleWhatsAppClick}
          className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-2xl transition-colors shadow-lg shadow-[#25D366]/20"
        >
          <MessageCircle className="h-6 w-6" />
          Chat on WhatsApp
        </button>
        <p className="mt-6 text-sm text-stone-500 font-mono">
          {settings.contactWhatsApp}
        </p>
      </div>
    </div>
  );
};

export const Privacy: React.FC = () => {
  const { settings } = useAppContext();
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-stone-100 p-3 rounded-2xl">
            <Shield className="h-8 w-8 text-stone-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Privacy Policy</h1>
        </div>
        <div className="prose prose-stone prose-lg max-w-none">
          <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
            {settings.privacyText}
          </p>
        </div>
      </div>
    </div>
  );
};
