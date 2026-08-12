import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../api/axious";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Manager" | "Cashier" | "Chef" | "Waiter";
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (employee: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authRequestId = useRef(0);

  useEffect(() => {
    const checkAuth = async () => {
      const requestId = ++authRequestId.current;

      try {
        const response = await api.get("/auth/me");

        if (requestId === authRequestId.current) {
          setUser(response.data.data.employee);
        }
      } catch {
        if (requestId === authRequestId.current) {
          setUser(null);
        }
      } finally {
        if (requestId === authRequestId.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  const login = (employee: AuthUser) => {
    authRequestId.current += 1;
    setUser(employee);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      authRequestId.current += 1;
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
