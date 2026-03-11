import { useEffect, useState } from "react";

export interface CustomerUser {
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "regenix_user";

export function useCustomerAuth() {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CustomerUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setUser(raw ? (JSON.parse(raw) as CustomerUser) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = (u: CustomerUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, login, logout, isLoggedIn: !!user };
}
