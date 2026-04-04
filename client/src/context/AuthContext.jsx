import { createContext, useContext, useState, useEffect } from "react";
import API from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await API.get("/user");
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
};
