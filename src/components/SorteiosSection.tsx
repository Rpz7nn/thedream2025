import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Gift, ArrowUp, ChevronDown, Check, X, Slash, Loader2, RotateCw, Share2, Image as ImageIcon, Calendar, Clock, Users, Hash, Search } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useConfirm } from '../hooks/use-confirm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { getApiPath } from '@/utils/api';

interface Requisitos {
  membroCliente: 'deny' | 'neutral' | 'allow';
  feedbackScience: 'deny' | 'neutral' | 'allow';
  membroVerificado: 'deny' | 'neutral' | 'allow';
  cargosObrigatorios: string[];
  cargosBloqueados: string[];
}

interface Sorteio {
  id: string;
  nome: string;
  descricao?: string;
  icon?: string;
  banner?: string;
  channelId?: string;
  messageId?: string;
  vencedores: number;
  maxParticipantes?: number;
  dataInicio: Date | string;
  dataFim?: Date | string;
  requisitos: Requisitos;
  status: 'rascunho' | 'ativo' | 'finalizado' | 'cancelado';
  botaoLabel?: string;
  botaoEmoji?: string;
  botaoCor?: string;
  embedColor?: string;
  tipoPremiacao?: 'sem-automatica' | 'automatica';
  mensagemPremiacao?: string;
  participantes?: Array<{
    userId: string;
    username: string;
    participouEm: Date;
    avatar?: string;
  }>;
  vencedoresIds?: string[];
  sorteadoEm?: Date;
  createdAt: string;
  updatedAt: string;
}

interface SorteiosSectionProps {
  application: any;
  botApiUrl: string;
}

const getSorteiosApiUrl = () => getApiPath('/api/sorteios');

// Lista completa de fusos horários do mundo

