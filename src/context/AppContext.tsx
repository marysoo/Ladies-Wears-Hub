import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon, SiteSettings } from '../types';

interface AppContextType {
  products: Product[];
  coupons: Coupon[];
  settings: SiteSettings;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  deleteCoupon: (id: string) => void;
  updateSettings: (settings: Partial<SiteSettings>) => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const defaultProducts: Product[] = [
  {
    id: '1',
    title: 'Classic Navy Blazer',
    description: 'A tailored navy blazer perfect for any professional setting. Features a structured fit and premium fabric.',
    category: 'Blazers',
    imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=800',
    affiliateLink: 'https://example.com/affiliate/blazer-1',
    price: '$89.99'
  },
  {
    id: '2',
    title: 'Elegant Pencil Skirt',
    description: 'High-waisted pencil skirt in charcoal grey. Comfortable stretch material ideal for long office hours.',
    category: 'Office Outfit',
    imageUrl: 'https://images.unsplash.com/photo-1582533561751-07168481d31c?auto=format&fit=crop&q=80&w=800',
    affiliateLink: 'https://example.com/affiliate/skirt-1',
    price: '$45.00'
  },
  {
    id: '3',
    title: 'Silk Blouse',
    description: 'Breathable silk blouse in ivory. A staple for every professional wardrobe.',
    category: 'Office Dress',
    imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800',
    affiliateLink: 'https://example.com/affiliate/blouse-1',
    price: '$65.00'
  }
];

const defaultCoupons: Coupon[] = [
  {
    id: '1',
    title: 'Summer Office Sale',
    code: 'OFFICE20',
    link: 'https://example.com/sale',
    description: 'Get 20% off all blazers and skirts this summer.'
  }
];

const defaultSettings: SiteSettings = {
  aboutText: 'Welcome to Office Wear Affiliate Hub. We curate the best professional attire for women, helping you look your best in the workplace.',
  contactWhatsApp: '+1234567890',
  privacyText: 'We respect your privacy. This site uses affiliate links to support our curation efforts. We do not sell your personal data.'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('coupons');
    return saved ? JSON.parse(saved) : defaultCoupons;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addCoupon = (coupon: Omit<Coupon, 'id'>) => {
    setCoupons([...coupons, { ...coupon, id: Date.now().toString() }]);
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const login = (password: string) => {
    // Simple mock authentication for demo
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AppContext.Provider value={{
      products, coupons, settings,
      addProduct, updateProduct, deleteProduct,
      addCoupon, deleteCoupon,
      updateSettings,
      isAdmin, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
