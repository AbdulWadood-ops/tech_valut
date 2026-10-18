'use client';

/* eslint-disable */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Device, getBuyLink } from '../data/devices';

type CategoryType = 'mobiles' | 'laptops' | 'watches' | 'earbuds' | 'tablets';

type SelectedDevicesState = Record<CategoryType, (Device | null)[]>;

interface AppContextType {
  activeCategory: CategoryType;
  setActiveCategory: (category: CategoryType) => void;
  selectedDevices: (Device | null)[]; // Convenience accessor for active category
  selectedDevicesState: SelectedDevicesState;
  setSelectedDevicesState: React.Dispatch<React.SetStateAction<SelectedDevicesState>>;
  cartCount: number;
  toastMessage: string | null;
  handleCategoryChange: (category: CategoryType) => void;
  handleSelectDevice: (index: number, device: Device) => void;
  handleRemoveDevice: (index: number) => void;
  handleBuy: (device: Device) => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSelectedState: SelectedDevicesState = {
  mobiles: [null, null, null],
  laptops: [null, null, null],
  watches: [null, null, null],
  earbuds: [null, null, null],
  tablets: [null, null, null]
};

const STORAGE_KEY_CATEGORY = 'techvault_activeCategory';
const STORAGE_KEY_DEVICES_STATE = 'techvault_selectedDevicesState';

const loadCategory = (): CategoryType => {
  if (typeof window === 'undefined') return 'mobiles';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORY);
    if (saved && ['mobiles', 'laptops', 'watches', 'earbuds', 'tablets'].includes(saved)) {
      return saved as CategoryType;
    }
  } catch {}
  return 'mobiles';
};

const loadDevicesState = (): SelectedDevicesState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DEVICES_STATE);
    if (saved) {
      const parsed: Record<string, (string | null)[]> = JSON.parse(saved);
      const restoredState: Partial<SelectedDevicesState> = {};
      
      for (const cat of ['mobiles', 'laptops', 'watches', 'earbuds', 'tablets'] as CategoryType[]) {
        if (parsed[cat]) {
          // In a real app we'd fetch devices by ID here, but for now we'll just set them to null 
          // if we don't have them in memory.
          restoredState[cat] = [null, null, null];
        } else {
          restoredState[cat] = [null, null, null];
        }
      }
      return restoredState as SelectedDevicesState;
    }
  } catch {}
  return null;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('mobiles');
  const [selectedDevicesState, setSelectedDevicesState] = useState<SelectedDevicesState>(defaultSelectedState);
  const [cartCount, setCartCount] = useState<number>(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage after component mounts to prevent hydration mismatches
  useEffect(() => {
    const savedCategory = loadCategory();
    const savedDevicesState = loadDevicesState();

    setActiveCategory(savedCategory);
    if (savedDevicesState) {
      setSelectedDevicesState(savedDevicesState);
    }
    setIsHydrated(true);
  }, []);

  // Persist activeCategory to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY, activeCategory);
    } catch {}
  }, [activeCategory, isHydrated]);

  // Persist selectedDevicesState to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const toSave: Record<string, (string | null)[]> = {};
      for (const cat in selectedDevicesState) {
        toSave[cat] = selectedDevicesState[cat as CategoryType].map(d => d?.id || null);
      }
      localStorage.setItem(STORAGE_KEY_DEVICES_STATE, JSON.stringify(toSave));
    } catch {}
  }, [selectedDevicesState, isHydrated]);

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    // Removed setSelectedDevices to preserve existing comparison states across categories
  };

  const handleSelectDevice = (index: number, device: Device) => {
    setSelectedDevicesState(prev => {
      const cat = device.category as CategoryType;
      const updatedCat = [...prev[cat]];
      updatedCat[index] = device;
      return { ...prev, [cat]: updatedCat };
    });
  };

  const handleRemoveDevice = (index: number) => {
    setSelectedDevicesState(prev => {
      const updatedCat = [...prev[activeCategory]];
      updatedCat[index] = null;
      return { ...prev, [activeCategory]: updatedCat };
    });
  };

  const handleBuy = (device: Device) => {
    const buyLink = getBuyLink(device);
    if (buyLink) {
      if (typeof window !== 'undefined') {
        window.open(buyLink, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    setCartCount(prev => prev + 1);
    showToast(`🛒 ${device.name} added to cart!`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Automatically clear toast message after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const selectedDevices = selectedDevicesState[activeCategory];

  return (
    <AppContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        selectedDevices,
        selectedDevicesState,
        setSelectedDevicesState,
        cartCount,
        toastMessage,
        handleCategoryChange,
        handleSelectDevice,
        handleRemoveDevice,
        handleBuy,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