export default function SorteiosSection({ application, botApiUrl }: SorteiosSectionProps) {
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoSorteio, setEditandoSorteio] = useState<string | null>(null);
  const [sorteioAtual, setSorteioAtual] = useState<Sorteio | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'requisitos' | 'premiacao' | 'participantes'>('geral');
  const [guildChannels, setGuildChannels] = useState<Array<{ id: string; name: string; type: number }>>([]);
  const [guildRoles, setGuildRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['geral', 'requisitos']));
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [icon, setIcon] = useState('');
  const [banner, setBanner] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [maxVencedores, setMaxVencedores] = useState(1);
  const [maxParticipantes, setMaxParticipantes] = useState(0);
  const [canalSorteio, setCanalSorteio] = useState('');
  const [botaoLabel, setBotaoLabel] = useState('Participar');
  const [botaoEmoji, setBotaoEmoji] = useState('');
  const [botaoCor, setBotaoCor] = useState('Primary');
  const [embedColor, setEmbedColor] = useState('#58B37F');
  const [tipoPremiacao, setTipoPremiacao] = useState<'sem-automatica' | 'automatica'>('sem-automatica');
  const [mensagemPremiacao, setMensagemPremiacao] = useState('');
  const [requisitos, setRequisitos] = useState<Requisitos>({
    membroCliente: 'neutral',
    feedbackScience: 'neutral',
    membroVerificado: 'neutral',
    cargosObrigatorios: [],
    cargosBloqueados: [],
  });
  
  // Estado do modal de seleção de canal
  const [modalPostarAberto, setModalPostarAberto] = useState(false);
  const [canalPesquisa, setCanalPesquisa] = useState('');
  const [postando, setPostando] = useState(false);
  

  // Função para buscar canais do servidor
  const fetchGuildChannels = useCallback(async () => {
    if (!application?.guild_id) {
      console.warn('⚠️ fetchGuildChannels: guild_id não encontrado');
      return;
    }
    
    try {
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId) {
        console.warn('⚠️ fetchGuildChannels: botId não encontrado');
        return;
      }
      
      console.log('🔍 Buscando canais:', { guildId: application.guild_id, botId });
      
      const response = await fetch(`${botApiUrl}/definicoes/canais/${application.guild_id}?bot_id=${botId}`, {
        credentials: 'include'
      });
      
      console.log('📡 Resposta da API de canais:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Dados recebidos:', {
          success: data.success,
          channelsCount: data.channels?.length || 0,
          cached: data.cached
        });
        
        if (data.success && data.channels) {
          console.log('✅ Canais carregados:', data.channels.length);
          setGuildChannels(data.channels);
        } else {
          console.warn('⚠️ Resposta não tem success ou channels:', data);
          setGuildChannels([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro HTTP ao buscar canais:', response.status, errorData);
        setGuildChannels([]);
        toast({
          title: 'Erro',
          description: `Erro ao carregar canais: ${response.status} ${errorData?.error || ''}`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar canais:', error);
      setGuildChannels([]);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar canais. Verifique a conexão.',
        type: 'error',
      });
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id, toast]);

  // Função para buscar cargos do servidor
  const fetchGuildRoles = useCallback(async () => {
    if (!application?.guild_id) return;
    
    try {
      const botId = application?.configuration?.clientId || application?.client_id;
      if (botId) {
        const response = await fetch(`${botApiUrl}/definicoes/cargos/${application.guild_id}?bot_id=${botId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.roles) {
            setGuildRoles(data.roles);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id]);

  // Buscar sorteios
  const fetchSorteios = useCallback(async () => {
    setLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;

      if (!botId || !guildId) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ bot_id: botId, guild_id: guildId });
      const response = await fetch(`${getSorteiosApiUrl()}?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSorteios(data.sorteios || []);
      }
    } catch (error) {
      console.error('Erro ao buscar sorteios:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar sorteios',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id, toast]);

  useEffect(() => {
    if (application?.guild_id) {
      const botId = application?.configuration?.clientId || application?.client_id;
      if (botId) {
        console.log('🔄 Inicializando sorteios, canais e cargos...', { guildId: application.guild_id, botId });
        fetchSorteios();
        fetchGuildChannels();
        fetchGuildRoles();
      } else {
        console.warn('⚠️ BotId não encontrado para carregar dados');
      }
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id, fetchSorteios, fetchGuildChannels, fetchGuildRoles]);

  // Função para criar novo sorteio
  const handleCriarSorteio = () => {
    setEditandoSorteio('new');
    setSorteioAtual(null);
    setAbaAtiva('geral');
    setHasUnsavedChanges(false);
    
    // Resetar formulário
    setNome('Novo Sorteio');
    setDescricao('');
    setIcon('');
    setBanner('');
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(amanha.getDate() + 1);
    
    // Formatar datas para datetime-local (YYYY-MM-DDTHH:mm)
    const formatarData = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setDataInicio(formatarData(agora));
    setDataFim(formatarData(amanha));
    setMaxVencedores(1);
    setMaxParticipantes(0);
    setCanalSorteio('');
    setBotaoLabel('Participar');
    setBotaoEmoji('');
    setBotaoCor('Primary');
    setEmbedColor('#58B37F');
    setTipoPremiacao('sem-automatica');
    setMensagemPremiacao('');
    setRequisitos({
      membroCliente: 'neutral',
      feedbackScience: 'neutral',
      membroVerificado: 'neutral',
      cargosObrigatorios: [],
      cargosBloqueados: [],
    });
  };

  // Função para editar sorteio existente
  const handleEditarSorteio = (sorteio: Sorteio) => {
    setEditandoSorteio(sorteio.id);
    setSorteioAtual(sorteio);
    setAbaAtiva('geral');
    setHasUnsavedChanges(false);
    
    // Função para formatar data para datetime-local
    const formatarData = (date: Date | string | undefined) => {
      if (!date) return '';
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Preencher formulário com dados do sorteio
    setNome(sorteio.nome || '');
    setDescricao(sorteio.descricao || '');
    setIcon(sorteio.icon || '');
    setBanner(sorteio.banner || '');
    setDataInicio(formatarData(sorteio.dataInicio));
    setDataFim(formatarData(sorteio.dataFim));
    setMaxVencedores(sorteio.vencedores || 1);
    setMaxParticipantes(sorteio.maxParticipantes || 0);
    setCanalSorteio(sorteio.channelId || '');
    setBotaoLabel(sorteio.botaoLabel || 'Participar');
    setBotaoEmoji(sorteio.botaoEmoji || '');
    setBotaoCor(sorteio.botaoCor || 'Primary');
    setEmbedColor(sorteio.embedColor || '#58B37F');
    setTipoPremiacao(sorteio.tipoPremiacao || 'sem-automatica');
    setMensagemPremiacao(sorteio.mensagemPremiacao || '');
    
    // Migrar requisitos antigos para novos (apenas os 3 principais)
    const requisitosAntigos = (sorteio.requisitos || {}) as Partial<Requisitos>;
    setRequisitos({
      membroCliente: requisitosAntigos.membroCliente || 'neutral',
      feedbackScience: requisitosAntigos.feedbackScience || 'neutral',
      membroVerificado: requisitosAntigos.membroVerificado || 'neutral',
      cargosObrigatorios: requisitosAntigos.cargosObrigatorios || [],
      cargosBloqueados: requisitosAntigos.cargosBloqueados || [],
    });
    
    // Recarregar canais e cargos ao editar
    fetchGuildChannels();
    fetchGuildRoles();
  };

  // Função para deletar sorteio
  const handleDeletarSorteio = async (id: string) => {
    confirm({
      title: 'Deletar Sorteio',
      description: 'Tem certeza que deseja deletar este sorteio? Esta ação não pode ser desfeita.',
      confirmText: 'OK',
      cancelText: 'Cancelar',
      onConfirm: async () => {
    try {
      const botId = application?.configuration?.clientId || application?.client_id;
      const guildId = application?.guild_id;
      
          const response = await fetch(`${getSorteiosApiUrl()}/${id}?bot_id=${botId}&guild_id=${guildId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Sorteio deletado com sucesso',
          type: 'success',
        });
        fetchSorteios();
        if (editandoSorteio === id) {
          setEditandoSorteio(null);
          setSorteioAtual(null);
        }
      } else {
        throw new Error('Erro ao deletar sorteio');
      }
    } catch (error) {
      console.error('Erro ao deletar sorteio:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar sorteio',
        type: 'error',
      });
    }
      }
    });
  };

  // Função para enviar/sincronizar/atualizar sorteio
  const handleEnviar = async () => {
    if (!nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do sorteio é obrigatório',
        type: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const botId = application?.configuration?.clientId || application?.client_id;
      const guildId = application?.guild_id;

      if (!dataInicio) {
        toast({
          title: 'Erro',
          description: 'Data de Início é obrigatória',
          type: 'error',
        });
        setSaving(false);
        return;
      }

      if (!dataFim) {
        toast({
          title: 'Erro',
          description: 'Data de Fim é obrigatória',
          type: 'error',
        });
        setSaving(false);
        return;
      }

      if (!canalSorteio) {
        toast({
          title: 'Erro',
          description: 'Canal do Sorteio é obrigatório',
          type: 'error',
        });
        setSaving(false);
        return;
      }

      const sorteioData = {
        bot_id: botId,
        guild_id: guildId,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        icon: icon.trim() || null,
        banner: banner.trim() || null,
        channelId: canalSorteio,
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: new Date(dataFim).toISOString(),
        vencedores: maxVencedores || 1,
        maxParticipantes: maxParticipantes || 0,
        botaoLabel: botaoLabel.trim() || 'Participar',
        botaoEmoji: botaoEmoji.trim() || null,
        botaoCor: botaoCor || 'Primary',
        embedColor: embedColor || '#58B37F',
        tipoPremiacao: tipoPremiacao || 'sem-automatica',
        mensagemPremiacao: mensagemPremiacao.trim() || null,
        requisitos,
      };

      let response;
      const baseUrl = getSorteiosApiUrl();
      const url = editandoSorteio === 'new' 
        ? baseUrl 
        : `${baseUrl}/${editandoSorteio}?bot_id=${botId}&guild_id=${guildId}`;
      
      console.log('🔍 Enviando requisição:', {
        method: editandoSorteio === 'new' ? 'POST' : 'PATCH',
        url,
        sorteioData
      });
      
      if (editandoSorteio === 'new') {
        // Criar novo sorteio
        response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(sorteioData),
        });
      } else {
        // Atualizar sorteio existente
        response = await fetch(`${baseUrl}/${editandoSorteio}?bot_id=${botId}&guild_id=${guildId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(sorteioData),
        });
      }
      
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (response.ok) {
        const data = await response.json();
        const sorteioSalvo = data.sorteio;
        const wasPosted = sorteioAtual?.messageId;
        
        // Sempre enviar/sincronizar após salvar
        try {
          const hasMessage = sorteioSalvo?.messageId || wasPosted;
          console.log(`📤 ${hasMessage ? 'Sincronizando' : 'Enviando'} sorteio ao Discord...`);
          
          const postarResponse = await fetch(`${getSorteiosApiUrl()}/${sorteioSalvo.id}/postar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              bot_id: botId,
              guild_id: guildId,
              channelId: canalSorteio
            }),
          });

          if (postarResponse.ok) {
            const postarData = await postarResponse.json();
            if (postarData.sorteio) {
              sorteioSalvo.messageId = postarData.sorteio.messageId;
              sorteioSalvo.status = postarData.sorteio.status;
            }
            
        toast({
          title: 'Sucesso',
              description: hasMessage 
                ? 'Sorteio sincronizado com sucesso!' 
                : editandoSorteio === 'new'
                  ? 'Sorteio criado e enviado ao Discord com sucesso!'
                  : 'Sorteio atualizado e enviado ao Discord com sucesso!',
          type: 'success',
        });
          } else {
            const errorData = await postarResponse.json().catch(() => ({}));
            console.error('⚠️ Erro ao enviar/sincronizar sorteio ao Discord:', errorData);
            toast({
              title: 'Aviso',
              description: `Sorteio ${editandoSorteio === 'new' ? 'criado' : 'atualizado'} com sucesso, mas houve um erro ao ${hasMessage ? 'sincronizar' : 'enviar'} ao Discord: ${errorData.error || 'Erro desconhecido'}`,
              type: 'warning',
            });
          }
        } catch (postarError: any) {
          console.error('❌ Erro ao enviar/sincronizar sorteio ao Discord:', postarError);
          toast({
            title: 'Aviso',
            description: `Sorteio ${editandoSorteio === 'new' ? 'criado' : 'atualizado'} com sucesso, mas houve um erro ao enviar ao Discord.`,
            type: 'warning',
          });
        }
        
        setHasUnsavedChanges(false);
        
        // Atualizar estado local sem recarregar
        if (sorteioSalvo) {
          if (editandoSorteio === 'new') {
            // Se foi criado novo, editar o criado
            handleEditarSorteio(sorteioSalvo);
          } else {
            // Atualizar sorteio atual no estado
            setSorteioAtual(sorteioSalvo);
          }
        }
      } else {
        let errorMessage = 'Erro ao salvar sorteio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Erro ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Erro ${response.status}: ${response.statusText || 'Não foi possível salvar o sorteio'}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Erro ao salvar sorteio:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar sorteio',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para limpar alterações
  const handleLimpar = () => {
    if (sorteioAtual) {
      handleEditarSorteio(sorteioAtual);
    } else {
      handleCriarSorteio();
    }
  };

  // Função para toggle de requisito
  const handleToggleRequisito = (requisito: keyof Requisitos, valor: 'deny' | 'neutral' | 'allow') => {
    setRequisitos(prev => ({ ...prev, [requisito]: valor }));
    setHasUnsavedChanges(true);
  };

  // Detectar mudanças não salvas
  useEffect(() => {
    if (editandoSorteio && !saving) {
      // Verificar se há mudanças não salvas
      // Simplificado por enquanto - sempre considerar como mudanças
    }
  }, [nome, descricao, icon, banner, dataInicio, dataFim, maxVencedores, maxParticipantes, canalSorteio, requisitos, editandoSorteio, saving]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#999999]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#ffffff] mb-1">Sorteios</h1>
          <p className="text-[#999999] text-sm">Gerencie os sorteios da {application?.guild_name || 'servidor'}</p>
        </div>
        <button
          onClick={handleCriarSorteio}
          className="px-4 py-2 bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={1.5} />
          Criar Sorteio
        </button>
      </div>

      {/* Card Principal */}
      {editandoSorteio && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {/* Header do Card */}
          <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#ffffff]">{nome || 'Novo Sorteio'}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedSections(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has('card')) {
                    newSet.delete('card');
                  } else {
                    newSet.add('card');
                  }
                  return newSet;
                })}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ChevronDown 
                  size={20} 
                  className={`text-[#999999] transition-transform ${expandedSections.has('card') ? 'rotate-180' : ''}`} 
                  strokeWidth={1.5}
                />
              </button>
              <button
                onClick={() => editandoSorteio && editandoSorteio !== 'new' && handleDeletarSorteio(editandoSorteio)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} className="text-red-500" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] px-6">
            <button
              onClick={() => setAbaAtiva('geral')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                abaAtiva === 'geral'
                  ? 'text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Geral
              {abaAtiva === 'geral' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffffff]" />
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('requisitos')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                abaAtiva === 'requisitos'
                  ? 'text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Requisitos
              {abaAtiva === 'requisitos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffffff]" />
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('premiacao')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                abaAtiva === 'premiacao'
                  ? 'text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Premiação
              {abaAtiva === 'premiacao' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffffff]" />
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('participantes')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                abaAtiva === 'participantes'
                  ? 'text-[#ffffff]'
                  : 'text-[#999999] hover:text-[#ffffff]'
              }`}
            >
              Participantes
              {abaAtiva === 'participantes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffffff]" />
              )}
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          {expandedSections.has('card') && (
            <div className="p-6">
              {/* Aba Geral */}
              {abaAtiva === 'geral' && (
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#ffffff] mb-4">Informações Básicas</h3>
                    
                    <div className="space-y-4">
                      {/* Nome do Sorteio */}
                      <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">Nome do Sorteio</label>
                        <input
                          type="text"
                          value={nome}
                          onChange={(e) => {
                            setNome(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Nome do sorteio"
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                        />
                      </div>

                      {/* Link do Banner (Opcional) */}
                        <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">
                          Link do Banner <span className="text-[#666666] text-xs">(Opcional)</span>
                        </label>
                          <input
                          type="url"
                          value={banner}
                            onChange={(e) => {
                            setBanner(e.target.value);
                                  setHasUnsavedChanges(true);
                          }}
                          placeholder="https://exemplo.com/banner.png"
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                        />
                      </div>

                      {/* Link do Icon (Opcional) */}
                      <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">
                          Link do Icon <span className="text-[#666666] text-xs">(Opcional)</span>
                        </label>
                            <input
                              type="url"
                              value={icon}
                              onChange={(e) => {
                                setIcon(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                          placeholder="https://exemplo.com/icon.png"
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                            />
                        </div>

                      {/* Descrição (Opcional) */}
                        <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">
                          Descrição <span className="text-[#666666] text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          value={descricao}
                          onChange={(e) => {
                            setDescricao(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Descrição do sorteio"
                          rows={4}
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a] resize-y"
                        />
                              </div>
                          </div>
                  </div>

                  {/* Configurações */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#ffffff] mb-4">Configurações</h3>
                    
                    <div className="space-y-4">
                      {/* Data de Início e Data de Fim */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#ffffff] mb-2">
                            Data de Início <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={dataInicio}
                            onChange={(e) => {
                              setDataInicio(e.target.value);
                                  setHasUnsavedChanges(true);
                            }}
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#ffffff] mb-2">
                            Data de Fim <span className="text-red-500">*</span>
                          </label>
                            <input
                            type="datetime-local"
                            value={dataFim}
                              onChange={(e) => {
                              setDataFim(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                            />
                        </div>
                      </div>

                      {/* Máximo de Vencedores e Máximo de Participantes */}
                      <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-[#ffffff] mb-2">Máximo de Vencedores</label>
                          <input
                            type="number"
                            value={maxVencedores}
                          onChange={(e) => {
                              setMaxVencedores(parseInt(e.target.value) || 1);
                            setHasUnsavedChanges(true);
                          }}
                            min="1"
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                        />
                      </div>
                        <div>
                          <label className="block text-sm font-medium text-[#ffffff] mb-2">Máximo de Participantes</label>
                          <input
                            type="number"
                            value={maxParticipantes}
                            onChange={(e) => {
                              setMaxParticipantes(parseInt(e.target.value) || 0);
                              setHasUnsavedChanges(true);
                            }}
                            min="0"
                            placeholder="0 = Ilimitado"
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                          />
                    </div>
                  </div>

                      {/* Canal do Sorteio */}
                  <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">
                          Canal do Sorteio <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={canalSorteio}
                          onChange={(e) => {
                            setCanalSorteio(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                        >
                          <option value="">Selecione um canal</option>
                          {guildChannels.filter(ch => ch.type === 0).map(channel => (
                            <option key={channel.id} value={channel.id}>
                              #{channel.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Configuração do Botão */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#ffffff] mb-3">Configuração do Botão</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#ffffff] mb-2">
                              Nome do Botão
                            </label>
                      <input
                        type="text"
                              value={botaoLabel}
                              onChange={(e) => {
                                setBotaoLabel(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Participar"
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                      />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#ffffff] mb-2">
                              Emoji do Botão <span className="text-[#666666] text-xs">(Opcional)</span>
                            </label>
                            <input
                              type="text"
                              value={botaoEmoji}
                              onChange={(e) => {
                                setBotaoEmoji(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                              placeholder="✨ ou <:nome:id>"
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                            />
                            <p className="text-xs text-[#666666] mt-1">
                              Use um emoji padrão (✨) ou um emoji customizado (&lt;:nome:id&gt;)
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#ffffff] mb-2">
                              Cor do Botão
                            </label>
                            <select
                              value={botaoCor}
                              onChange={(e) => {
                                setBotaoCor(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                            >
                              <option value="Primary">Azul (Primary)</option>
                              <option value="Secondary">Cinza (Secondary)</option>
                              <option value="Success">Verde (Success)</option>
                              <option value="Danger">Vermelho (Danger)</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Cor da Embed */}
                        <div>
                          <label className="block text-sm font-medium text-[#ffffff] mb-2">
                            Cor da Embed
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={embedColor}
                              onChange={(e) => {
                                setEmbedColor(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              className="w-16 h-10 rounded border border-[#1a1a1a] cursor-pointer"
                            />
                            <input
                              type="text"
                              value={embedColor}
                              onChange={(e) => {
                                setEmbedColor(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="#58B37F"
                              className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Requisitos */}
              {abaAtiva === 'requisitos' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#ffffff] mb-4 flex items-center gap-2">
                    Requisitos de Participação
                    <ChevronDown 
                      size={16} 
                      className={`text-[#999999] transition-transform ${expandedSections.has('requisitos') ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </h3>

                  {/* Toggles de Requisitos - Apenas 3 */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {[
                      { key: 'membroCliente', label: 'Membro Cliente' },
                      { key: 'feedbackScience', label: 'Feedback Science' },
                      { key: 'membroVerificado', label: 'Membro Verificado' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex flex-col items-center gap-3">
                        <p className="text-sm text-[#ffffff] font-medium text-center">{label}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleRequisito(key as keyof Requisitos, 'deny')}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                              requisitos[key as keyof Requisitos] === 'deny'
                                ? 'bg-red-500/20 border border-red-500'
                                : 'bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a]'
                            }`}
                          >
                            <X size={16} className="text-red-500" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleToggleRequisito(key as keyof Requisitos, 'neutral')}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                              requisitos[key as keyof Requisitos] === 'neutral'
                                ? 'bg-[#1a1a1a] border border-[#2a2a2a]'
                                : 'bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a]'
                            }`}
                          >
                            <Slash size={16} className="text-[#999999]" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleToggleRequisito(key as keyof Requisitos, 'allow')}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                              requisitos[key as keyof Requisitos] === 'allow'
                                ? 'bg-green-500/20 border border-green-500'
                                : 'bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a]'
                            }`}
                          >
                            <Check size={16} className="text-green-500" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cargos Obrigatórios e Bloqueados */}
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">Cargos Obrigatórios</label>
                        <select
                          multiple
                          value={requisitos.cargosObrigatorios}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setRequisitos(prev => ({ ...prev, cargosObrigatorios: selected }));
                            setHasUnsavedChanges(true);
                          }}
                        className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a] min-h-[150px]"
                        >
                          {guildRoles.map(role => (
                            <option key={role.id} value={role.id} className="bg-[#0f0f0f] text-[#ffffff]">
                              {role.name}
                            </option>
                          ))}
                        </select>
                      <p className="text-xs text-[#666666] mt-1">Segure Ctrl/Cmd para selecionar múltiplos</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">Cargos Bloqueados</label>
                        <select
                          multiple
                          value={requisitos.cargosBloqueados}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setRequisitos(prev => ({ ...prev, cargosBloqueados: selected }));
                            setHasUnsavedChanges(true);
                          }}
                        className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a] min-h-[150px]"
                        >
                          {guildRoles.map(role => (
                            <option key={role.id} value={role.id} className="bg-[#0f0f0f] text-[#ffffff]">
                              {role.name}
                            </option>
                          ))}
                        </select>
                      <p className="text-xs text-[#666666] mt-1">Segure Ctrl/Cmd para selecionar múltiplos</p>
                      </div>
                    </div>
                </div>
              )}

              {/* Aba Premiação */}
              {abaAtiva === 'premiacao' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#ffffff] mb-4">Configurações de Premiação</h3>
                  
                    <div className="space-y-4">
                    {/* Tipo de Premiação */}
                      <div>
                      <label className="block text-sm font-medium text-[#ffffff] mb-2">
                        Tipo de Premiação
                      </label>
                      <select
                        value={tipoPremiacao}
                          onChange={(e) => {
                          setTipoPremiacao(e.target.value as 'sem-automatica' | 'automatica');
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
                      >
                        <option value="sem-automatica">Sem Entrega Automática</option>
                        <option value="automatica">Entrega Automática</option>
                      </select>
                      <p className="text-xs text-[#666666] mt-1">
                        {tipoPremiacao === 'sem-automatica' 
                          ? 'Quando o sorteio terminar, enviará uma mensagem no canal reagindo à embed com a lista de vencedores'
                          : 'Quando o sorteio terminar, enviará automaticamente a mensagem configurada para os ganhadores em DM'}
                      </p>
                      </div>

                    {/* Mensagem de Premiação (apenas para Entrega Automática) */}
                    {tipoPremiacao === 'automatica' && (
                      <div>
                        <label className="block text-sm font-medium text-[#ffffff] mb-2">
                          Mensagem de Premiação
                        </label>
                        <textarea
                          value={mensagemPremiacao}
                          onChange={(e) => {
                            setMensagemPremiacao(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Digite a mensagem que será enviada para os ganhadores em DM. Use {user} para mencionar o usuário."
                          rows={6}
                          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a] resize-none"
                        />
                        <p className="text-xs text-[#666666] mt-1">
                          Esta mensagem será enviada automaticamente para cada ganhador em DM quando o sorteio for finalizado. Use {'{user}'} para mencionar o usuário.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Participantes */}
              {abaAtiva === 'participantes' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#ffffff]">Participantes do Sorteio</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#999999]">
                        {sorteioAtual?.participantes?.length || 0} participante(s)
                      </span>
                      {sorteioAtual && (
                      <button
                          onClick={async () => {
                            if (!sorteioAtual?.id) return;
                            try {
                              const botId = application?.configuration?.clientId || application?.client_id;
                              const guildId = application?.guild_id;
                              const response = await fetch(`${getSorteiosApiUrl()}/${sorteioAtual.id}?bot_id=${botId}&guild_id=${guildId}`, {
                                credentials: 'include'
                              });
                              if (response.ok) {
                                const data = await response.json();
                                if (data.sorteio) {
                                  setSorteioAtual(data.sorteio);
                                  toast({
                                    title: 'Sucesso',
                                    description: 'Lista de participantes atualizada',
                                    type: 'success',
                                  });
                                }
                              }
                            } catch (error) {
                              console.error('Erro ao atualizar participantes:', error);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-2"
                      >
                          <RotateCw size={14} strokeWidth={2} />
                          Atualizar
                      </button>
                      )}
                    </div>
                    </div>
                    
                  {!sorteioAtual || !sorteioAtual.participantes || sorteioAtual.participantes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users size={48} className="text-[#666666] mb-4" strokeWidth={1.5} />
                      <p className="text-[#999999] text-sm">Nenhum participante ainda</p>
                      <p className="text-[#666666] text-xs mt-1">Os participantes aparecerão aqui quando participarem do sorteio</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {[...(sorteioAtual.participantes || [])]
                        .sort((a, b) => {
                          const dateA = a.participouEm ? new Date(a.participouEm).getTime() : 0;
                          const dateB = b.participouEm ? new Date(b.participouEm).getTime() : 0;
                          return dateB - dateA; // Mais recente primeiro
                        })
                        .map((participante, index) => {
                        const participouEm = participante.participouEm 
                          ? new Date(participante.participouEm) 
                          : null;
                        const isVencedor = sorteioAtual.vencedoresIds?.includes(participante.userId) || false;
                        
                        return (
                          <div
                            key={participante.userId || index}
                            className={`bg-[#0f0f0f] border rounded-lg p-4 transition-colors ${
                              isVencedor 
                                ? 'border-green-500/50 bg-green-500/5' 
                                : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                            }`}
                          >
                        <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Avatar */}
                                {participante.avatar ? (
                                  <img
                                    src={participante.avatar.startsWith('a_') 
                                      ? `https://cdn.discordapp.com/avatars/${participante.userId}/${participante.avatar}.gif?size=128`
                                      : `https://cdn.discordapp.com/avatars/${participante.userId}/${participante.avatar}.png?size=128`
                                    }
                                    alt={participante.username || 'Avatar'}
                                    className="w-10 h-10 rounded-full border border-[#2a2a2a] object-cover"
                                    onError={(e) => {
                                      // Fallback para inicial se a imagem falhar
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent && !parent.querySelector('.fallback-avatar')) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#ffffff] font-medium text-sm border border-[#2a2a2a] fallback-avatar';
                                        fallback.textContent = participante.username?.charAt(0)?.toUpperCase() || '?';
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#ffffff] font-medium text-sm border border-[#2a2a2a]">
                                    {participante.username?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                )}

                                {/* Informações */}
                        <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[#ffffff] font-medium text-sm">
                                      {participante.username || 'Usuário desconhecido'}
                                    </p>
                                    {isVencedor && (
                                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">
                                        Vencedor
                                      </span>
                                    )}
                        </div>
                                  {participouEm && (
                                    <p className="text-[#666666] text-xs mt-0.5">
                                      Participou em {participouEm.toLocaleDateString('pt-BR', { 
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                          </div>
                        </div>

                              {/* ID do usuário */}
                              <div className="text-right">
                                <p className="text-[#666666] text-xs font-mono">
                                  ID: {participante.userId?.substring(0, 8)}...
                                </p>
                          </div>
                          </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                </div>
              )}

            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
                          <button
                disabled
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center gap-2"
              >
                            Ressortear
                          </button>
                        </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLimpar}
                className="px-4 py-2 text-sm text-[#999999] hover:text-[#ffffff] transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={handleEnviar}
                disabled={saving || !nome.trim() || !dataInicio || !dataFim || !canalSorteio}
                className="px-6 py-2 bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                    {sorteioAtual?.messageId ? 'Sincronizando...' : 'Enviando...'}
                  </>
                ) : (
                  sorteioAtual?.messageId ? 'Sincronizar' : 'Enviar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Sorteios */}
      {!editandoSorteio && sorteios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorteios.map((sorteio) => (
            <div
              key={sorteio.id}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors cursor-pointer"
              onClick={() => handleEditarSorteio(sorteio)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#ffffff]">{sorteio.nome}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarSorteio(sorteio);
                    }}
                    className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <Edit size={16} className="text-[#999999]" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletarSorteio(sorteio.id);
                    }}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              {sorteio.descricao && (
                <p className="text-sm text-[#999999] line-clamp-2 mb-3">{sorteio.descricao}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-[#666666]">
                <span className={`px-2 py-1 rounded ${
                  sorteio.status === 'ativo' ? 'bg-green-500/20 text-green-500' :
                  sorteio.status === 'finalizado' ? 'bg-gray-500/20 text-gray-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {sorteio.status}
                </span>
                <span>{sorteio.participantes?.length || 0} participante(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!editandoSorteio && sorteios.length === 0 && (
        <div className="text-center py-16">
          <Gift size={48} className="text-[#666666] mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-semibold text-[#ffffff] mb-2">Nenhum sorteio criado</h3>
          <p className="text-[#999999] text-sm mb-6">Comece criando seu primeiro sorteio</p>
          <button
            onClick={handleCriarSorteio}
            className="px-6 py-3 bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] rounded-lg font-medium transition-colors"
          >
            Criar Sorteio
          </button>
        </div>
      )}

      {/* Modal de Seleção de Canal para Postar */}
      <Dialog open={modalPostarAberto} onOpenChange={setModalPostarAberto}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Canal</DialogTitle>
            <DialogDescription>
              Escolha o canal onde deseja {sorteioAtual?.messageId ? 'repostar' : 'postar'} o sorteio
            </DialogDescription>
          </DialogHeader>
          
          {/* Campo de pesquisa */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999] w-4 h-4" strokeWidth={1.5} />
            <input
              type="text"
              value={canalPesquisa}
              onChange={(e) => setCanalPesquisa(e.target.value)}
              placeholder="Buscar canal..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-[#ffffff] text-sm focus:outline-none focus:border-[#2a2a2a]"
            />
          </div>

          {/* Lista de canais */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {guildChannels.length === 0 ? (
              <div className="text-center py-8 text-[#999999] text-sm">
                <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                <p>Carregando canais...</p>
              </div>
            ) : (
              guildChannels
                .filter(channel => {
                  const searchTerm = canalPesquisa.toLowerCase();
                  return channel.name.toLowerCase().includes(searchTerm);
                })
                .map(channel => (
                  <button
                    key={channel.id}
                    onClick={async () => {
                      if (postando) return;
                      
                      setPostando(true);
                      try {
                        const botId = application?.configuration?.clientId || application?.client_id;
                        const guildId = application?.guild_id;
                        
                        if (!sorteioAtual || !sorteioAtual.id) {
                          toast({
                            title: 'Erro',
                            description: 'Sorteio não encontrado',
                            type: 'error',
                          });
                          return;
                        }

                        // Chamar API para postar/repostar
                        const wasPosted = !!sorteioAtual.messageId;
                        const response = await fetch(`${getSorteiosApiUrl()}/${sorteioAtual.id}/postar`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({
                            bot_id: botId,
                            guild_id: guildId,
                            channelId: channel.id
                          }),
                        });

                        if (response.ok) {
                          const data = await response.json();
                          toast({
                            title: 'Sucesso',
                            description: wasPosted ? 'Sorteio repostado com sucesso' : 'Sorteio postado com sucesso',
                            type: 'success',
                          });
                          
                          // Atualizar sorteio com messageId (sem recarregar página)
                          if (data.sorteio) {
                            setSorteioAtual(data.sorteio);
                            // Atualizar também na lista de sorteios se estiver editando
                            if (editandoSorteio === data.sorteio.id) {
                              // Atualizar estado local
                              setSorteios(prev => prev.map(s => s.id === data.sorteio.id ? data.sorteio : s));
                            }
                          }
                          
                          setModalPostarAberto(false);
                          setCanalPesquisa('');
                        } else {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.error || 'Erro ao postar sorteio');
                        }
                      } catch (error: any) {
                        console.error('Erro ao postar sorteio:', error);
                        toast({
                          title: 'Erro',
                          description: error.message || 'Erro ao postar sorteio',
                          type: 'error',
                        });
                      } finally {
                        setPostando(false);
                      }
                    }}
                    disabled={postando}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] hover:bg-[#151515] transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Hash size={16} className="text-[#999999] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[#ffffff] text-sm flex-1">{channel.name}</span>
                    {postando && (
                      <Loader2 size={16} className="animate-spin text-[#999999] flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </button>
                ))
            )}
            {guildChannels.length > 0 && guildChannels.filter(channel => {
              const searchTerm = canalPesquisa.toLowerCase();
              return channel.name.toLowerCase().includes(searchTerm);
            }).length === 0 && (
              <div className="text-center py-8 text-[#999999] text-sm">
                Nenhum canal encontrado
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação */}
      <ConfirmDialog />
    </div>
  );
}
