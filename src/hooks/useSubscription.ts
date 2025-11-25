import { useEffect, useState, useCallback } from "react";
import { getApiPath } from "@/utils/api";

export function useSubscription() {
  const [subscription, setSubscription] = useState<unknown>(null);
  const [invoices, setInvoices] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(getApiPath("/api/subscription"), { credentials: "include" }).then(r => r.json()),
      fetch(getApiPath("/api/subscription/invoices"), { credentials: "include" }).then(r => r.json())
    ])
      .then(([sub, inv]) => {
        setSubscription(sub.subscription || sub);
        setInvoices(inv.invoices || inv);
        setError(null);
      })
      .catch(err => setError(typeof err === "string" ? err : "Erro ao buscar assinatura"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { subscription, invoices, loading, error, refetch: fetchAll };
} 
