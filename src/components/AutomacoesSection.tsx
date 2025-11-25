import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Trash2, Loader2, AlertCircle, Heart, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';

interface Channel {
  id: string;
  name: string;
  type: number;
  position?: number;
  parentId?: string | null;
  parentName?: string | null;
}

interface AutomacoesSectionProps {
  application: any;
  botApiUrl: string;
}

export default function AutomacoesSection({ application, botApiUrl }: AutomacoesSectionProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  
  // Estados para cada automação
  const [lockChannelId, setLockChannelId] = useState('');
  const [lockLoading, setLockLoading] = useState(false);
  
  const [unlockChannelId, setUnlockChannelId] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  
  const [clearChannelId, setClearChannelId] = useState('');
  const [clearLoading, setClearLoading] = useState(false);
  const [clearQuantidade, setClearQuantidade] = useState(1000);
  
  // Estados para Reação em Feedback
  const [feedbackChannelId, setFeedbackChannelId] = useState('');
  const [feedbackEmoji, setFeedbackEmoji] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Estados para Limpeza Programada
  const [limpezaProgramadaChannelId, setLimpezaProgramadaChannelId] = useState('');
  const [limpezaProgramadaHorario1, setLimpezaProgramadaHorario1] = useState('14:00');
  const [limpezaProgramadaHorario2, setLimpezaProgramadaHorario2] = useState('22:00');
  const [limpezaProgramadaQuantidade, setLimpezaProgramadaQuantidade] = useState(1000);
  const [limpezaProgramadaLoading, setLimpezaProgramadaLoading] = useState(false);
  const [limpezasProgramadas, setLimpezasProgramadas] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Carregar canais ao montar
  useEffect(() => {
    const botId = application?.configuration?.clientId || application?.client_id;
    const guildId = application?.guild_id || application?.guildId;
    
    if (botId && guildId) {
      loadChannels();
    }
  }, [application]);

  const loadChannels = async () => {
    const botId = application?.configuration?.clientId || application?.client_id;
    const guildId = application?.guild_id || application?.guildId;
    
    if (!botId || !guildId) return;
    
    setLoadingChannels(true);
    try {
      const response = await fetch(
        `${botApiUrl}/automacoes/canais?bot_id=${botId}&guild_id=${guildId}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      console.log('Canais carregados:', data);

      if (data.success && Array.isArray(data.channels)) {
        setChannels(data.channels);
      } else {
        throw new Error(data.error || 'Erro ao carregar canais');
      }
    } catch (error: any) {
      console.error('Erro ao carregar canais:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível carregar os canais do servidor',
        variant: 'destructive',
      });
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleLockChannel = async () => {
    if (!lockChannelId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um canal para trancar',
        variant: 'destructive',
      });
      return;
    }

    const botId = application?.configuration?.clientId || application?.client_id;
    const guildId = application?.guild_id || application?.guildId;
    
    if (!botId || !guildId) {
      toast({
        title: 'Erro',
        description: 'Bot ID ou Guild ID não encontrado',
        variant: 'destructive',
      });
      return;
    }

    setLockLoading(true);
    try {
      const response = await fetch(`${botApiUrl}/automacoes/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          channel_id: lockChannelId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Canal trancado com sucesso!',
        });
        setLockChannelId('');
      } else {
        throw new Error(data.error || 'Erro ao trancar canal');
      }
    } catch (error: any) {
      console.error('Erro ao trancar canal:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível trancar o canal',
        variant: 'destructive',
      });
    } finally {
      setLockLoading(false);
    }
  };

  const handleUnlockChannel = async () => {
    if (!unlockChannelId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um canal para destrancar',
        variant: 'destructive',
      });
      return;
    }

    const botId = application?.configuration?.clientId || application?.client_id;
    const guildId = application?.guild_id || application?.guildId;
    
    if (!botId || !guildId) {
      toast({
        title: 'Erro',
        description: 'Bot ID ou Guild ID não encontrado',
        variant: 'destructive',
      });
      return;
    }

    setUnlockLoading(true);
    try {
      const response = await fetch(`${botApiUrl}/automacoes/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          channel_id: unlockChannelId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Canal destrancado com sucesso!',
        });
        setUnlockChannelId('');
      } else {
        throw new Error(data.error || 'Erro ao destrancar canal');
      }
    } catch (error: any) {
      console.error('Erro ao destrancar canal:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível destrancar o canal',
        variant: 'destructive',
      });
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleClearChannel = async () => {
    if (!clearChannelId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um canal para limpar',
        variant: 'destructive',
      });
      return;
    }

    if (clearQuantidade < 0 || clearQuantidade > 1000) {
      toast({
        title: 'Atenção',
        description: 'A quantidade deve estar entre 0 e 1000 mensagens',
        variant: 'destructive',
      });
      return;
    }

    const channelName = channels.find(c => c.id === clearChannelId)?.name || 'este canal';

    // Confirmação antes de limpar usando modal customizado
    confirm({
      title: 'Limpar Canal',
      description: `Tem certeza que deseja limpar até ${clearQuantidade} mensagens do canal #${channelName}?\n\nEsta ação não pode ser desfeita.`,
      confirmText: 'Limpar',
      onConfirm: async () => {
        await executeClearChannel();
      },
    });
  };

  const executeClearChannel = async () => {
    if (!clearChannelId) return;

    const botId = application?.configuration?.clientId || application?.client_id;
    const guildId = application?.guild_id || application?.guildId;
    
    if (!botId || !guildId) {
      toast({
        title: 'Erro',
        description: 'Bot ID ou Guild ID não encontrado',
        variant: 'destructive',
      });
      return;
    }

    setClearLoading(true);
    try {
      const response = await fetch(`${botApiUrl}/automacoes/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
          body: JSON.stringify({
            bot_id: botId,
            guild_id: guildId,
            channel_id: clearChannelId,
            quantidade: clearQuantidade,
          }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: data.message || 'Canal limpo com sucesso!',
        });
        setClearChannelId('');
      } else {
        throw new Error(data.error || 'Erro ao limpar canal');
      }
    } catch (error: any) {
      console.error('Erro ao limpar canal:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível limpar o canal',
        variant: 'destructive',
      });
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Automações</h1>
        <p className="text-sm text-[#999999]">Configure automações para gerenciar seu servidor</p>
      </div>

      {/* Grid de automações - Estilo Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Automação 1: Lock (Trancar Canal) */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#111] rounded-xl border border-[#1a1a1a]">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">Automação Lock</h3>
              <p className="text-sm text-[#999999] mb-4">
                Tranque um canal para impedir que usuários enviem mensagens
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#cccccc] mb-2 block">
                    Selecione o Canal
                  </label>
                  <select
                    value={lockChannelId}
                    onChange={(e) => setLockChannelId(e.target.value)}
                    disabled={loadingChannels || lockLoading}
                    className="w-full px-3 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingChannels ? 'Carregando...' : 'Selecione um canal'}
                    </option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.parentName ? `${channel.parentName} / ` : ''}# {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLockChannel}
                  disabled={!lockChannelId || lockLoading}
                  className="w-full px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] disabled:bg-[#0b0b0b] disabled:cursor-not-allowed text-white font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {lockLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Trancando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Trancar Canal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Automação 2: Unlock (Destrancar Canal) */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#111] rounded-xl border border-[#1a1a1a]">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">Automação Unlock</h3>
              <p className="text-sm text-[#999999] mb-4">
                Destranque um canal para permitir que usuários enviem mensagens
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#cccccc] mb-2 block">
                    Selecione o Canal
                  </label>
                  <select
                    value={unlockChannelId}
                    onChange={(e) => setUnlockChannelId(e.target.value)}
                    disabled={loadingChannels || unlockLoading}
                    className="w-full px-3 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingChannels ? 'Carregando...' : 'Selecione um canal'}
                    </option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.parentName ? `${channel.parentName} / ` : ''}# {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleUnlockChannel}
                  disabled={!unlockChannelId || unlockLoading}
                  className="w-full px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] disabled:bg-[#0b0b0b] disabled:cursor-not-allowed text-white font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {unlockLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Destrancando...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Destrancar Canal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Automação 3: Clear (Limpar Mensagens) */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#111] rounded-xl border border-[#1a1a1a]">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">Automação Clear</h3>
              <p className="text-sm text-[#999999] mb-4">
                Limpe todas as mensagens de um canal específico
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#cccccc] mb-2 block">
                    Selecione o Canal
                  </label>
                  <select
                    value={clearChannelId}
                    onChange={(e) => setClearChannelId(e.target.value)}
                    disabled={loadingChannels || clearLoading}
                    className="w-full px-3 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingChannels ? 'Carregando...' : 'Selecione um canal'}
                    </option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.parentName ? `${channel.parentName} / ` : ''}# {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#cccccc] mb-2 block">
                    Quantidade de Mensagens (0-1000)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={clearQuantidade}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setClearQuantidade(Math.min(Math.max(value, 0), 1000));
                    }}
                    disabled={clearLoading}
                    className="w-full px-3 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="1000"
                  />
                  <p className="text-xs text-[#666666] mt-1">
                    O sistema deletará de 1000 em 1000 mensagens automaticamente
                  </p>
                </div>

                <div className="p-3 bg-[#111] border border-[#1a1a1a] rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#999999] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#999999]">
                      <strong>Atenção:</strong> Esta ação irá apagar até {clearQuantidade} mensagens do canal e não pode ser desfeita.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClearChannel}
                  disabled={!clearChannelId || clearLoading}
                  className="w-full px-4 py-2.5 bg-[#111] hover:bg-[#1a1a1a] disabled:bg-[#0b0b0b] disabled:cursor-not-allowed text-white font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {clearLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Limpando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Limpar Canal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info (remover em produção) */}
      {channels.length === 0 && !loadingChannels && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <p className="text-sm text-[#999999]">
            Nenhum canal encontrado. Verifique se o bot tem permissões para ver os canais do servidor.
          </p>
        </div>
      )}

      {/* Modal de confirmação */}
      <ConfirmDialog />
    </div>
  );
}
