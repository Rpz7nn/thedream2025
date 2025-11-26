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
  forceRefresh: () => void;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [skipAutoFetch, setSkipAutoFetch] = useState(false);

  const fetchUser = useCallback(async () => {
    if (skipAutoFetch) {
      setLoading(false);
      return;
    }
    
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
        setSkipAutoFetch(false); // Reset flag se login bem-sucedido
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
  }, [skipAutoFetch]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Detectar quando o usuário volta após login do Discord
  useEffect(() => {
    const handleFocus = () => {
      // Se o usuário voltou para a página e não há flag de skip, tentar verificar login
      if (!skipAutoFetch && !user) {
        // Pequeno delay para garantir que cookies foram processados
        setTimeout(() => {
          fetchUser();
        }, 500);
      }
    };

    // Verificar quando a janela ganha foco (usuário volta para a aba)
    window.addEventListener('focus', handleFocus);
    
    // Verificar imediatamente se há parâmetros de callback na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || window.location.hash.includes('access_token')) {
      setSkipAutoFetch(false);
      setTimeout(() => {
        fetchUser();
      }, 500);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [skipAutoFetch, user, fetchUser]);

  const logout = async () => {
    try {
      await fetch(getApiPath("/auth/logout"), { 
        method: "POST",
        credentials: "include" 
      });
      setUser(null);
      setSkipAutoFetch(true); // Evitar re-fetch automático após logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setUser(null); // Limpa o estado local mesmo se a requisição falhar
      setSkipAutoFetch(true); // Evitar re-fetch automático mesmo em caso de erro
    }
  };

  const forceRefresh = useCallback(async () => {
    setSkipAutoFetch(false); // Permitir fetch ao forçar refresh
    await fetchUser();
  }, [fetchUser]);

  const refresh = useCallback(async () => {
    setSkipAutoFetch(false); // Resetar flag ao fazer refresh manual
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, forceRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDiscordAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useDiscordAuth must be used within <AuthProvider>");
  return ctx;
}
