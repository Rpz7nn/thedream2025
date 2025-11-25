import React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Play, Wifi, Download, Search, Copy, CheckCircle2, XCircle, AlertTriangle, Loader2, Info,
  MessageSquare, MessageCircle, Send, Users, UserMinus, UserX, Ban, LogOut, Trash2, Hash, Server
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ícones padronizados para logs de progresso em todas as ferramentas.
 * Adicione ou ajuste aqui para manter o padrão visual e semântico.
 */
export function getLogIcon(type: string, message: string): React.ReactNode {
  // --- Mensagens de início de operação ---
  if (/iniciando (extração|envio|remoção|kick|banimento|flood|clonagem|limpeza|fechamento|saída)/i.test(message)) {
    return <Play className="h-4 w-4 text-white" />;
  }

  // --- Conexão Discord ---
  if (/discord conectado|conectado ao discord/i.test(message)) {
    return <Wifi className="h-4 w-4 text-green-500" />;
  }

  // --- Progresso de coleta, obtenção, busca ---
  if (/coletando|obtendo|buscando|mensagens encontradas/i.test(message)) {
    return <Download className="h-4 w-4 text-white" />;
  }
  if (/mensagens encontradas/i.test(message)) {
    return <Search className="h-4 w-4 text-purple-500" />;
  }

  // --- Mensagens específicas de cada ferramenta ---
  // MassDM
  if (/enviando mensagem|mensagem enviada/i.test(message)) {
    return <Send className="h-4 w-4 text-white" />;
  }
  // RemoveFriends
  if (/removendo amigo/i.test(message)) {
    return <UserMinus className="h-4 w-4 text-white" />;
  }
  // KickAll
  if (/kickando membro/i.test(message)) {
    return <UserX className="h-4 w-4 text-white" />;
  }
  // BanAll
  if (/banindo/i.test(message)) {
    return <Ban className="h-4 w-4 text-white" />;
  }
  // FloodChannels
  if (/mensagem enviada em|flood/i.test(message)) {
    return <Hash className="h-4 w-4 text-white" />;
  }
  // Raid
  if (/criando canais/i.test(message)) {
    return <Server className="h-4 w-4 text-white" />;
  }
  if (/enviando mensagens/i.test(message)) {
    return <MessageSquare className="h-4 w-4 text-white" />;
  }
  // ExtractMessages
  if (/copiando mensagem|copiando/i.test(message)) {
    return <Copy className="h-4 w-4 text-white" />;
  }
  // CloneServer
  if (/canal.*clonado|servidor clonado/i.test(message)) {
    return <Copy className="h-4 w-4 text-white" />;
  }
  // ClearServer
  if (/canal.*deletado|servidor limpo/i.test(message)) {
    return <Trash2 className="h-4 w-4 text-white" />;
  }
  // ClearDMs
  if (/limpando dm|dm limpa|limpeza de dms/i.test(message)) {
    return <Trash2 className="h-4 w-4 text-white" />;
  }
  // CloseDMs
  if (/fechando dm|dm fechada|fechamento de dms/i.test(message)) {
    return <MessageCircle className="h-4 w-4 text-white" />;
  }
  // LeaveServers
  if (/saindo do servidor|saída de servidores/i.test(message)) {
    return <LogOut className="h-4 w-4 text-white" />;
  }

  // --- Mensagens de sucesso/conclusão ---
  if (/conclu[ií]d[oa]!|finalizada!|conclu[ií]do!|sucesso/i.test(message)) {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }

  // --- Fallback para tipos de log ---
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'progress':
      return <Loader2 className="h-4 w-4 text-white animate-spin" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Busca o username do Discord a partir de um token.
 * Retorna o username ou null em caso de erro.
 */
export async function fetchDiscordUsername(token: string): Promise<string | null> {
  try {
    const res = await fetch("https://discord.com/api/v9/users/@me", {
      headers: {
        Authorization: token,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.username || null;
  } catch (e) {
    return null;
  }
}

// Utilitário para mascarar parcialmente o e-mail
export function maskEmailPartial(email: string) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 4);
  const masked = '*'.repeat(Math.max(0, user.length - 4));
  return `${visible}${masked}@${domain}`;
}

// Utilitário para exibir tempo relativo em português
export function formatTimeAgo(date: string | Date) {
  if (!date) return '';
  let d = date;
  if (!(d instanceof Date)) {
    d = new Date(d);
    if (isNaN(d.getTime())) return '';
  }
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // em segundos
  if (diff < 10) return 'agora mesmo';
  if (diff < 60) return `há ${diff} segundos`;
  if (diff < 3600) {
    const min = Math.floor(diff / 60);
    return min === 1 ? 'há 1 minuto' : `há ${min} minutos`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return h === 1 ? 'há 1 hora' : `há ${h} horas`;
  }
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'há 1 dia' : `há ${days} dias`;
}

/**
 * Gera a URL do avatar do Discord de forma otimizada e segura
 * Suporta usuários com discriminator 0 (novos usuários do Discord) e usuários sem avatar
 * @param userId - ID do usuário do Discord
 * @param avatar - Hash do avatar (pode ser null)
 * @param discriminator - Discriminator do usuário (opcional, para fallback)
 * @param size - Tamanho da imagem (128, 256, 512, 1024) - padrão: 256
 * @returns URL do avatar ou null se não houver avatar
 */
export function getDiscordAvatarUrl(
  userId: string | null | undefined,
  avatar: string | null | undefined,
  discriminator?: string | number | null,
  size: number = 256
): string | null {
  // Validação básica
  if (!userId) return null;

  // Se tiver avatar, usar a URL padrão do Discord
  if (avatar && avatar.trim() !== '') {
    // Validar tamanho (limites do Discord)
    const validSize = Math.min(Math.max(size, 16), 4096);
    // Detectar se é GIF (avatar animado)
    const isAnimated = avatar.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${extension}?size=${validSize}`;
  }

  // Se não tiver avatar, retornar null para usar fallback com inicial
  return null;
}

/**
 * Gera a URL do ícone de servidor do Discord
 * @param guildId - ID do servidor
 * @param icon - Hash do ícone
 * @param size - Tamanho da imagem (padrão: 256)
 * @returns URL do ícone ou null
 */
export function getDiscordGuildIconUrl(
  guildId: string | null | undefined,
  icon: string | null | undefined,
  size: number = 256
): string | null {
  if (!guildId || !icon || icon.trim() === '') return null;
  
  const validSize = Math.min(Math.max(size, 16), 4096);
  const isAnimated = icon.startsWith('a_');
  const extension = isAnimated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${extension}?size=${validSize}`;
}

/**
 * Debounce function para otimizar chamadas de função
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para limitar chamadas de função
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
