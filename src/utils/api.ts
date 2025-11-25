/**
 * Configuração de URLs da API baseadas no ambiente
 */

// URLs baseadas em variáveis de ambiente ou padrões
const getApiBaseUrl = (): string => {
  if (import.meta.env.PROD) {
    // Em produção, SEMPRE usar a variável de ambiente ou a URL correta
    // NUNCA usar URLs antigas como fallback
    return import.meta.env.VITE_API_BASE_URL || 'https://beta.dreamapplications.com.br';
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
};

const getDreamCloudApiUrl = (): string => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_DREAMCLOUD_API_URL || 'https://betadreamcloud2.discloud.app';
  }
  return import.meta.env.VITE_DREAMCLOUD_API_URL || 'http://localhost:3000';
};

const getFrontendUrl = (): string => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_FRONTEND_URL || 'https://euamoadream2025.netlify.app';
  }
  return import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080';
};

// URLs exportadas
export const API_BASE_URL = getApiBaseUrl();
export const DREAMCLOUD_API_URL = getDreamCloudApiUrl();
export const FRONTEND_URL = getFrontendUrl();

// Helper para construir URLs completas
export const buildApiUrl = (path: string): string => {
  // Se o path já começa com http, retornar como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Normalizar URL base: remover barra final se existir
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  
  // Normalizar path: garantir que comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Se o path começa com /dreamcloud (sem /api), usar DREAMCLOUD_API_URL diretamente
  // Isso é para chamadas diretas à API do DreamCloud (raro, mas possível)
  if (normalizedPath.startsWith('/dreamcloud') && !normalizedPath.startsWith('/api/dreamcloud')) {
    const dreamCloudBase = DREAMCLOUD_API_URL.replace(/\/+$/, '');
    return `${dreamCloudBase}${normalizedPath}`;
  }
  
  // Para outros paths (incluindo /api, /api/dreamcloud, /auth, /orders, /applications), usar API_BASE_URL
  // O site-backend faz proxy para /api/dreamcloud/* para a API do DreamCloud
  return `${baseUrl}${normalizedPath}`;
};

// Helper para construir URLs do DreamCloud
export const buildDreamCloudUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Normalizar URL base: remover barra final se existir
  const baseUrl = DREAMCLOUD_API_URL.replace(/\/+$/, '');
  
  // Remover /dreamcloud do início se existir
  const cleanPath = path.startsWith('/dreamcloud') ? path : `/dreamcloud${path.startsWith('/') ? path : `/${path}`}`;
  
  // Garantir que o path comece com /
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  return `${baseUrl}${normalizedPath}`;
};

// Helper para verificar se estamos em produção
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

// Helper para usar URL relativa em desenvolvimento (para proxy do Vite) ou absoluta em produção
export const getApiPath = (path: string): string => {
  // Sempre usar path relativo em desenvolvimento para o proxy do Vite funcionar
  // Isso garante que mesmo com variáveis de ambiente configuradas, o proxy será usado
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    return path;
  }
  // Em produção, usar URL absoluta
  return buildApiUrl(path);
};

// Helper similar para DreamCloud
export const getDreamCloudPath = (path: string): string => {
  if (isProduction()) {
    return buildDreamCloudUrl(path);
  }
  // Em desenvolvimento, usar path relativo para o proxy do Vite funcionar
  return path;
};

// Wrapper para fetch que automaticamente adiciona a URL base em produção
export const apiFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> => {
  const url = getApiPath(path);
  return fetch(url, {
    ...options,
    credentials: options?.credentials ?? 'include',
  });
};

// Wrapper para fetch do DreamCloud
export const dreamCloudFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> => {
  const url = getDreamCloudPath(path);
  return fetch(url, {
    ...options,
    credentials: options?.credentials ?? 'include',
  });
};

