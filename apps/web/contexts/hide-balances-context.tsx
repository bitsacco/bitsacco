"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const BITSACCO_PRIVACY_MODE_KEY = "bitsacco_privacy_default_mode";
const BITSACCO_PRIVACY_MODE_DEFAULT = true;

interface HideBalancesContextType {
  hideBalances: boolean;
  toggleHideBalances: () => void;
  setHideBalances: (value: boolean) => void;
  isInitialized: boolean;
}

const HideBalancesContext = createContext<HideBalancesContextType | undefined>(
  undefined,
);

interface HideBalancesProviderProps {
  children: ReactNode;
}

export function HideBalancesProvider({ children }: HideBalancesProviderProps) {
  const [hideBalances, setHideBalancesState] = useState<boolean>(
    BITSACCO_PRIVACY_MODE_DEFAULT,
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BITSACCO_PRIVACY_MODE_KEY);
      if (stored !== null) {
        setHideBalancesState(JSON.parse(stored));
      }
    } catch (error) {
      console.warn(
        "Failed to load hide balances preference from localStorage:",
        error,
      );
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(
          BITSACCO_PRIVACY_MODE_KEY,
          JSON.stringify(hideBalances),
        );
      } catch (error) {
        console.warn(
          "Failed to save hide balances preference to localStorage:",
          error,
        );
      }
    }
  }, [hideBalances, isInitialized]);

  const setHideBalances = (value: boolean) => {
    setHideBalancesState(value);
  };

  const toggleHideBalances = () => {
    setHideBalancesState((prev) => !prev);
  };

  return (
    <HideBalancesContext.Provider
      value={{
        hideBalances,
        toggleHideBalances,
        setHideBalances,
        isInitialized,
      }}
    >
      {children}
    </HideBalancesContext.Provider>
  );
}

export function useHideBalances() {
  const context = useContext(HideBalancesContext);
  if (context === undefined) {
    throw new Error(
      "useHideBalances must be used within a HideBalancesProvider",
    );
  }
  return context;
}
