import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon, SiteSettings } from '../types';
import { db, auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface AppContextType {
  products: Product[];
  coupons: Coupon[];
  settings: SiteSettings;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  isAdmin: boolean;
  isAuthReady: boolean;
  login: () => Promise<boolean>;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  aboutText: 'Welcome to Office Wear Affiliate Hub. We curate the best professional attire for women, helping you look your best in the workplace.',
  contactWhatsApp: '+1234567890',
  privacyText: 'We respect your privacy. This site uses affiliate links to support our curation efforts. We do not sell your personal data.'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AppProvider initializing");
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check for redirect result on mount
    getRedirectResult(auth).then((result) => {
      if (result) {
        const adminEmails = ['tersooaker@gmail.com'];
        if (result.user.email && adminEmails.includes(result.user.email)) {
          setIsAdmin(true);
        }
      }
    }).catch((error) => {
      console.error("Redirect login failed", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Authorized admin emails
      const adminEmails = ['tersooaker@gmail.com'];
      
      if (user && adminEmails.includes(user.email || '')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });

    // Fallback: If Firebase doesn't respond within 5 seconds, proceed anyway
    const timeout = setTimeout(() => {
      setIsAuthReady((ready) => {
        if (!ready) {
          console.warn("Firebase auth initialization timed out. Proceeding with unauthenticated state.");
          return true;
        }
        return ready;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prods.push({ 
          id: doc.id, 
          ...data,
          imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : [])
        } as Product);
      });
      setProducts(prods);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const coups: Coupon[] = [];
      snapshot.forEach((doc) => {
        coups.push({ id: doc.id, ...doc.data() } as Coupon);
      });
      setCoupons(coups);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'coupons'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/site'));

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubSettings();
    };
  }, [isAuthReady]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updatedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
    try {
      await addDoc(collection(db, 'coupons'), coupon);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'coupons');
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `coupons/${id}`);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      await setDoc(doc(db, 'settings', 'site'), { ...settings, ...newSettings }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/site');
    }
  };

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const adminEmails = ['tersooaker@gmail.com'];
      
      if (result.user.email && adminEmails.includes(result.user.email)) {
        setIsAdmin(true);
        return true;
      } else {
        await signOut(auth);
        return false;
      }
    } catch (error: any) {
      console.error("Login failed", error);
      // If popup is blocked, we might want to suggest redirect
      if (error.code === 'auth/popup-blocked') {
        throw new Error("Popup blocked. Please enable popups or try the 'Login with Redirect' option.");
      }
      throw error;
    }
  };

  const loginWithRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Redirect login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  return (
    <AppContext.Provider value={{
      products, coupons, settings,
      addProduct, updateProduct, deleteProduct,
      addCoupon, deleteCoupon,
      updateSettings,
      isAdmin, isAuthReady, login, loginWithRedirect, logout
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
