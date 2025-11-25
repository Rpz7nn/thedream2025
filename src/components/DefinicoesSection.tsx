import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, Plus, Check } from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';

interface Canal {
  id: string;
  name: string;
  type: number;
  position: number;
  parentId?: string;
}

interface Cargo {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface DefinicoesData {
  canaisLogs: {
    [key: string]: string;
  };
  cargos: {
    [key: string]: string;
  };
}

interface DefinicoesSectionProps {
  application: any;
  botApiUrl: string;
}

export default function DefinicoesSection({ application, botApiUrl }: DefinicoesSectionProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const { toast } = useToast();
  const [canais, setCanais] = useState<Canal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [definicoes, setDefinicoes] = useState<DefinicoesData>({ canaisLogs: {}, cargos: {} });
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [criandoCanais, setCriandoCanais] = useState(false);
  const [criandoCargos, setCriandoCargos] = useState(false);

  const canaisLogs = [
    { id: 'logs-pedidos', label: 'Logs de Pedidos' },
    { id: 'logs-compras', label: 'Logs de Compras' },
    { id: 'boas-vindas', label: 'Boas-vindas' },
    { id: 'logs-sistema', label: 'Logs do Sistema' },
    { id: 'logs-antiraid', label: 'Logs Anti-Raid' },
    { id: 'logs-entradas', label: 'Logs de Entradas' },
    { id: 'logs-saidas', label: 'Logs de Saídas' },
    { id: 'logs-mensagens', label: 'Logs de Mensagens' },
    { id: 'logs-e-cloud', label: 'Logs E-Cloud' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'dream-announcements', label: 'Anúncios Dream' }
  ];

  const tiposCargos = [
    { id: 'administrador', label: 'Administrador' },
    { id: 'suporte', label: 'Suporte' },
    { id: 'cliente', label: 'Cliente' },
    { id: 'membro', label: 'Membro' }
  ];

  useEffect(() => {
    if (application?.guild_id) {
      // Carregar tudo em paralelo para aparecer imediatamente
      Promise.allSettled([
        carregarCanais(),
        carregarCargos(),
        carregarDefinicoes()
      ]);
    }
  }, [application?.guild_id]);

  const carregarCanais = async () => {
    try {
      setLoading(true);
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      const response = await fetch(`${botApiUrl}/definicoes/canais/${application.guild_id}?bot_id=${botId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Erro HTTP ao carregar canais:', response.status, text);
        toast({
          title: 'Erro ao carregar canais',
          description: `Status: ${response.status}`,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCanais(data.channels || []);
      } else if (data.error) {
        toast({
          title: 'Erro ao carregar canais',
          description: data.error,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      toast({
        title: 'Erro ao carregar canais',
        description: 'Erro desconhecido',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarCargos = async () => {
    try {
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      const response = await fetch(`${botApiUrl}/definicoes/cargos/${application.guild_id}?bot_id=${botId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Erro HTTP ao carregar cargos:', response.status, text);
        toast({
          title: 'Erro ao carregar cargos',
          description: `Status: ${response.status}`,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCargos(data.roles || []);
      } else if (data.error) {
        toast({
          title: 'Erro ao carregar cargos',
          description: data.error,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast({
        title: 'Erro ao carregar cargos',
        description: 'Erro desconhecido',
        type: 'error',
      });
    }
  };

  const carregarDefinicoes = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      
      if (!botId || !guildId) {
        console.warn('botId ou guildId não encontrado');
        return;
      }

      const response = await fetch(`${botApiUrl}/definicoes?bot_id=${botId}&guild_id=${guildId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
        setDefinicoes({
          canaisLogs: data.canaisLogs || {},
          cargos: data.cargos || {}
        });
    } catch (error) {
      console.error('Erro ao carregar definições:', error);
    }
  };

  const salvarDefinicoes = async () => {
    try {
      setSalvando(true);
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      
      const response = await fetch(`${botApiUrl}/definicoes/salvar?bot_id=${botId}&guild_id=${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          canaisLogs: definicoes.canaisLogs,
          cargos: definicoes.cargos
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Definições salvas com sucesso!',
          type: 'success',
        });
      } else {
        toast({
          title: 'Erro ao salvar definições',
          description: data.error || 'Erro desconhecido',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar definições',
        description: 'Erro desconhecido',
        type: 'error',
      });
    } finally {
      setSalvando(false);
    }
  };

  const criarTodosCanais = async () => {
    confirm({
      title: 'Criar todos os canais automaticamente?',
      description: 'Isso criará:\n- 1 Categoria "🌟 Dream App"\n- 11 Canais de logs\n\nOs canais serão automaticamente associados às definições.',
      onConfirm: async () => {
    try {
      setCriandoCanais(true);
          
          // Notificação de progresso
          const { update, id } = toast({
            title: 'Criando canais...',
            description: 'Aguarde, isso pode levar 10-15 segundos.',
            type: 'info',
            duration: 30000,
          });
      
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      const response = await fetch(`${botApiUrl}/definicoes/criar-canais/${application.guild_id}?bot_id=${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
            update({
              id,
              title: 'Canais criados com sucesso!',
              description: 'Categoria e 11 canais foram criados com sucesso.',
              type: 'success',
              duration: 5000,
            });
        
        // Atualizar definições imediatamente com os dados retornados pelo backend
        if (data.definicoes) {
          setDefinicoes({
            canaisLogs: data.definicoes.canaisLogs || definicoes.canaisLogs,
            cargos: data.definicoes.cargos || definicoes.cargos
          });
        }
        
        await Promise.all([
          carregarCanais(),
          carregarDefinicoes()
        ]);
      } else {
            update({
              id,
              title: 'Erro ao criar canais',
              description: data.error || 'Erro desconhecido',
              type: 'error',
              duration: 5000,
            });
      }
        } catch (error: any) {
      console.error('Erro ao criar canais:', error);
          toast({
            title: 'Erro ao criar canais',
            description: error.message || 'Erro desconhecido',
            type: 'error',
            duration: 5000,
          });
    } finally {
      setCriandoCanais(false);
    }
      }
    });
  };

  const criarTodosCargos = async () => {
    confirm({
      title: 'Criar todos os cargos automaticamente?',
      description: 'Isso criará:\n- Administrador (vermelho)\n- Suporte (azul)\n- Cliente (verde)\n- Membro (cinza)\n\nOs cargos serão automaticamente associados às definições.',
      onConfirm: async () => {
    try {
      setCriandoCargos(true);
          
          // Notificação de progresso
          const { update, id } = toast({
            title: 'Criando cargos...',
            description: 'Aguarde, isso pode levar alguns segundos.',
            type: 'info',
            duration: 30000,
          });
      
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      const response = await fetch(`${botApiUrl}/definicoes/criar-cargos/${application.guild_id}?bot_id=${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
            update({
              id,
              title: 'Cargos criados com sucesso!',
              description: '4 cargos criados (Administrador, Suporte, Cliente, Membro).',
              type: 'success',
              duration: 5000,
            });
        
        // Atualizar definições imediatamente com os dados retornados pelo backend
        if (data.definicoes) {
          setDefinicoes({
            canaisLogs: data.definicoes.canaisLogs || definicoes.canaisLogs,
            cargos: data.definicoes.cargos || definicoes.cargos
          });
        }
        
        await Promise.all([
          carregarCargos(),
          carregarDefinicoes()
        ]);
      } else {
            update({
              id,
              title: 'Erro ao criar cargos',
              description: data.error || 'Erro desconhecido',
              type: 'error',
              duration: 5000,
            });
      }
        } catch (error: any) {
      console.error('Erro ao criar cargos:', error);
          toast({
            title: 'Erro ao criar cargos',
            description: error.message || 'Erro desconhecido',
            type: 'error',
            duration: 5000,
          });
    } finally {
      setCriandoCargos(false);
    }
      }
    });
  };

  const criarBackup = async () => {
    try {
      const response = await fetch(`${botApiUrl}/definicoes/backup`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!data.success) {
        toast({
          title: 'Erro ao criar backup',
          description: data.error || 'Erro desconhecido',
          type: 'error',
        });
      } else {
        toast({
          title: 'Backup criado com sucesso!',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: 'Erro ao criar backup',
        description: 'Erro desconhecido',
        type: 'error',
      });
    }
  };

  const getChannelIcon = (type: number) => {
    // Retornar apenas texto simples sem emojis
    switch(type) {
      case 0: return '#';
      case 2: return '';
      case 5: return '';
      case 13: return '';
      case 15: return '';
      default: return '';
    }
  };

  return (
    <>
      <ConfirmDialog />
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#ffffff] mb-1">Definições</h1>
        <p className="text-sm text-[#999999]">Configure canais de logs e cargos do servidor</p>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={salvarDefinicoes}
          disabled={salvando}
          className="px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Save size={16} strokeWidth={1.5} />
          {salvando ? 'Salvando...' : 'Salvar Definições'}
        </button>
        <button
          onClick={criarTodosCanais}
          disabled={criandoCanais}
          className="px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Plus size={16} strokeWidth={1.5} />
          {criandoCanais ? 'Criando...' : 'Criar Todos os Canais'}
        </button>
        <button
          onClick={criarTodosCargos}
          disabled={criandoCargos}
          className="px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Plus size={16} strokeWidth={1.5} />
          {criandoCargos ? 'Criando...' : 'Criar Todos os Cargos'}
        </button>
        <button
          onClick={criarBackup}
          className="px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <Download size={16} strokeWidth={1.5} />
          Backup
        </button>
      </div>

      {/* Grid de Canais e Cargos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canais de Logs */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="text-[#999999]" size={20} strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-white">Canais de Logs</h3>
          </div>

          <div className="space-y-4">
            {loading && canais.length === 0 && (
              <div className="text-center py-4 text-[#999999] text-sm">Carregando canais...</div>
            )}
            {canaisLogs.map(canal => (
              <div key={canal.id}>
                <label className="text-xs text-[#999999] mb-1.5 block font-medium">
                  {canal.label}
                </label>
                <select
                  value={definicoes.canaisLogs[canal.id] || ''}
                  onChange={(e) => setDefinicoes({
                    ...definicoes,
                    canaisLogs: { ...definicoes.canaisLogs, [canal.id]: e.target.value }
                  })}
                  disabled={loading && canais.length === 0}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um canal</option>
                  {canais.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {getChannelIcon(ch.type)}{ch.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Cargos */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="text-[#999999]" size={20} strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-white">Cargos</h3>
          </div>

          <div className="space-y-4">
            {loading && cargos.length === 0 && (
              <div className="text-center py-4 text-[#999999] text-sm">Carregando cargos...</div>
            )}
            {tiposCargos.map(tipo => (
              <div key={tipo.id}>
                <label className="text-xs text-[#999999] mb-1.5 block font-medium">
                  {tipo.label}
                </label>
                <select
                  value={definicoes.cargos[tipo.id] || ''}
                  onChange={(e) => setDefinicoes({
                    ...definicoes,
                    cargos: { ...definicoes.cargos, [tipo.id]: e.target.value }
                  })}
                  disabled={loading && cargos.length === 0}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um cargo</option>
                  {cargos.map(cargo => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <h4 className="text-base font-semibold text-white mb-4">Informações</h4>
        <ul className="space-y-2.5 text-sm text-[#999999]">
          <li className="flex items-start gap-2">
            <span className="text-[#666666]">•</span>
            <span><span className="text-white font-medium">Criar Todos os Canais:</span> Cria automaticamente uma categoria "Dream App" com todos os canais de logs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#666666]">•</span>
            <span><span className="text-white font-medium">Criar Todos os Cargos:</span> Cria automaticamente os cargos de Administrador, Suporte, Cliente e Membro</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#666666]">•</span>
            <span><span className="text-white font-medium">Backup:</span> Cria um arquivo de backup com todas as definições atuais</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#666666]">•</span>
            <span><span className="text-white font-medium">Salvar:</span> Salva as configurações de canais e cargos selecionados</span>
          </li>
        </ul>
      </div>
    </div>
    </>
  );
}

