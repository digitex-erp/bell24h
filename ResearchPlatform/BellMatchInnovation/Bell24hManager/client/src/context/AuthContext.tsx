import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  email: string;
  companyName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me", undefined);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const registeredUser = await response.json();
      setUser(registeredUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome to Bell24h, ${registeredUser.username}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout", undefined);
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
