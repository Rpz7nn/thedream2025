import React, { useState, useEffect, useRef } from 'react';
import { Ticket, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, RefreshCw, CheckCircle, Send } from 'lucide-react';
import { getApiPath } from '@/utils/api';

interface Canal {
  id: string;
  name: string;
  type: number;
}

interface Cargo {
  id: string;
  name: string;
  color: number;
}

interface Funcao {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  subDescricao?: string;
  corButton?: string;
  cargoNecessario?: string;
}

interface TicketConfig {
  id: string;
  titulo: string;
  descricao: string;
  ativo: boolean;
  cargoSuporte?: string;
  funcoes: Funcao[];
  messageId?: string;
  channelId?: string;
  useContainers?: boolean;
  corEmbed?: string;
  thumbnail?: string;
  banner?: string;
  authorName?: string;
  authorIcon?: string;
}

interface TicketSectionProps {
  application: any;
  botApiUrl: string;
}

export default function TicketSection({ application, botApiUrl }: TicketSectionProps) {
  const [canais, setCanais] = useState<Canal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [tickets, setTickets] = useState<TicketConfig[]>([]);
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketConfig | null>(null);
  const [criandoTicket, setCriandoTicket] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [canalSelecionado, setCanalSelecionado] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'funcoes' | 'embed'>('geral');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error'>('error');
  const [funcoesExpandidas, setFuncoesExpandidas] = useState<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (application?.guild_id) {
      carregarCanais();
      carregarCargos();
      carregarTickets();
    }
  }, [application?.guild_id]);

  // Auto-save quando campos principais mudarem
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    if (!ticketSelecionado || criandoTicket || skipNextSave.current || salvando) {
      if (skipNextSave.current) {
        skipNextSave.current = false;
      }
      return;
    }
    
    const timeoutId = setTimeout(() => {
      if (!salvando && !skipNextSave.current && ticketSelecionado) {
        salvarTicket();
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [
    ticketSelecionado?.titulo,
    ticketSelecionado?.descricao,
    ticketSelecionado?.ativo,
    ticketSelecionado?.useContainers,
    ticketSelecionado?.corEmbed,
    ticketSelecionado?.cargoSuporte
  ]);
  
  // Auto-save quando funções mudarem (com monitoramento separado)
  const funcoesRef = useRef(ticketSelecionado?.funcoes);
  useEffect(() => {
    if (isInitialLoad.current || !ticketSelecionado || criandoTicket || skipNextSave.current || salvando) {
      funcoesRef.current = ticketSelecionado?.funcoes;
      return;
    }
    
    // Comparar se funções realmente mudaram
    const funcoesAtuais = ticketSelecionado?.funcoes;
    const funcoesAnteriores = funcoesRef.current;
    
    if (JSON.stringify(funcoesAtuais) !== JSON.stringify(funcoesAnteriores)) {
      funcoesRef.current = funcoesAtuais;
      const timeoutId = setTimeout(() => {
        if (!salvando && !skipNextSave.current && ticketSelecionado) {
          salvarTicket();
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [ticketSelecionado?.funcoes]);

  const carregarCanais = async () => {
    try {
      const guildId = application?.guild_id;
      
      if (!guildId) {
        console.warn('⚠️ Guild ID não encontrado');
        return;
      }
      
      const url = getApiPath(`/api/tickets/canais?guild_id=${guildId}`);
      console.log('🔍 Carregando canais:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.channels) {
          setCanais(data.channels);
          console.log('✅ Canais carregados:', data.channels.length);
        } else {
          console.warn('⚠️ Resposta não tem success ou channels:', data);
          setCanais([]);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar canais:', response.status, errorText);
        setCanais([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar canais:', error);
      setCanais([]);
    }
  };

  const carregarCargos = async () => {
    try {
      const guildId = application?.guild_id;
      
      if (!guildId) {
        console.warn('⚠️ Guild ID não encontrado');
        return;
      }
      
      const url = getApiPath(`/api/tickets/cargos?guild_id=${guildId}`);
      console.log('🔍 Carregando cargos:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.roles) {
          setCargos(data.roles);
          console.log('✅ Cargos carregados:', data.roles.length);
        } else {
          console.warn('⚠️ Resposta não tem success ou roles:', data);
          setCargos([]);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar cargos:', response.status, errorText);
        setCargos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cargos:', error);
      setCargos([]);
    }
  };

  const carregarTickets = async () => {
    try {
      const guildId = application?.guild_id;
      
      if (!guildId) {
        console.warn('⚠️ Guild ID não encontrado');
        return;
      }
      
      const url = getApiPath(`/api/tickets?guild_id=${guildId}`);
      console.log('📋 Carregando tickets:', url);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Resposta não é JSON:', text.substring(0, 200));
        throw new Error(`Resposta não é JSON. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Tickets carregados:', data);
      
      if (data.success && data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0) {
          skipNextSave.current = true;
          setTicketSelecionado(data.tickets[0]);
        }
      } else {
        console.warn('⚠️ Resposta não tem success ou tickets:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tickets:', error);
    }
  };

  const criarNovoTicket = () => {
    const novoTicket: TicketConfig = {
      id: `ticket_${Date.now()}`,
      titulo: 'Novo Ticket',
      descricao: '',
      ativo: false,
      funcoes: [],
      useContainers: false,
      corEmbed: '#5865F2'
    };
    setTickets([...tickets, novoTicket]);
    setTicketSelecionado(novoTicket);
    setCriandoTicket(false);
    setAbaAtiva('geral');
  };

  const salvarTicket = async () => {
    if (!ticketSelecionado) return;
    
    try {
      setSalvando(true);
      skipNextSave.current = true;
      const guildId = application?.guild_id;
      
      if (!guildId) {
        console.warn('⚠️ Guild ID não encontrado ao salvar');
        return;
      }
      
      const url = getApiPath(`/api/tickets?guild_id=${guildId}`);
      const ticketData = { 
        ...ticketSelecionado
      };
      
      console.log('💾 Salvando ticket:', url, ticketData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ticketData)
      });
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Resposta não é JSON:', text.substring(0, 200));
        throw new Error(`Resposta não é JSON. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ticket salvo:', data);
      
      if (data.success && data.ticket) {
        setTicketSelecionado(data.ticket);
        carregarTickets(); // Recarregar lista
      }
    } catch (error) {
      console.error('❌ Erro ao salvar ticket:', error);
    } finally {
      setSalvando(false);
    }
  };

  const deletarTicket = async (id: string) => {
    // Usar hook de confirmação - será implementado
    const shouldDelete = await new Promise<boolean>((resolve) => {
      const dialog = document.createElement('div');
      dialog.innerHTML = `
        <div style="position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;">
          <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 24px; max-width: 500px; width: 90%;">
            <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Deletar ticket</h3>
            <p style="color: #999999; font-size: 14px; margin-bottom: 24px;">Tem certeza que deseja deletar este ticket?</p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button id="cancel-btn" style="padding: 8px 16px; background: #0f0f0f; border: 1px solid #1a1a1a; color: #999999; border-radius: 6px; cursor: pointer;">Cancelar</button>
              <button id="confirm-btn" style="padding: 8px 16px; background: #ffffff; color: #000000; border-radius: 6px; cursor: pointer; border: 1px solid #1a1a1a;">OK</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
      dialog.querySelector('#cancel-btn')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });
      dialog.querySelector('#confirm-btn')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });
    });
    if (!shouldDelete) return;
    
    try {
      const guildId = application?.guild_id;
      
      if (!guildId) {
        setMensagem('Guild ID não encontrado');
        setTipoMensagem('error');
        setTimeout(() => setMensagem(''), 3000);
        return;
      }
      
      const url = getApiPath(`/api/tickets/${id}?guild_id=${guildId}`);
      console.log('🗑️ Deletando ticket:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Resposta não é JSON:', text.substring(0, 200));
        throw new Error(`Resposta não é JSON. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ticket deletado:', data);
      
      if (data.success) {
        carregarTickets(); // Recarregar lista
        if (ticketSelecionado?.id === id) {
          setTicketSelecionado(null);
        }
      } else {
        setMensagem('Erro ao deletar ticket: ' + (data.error || ''));
        setTipoMensagem('error');
        setTimeout(() => setMensagem(''), 3000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao deletar ticket:', error);
      setMensagem('Erro ao deletar ticket: ' + (error.message || 'Erro desconhecido'));
      setTipoMensagem('error');
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  const adicionarFuncao = () => {
    if (!ticketSelecionado) return;
    
    const novaFuncao: Funcao = {
      id: `funcao_${Date.now()}`,
      nome: 'Nova Função',
      emoji: '',
      descricao: ''
    };
    
    setTicketSelecionado({
      ...ticketSelecionado,
      funcoes: [...ticketSelecionado.funcoes, novaFuncao]
    });
  };

  const removerFuncao = (id: string) => {
    if (!ticketSelecionado) return;
    
    setTicketSelecionado({
      ...ticketSelecionado,
      funcoes: ticketSelecionado.funcoes.filter(f => f.id !== id)
    });
  };

  const toggleFuncaoExpandida = (id: string) => {
    const novas = new Set(funcoesExpandidas);
    if (novas.has(id)) {
      novas.delete(id);
    } else {
      novas.add(id);
    }
    setFuncoesExpandidas(novas);
  };

  const enviarTicket = async () => {
    if (!canalSelecionado) {
      setMensagem('Selecione um canal para enviar o ticket');
      setTipoMensagem('error');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }
    
    if (!ticketSelecionado) return;
    
    try {
      setEnviando(true);
      const guildId = application?.guild_id;
      
      if (!guildId) {
        setMensagem('Guild ID não encontrado');
        setTipoMensagem('error');
        setTimeout(() => setMensagem(''), 3000);
        return;
      }
      
      const url = getApiPath(`/api/tickets/enviar/${ticketSelecionado.id}?guild_id=${guildId}`);
      console.log('📤 Enviando ticket:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          channelId: canalSelecionado
        })
      });
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Resposta não é JSON:', text.substring(0, 200));
        throw new Error(`Resposta não é JSON. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Resposta do envio:', data);
      
      if (data.success) {
        setMostrarModal(false);
        setCanalSelecionado('');
        setMensagem('Ticket enviado com sucesso!');
        setTipoMensagem('success');
        setTimeout(() => setMensagem(''), 3000);
        
        // Salvar messageId e channelId após enviar
        if (data.message?.id) {
          setTicketSelecionado({
            ...ticketSelecionado,
            messageId: data.message.id,
            channelId: canalSelecionado
          });
        }
        
        // Recarregar tickets para atualizar dados
        carregarTickets();
      } else {
        setMensagem('Erro ao enviar ticket: ' + (data.error || ''));
        setTipoMensagem('error');
        setTimeout(() => setMensagem(''), 5000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar ticket:', error);
      setMensagem('Erro ao enviar ticket: ' + (error.message || 'Erro desconhecido'));
      setTipoMensagem('error');
      setTimeout(() => setMensagem(''), 5000);
    } finally {
      setEnviando(false);
    }
  };

  const atualizarTicket = async () => {
    if (!ticketSelecionado) return;
    
    try {
      setEnviando(true);
      const guildId = application?.guild_id;
      
      if (!guildId) {
        setMensagem('Guild ID não encontrado');
        setTipoMensagem('error');
        setTimeout(() => setMensagem(''), 3000);
        return;
      }
      
      // Se o ticket já foi enviado, atualizar mensagem no Discord
      if (ticketSelecionado.messageId && ticketSelecionado.channelId) {
        const url = getApiPath(`/api/tickets/atualizar/${ticketSelecionado.id}?guild_id=${guildId}`);
        console.log('🔄 Atualizando mensagem do ticket:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            ...ticketSelecionado
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setMensagem('Ticket atualizado no Discord!');
          setTipoMensagem('success');
          setTimeout(() => setMensagem(''), 3000);
          carregarTickets(); // Recarregar para atualizar dados
        } else {
          setMensagem('Erro ao atualizar ticket: ' + (data.error || ''));
          setTipoMensagem('error');
          setTimeout(() => setMensagem(''), 5000);
        }
      } else {
        // Se não foi enviado, apenas salvar no MongoDB
        await salvarTicket();
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar ticket:', error);
      setMensagem('Erro ao atualizar ticket: ' + (error.message || 'Erro desconhecido'));
      setTipoMensagem('error');
      setTimeout(() => setMensagem(''), 5000);
    } finally {
      setEnviando(false);
    }
  };


  if (!ticketSelecionado && tickets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ticket</h2>
          <p className="text-[#999999] text-base sm:text-lg">Configure seu sistema de tickets</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] mb-6">
            <Ticket className="text-[#666666]" size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Nenhum Ticket Configurado</h3>
          <p className="text-[#999999] text-base mb-6">Comece criando seu primeiro ticket</p>
          <button
            onClick={criarNovoTicket}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus size={18} strokeWidth={1.5} />
            Criar Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ticket</h2>
          <p className="text-[#999999] text-base sm:text-lg">Configure seu sistema de tickets</p>
        </div>
        <div className="flex items-center gap-2">
          {ticketSelecionado && ticketSelecionado.messageId && (
            <button
              onClick={atualizarTicket}
              disabled={enviando}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RefreshCw size={16} strokeWidth={1.5} />
              Atualizar
            </button>
          )}
          {ticketSelecionado && (
            <button
              onClick={() => setMostrarModal(true)}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <Send size={16} strokeWidth={1.5} />
              Enviar
            </button>
          )}
          <button
            onClick={criarNovoTicket}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={18} strokeWidth={1.5} />
            Criar Ticket
          </button>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {mensagem && (
        <div className={`p-4 rounded-xl border ${
          tipoMensagem === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {mensagem}
        </div>
      )}

      {/* Lista de Tickets */}
      {tickets.length > 1 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
          <div className="space-y-2">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                  ticketSelecionado?.id === ticket.id
                    ? 'bg-[#111] border border-[#2a2a2a]'
                    : 'hover:bg-[#111]'
                }`}
                onClick={() => setTicketSelecionado(ticket)}
              >
                <div className="flex items-center gap-3">
                  <Ticket size={18} className="text-[#999999]" strokeWidth={1.5} />
                  <span className="text-white font-medium text-sm">{ticket.titulo}</span>
                  {ticket.ativo && (
                    <span className="px-2 py-0.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] text-xs rounded-lg">Ativo</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletarTicket(ticket.id);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuração do Ticket */}
      {ticketSelecionado && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          {/* Abas - Estilo do Dashboard */}
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2 px-6 pt-6">
            {(['geral', 'funcoes', 'embed'] as const).map(aba => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  abaAtiva === aba
                    ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
                    : 'text-[#999999] hover:text-white'
                }`}
              >
                {aba === 'geral' && 'Geral'}
                {aba === 'funcoes' && `Funções (${ticketSelecionado.funcoes.length})`}
                {aba === 'embed' && 'Config da Embed'}
              </button>
            ))}
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {abaAtiva === 'geral' && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between pb-6 border-b border-[#1a1a1a]">
                  <div>
                    <label className="text-sm font-medium text-white mb-1.5 block">Status</label>
                    <p className="text-[#999999] text-xs">Ativar ou desativar o ticket</p>
                  </div>
                  <button
                    onClick={() => {
                      const novoAtivo = !ticketSelecionado.ativo;
                      setTicketSelecionado({ ...ticketSelecionado, ativo: novoAtivo });
                      // Auto-save vai salvar automaticamente
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      ticketSelecionado.ativo ? 'bg-white' : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-black rounded-full top-0.5 transition-transform duration-200 ${
                      ticketSelecionado.ativo ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Configurações de Funcionamento */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Configurações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cargo de Suporte */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-white mb-2 block">
                        Cargo de Suporte (Opcional)
                      </label>
                      <select
                        value={ticketSelecionado.cargoSuporte || ''}
                        onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, cargoSuporte: e.target.value || undefined })}
                        className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                      >
                        <option value="">Nenhum</option>
                        {cargos.map(cargo => (
                          <option key={cargo.id} value={cargo.id}>
                            {cargo.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === 'funcoes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
                  <h3 className="text-lg font-semibold text-white">Funções ({ticketSelecionado.funcoes.length})</h3>
                  <button
                    onClick={adicionarFuncao}
                    className="px-3 py-1.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {ticketSelecionado.funcoes.map((funcao, index) => (
                    <div key={funcao.id} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <GripVertical className="text-[#666666] cursor-move" size={18} strokeWidth={1.5} />
                        <input
                          type="text"
                          value={funcao.nome}
                          onChange={(e) => {
                            const novasFuncoes = [...ticketSelecionado.funcoes];
                            novasFuncoes[index].nome = e.target.value;
                            setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                          }}
                          className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                          placeholder="Nome da função"
                        />
                        <button
                          onClick={() => toggleFuncaoExpandida(funcao.id)}
                          className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          {funcoesExpandidas.has(funcao.id) ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => removerFuncao(funcao.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>

                      {funcoesExpandidas.has(funcao.id) && (
                        <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
                          {/* Emoji */}
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">Emoji (ID do emoji customizado ou emoji padrão)</label>
                            <input
                              type="text"
                              value={funcao.emoji}
                              onChange={(e) => {
                                const novasFuncoes = [...ticketSelecionado.funcoes];
                                novasFuncoes[index].emoji = e.target.value;
                                setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                              }}
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                              placeholder="Ex: <:emoji:123456789> ou 😀"
                            />
                          </div>

                          {/* Sub-Descrição */}
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">Sub-Descrição</label>
                            <input
                              type="text"
                              value={funcao.subDescricao || ''}
                              onChange={(e) => {
                                const novasFuncoes = [...ticketSelecionado.funcoes];
                                novasFuncoes[index].subDescricao = e.target.value || undefined;
                                setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                              }}
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                              placeholder="Descrição curta"
                            />
                          </div>

                          {/* Descrição */}
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
                            <textarea
                              value={funcao.descricao}
                              onChange={(e) => {
                                const novasFuncoes = [...ticketSelecionado.funcoes];
                                novasFuncoes[index].descricao = e.target.value;
                                setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                              }}
                              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] min-h-[120px] resize-none"
                              placeholder="Descrição completa"
                            />
                          </div>

                          {/* Cor do Botão e Cargo Necessário */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cor do Botão (apenas se 1 função) */}
                            {ticketSelecionado.funcoes.length === 1 && (
                              <div>
                                <label className="text-sm font-medium text-white mb-2 block">Cor do Botão</label>
                                <select
                                  value={funcao.corButton || 'azul'}
                                  onChange={(e) => {
                                    const novasFuncoes = [...ticketSelecionado.funcoes];
                                    novasFuncoes[index].corButton = e.target.value;
                                    setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                                  }}
                                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                                >
                                  <option value="cinza">Cinza</option>
                                  <option value="azul">Azul</option>
                                  <option value="verde">Verde</option>
                                  <option value="vermelho">Vermelho</option>
                                </select>
                              </div>
                            )}

                            {/* Cargo Necessário */}
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">Cargo Necessário (Opcional)</label>
                              <select
                                value={funcao.cargoNecessario || ''}
                                onChange={(e) => {
                                  const novasFuncoes = [...ticketSelecionado.funcoes];
                                  novasFuncoes[index].cargoNecessario = e.target.value || undefined;
                                  setTicketSelecionado({ ...ticketSelecionado, funcoes: novasFuncoes });
                                }}
                                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                              >
                                <option value="">Nenhum</option>
                                {cargos.map(cargo => (
                                  <option key={cargo.id} value={cargo.id}>
                                    {cargo.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {ticketSelecionado.funcoes.length === 0 && (
                    <div className="text-center py-12 text-[#999999]">
                      <Ticket size={40} className="mx-auto mb-4 opacity-50" strokeWidth={1.5} />
                      <p className="text-base font-medium">Nenhuma função configurada</p>
                      <p className="text-sm text-[#666666] mt-1">Adicione uma função para começar</p>
                    </div>
                  )}
                </div>
                
              </div>
            )}

            {abaAtiva === 'embed' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Configuração da Embed</h3>
                  <div className="space-y-4">
                    {/* Tipo de Mensagem */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Tipo de Mensagem</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const previousUseContainers = ticketSelecionado.useContainers;
                            const newUseContainers = false;
                            
                            // Se mudou de tipo e já tem mensagem enviada, avisar
                            if (previousUseContainers !== newUseContainers && ticketSelecionado.messageId) {
                              setMensagem('⚠️ Você mudou de Components V2 para Embed. O ticket será reenviado automaticamente quando salvar.');
                              setTipoMensagem('error');
                              setTimeout(() => setMensagem(''), 5000);
                            }
                            
                            setTicketSelecionado({ ...ticketSelecionado, useContainers: newUseContainers });
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            !ticketSelecionado.useContainers
                              ? 'bg-white text-black'
                              : 'bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] hover:text-white'
                          }`}
                        >
                          Embed
                        </button>
                        <button
                          onClick={() => {
                            const previousUseContainers = ticketSelecionado.useContainers;
                            const newUseContainers = true;
                            
                            // Se mudou de tipo e já tem mensagem enviada, avisar
                            if (previousUseContainers !== newUseContainers && ticketSelecionado.messageId) {
                              setMensagem('⚠️ Você mudou de Embed para Components V2. O ticket será reenviado automaticamente quando salvar.');
                              setTipoMensagem('error');
                              setTimeout(() => setMensagem(''), 5000);
                            }
                            
                            setTicketSelecionado({ ...ticketSelecionado, useContainers: newUseContainers });
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            ticketSelecionado.useContainers
                              ? 'bg-white text-black'
                              : 'bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] hover:text-white'
                          }`}
                        >
                          Components V2
                        </button>
                      </div>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Título</label>
                      <input
                        type="text"
                        value={ticketSelecionado.titulo}
                        onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, titulo: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                        placeholder="Título da mensagem"
                      />
                    </div>

                    {/* Author (apenas para Embed) */}
                    {!ticketSelecionado.useContainers && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Nome do Author</label>
                          <input
                            type="text"
                            value={ticketSelecionado.authorName || ''}
                            onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, authorName: e.target.value || undefined })}
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                            placeholder="Nome do servidor"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Ícone do Author (URL)</label>
                          <input
                            type="text"
                            value={ticketSelecionado.authorIcon || ''}
                            onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, authorIcon: e.target.value || undefined })}
                            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                            placeholder="https://exemplo.com/icon.png"
                          />
                        </div>
                      </div>
                    )}

                    {/* Descrição */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
                      <textarea
                        value={ticketSelecionado.descricao}
                        onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, descricao: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a] min-h-[120px] resize-none"
                        placeholder="Descrição da mensagem"
                      />
                    </div>

                    {/* Banner */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Banner (URL da Imagem)</label>
                      <input
                        type="text"
                        value={ticketSelecionado.banner || ''}
                        onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, banner: e.target.value || undefined })}
                        className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                        placeholder="https://exemplo.com/banner.png"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Thumbnail (URL da Imagem)</label>
                      <input
                        type="text"
                        value={ticketSelecionado.thumbnail || ''}
                        onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, thumbnail: e.target.value || undefined })}
                        className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                        placeholder="https://exemplo.com/thumbnail.png"
                      />
                    </div>

                    {/* Cor da Embed */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Cor da Embed</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={ticketSelecionado.corEmbed || '#5865F2'}
                          onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, corEmbed: e.target.value })}
                          className="h-10 w-16 rounded-lg border border-[#1a1a1a] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={ticketSelecionado.corEmbed || '#5865F2'}
                          onChange={(e) => setTicketSelecionado({ ...ticketSelecionado, corEmbed: e.target.value })}
                          className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                          placeholder="#5865F2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Seleção de Canal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Enviar Ticket</h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setCanalSelecionado('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Selecione o canal onde deseja enviar o ticket
                </label>
                <select
                  value={canalSelecionado}
                  onChange={(e) => setCanalSelecionado(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                >
                  <option value="">Selecione um canal</option>
                  {canais.map(canal => (
                    <option key={canal.id} value={canal.id}>
                      #{canal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setMostrarModal(false);
                    setCanalSelecionado('');
                  }}
                  disabled={enviando}
                  className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarTicket}
                  disabled={enviando || !canalSelecionado}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

