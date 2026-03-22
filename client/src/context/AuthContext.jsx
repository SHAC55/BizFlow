import { createContext, useContext, useState, useEffect } from "react";
import API from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //  Check session on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  //  Login
  const login = (userData) => {
    setUser(userData);
  };

  //  Logout 
  const logout = async () => {
    try {
      await API.post("/logout"); // if your backend has it
    } catch (err) {
      console.log("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
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