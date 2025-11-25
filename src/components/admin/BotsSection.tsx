import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { Bot, RefreshCw, Power, RotateCw, Activity } from 'lucide-react';

interface BotInfo {
  id: string;
  name: string;
  status: string;
  discloudAppId?: string;
  cpu?: number;
  ram?: number;
  uptime?: number;
}

export default function BotsSection() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [bots, setBots] = useState<BotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/admin/bots/list', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBots(data.bots || []);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de bots.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar bots:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (botId: string, botName: string) => {
    const confirmed = await confirm({
      title: 'Reiniciar Bot',
      description: `Tem certeza que deseja reiniciar o bot "${botName}"?`,
    });

    if (!confirmed) return;

    setActionLoading(botId);
    try {
      const response = await fetch(`/api/admin/bots/${botId}/restart`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: `Bot "${botName}" reiniciado com sucesso.`,
          type: 'success',
        });
        setTimeout(fetchBots, 2000);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao reiniciar o bot.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao reiniciar bot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartAll = async () => {
    const confirmed = await confirm({
      title: 'Reiniciar Todos os Bots',
      description: `Tem certeza que deseja reiniciar todos os ${bots.length} bots? Esta ação pode levar alguns minutos.`,
    });

    if (!confirmed) return;

    setActionLoading('all');
    try {
      const response = await fetch('/api/admin/bots/restart-all', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Todos os bots estão sendo reiniciados.',
          type: 'success',
        });
        setTimeout(fetchBots, 5000);
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao reiniciar os bots.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao reiniciar todos os bots:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSync = async (botId: string, botName: string) => {
    setActionLoading(botId);
    try {
      const response = await fetch(`/api/admin/bots/${botId}/sync`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: `Configurações do bot "${botName}" sincronizadas.`,
          type: 'success',
        });
        fetchBots();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao sincronizar o bot.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar bot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="minimal-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00ffbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Carregando bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Gerenciamento de Bots</h1>
          <p className="text-sm text-[#999999]">Controle e gerencie todos os bots hospedados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRestartAll}
            disabled={actionLoading === 'all' || bots.length === 0}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === 'all' ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Reiniciando...
              </>
            ) : (
              <>
                <Power size={16} />
                Reiniciar Todos
              </>
            )}
          </button>
          <button
            onClick={fetchBots}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white hover:bg-[#151515] transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Bots */}
      <div className="minimal-card p-6">
        {bots.length === 0 ? (
          <div className="text-center py-12">
            <Bot size={48} className="text-[#666666] mx-auto mb-4" />
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bot size={20} className="text-[#999999]" />
                      <h3 className="text-white font-medium">{bot.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        bot.status === 'online' 
                          ? 'text-green-500 bg-green-500/10 border border-green-500/20'
                          : bot.status === 'offline'
                          ? 'text-red-500 bg-red-500/10 border border-red-500/20'
                          : 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20'
                      }`}>
                        {bot.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3">
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
                          <p className="text-sm font-medium text-white">
                            {Math.floor(bot.uptime / 3600)}h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleRestart(bot.id, bot.name)}
                      disabled={actionLoading === bot.id}
                      className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Reiniciar Bot"
                    >
                      {actionLoading === bot.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <RefreshCw size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleSync(bot.id, bot.name)}
                      disabled={actionLoading === bot.id}
                      className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Sincronizar Configurações"
                    >
                      <RotateCw size={16} />
                    </button>
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

