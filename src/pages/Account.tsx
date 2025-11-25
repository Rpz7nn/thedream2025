import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Trash2, ExternalLink, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useDiscordAuth } from "../hooks/useDiscordAuth";
import { getDiscordAvatarUrl, getDiscordGuildIconUrl, debounce } from "../lib/utils";

interface Usuario {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
  globalName?: string;
  verified?: boolean;
}

interface Aplicacao {
  _id: string;
  name: string;
  description?: string;
  guild_id?: string;
  guild_name?: string;
  guild_icon?: string;
  createdAt: string;
  configuration?: {
    configured: boolean;
    clientId?: string;
  };
  discloudAppId?: string;
}

interface AccountInfo {
  usuario: Usuario;
  estatisticas: {
    totalAplicacoes: number;
    aplicacoesAtivas: number;
    aplicacoesInativas: number;
  };
  aplicacoes: {
    ativas: Aplicacao[];
    inativas: Aplicacao[];
  };
}

export default function Account() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigoGift, setCodigoGift] = useState('');
  const [resgatando, setResgatando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'aplicacoes' | 'gift'>('aplicacoes');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useDiscordAuth();

  // Memoizar função de carregamento (não depende de user para evitar loops)
  const carregarInfoConta = useCallback(async () => {
    try {
      setLoading(true);
      const { getApiPath } = await import('@/utils/api');
      const apiUrl = getApiPath('/api/account/info');
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Não redirecionar automaticamente - usar estado padrão
          console.warn('⚠️ Não autenticado, usando estado padrão');
          // Definir estado padrão ao invés de null
          setAccountInfo({
            usuario: {
              id: user?.id || '',
              username: user?.username || 'Usuário',
              discriminator: '0',
              avatar: user?.avatar || null,
              email: user?.email || 'Não informado',
              globalName: null,
              verified: false
            },
            estatisticas: {
              totalAplicacoes: 0,
              aplicacoesAtivas: 0,
              aplicacoesInativas: 0
            },
            aplicacoes: {
              ativas: [],
              inativas: []
            }
          });
          setLoading(false);
          return;
        }
        // Para outros erros, definir estado vazio mas válido
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar informações');
      }

      const data = await response.json();
      
      // Validar dados recebidos - sempre definir accountInfo
      if (data && data.success && data.usuario) {
        setAccountInfo(data);
      } else {
        // Se não tiver dados válidos, definir estado vazio mas válido
        console.warn('⚠️ Dados inválidos recebidos, usando estado padrão');
        setAccountInfo({
          usuario: {
            id: user?.id || '',
            username: user?.username || 'Usuário',
            discriminator: '0',
            avatar: user?.avatar || null,
            email: user?.email || 'Não informado',
            globalName: null,
            verified: false
          },
          estatisticas: {
            totalAplicacoes: 0,
            aplicacoesAtivas: 0,
            aplicacoesInativas: 0
          },
          aplicacoes: {
            ativas: [],
            inativas: []
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
      
      // Sempre definir um estado padrão em caso de erro
      const defaultAccountInfo = {
        usuario: {
          id: user?.id || '',
          username: user?.username || 'Usuário',
          discriminator: '0',
          avatar: user?.avatar || null,
          email: user?.email || 'Não informado',
          globalName: null,
          verified: false
        },
        estatisticas: {
          totalAplicacoes: 0,
          aplicacoesAtivas: 0,
          aplicacoesInativas: 0
        },
        aplicacoes: {
          ativas: [],
          inativas: []
        }
      };
      
      setAccountInfo(defaultAccountInfo);
      
      // Mostrar toast apenas se não for erro de autenticação
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('autenticado')) {
        toast({
          title: 'Aviso',
          description: 'Alguns dados podem estar indisponíveis. Recarregue a página.',
          variant: 'default'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  // Carregar dados quando o componente montar
  useEffect(() => {
    // Carregar dados sempre que o componente montar, independente do estado do usuário
    carregarInfoConta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregar apenas uma vez quando montar (carregarInfoConta é estável)

  // Validar formato do código antes de enviar (mais flexível)
  const validarCodigoGift = useCallback((codigo: string): boolean => {
    if (!codigo || !codigo.trim()) return false;
    const codigoLimpo = codigo.trim().toUpperCase();
    // Validar formato: deve começar com APP_DREAMPRO- e ter pelo menos 20 caracteres totais
    // Aceita qualquer código que comece com APP_DREAMPRO- e tenha caracteres alfanuméricos/hífens
    const temTamanhoMinimo = codigoLimpo.length >= 20;
    const comecaComPrefixo = codigoLimpo.startsWith('APP_DREAMPRO-');
    const temFormatoValido = /^APP_DREAMPRO-[A-Z0-9-]+$/i.test(codigoLimpo);
    return temTamanhoMinimo && comecaComPrefixo && temFormatoValido;
  }, []);

  const resgatarCodigo = useCallback(async () => {
    const codigoLimpo = codigoGift.trim().toUpperCase();
    
    // Validação no frontend antes de enviar
    if (!codigoLimpo) {
      toast({
        title: 'Erro',
        description: 'Digite um código válido',
        variant: 'destructive'
      });
      return;
    }

    if (!validarCodigoGift(codigoLimpo)) {
      toast({
        title: 'Erro',
        description: 'Formato de código inválido. O código deve seguir o formato: APP_DREAMPRO-XXXXXXXX...',
        variant: 'destructive'
      });
      return;
    }

    try {
      setResgatando(true);
      const { getApiPath } = await import('@/utils/api');
      const apiUrl = getApiPath('/api/account/gift/redeem');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ codigo: codigoLimpo })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao resgatar código',
          variant: 'destructive'
        });
        return;
      }

      // O backend retorna resultado dentro de data.resultado
      const resultado = data.resultado || data;
      const tipo = resultado.tipo || data.tipo;

      // Processar normalmente - não há mais modal de escolha
      toast({
        title: 'Sucesso! 🎉',
        description: resultado.mensagem || data.message || 'Código resgatado com sucesso! Redirecionando...'
      });

      setCodigoGift('');
      
      // Recarregar dados da conta antes de redirecionar
      await carregarInfoConta();
      
      // Aguardar um pouco e redirecionar para aplicações
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } catch (error) {
      console.error('Erro ao resgatar código:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao resgatar código. Verifique sua conexão.',
        variant: 'destructive'
      });
    } finally {
      setResgatando(false);
    }
  }, [codigoGift, validarCodigoGift, toast, carregarInfoConta, navigate]);

  const deletarAplicacao = useCallback(async (id: string) => {
    if (!id) {
      toast({
        title: 'Erro',
        description: 'ID da aplicação inválido',
        variant: 'destructive'
      });
      return;
    }

    confirm({
      title: 'Deletar aplicação',
      description: 'Tem certeza que deseja deletar esta aplicação? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/account/application/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erro ao deletar aplicação');
          }

          toast({
            title: 'Sucesso',
            description: 'Aplicação deletada com sucesso'
          });

          // Recarregar dados
          await carregarInfoConta();
        } catch (error) {
          console.error('Erro ao deletar aplicação:', error);
          toast({
            title: 'Erro',
            description: error instanceof Error ? error.message : 'Erro ao deletar aplicação',
            variant: 'destructive'
          });
        }
      }
    });
  }, [toast, carregarInfoConta, confirm]);

  // IMPORTANTE: Todos os hooks devem ser chamados ANTES de qualquer return early
  // Memoizar valores derivados para garantir consistência entre renders
  const usuario = useMemo(() => 
    accountInfo?.usuario || {
      id: user?.id || '',
      username: user?.username || 'Usuário',
      discriminator: '0',
      avatar: user?.avatar || null,
      email: user?.email || 'Não informado',
      globalName: null,
      verified: false
    },
    [accountInfo?.usuario, user?.id, user?.username, user?.avatar, user?.email]
  );
  
  const estatisticas = useMemo(() => 
    accountInfo?.estatisticas || {
      totalAplicacoes: 0,
      aplicacoesAtivas: 0,
      aplicacoesInativas: 0
    },
    [accountInfo?.estatisticas]
  );
  
  const aplicacoes = useMemo(() => 
    accountInfo?.aplicacoes || {
      ativas: [],
      inativas: []
    },
    [accountInfo?.aplicacoes]
  );

  // Memoizar URL do avatar para evitar recálculos
  const avatarUrl = useMemo(() => 
    getDiscordAvatarUrl(usuario.id, usuario.avatar, usuario.discriminator, 256),
    [usuario.id, usuario.avatar, usuario.discriminator]
  );

  // Inicial do usuário para fallback
  const userInitial = useMemo(() => 
    usuario.username?.charAt(0).toUpperCase() || usuario.globalName?.charAt(0).toUpperCase() || 'U',
    [usuario.username, usuario.globalName]
  );

  // Mostrar loading apenas durante o carregamento inicial (DEPOIS de todos os hooks)
  if (loading && !accountInfo) {
    return (
      <>
        <Header onOpenSidebar={undefined} showSidebarButton={false} />
        <div className="flex items-center justify-center min-h-screen bg-[#000000]" style={{ filter: 'grayscale(1)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header onOpenSidebar={undefined} showSidebarButton={false} />
      <div className="min-h-screen bg-[#000000] text-gray-100 font-sans pt-20" style={{ filter: 'grayscale(1)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6">
            <span>Minha conta</span>
            <span className="mx-2">›</span>
            <span className="text-white">Conta</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1
                  className="text-3xl md:text-4xl font-extrabold leading-tight"
                  style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}
                >
                  Minha Conta
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-400 ml-1 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 md:w-6 md:h-6">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Gerencie suas aplicações e resgate códigos GIFT
              </p>
            </div>

            {/* Avatar e Info do Usuário */}
            <div className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 md:p-6 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 border-2 border-white/10 relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={usuario.username || usuario.globalName || 'Usuário'}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      // Fallback em caso de erro ao carregar imagem
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                {!avatarUrl && (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg md:text-xl font-bold text-white truncate" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    {usuario.globalName || usuario.username || 'Usuário'}
                  </h2>
                  {usuario.verified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500 flex-shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {usuario.discriminator && usuario.discriminator !== '0' && (
                  <p className="text-xs md:text-sm text-gray-400 mb-2">#{usuario.discriminator}</p>
                )}
                
                {/* ID do Usuário */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 mb-2 bg-[#1a1a1a] px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="font-mono font-semibold truncate">ID: {usuario.id}</span>
                </div>

                {/* Email */}
                {usuario.email && usuario.email !== 'Não informado' && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 bg-[#1a1a1a] px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium truncate">{usuario.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-400 font-medium">Total de Aplicações</span>
              </div>
              <div className="text-3xl font-bold text-white">{estatisticas.totalAplicacoes}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400 font-medium">Aplicações Ativas</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{estatisticas.aplicacoesAtivas}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-400 font-medium">Aplicações Inativas</span>
              </div>
              <div className="text-3xl font-bold text-gray-500">{estatisticas.aplicacoesInativas}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex items-center gap-6 border-b border-[#151515] pb-4">
              <button
                onClick={() => setAbaAtiva('aplicacoes')}
                className={`pb-2 font-medium transition-colors ${
                  abaAtiva === 'aplicacoes'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Aplicações
              </button>
              <button
                onClick={() => setAbaAtiva('gift')}
                className={`pb-2 font-medium transition-colors flex items-center gap-2 ${
                  abaAtiva === 'gift'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Gift className="w-5 h-5" />
                Resgatar Código GIFT
              </button>
            </div>

            {abaAtiva === 'aplicacoes' ? (
              <div className="mt-6">
                {/* Aplicações Ativas */}
                <div className="mb-10">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Aplicações Ativas ({aplicacoes.ativas.length})
                  </h2>
                  {aplicacoes.ativas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {aplicacoes.ativas.map((app) => (
                        <div
                          key={app._id}
                          className="cursor-pointer bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 group hover:border-white hover:shadow-lg hover:shadow-white/5 transition-all duration-300 relative"
                          onClick={() => navigate(`/dashboard/${app._id}`)}
                        >
                          {/* Seta no canto superior direito */}
                          <div className="absolute top-2 right-2 z-10">
                            <svg 
                              width="22" 
                              height="60" 
                              viewBox="0 0 20 20" 
                              fill="none" 
                              className="text-gray-400 group-hover:text-white transition-colors"
                            >
                              <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>

                          {/* Header do card */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl relative shadow-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center border border-gray-700 flex-shrink-0">
                              {(() => {
                                const iconUrl = getDiscordGuildIconUrl(app.guild_id, app.guild_icon, 128);
                                return iconUrl ? (
                                  <img
                                    src={iconUrl}
                                    alt={app.guild_name || app.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                );
                              })()}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                                {app.guild_name || app.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-500">Configurado</span>
                              </div>
                            </div>
                          </div>

                          {app.description && (
                            <p className="text-gray-400 text-sm mb-3">{app.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-600 mt-4 pt-4 border-t border-[#1a1a1a]">
                            <span>Criada em {new Date(app.createdAt).toLocaleDateString('pt-BR')}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletarAplicacao(app._id);
                              }}
                              className="p-2 hover:bg-red-900/20 text-red-500 rounded transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center">
                      <p className="text-gray-500">Nenhuma aplicação ativa</p>
                    </div>
                  )}
                </div>

                {/* Aplicações Inativas */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    <XCircle className="w-5 h-5 text-gray-500" />
                    Aplicações Inativas ({aplicacoes.inativas.length})
                  </h2>
                  {aplicacoes.inativas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {aplicacoes.inativas.map((app) => (
                        <div
                          key={app._id}
                          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 opacity-60 hover:opacity-100 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-gray-800">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                                {app.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-500">Não configurado</span>
                              </div>
                            </div>
                          </div>

                          {app.description && (
                            <p className="text-gray-400 text-sm mb-3">{app.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-600 mt-4 pt-4 border-t border-[#1a1a1a]">
                            <span>Criada em {new Date(app.createdAt).toLocaleDateString('pt-BR')}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/applications`)}
                                className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400"
                                title="Configurar"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deletarAplicacao(app._id)}
                                className="p-2 hover:bg-red-900/20 text-red-500 rounded transition-colors"
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center">
                      <p className="text-gray-500">Nenhuma aplicação inativa</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <Gift className="w-8 h-8 text-white" />
                      {!resgatando && codigoGift && validarCodigoGift(codigoGift.trim().toUpperCase()) && (
                        <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                      Resgatar Código GIFT
                    </h2>
                  </div>
                  <p className="text-gray-400 mb-6 text-sm md:text-base">
                    Digite o código GIFT para ganhar uma aplicação gratuita ou outros benefícios!
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Código GIFT
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={codigoGift}
                        onChange={(e) => {
                          const valor = e.target.value.toUpperCase();
                          setCodigoGift(valor);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && codigoGift.trim() && !resgatando) {
                            resgatarCodigo();
                          }
                        }}
                        placeholder="APP_DREAMPRO-XXXXXXXXXXXXXXXXXX..."
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm"
                        disabled={resgatando}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      {codigoGift && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {validarCodigoGift(codigoGift.trim().toUpperCase()) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {codigoGift && !validarCodigoGift(codigoGift.trim().toUpperCase()) && (
                      <p className="text-xs text-red-400 mt-2">
                        Formato inválido. O código deve seguir o padrão: APP_DREAMPRO- seguido de 64 caracteres hexadecimais.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={resgatarCodigo}
                    disabled={resgatando || !codigoGift.trim() || !validarCodigoGift(codigoGift.trim().toUpperCase())}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {resgatando ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resgatando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Resgatar Código
                      </>
                    )}
                  </button>

                  <div className="mt-6 p-4 bg-gradient-to-r from-white/5 to-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm text-gray-400">
                      💡 <strong className="text-white">Dica:</strong> Os códigos GIFT são promocionais e podem dar acesso gratuito a aplicações ou descontos especiais!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-24" />
        </div>

        <footer className="w-full border-t border-[#0b0b0b] mt-8">
          <div className="max-w-[1200px] mx-auto px-8 py-8 text-sm text-gray-600">&nbsp;</div>
        </footer>
      </div>
      <Footer />

    </>
  );
}
