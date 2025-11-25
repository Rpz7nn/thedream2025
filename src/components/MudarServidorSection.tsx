import React, { useState, useEffect } from 'react';
import { Server, Loader2, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiPath } from '@/utils/api';

interface Application {
  id: string;
  guild_id?: string;
  guild_name?: string;
  configuration?: {
    configured: boolean;
    bot_token?: string;
    client_id?: string;
  };
}

interface MudarServidorSectionProps {
  application: Application | null;
  onServidorChanged: () => void;
}

export default function MudarServidorSection({ application, onServidorChanged }: MudarServidorSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [changing, setChanging] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGuilds = async () => {
    if (!application?.id) return;

    setLoadingGuilds(true);
    try {
      // Usar o id da aplicação (MongoDB _id) ou client_id
      const botId = application.id;
      const response = await fetch(getApiPath(`/api/mudar-servidor/guilds?bot_id=${encodeURIComponent(botId)}`), {
        credentials: 'include'
      });

      if (!response.ok) {
        // Verificar se a resposta é JSON antes de fazer parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          toast({
            type: 'error',
            title: 'Erro ao buscar servidores',
            description: data.error || `Erro ${response.status}: Não foi possível buscar os servidores do bot`,
          });
        } else {
          // Se não for JSON, provavelmente é HTML (página 404)
          const text = await response.text();
          console.error('Resposta não é JSON (provavelmente 404):', text.substring(0, 100));
          toast({
            type: 'error',
            title: 'Erro ao buscar servidores',
            description: `Erro ${response.status}: Rota não encontrada. Verifique se o backend está configurado corretamente.`,
          });
        }
        return;
      }

      // Verificar se a resposta é JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 100));
        toast({
          type: 'error',
          title: 'Erro ao buscar servidores',
          description: 'Resposta inválida do servidor',
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Filtrar o servidor atual
        const filteredGuilds = (data.guilds || []).filter(
          (guild: any) => guild.id !== application.guild_id
        );
        setGuilds(filteredGuilds);
      } else {
        toast({
          type: 'error',
          title: 'Erro ao buscar servidores',
          description: data.error || 'Não foi possível buscar os servidores do bot',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
      if (error instanceof SyntaxError) {
        toast({
          type: 'error',
          title: 'Erro ao buscar servidores',
          description: 'Resposta inválida do servidor. Verifique se o backend está funcionando corretamente.',
        });
      } else {
        toast({
          type: 'error',
          title: 'Erro ao buscar servidores',
          description: 'Ocorreu um erro ao buscar os servidores disponíveis',
        });
      }
    } finally {
      setLoadingGuilds(false);
    }
  };

  useEffect(() => {
    if (showModal && application) {
      fetchGuilds();
    }
  }, [showModal, application]);

  const [confirming, setConfirming] = useState(false);

  const handleMudarServidor = async () => {
    if (!selectedGuildId || !application?.id) return;

    // Se ainda não confirmou, mostrar toast de confirmação
    if (!confirming) {
      const selectedGuild = guilds.find(g => g.id === selectedGuildId);
      toast({
        type: 'warning',
        title: 'Confirmação necessária',
        description: `Tem certeza que deseja mudar para o servidor "${selectedGuild?.name || selectedGuildId}"? Todos os dados serão excluídos. Clique novamente em "Confirmar Mudança" para confirmar.`,
        duration: 5000,
      });
      setConfirming(true);
      return;
    }

    setChanging(true);
    try {
      // Usar o id da aplicação (MongoDB _id)
      const botId = application.id;
      const response = await fetch('/api/mudar-servidor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          new_guild_id: selectedGuildId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          type: 'success',
          title: 'Servidor alterado com sucesso!',
          description: 'Todos os dados foram deletados e os comandos foram re-registrados no novo servidor.',
        });
        setShowModal(false);
        setSelectedGuildId(null);
        setConfirming(false);
        onServidorChanged();
      } else {
        toast({
          type: 'error',
          title: 'Erro ao mudar servidor',
          description: data.error || 'Não foi possível alterar o servidor',
        });
      }
    } catch (error) {
      console.error('Erro ao mudar servidor:', error);
      toast({
        type: 'error',
        title: 'Erro ao mudar servidor',
        description: 'Ocorreu um erro ao alterar o servidor',
      });
    } finally {
      setChanging(false);
      setConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGuildId(null);
    setConfirming(false);
  };

  // Não mostrar se aplicação não estiver configurada
  if (!application?.configuration?.configured) {
    return null;
  }

  return (
    <>
      {/* Seção Mudar de Servidor */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Mudar de Servidor</h3>
          <p className="text-sm text-gray-400 mb-4">
            Altere o servidor do bot. Todos os dados serão excluídos e os comandos serão re-registrados no novo servidor.
          </p>
        </div>
        
        {/* Botão para abrir modal */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-3 p-4 bg-[#0b0b0b] hover:bg-[#111] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-xl transition-all duration-200 text-white"
          title="Mudar de Servidor"
        >
          <Server size={20} />
          <span className="text-sm font-medium">Mudar de Servidor</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="text-white" size={24} />
                <h2 className="text-xl font-semibold text-white">Mudar de Servidor</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X className="text-gray-400" size={20} />
              </button>
            </div>

            {/* Aviso */}
            <div className="p-6 bg-[#0b0b0b] border border-[#1a1a1a]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-white flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Atenção: Esta ação é irreversível!</h3>
                  <p className="text-gray-300 text-sm">
                    Ao mudar de servidor, <strong>TODOS</strong> os dados do bot serão <strong>EXCLUÍDOS</strong>:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                    <li>Todos os produtos</li>
                    <li>Todos os sorteios</li>
                    <li>Todas as definições</li>
                    <li>Todas as configurações</li>
                  </ul>
                  <p className="text-gray-300 text-sm mt-2">
                    Os comandos serão re-registrados automaticamente no novo servidor.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de servidores */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingGuilds ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-gray-400" size={32} />
                  <span className="ml-3 text-gray-400">Carregando servidores...</span>
                </div>
              ) : guilds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Nenhum servidor disponível</p>
                  <p className="text-gray-500 text-sm mt-2">O bot precisa estar em pelo menos um outro servidor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guilds.map((guild) => (
                    <button
                      key={guild.id}
                      onClick={() => setSelectedGuildId(guild.id)}
                      className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                        selectedGuildId === guild.id
                          ? 'border-white bg-white/5'
                          : 'border-[#1a1a1a] hover:border-[#2a2a2a] bg-[#0b0b0b]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                          {guild.icon ? (
                            <img
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                              alt={guild.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {guild.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{guild.name}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {guild.id}</p>
                        </div>
                        {selectedGuildId === guild.id && (
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#0a0a0a]"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#1a1a1a] flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg font-medium transition-colors border border-[#1a1a1a] bg-transparent text-gray-400 hover:text-white hover:border-[#2a2a2a]"
                disabled={changing}
              >
                Cancelar
              </button>
              <button
                onClick={handleMudarServidor}
                disabled={!selectedGuildId || changing || loadingGuilds}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  confirming
                    ? 'bg-white text-[#0a0a0a] border-white hover:bg-gray-200'
                    : 'bg-[#0b0b0b] text-white border-[#1a1a1a] hover:bg-[#111] hover:border-[#2a2a2a]'
                }`}
              >
                {changing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Mudando...</span>
                  </>
                ) : confirming ? (
                  <span>Confirmar Mudança (2ª vez)</span>
                ) : (
                  <span>Confirmar Mudança</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

