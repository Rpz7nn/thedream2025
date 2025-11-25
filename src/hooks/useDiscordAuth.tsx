import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getApiPath } from "@/utils/api";

type UserType = {
  id: string;
  username: string;
  avatar: string;
  email: string;
  lastLogin?: string;
} | null;

const AuthContext = createContext<{
  user: UserType;
  loading: boolean;
  refresh: () => void;
  logout: () => void;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const url = getApiPath("/auth/me");
      console.log(`[AUTH] Buscando usuário em: ${url}`);
      
      const res = await fetch(url, {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log(`[AUTH] Resposta: ${res.status} ${res.statusText}`);
      // document.cookie só mostra cookies do domínio atual (frontend)
      // O cookie do backend não aparecerá aqui, mas será enviado automaticamente
      console.log(`[AUTH] Cookies do domínio atual: ${document.cookie || 'nenhum'}`);
      console.log(`[AUTH] Nota: Cookie do backend será enviado automaticamente se existir`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`[AUTH] Dados recebidos:`, data);
        if (data.success && data.user) {
        setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error(`[AUTH] Erro na resposta:`, errorData);
        setUser(null);
      }
    } catch (err) {
      console.error(`[AUTH] Erro ao buscar usuário:`, err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await fetch(getApiPath("/auth/logout"), { 
        method: "POST",
        credentials: "include" 
      });
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setUser(null); // Limpa o estado local mesmo se a requisição falhar
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDiscordAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useDiscordAuth must be used within <AuthProvider>");
  return ctx;
}
