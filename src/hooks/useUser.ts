import { useEffect, useState } from "react";
import { getApiPath } from "@/utils/api";

export type User = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  lastLogin?: string | Date;
  // Adicione outros campos conforme necessário
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(getApiPath("/auth/me"), { credentials: "include" })
      .then(res => res.ok ? res.json() : Promise.reject("Não autenticado"))
      .then(data => {
        setUser(data.user || data);
        setError(null);
      })
      .catch(err => setError(typeof err === "string" ? err : "Erro ao buscar usuário"))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
} 