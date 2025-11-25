import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Activity, Server, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface BotStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'paused' | 'error';
  cpu?: number;
  ram?: number;
  uptime?: number;
  lastUpdate?: string;
}

export default function MonitoramentoSection() {
  const { toast } = useToast();
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    paused: 0,
    error: 0
  });

  useEffect(() => {
    fetchBotsStatus();
    const interval = setInterval(fetchBotsStatus, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchBotsStatus = async () => {
    try {
      const response = await fetch('/api/admin/bots/status', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBots(data.bots || []);
        
        const newStats = {
          total: data.bots?.length || 0,
          online: data.bots?.filter((b: BotStatus) => b.status === 'online').length || 0,
          offline: data.bots?.filter((b: BotStatus) => b.status === 'offline').length || 0,
          paused: data.bots?.filter((b: BotStatus) => b.status === 'paused').length || 0,
          error: data.bots?.filter((b: BotStatus) => b.status === 'error').length || 0,
        };
        setStats(newStats);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o status dos bots.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar status dos bots:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'offline':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'paused':
        return <Clock size={16} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'offline':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'paused':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="minimal-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00ffbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Carregando status dos bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Monitoramento em Tempo Real</h1>
        <p className="text-sm text-[#999999]">Status de todos os bots hospedados na Discloud</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="minimal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
              <Server size={20} className="text-[#999999]" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Total de Bots</p>
              <p className="text-lg font-semibold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Online</p>
              <p className="text-lg font-semibold text-green-500">{stats.online}</p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Offline</p>
              <p className="text-lg font-semibold text-red-500">{stats.offline}</p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Clock size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Pausados</p>
              <p className="text-lg font-semibold text-yellow-500">{stats.paused}</p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Com Erro</p>
              <p className="text-lg font-semibold text-red-500">{stats.error}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Bots */}
      <div className="minimal-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Status Detalhado dos Bots</h2>
          <button
            onClick={fetchBotsStatus}
            className="px-3 py-1.5 text-xs bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white hover:bg-[#151515] transition-colors"
          >
            Atualizar
          </button>
        </div>

        {bots.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="text-[#666666] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Nenhum bot encontrado</p>
            <p className="text-sm text-[#666666]">Não há bots configurados no sistema.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(bot.status)}
                      <h3 className="text-white font-medium">{bot.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(bot.status)}`}>
                        {bot.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {bot.cpu !== undefined && (
                        <div>
                          <p className="text-xs text-[#666666]">CPU</p>
                          <p className="text-sm font-medium text-white">{bot.cpu}%</p>
                        </div>
                      )}
                      {bot.ram !== undefined && (
                        <div>
                          <p className="text-xs text-[#666666]">RAM</p>
                          <p className="text-sm font-medium text-white">{bot.ram}MB</p>
                        </div>
                      )}
                      {bot.uptime !== undefined && (
                        <div>
                          <p className="text-xs text-[#666666]">Uptime</p>
                          <p className="text-sm font-medium text-white">{formatUptime(bot.uptime)}</p>
                        </div>
                      )}
                      {bot.lastUpdate && (
                        <div>
                          <p className="text-xs text-[#666666]">Última Atualização</p>
                          <p className="text-sm font-medium text-white">
                            {new Date(bot.lastUpdate).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

