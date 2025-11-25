import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, CheckCircle, Link, ExternalLink, MessageSquare, BarChart3, Users, Search, MoreVertical, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiPath } from '@/utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Cargo {
  id: string;
  name: string;
  color: number;
  position?: number;
}

interface Canal {
  id: string;
  name: string;
  type: number;
  position?: number;
}

// Função auxiliar para obter o nome do tipo de canal
function getChannelTypeName(type: number): string {
  const types: { [key: number]: string } = {
    0: 'Texto',
    2: 'Voz',
    4: 'Categoria',
    5: 'Anúncios',
    13: 'Palco',
    15: 'Fórum',
  };
  return types[type] || 'Desconhecido';
}

interface DreamCloudConfig {
  botToken?: string;
  clientSecret?: string;
  hasClientSecret?: boolean; // Indica se o client_secret existe no MongoDB
  botName?: string;
  botId?: string;
  botAvatar?: string;
  redirectPath?: string;
  domain?: string;
  authCount?: number;
  bloquearVPN?: boolean;
  bloquearEmailNaoVerificado?: boolean;
  bloquearSpam?: boolean;
  bloquearRedeMovel?: boolean;
  bloquearEmailVinculado?: boolean;
  ativo?: boolean;
  cargoMembros?: string;
  cargoVerificados?: string;
  canalLogs?: string;
  mensagem?: {
    tipo?: 'embed' | 'container';
    titulo?: string;
    descricao?: string;
    imagem?: string;
    thumbnail?: string;
    cor?: string;
    botaoTexto?: string;
    botaoCor?: string;
    canalId?: string;
    messageId?: string;
    container?: {
      titulo?: string;
      descricao?: string;
      subDescricao?: string;
      banner?: string;
      icon?: string;
      botaoNome?: string;
      botaoEmoji?: string;
      botaoCor?: string;
      content?: string; // Compatibilidade
      components?: any; // Compatibilidade
    };
  };
  // Compatibilidade com código antigo
  mensagemTitulo?: string;
  mensagemDescricao?: string;
  mensagemImagem?: string;
  mensagemThumbnail?: string;
  mensagemCor?: string;
  mensagemCanalId?: string;
}

interface DreamCloudSectionProps {
  application: any;
  botApiUrl: string;
}

export default function DreamCloudSection({ application, botApiUrl }: DreamCloudSectionProps) {
  const [config, setConfig] = useState<DreamCloudConfig | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [requiresClientSecret, setRequiresClientSecret] = useState(false);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [canais, setCanais] = useState<Canal[]>([]);
  const [botInfo, setBotInfo] = useState<{ id: string; username: string; avatar: string; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [links, setLinks] = useState<{ oauth2Invite: string; authorization: string; redirectUri?: string } | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'links' | 'mensagem' | 'membros' | 'estatisticas'>('geral');
  const [formData, setFormData] = useState({
    clientSecret: ''
  });
  const [membros, setMembros] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPuxarModal, setShowPuxarModal] = useState(false);
  const [servidores, setServidores] = useState<any[]>([]);
  const [loadingServidores, setLoadingServidores] = useState(false);
  const [servidorSelecionado, setServidorSelecionado] = useState<string | null>(null);
  const [puxandoMembros, setPuxandoMembros] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [graficoVerificacoes, setGraficoVerificacoes] = useState<Array<{ data: string; quantidade: number }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (application?.guild_id) {
      carregarConfig();
    }
  }, [application?.guild_id]);

  useEffect(() => {
    if (abaAtiva === 'estatisticas' && application?.guild_id && config) {
      carregarGraficoVerificacoes();
    }
  }, [abaAtiva, application?.guild_id, config]);

  // Token do bot é usado automaticamente da aplicação - não precisa de estado

  // Verificar se client_secret está disponível (usando useMemo para evitar recálculos)
  // IMPORTANTE: Se o client_secret existe no MongoDB, o sistema deve funcionar mesmo sem authenticated === true
  const isClientSecretAvailable = useMemo(() => {
    // Se authenticated for true, está disponível
    if (authenticated) return true;
    // Se hasClientSecret for true (vindo do backend), está disponível
    if (config?.hasClientSecret === true) return true;
    // Se clientSecret existir (mesmo que não tenha flag), está disponível
    if (config?.clientSecret) return true;
    // Caso contrário, não está disponível
    return false;
  }, [authenticated, config?.hasClientSecret, config?.clientSecret]);

  useEffect(() => {
    // Carregar informações do bot apenas se client_secret estiver disponível
    if (isClientSecretAvailable && config?.botId && application?.guild_id) {
      carregarBotInfo();
      carregarCargos();
      carregarCanais();
      // Carregar links se estiver na aba Links
      if (abaAtiva === 'links') {
        carregarLinks();
      }
    }
  }, [isClientSecretAvailable, config?.botId, application?.guild_id, abaAtiva]);

  useEffect(() => {
    // Carregar cargos e canais apenas se client_secret estiver disponível
    if (isClientSecretAvailable && application?.guild_id && application?.configuration?.clientId) {
      carregarCargos();
      carregarCanais();
    }
  }, [isClientSecretAvailable, application?.guild_id, application?.configuration?.clientId]);

  useEffect(() => {
    // Carregar membros apenas se client_secret estiver disponível
    if (isClientSecretAvailable && abaAtiva === 'membros' && config?.botId) {
      carregarMembros();
    }
  }, [isClientSecretAvailable, abaAtiva, config?.botId]);

  useEffect(() => {
    // Carregar links quando a aba Links for ativada
    if (isClientSecretAvailable && abaAtiva === 'links' && config?.botId && application?.guild_id) {
      carregarLinks();
    }
  }, [isClientSecretAvailable, abaAtiva, config?.botId, application?.guild_id]);

  useEffect(() => {
    // Carregar servidores apenas se client_secret estiver disponível
    if (isClientSecretAvailable && showPuxarModal && config?.botId && application?.guild_id) {
      carregarServidores();
    }
  }, [isClientSecretAvailable, showPuxarModal, config?.botId, application?.guild_id]);

  const carregarCargos = async () => {
    try {
      // Verificar se client_secret está disponível antes de carregar
      if (!isClientSecretAvailable) {
        setCargos([]);
        return;
      }
      
      const botId = application?.configuration?.clientId || application?.client_id || config?.botId;
      const guildId = application?.guild_id;
      
      if (!botId || !guildId) {
        console.log('⚠️ Não foi possível carregar cargos: botId ou guild_id não encontrado', { botId, guild_id: guildId });
        setCargos([]);
        return;
      }
      
      // Verificar se o bot está configurado no DreamCloud
      if (!config) {
        console.log('⚠️ Bot não configurado no DreamCloud');
        setCargos([]);
        return;
      }
      
      console.log('🔍 Carregando cargos do DreamCloud...', { botId, guild_id: guildId });
      const response = await fetch(getApiPath(`/api/dreamcloud/cargos?bot_id=${botId}&guild_id=${guildId}`), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Tentar parsear o erro como JSON para verificar se é erro de client_secret
        let errorData = null;
        try {
          const errorText = await response.text();
          errorData = JSON.parse(errorText);
          if (errorData.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
            setRequiresClientSecret(true);
            setAuthenticated(false);
            setCargos([]);
            return;
          }
        } catch (e) {
          // Se não for JSON, continuar com o tratamento normal
        }
        
        console.error('❌ Erro HTTP ao carregar cargos:', response.status, errorData);
        setCargos([]);
        toast({
          title: 'Erro',
          description: errorData?.error || `Não foi possível carregar cargos: ${response.status}`,
          type: 'error',
        });
        return;
      }
      
      const data = await response.json();
      if (data.success && data.roles) {
        // Ordenar cargos por posição (mais alto primeiro) e depois por nome
        const sortedRoles = data.roles.sort((a: Cargo, b: Cargo) => {
          // Se tiver posição, ordenar por posição (maior primeiro)
          if (a.position !== undefined && b.position !== undefined) {
            return b.position - a.position;
          }
          // Caso contrário, ordenar por nome
          return a.name.localeCompare(b.name);
        });
        console.log('✅ Cargos carregados:', sortedRoles.length);
        setCargos(sortedRoles);
      } else {
        console.error('❌ Erro ao carregar cargos:', data.error);
        setCargos([]);
        
        // Se o erro for de client_secret não configurado, atualizar estado
        if (data.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
          setRequiresClientSecret(true);
          setAuthenticated(false);
        } else if (data.error) {
          toast({
            title: 'Erro',
            description: `Erro ao carregar cargos: ${data.error}`,
            type: 'error',
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cargos:', error);
      setCargos([]);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cargos. Verifique se o bot está online e tem permissões.',
        type: 'error',
      });
    }
  };

  const carregarCanais = async () => {
    try {
      // Verificar se client_secret está disponível antes de carregar
      if (!isClientSecretAvailable) {
        setCanais([]);
        return;
      }
      
      const botId = application?.configuration?.clientId || application?.client_id || config?.botId;
      const guildId = application?.guild_id;
      
      if (!botId || !guildId) {
        console.log('⚠️ Não foi possível carregar canais: botId ou guild_id não encontrado', { botId, guild_id: guildId });
        setCanais([]);
        return;
      }
      
      // Verificar se o bot está configurado no DreamCloud
      if (!config) {
        console.log('⚠️ Bot não configurado no DreamCloud');
        setCanais([]);
        return;
      }
      
      console.log('🔍 Carregando canais do DreamCloud...', { botId, guild_id: guildId });
      const response = await fetch(getApiPath(`/api/dreamcloud/canais?bot_id=${botId}&guild_id=${guildId}`), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Tentar parsear o erro como JSON para verificar se é erro de client_secret
        let errorData = null;
        try {
          const errorText = await response.text();
          errorData = JSON.parse(errorText);
          if (errorData.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
            setRequiresClientSecret(true);
            setAuthenticated(false);
            setCanais([]);
            return;
          }
        } catch (e) {
          // Se não for JSON, continuar com o tratamento normal
        }
        
        console.error('❌ Erro HTTP ao carregar canais:', response.status, errorData);
        setCanais([]);
        toast({
          title: 'Erro',
          description: errorData?.error || `Não foi possível carregar canais: ${response.status}`,
          type: 'error',
        });
        return;
      }
      
      const data = await response.json();
      if (data.success && data.channels) {
        // Mostrar TODOS os canais disponíveis, ordenados por posição
        const allChannels = data.channels
          .sort((a: Canal, b: Canal) => {
            // Ordenar por posição se disponível
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position;
            }
            // Caso contrário, ordenar por nome
            return a.name.localeCompare(b.name);
          });
        console.log('✅ Canais carregados:', allChannels.length);
        setCanais(allChannels);
      } else {
        console.error('❌ Erro ao carregar canais:', data.error);
        setCanais([]);
        
        // Se o erro for de client_secret não configurado, atualizar estado
        if (data.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
          setRequiresClientSecret(true);
          setAuthenticated(false);
        } else if (data.error) {
          toast({
            title: 'Erro',
            description: `Erro ao carregar canais: ${data.error}`,
            type: 'error',
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar canais:', error);
      setCanais([]);
      
      // Verificar se é erro de sessões do Discord
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('Not enough sessions remaining') || errorMessage.includes('sessions remaining')) {
        toast({
          title: 'Erro',
          description: 'Limite de sessões do Discord atingido. Aguarde alguns minutos e tente novamente.',
          type: 'error',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar canais. Verifique se o bot está online e tem permissões.',
          type: 'error',
        });
      }
    }
  };

  const carregarBotInfo = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id || config?.botId;
      if (!botId || !guildId) return;
      
      const response = await fetch(getApiPath(`/api/dreamcloud/bot-info?bot_id=${botId}&guild_id=${guildId}`), {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.bot) {
        setBotInfo(data.bot);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do bot:', error);
    }
  };

  const carregarConfig = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) {
        setConfig(null);
        setAuthenticated(false);
        setRequiresClientSecret(false);
        return;
      }
      
      // Carregar configuração
      const url = getApiPath(`/api/dreamcloud/config?bot_id=${botId}&guild_id=${guildId}`);
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.config) {
        setConfig(data.config);
        // Se authenticated for true OU se hasClientSecret for true, considerar autenticado
        // Isso garante que mesmo sem a flag clientSecretValidated, se o secret existir no MongoDB, está OK
        const isAuthenticated = data.authenticated === true || data.config.hasClientSecret === true || !!data.config.clientSecret;
        setAuthenticated(isAuthenticated);
        setRequiresClientSecret(!isAuthenticated);
        
        // Carregar links apenas se autenticado
        if (isAuthenticated) {
          carregarLinks();
        }
      } else if (data.success && !data.config) {
        // Se não houver config, verificar auth-status para ver se client_secret existe
        const authStatusUrl = `/api/dreamcloud/auth-status?bot_id=${botId}&guild_id=${guildId}`;
        const authStatusResponse = await fetch(authStatusUrl, {
          credentials: 'include'
        });
        const authStatusData = await authStatusResponse.json();
        
        if (authStatusData.success) {
          // Se hasClientSecret for true, considerar autenticado mesmo sem config completa
          const isAuthenticated = authStatusData.authenticated === true || authStatusData.hasClientSecret === true;
          setAuthenticated(isAuthenticated);
          setRequiresClientSecret(!isAuthenticated);
          setConfig(null); // Não há config ainda
        } else {
          setConfig(null);
          setAuthenticated(false);
          setRequiresClientSecret(true);
        }
      } else {
        setConfig(null);
        setAuthenticated(false);
        setRequiresClientSecret(true);
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
      setConfig(null);
      setAuthenticated(false);
      setRequiresClientSecret(true);
    }
  };

  const carregarLinks = async () => {
    try {
      // Verificar se client_secret está disponível antes de carregar
      if (!isClientSecretAvailable) {
        setLinks(null);
        return;
      }
      
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) return;
      const url = getApiPath(`/api/dreamcloud/links?bot_id=${botId}&guild_id=${guildId}`);
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Tentar parsear o erro como JSON para verificar se é erro de client_secret
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          if (errorData.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
            setRequiresClientSecret(true);
            setAuthenticated(false);
            setLinks(null);
            return;
          }
        } catch (e) {
          // Se não for JSON, continuar com o tratamento normal
        }
        return;
      }
      
      const data = await response.json();
      if (data.success && data.links) {
        setLinks(data.links);
        // Se conseguiu carregar links, significa que está autenticado
        // Atualizar estado para refletir que está autenticado
        setAuthenticated(true);
        setRequiresClientSecret(false);
      } else if (data.error && data.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
        // Se o erro for de client_secret não configurado, atualizar estado
        setRequiresClientSecret(true);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao carregar links:', error);
    }
  };

  const carregarGraficoVerificacoes = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) return;

      const apiUrl = getApiPath(`/api/dreamcloud/membros?bot_id=${botId}&guild_id=${guildId}`);
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.membros) {
          // Agrupar verificações por mês
          const verificacoesPorMes = new Map<string, number>();
          
          data.membros.forEach((membro: any) => {
            if (membro.verifiedAt) {
              const date = new Date(membro.verifiedAt);
              const mesAno = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
              verificacoesPorMes.set(mesAno, (verificacoesPorMes.get(mesAno) || 0) + 1);
            }
          });

          // Criar array ordenado por data
          const graficoData = Array.from(verificacoesPorMes.entries())
            .map(([data, quantidade]) => ({ data, quantidade }))
            .sort((a, b) => {
              const dateA = new Date(`01 ${a.data}`);
              const dateB = new Date(`01 ${b.data}`);
              return dateA.getTime() - dateB.getTime();
            });

          // Se não houver dados, criar array vazio ou com zeros
          if (graficoData.length === 0) {
            // Criar últimos 6 meses com zero
            const meses = [];
            const hoje = new Date();
            for (let i = 5; i >= 0; i--) {
              const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
              meses.push({
                data: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                quantidade: 0
              });
            }
            setGraficoVerificacoes(meses);
          } else {
            setGraficoVerificacoes(graficoData);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar gráfico de verificações:', error);
    }
  };

  const carregarMembros = async () => {
    try {
      // Verificar se client_secret está disponível antes de carregar
      if (!isClientSecretAvailable) {
        setMembros([]);
        return;
      }
      
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) return;
      // Usar getApiPath para garantir que a URL está correta em produção
      const apiUrl = getApiPath(`/api/dreamcloud/membros?bot_id=${botId}&guild_id=${guildId}`);
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Tentar parsear o erro como JSON para verificar se é erro de client_secret
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          if (errorData.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
            setRequiresClientSecret(true);
            setAuthenticated(false);
            setMembros([]);
            return;
          }
        } catch (e) {
          // Se não for JSON, continuar com o tratamento normal
        }
        return;
      }
      
      const data = await response.json();
      if (data.success && data.membros) {
        setMembros(data.membros);
      } else if (data.error && data.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
        // Se o erro for de client_secret não configurado, atualizar estado
        setRequiresClientSecret(true);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const carregarServidores = async () => {
    setLoadingServidores(true);
    try {
      // Verificar se client_secret está disponível antes de carregar
      if (!isClientSecretAvailable) {
        setServidores([]);
        setLoadingServidores(false);
        return;
      }
      
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id || config?.botId;
      if (!botId || !guildId) {
        toast({
          title: 'Erro',
          description: 'Bot ID ou Guild ID não encontrado.',
          type: 'error',
        });
        return;
      }

      const response = await fetch(getApiPath(`/api/dreamcloud/servidores?bot_id=${botId}&guild_id=${guildId}`), {
        credentials: 'include'
      });

      if (!response.ok) {
        // Tentar parsear o erro como JSON para verificar se é erro de client_secret
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          if (errorData.code === 'CLIENT_SECRET_NOT_CONFIGURED') {
            setRequiresClientSecret(true);
            setAuthenticated(false);
            setServidores([]);
            return;
          }
        } catch (e) {
          // Se não for JSON, continuar com o tratamento normal
        }
        
        toast({
          title: 'Erro',
          description: `Erro ao carregar servidores: ${response.status}`,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      if (data.success && data.servidores) {
        setServidores(data.servidores);
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao carregar servidores',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar servidores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar servidores do bot',
        type: 'error',
      });
    } finally {
      setLoadingServidores(false);
    }
  };

  const handlePuxarMembros = async () => {
    if (!servidorSelecionado) {
      toast({
        title: 'Erro',
        description: 'Selecione um servidor de destino',
        type: 'error',
      });
      return;
    }

    setPuxandoMembros(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id || config?.botId;
      
      if (!botId || !guildId) {
        toast({
          title: 'Erro',
          description: 'Bot ID ou Guild ID não encontrado.',
          type: 'error',
        });
        return;
      }

      const response = await fetch(getApiPath('/api/dreamcloud/puxar-membros'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          servidor_destino_id: servidorSelecionado
        })
      });

      // Ler resposta como texto primeiro para poder parsear como JSON depois
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Se não for JSON, tratar como erro genérico
        toast({
          title: 'Erro',
          description: 'Erro ao processar resposta do servidor',
          type: 'error',
        });
        setPuxandoMembros(false);
        return;
      }

      // Verificar se há erro de client_secret (tanto em respostas de erro quanto de sucesso)
      if (data.error && (data.code === 'CLIENT_SECRET_INVALID' || data.code === 'CLIENT_SECRET_NOT_CONFIGURED')) {
        // Atualizar estado de autenticação
        setRequiresClientSecret(true);
        setAuthenticated(false);
        
        // Exibir mensagem de erro
        toast({
          title: 'Client Secret Inválido',
          description: data.error || 'O client_secret configurado não está funcionando. Por favor, atualize o client_secret nas configurações do DreamCloud.',
          type: 'error',
        });
        
        setPuxandoMembros(false);
        return;
      }

      // Verificar se a resposta não foi bem-sucedida (mas não é erro de client_secret)
      if (!response.ok) {
        toast({
          title: 'Erro',
          description: data.error || `Erro ao puxar membros: ${response.status}`,
          type: 'error',
        });
        setPuxandoMembros(false);
        return;
      }
      
      if (data.success) {
        // Mostrar toast apropriado baseado no resultado
        if (data.adicionados > 0 && data.erros === 0) {
          toast({
            title: 'Sucesso',
            description: data.message || `Todos os ${data.adicionados} membros foram adicionados com sucesso!`,
            type: 'success',
          });
        } else if (data.adicionados > 0 && data.erros > 0) {
          toast({
            title: 'Sucesso parcial',
            description: data.message || `${data.adicionados} membros adicionados, ${data.erros} erros`,
            type: 'success',
          });
        } else {
          toast({
            title: 'Atenção',
            description: data.message || `Nenhum membro foi adicionado. ${data.erros || 0} erros encontrados.`,
            type: 'warning',
          });
        }
        
        // Se houver membros sem token, mostrar mensagem informativa
        if (data.membrosSemToken && data.membrosSemToken.length > 0) {
          toast({
            title: 'Membros precisam se verificar novamente',
            description: `${data.membrosSemToken.length} membro(s) (${data.membrosSemToken.join(', ')}) precisam se verificar novamente para poder ser transferido(s). Eles foram verificados antes da atualização do sistema.`,
            type: 'info',
          });
        }
        
        // Se houver erros, mostrar detalhes no console
        if (data.errosDetalhes && data.errosDetalhes.length > 0) {
          console.warn('Erros ao adicionar membros:', data.errosDetalhes);
        }
        
        setShowPuxarModal(false);
        setServidorSelecionado(null);
        
        // Recarregar lista de membros
        if (data.adicionados > 0) {
          carregarMembros();
        }
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao puxar membros',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao puxar membros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao puxar membros para o servidor destino',
        type: 'error',
      });
    } finally {
      setPuxandoMembros(false);
    }
  };

  const handleConfigurarBot = async () => {
    // Validar campos obrigatórios
    if (!formData.clientSecret) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o client_secret.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      
      if (!botId || !guildId) {
        toast({
          title: 'Erro',
          description: 'Bot ID ou Guild ID não encontrado.',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      // Validar e salvar client_secret
      // O token do bot será usado automaticamente da aplicação
      try {
        const validateResponse = await fetch(getApiPath('/api/dreamcloud/validate-secret'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            bot_id: botId,
            guild_id: guildId,
            client_secret: formData.clientSecret
          })
        });

        const validateData = await validateResponse.json();
        if (!validateData.success) {
          toast({
            title: 'Erro',
            description: validateData.error || 'Erro ao validar client_secret.',
            type: 'error',
          });
          return;
        }

        toast({
          title: 'Sucesso',
          description: 'Client Secret validado e salvo com sucesso!',
          type: 'success',
        });
      } catch (error: any) {
        console.error('Erro ao validar client_secret:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao validar client_secret.',
          type: 'error',
        });
        return;
      }

      // Recarregar configuração após salvar
      await carregarConfig();
      setShowModal(false);
      setFormData({ clientSecret: '' });
      carregarBotInfo();
      carregarCargos();
      carregarCanais();
    } catch (error: any) {
      console.error('Erro ao configurar bot:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao configurar bot.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (campo: keyof DreamCloudConfig, valor?: any) => {
    if (!config) return;
    
    const novoValor = valor !== undefined ? valor : !config[campo];
    setLoading(true);
    
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) return;

      // Mapear campos de mensagem para a estrutura correta
      const updateData: any = {};
      if (campo.startsWith('mensagem')) {
        // Campos de mensagem precisam ser atualizados via endpoint de mensagem
        return handleSaveMensagem();
      } else if (campo === 'bloquearRedeMovel') {
        updateData.bloquear_rede_movel = novoValor;
      } else if (campo === 'bloquearEmailNaoVerificado') {
        updateData.bloquear_email_nao_verificado = novoValor;
      } else if (campo === 'bloquearVPN') {
        updateData.bloquear_vpn = novoValor;
      } else if (campo === 'bloquearEmailVinculado') {
        updateData.bloquear_email_vinculado = novoValor;
      } else if (campo === 'ativo') {
        updateData.ativo = novoValor;
      } else if (campo === 'cargoMembros') {
        updateData.cargo_membros = novoValor;
      } else if (campo === 'cargoVerificados') {
        updateData.cargo_verificados = novoValor;
      } else if (campo === 'canalLogs') {
        updateData.canal_logs = novoValor;
      }

      const response = await fetch(getApiPath('/api/dreamcloud/config'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          ...updateData
        })
      });

      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        if (valor === undefined) {
          toast({
            title: 'Sucesso',
            description: 'Configuração atualizada!',
            type: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMensagem = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) return;

      const mensagem = config.mensagem || {};
      const mensagemTipo = mensagem.tipo || 'embed';
      
      const payload: any = {
        bot_id: botId,
        guild_id: guildId,
        tipo: mensagemTipo,
        botao_texto: mensagem.botaoTexto || 'Verificar',
        botao_cor: mensagem.botaoCor || 'primary',
        canal_id: config.mensagemCanalId || mensagem.canalId
      };

      if (mensagemTipo === 'container') {
        payload.container_titulo = mensagem.container?.titulo;
        payload.container_descricao = mensagem.container?.descricao;
        payload.container_sub_descricao = mensagem.container?.subDescricao;
        payload.container_banner = mensagem.container?.banner;
        payload.container_icon = mensagem.container?.icon;
        payload.container_botao_nome = mensagem.container?.botaoNome;
        payload.container_botao_emoji = mensagem.container?.botaoEmoji;
        payload.container_botao_cor = mensagem.container?.botaoCor;
      } else {
        payload.titulo = config.mensagemTitulo || mensagem.titulo;
        payload.descricao = config.mensagemDescricao || mensagem.descricao;
        payload.imagem = config.mensagemImagem || mensagem.imagem;
        payload.thumbnail = config.mensagemThumbnail || mensagem.thumbnail;
        payload.cor = config.mensagemCor || mensagem.cor;
      }

      const response = await fetch(getApiPath('/api/dreamcloud/mensagem'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        // Atualizar config local
        setConfig({ ...config, mensagem: data.mensagem });
        toast({
          title: 'Sucesso',
          description: 'Mensagem salva com sucesso!',
          type: 'success',
        });
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao salvar mensagem',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar mensagem',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCargoChange = async (campo: 'cargoMembros' | 'cargoVerificados' | 'canalLogs', value: string) => {
    if (!config) return;
    
    setLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId || !guildId) {
        toast({
          title: 'Erro',
          description: 'Bot ID ou Guild ID não encontrado',
          type: 'error',
        });
        return;
      }

      // Mapear campo para o nome correto da API
      const updateData: any = {};
      if (campo === 'cargoMembros') {
        updateData.cargo_membros = value || null;
      } else if (campo === 'cargoVerificados') {
        updateData.cargo_verificados = value || null;
      } else if (campo === 'canalLogs') {
        updateData.canal_logs = value || null;
      }

      // Atualizar estado local imediatamente para feedback visual
      setConfig({
        ...config,
        [campo]: value || null
      });

      const response = await fetch(getApiPath('/api/dreamcloud/config'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          ...updateData
        })
      });

      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        toast({
          title: 'Sucesso',
          description: 'Configuração salva com sucesso!',
          type: 'success',
        });
      } else {
        // Reverter mudança local em caso de erro
        setConfig(config);
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao salvar configuração',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar cargo/canal:', error);
      // Reverter mudança local em caso de erro
      setConfig(config);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar tela de autenticação apenas se client_secret realmente não estiver configurado
  // Se config?.hasClientSecret for true, significa que o client_secret existe no MongoDB
  // e não precisa mostrar a tela de autenticação
  const shouldShowAuthScreen = (requiresClientSecret || !authenticated) && 
                                !config?.hasClientSecret && 
                                !config?.clientSecret;
  
  if (shouldShowAuthScreen) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">DreamCloud</h2>
          <p className="text-gray-400 text-base sm:text-lg">Configure seu sistema de verificação Discord</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-16 text-center">
          <h3 className="text-2xl font-semibold text-white mb-3">Client Secret Não Configurado</h3>
          <p className="text-gray-400 text-lg mb-6">
            Para usar o DreamCloud, você precisa configurar o client_secret do seu bot Discord. O token do bot será usado automaticamente da sua aplicação.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors mx-auto"
          >
            Configurar Client Secret
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
                <h3 className="text-xl font-bold text-white">Configurar Bot OAuth2</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    O token do bot será usado automaticamente da sua aplicação. Você só precisa inserir o <span className="text-white font-medium">Client Secret</span> do seu bot Discord.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Client Secret *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a] pr-10"
                      placeholder="Seu client secret aqui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showSecret ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Somente o client_secret oficial da aplicação funcionará — qualquer segredo de outra aplicação será automaticamente rejeitado.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1a1a1a]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl font-medium hover:border-[#2a2a2a] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfigurarBot}
                  disabled={loading || !formData.clientSecret}
                  className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Validando...
                    </>
                  ) : (
                    'Configurar Client Secret'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">DreamCloud</h2>
        <p className="text-gray-400 text-base sm:text-lg">Configure seu sistema de backup em nuvem</p>
      </div>

      {/* Tabs - Estilo do Dashboard */}
      <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
        <button
          onClick={() => setAbaAtiva('geral')}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            abaAtiva === 'geral'
              ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
              : 'text-[#999999] hover:text-white'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setAbaAtiva('links')}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            abaAtiva === 'links'
              ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
              : 'text-[#999999] hover:text-white'
          }`}
        >
          Links
        </button>
        <button
          onClick={() => setAbaAtiva('mensagem')}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            abaAtiva === 'mensagem'
              ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
              : 'text-[#999999] hover:text-white'
          }`}
        >
          Mensagem
        </button>
        <button
          onClick={() => setAbaAtiva('membros')}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            abaAtiva === 'membros'
              ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
              : 'text-[#999999] hover:text-white'
          }`}
        >
          Membros
        </button>
        <button
          onClick={() => setAbaAtiva('estatisticas')}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            abaAtiva === 'estatisticas'
              ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
              : 'text-[#999999] hover:text-white'
          }`}
        >
          Estatísticas
        </button>
      </div>

      {/* Aba Geral */}
      {abaAtiva === 'geral' && (
      <>
      {/* Informações do Bot OAuth2 */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Informações do Bot OAuth2</h3>
          <p className="text-sm text-[#999999]">Gerencie as informações do bot OAuth2.</p>
        </div>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1a1a1a]">
          {botInfo?.avatarUrl ? (
            <img 
              src={botInfo.avatarUrl} 
              alt={botInfo.username}
              className="w-16 h-16 rounded-xl border border-[#1a1a1a] object-cover"
            />
          ) : config?.botAvatar ? (
            <img 
              src={`https://cdn.discordapp.com/avatars/${config.botId}/${config.botAvatar}.png?size=256`} 
              alt={config.botName || 'Bot'}
              className="w-16 h-16 rounded-xl border border-[#1a1a1a] object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a1a]"></div>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white">{botInfo?.username || config?.botName || 'Nome do Bot'}</h4>
            <p className="text-sm text-[#999999]">@{botInfo?.username || config?.botName || 'bot'}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{config?.authCount || 0}</div>
            <div className="text-xs text-[#999999]">Autorizações</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[#999999] mb-1.5 font-medium">Bot ID</div>
              <div className="text-sm text-white font-medium">{config?.botId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-[#999999] mb-1.5 font-medium">Redirect Path</div>
              <div className="text-sm text-white font-medium">{config?.redirectPath || '/'}</div>
            </div>
            <div>
              <div className="text-xs text-[#999999] mb-1.5 font-medium">Domain</div>
              <div className="text-sm text-white font-medium">{config?.domain || 'cloud.dreamapplications.com.br'}</div>
            </div>
            <div>
              <div className="text-xs text-[#999999] mb-1.5 font-medium">Auth Count</div>
              <div className="text-sm text-white font-medium">{config?.authCount || 0}</div>
            </div>

            <div className="flex items-center justify-between py-1 pt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config?.ativo ? 'bg-white' : 'bg-[#666666]'}`}></div>
                <div className="text-sm text-white font-medium">Status</div>
              </div>
              <div className="text-xs text-[#999999]">{config?.ativo ? '• Ativo' : '• Inativo'}</div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-5">
            {/* Configurações com Toggle */}
            <div className="space-y-5">
              {/* Bloquear Email não verificado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white font-medium">Bloquear verificações de conta sem E-mail verificado</div>
                  <button
                    onClick={() => handleToggle('bloquearEmailNaoVerificado')}
                    disabled={loading || !config}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      config?.bloquearEmailNaoVerificado ? 'bg-white' : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`absolute w-5 h-5 bg-black rounded-full top-0.5 transition-transform duration-200 ${
                      config?.bloquearEmailNaoVerificado ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-[#666666]">• Só pode se verificar quem tem um Email Verificado.</p>
              </div>

              {/* Bloquear Rede Móvel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white font-medium">Bloquear uso de 3/4/5G (Redes Móveis)</div>
                  <button
                    onClick={() => handleToggle('bloquearRedeMovel')}
                    disabled={loading || !config}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      config?.bloquearRedeMovel ? 'bg-white' : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`absolute w-5 h-5 bg-black rounded-full top-0.5 transition-transform duration-200 ${
                      config?.bloquearRedeMovel ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-[#666666]">• Não pode se verificar usando dados móveis.</p>
              </div>

              {/* Bloquear VPN */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white font-medium">Bloquear uso de VPN</div>
                  <button
                    onClick={() => handleToggle('bloquearVPN')}
                    disabled={loading || !config}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      config?.bloquearVPN ? 'bg-white' : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`absolute w-5 h-5 bg-black rounded-full top-0.5 transition-transform duration-200 ${
                      config?.bloquearVPN ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-[#666666]">• Não pode se verificar usando VPN.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuração de Cargos */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Configuração de Cargos</h3>
            <p className="text-sm text-[#999999]">Configure os cargos para membros e verificados.</p>
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await Promise.all([carregarCargos(), carregarCanais()]);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#1a1a1a] text-[#999999] rounded-lg font-medium hover:border-[#2a2a2a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Carregando...' : 'Recarregar'}
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Cargo para Membros</label>
            <select
              value={config?.cargoMembros || ''}
              onChange={(e) => handleCargoChange('cargoMembros', e.target.value)}
              disabled={loading || !config}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="">Nenhum</option>
              {cargos.length === 0 ? (
                <option disabled>Carregando cargos...</option>
              ) : (
                cargos.map(cargo => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.name}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-[#999999] mt-1.5">
              Este cargo é obrigatório para o OAuth2 funcionar corretamente.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">Cargo para Verificados</label>
            <select
              value={config?.cargoVerificados || ''}
              onChange={(e) => handleCargoChange('cargoVerificados', e.target.value)}
              disabled={loading || !config}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="">Nenhum</option>
              {cargos.length === 0 ? (
                <option disabled>Carregando cargos...</option>
              ) : (
                cargos.map(cargo => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.name}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-[#999999] mt-1.5">
              Este cargo é obrigatório para o OAuth2 funcionar corretamente.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">Canal de Logs</label>
            <select
              value={config?.canalLogs || ''}
              onChange={(e) => handleCargoChange('canalLogs', e.target.value)}
              disabled={loading || !config}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="">Nenhum</option>
              {canais.length === 0 ? (
                <option disabled>Carregando canais...</option>
              ) : (
                canais.map(canal => (
                  <option key={canal.id} value={canal.id}>
                    #{canal.name} {canal.type !== 0 ? `(${getChannelTypeName(canal.type)})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      </>)}

      {/* Aba Links */}
      {abaAtiva === 'links' && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Link size={24} />
              Links
            </h3>
            <p className="text-sm text-gray-400">Links de OAuth2 para convite e autorização</p>
          </div>

          {!links ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111] mb-4">
                <Link className="text-gray-600" size={32} />
              </div>
              <p className="text-gray-400">Carregando links...</p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Redirect URI */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-white">Redirect URI (Copiar para Discord Developers)</label>
                <ExternalLink size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={links.redirectUri || ''}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(links.redirectUri);
                    toast({
                      title: 'Copiado!',
                      description: 'Redirect URI copiado para a área de transferência',
                      type: 'success',
                    });
                  }}
                  className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ⚠️ Cole este URL na seção "Redirects" do Discord Developers
              </p>
            </div>

            {/* Link de Convidar Bot */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-white">Link de Convidar Bot (OAuth2)</label>
                <ExternalLink size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={links.oauth2Invite}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(links.oauth2Invite);
                    toast({
                      title: 'Copiado!',
                      description: 'Link de convite copiado para a área de transferência',
                      type: 'success',
                    });
                  }}
                  className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Link de Autorização */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-white">Link de Autorização</label>
                <ExternalLink size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={links.authorization}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(links.authorization);
                    toast({
                      title: 'Copiado!',
                      description: 'Link de autorização copiado para a área de transferência',
                      type: 'success',
                    });
                  }}
                  className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Copiar
                </button>
              </div>
              <button
                onClick={() => window.open(links.authorization, '_blank')}
                className="mt-2 px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl font-medium hover:border-[#2a2a2a] transition-colors"
              >
                Testar Link
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Aba Mensagem */}
      {abaAtiva === 'mensagem' && config && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare size={24} />
              Mensagem de Verificação
            </h3>
            <p className="text-sm text-gray-400">Configure a mensagem que será enviada quando um usuário se verificar</p>
          </div>

          <div className="space-y-6">
            {/* Tipo de Mensagem */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Tipo de Mensagem</label>
              <select
                value={config.mensagem?.tipo || 'embed'}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), tipo: e.target.value as 'embed' | 'container' }
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
              >
                <option value="embed">Embed (Tradicional)</option>
                <option value="container">Container (Components v2)</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                {config.mensagem?.tipo === 'container' 
                  ? 'Container permite mensagens mais modernas com Components v2'
                  : 'Embed é o formato tradicional com título, descrição e imagens'}
              </p>
            </div>

            {/* Canal */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Canal</label>
              <select
                value={config.mensagem?.canalId || config.mensagemCanalId || ''}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), canalId: e.target.value },
                    mensagemCanalId: e.target.value
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
              >
                <option value="">Selecione um canal</option>
                {canais.map(canal => {
                  // Determinar ícone baseado no tipo do canal
                  let icon = '#';
                  if (canal.type === 0) icon = '#';
                  else if (canal.type === 2) icon = '🔊';
                  else if (canal.type === 4) icon = '📁';
                  else if (canal.type === 5) icon = '📢';
                  else if (canal.type === 13) icon = '🎤';
                  else if (canal.type === 15) icon = '📋';
                  else icon = '#';
                  
                  return (
                    <option key={canal.id} value={canal.id}>
                      {icon} {canal.name} {canal.type !== 0 ? `(${getChannelTypeName(canal.type)})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Campos para Container */}
            {config.mensagem?.tipo === 'container' ? (
              <>
                {/* Título */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Título</label>
                  <input
                    type="text"
                    value={config.mensagem?.container?.titulo || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            titulo: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                    placeholder="Sistema de Verificação"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
                  <textarea
                    value={config.mensagem?.container?.descricao || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            descricao: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a] resize-none"
                    rows={4}
                    placeholder="Para sua segurança e para evitar qualquer interrupção no Discord..."
                  />
                </div>

                {/* Sub Descrição */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Sub Descrição</label>
                  <textarea
                    value={config.mensagem?.container?.subDescricao || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            subDescricao: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a] resize-none"
                    rows={3}
                    placeholder="Para acessar todos os canais do servidor e participar da comunidade..."
                  />
                </div>

                {/* Banner */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Banner (URL)</label>
                  <input
                    type="text"
                    value={config.mensagem?.container?.banner || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            banner: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Banner que aparecerá na galeria de imagens após o divider (opcional)
                  </p>
                </div>

                {/* Icon */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Ícone/Thumbnail (URL)</label>
                  <input
                    type="text"
                    value={config.mensagem?.container?.icon || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            icon: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                    placeholder="https://exemplo.com/icon.png"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Thumbnail/Ícone que aparecerá ao lado do título e descrição quando não houver banner (opcional)
                  </p>
                </div>

                {/* Nome do Botão */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Nome do Botão</label>
                  <input
                    type="text"
                    value={config.mensagem?.container?.botaoNome || 'Verificar-se'}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            botaoNome: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                    placeholder="Verificar-se"
                  />
                </div>

                {/* Emoji do Botão */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Emoji do Botão</label>
                  <input
                    type="text"
                    value={config.mensagem?.container?.botaoEmoji || ''}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            botaoEmoji: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                    placeholder="✅ ou :white_check_mark:"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Emoji que aparecerá no botão (pode ser emoji direto ou nome do emoji) (opcional)
                  </p>
                </div>

                {/* Cor do Botão */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Cor do Botão</label>
                  <select
                    value={config.mensagem?.container?.botaoCor || '2'}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        mensagem: { 
                          ...(config.mensagem || {}), 
                          container: { 
                            ...(config.mensagem?.container || {}), 
                            botaoCor: e.target.value 
                          } 
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                  >
                    <option value="1">Primary (Azul)</option>
                    <option value="2">Secondary (Cinza)</option>
                    <option value="3">Success (Verde)</option>
                    <option value="4">Danger (Vermelho)</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Título */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Título</label>
              <input
                type="text"
                value={config.mensagem?.titulo || config.mensagemTitulo || ''}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), titulo: e.target.value },
                    mensagemTitulo: e.target.value
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                placeholder="Título da mensagem"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
              <textarea
                value={config.mensagem?.descricao || config.mensagemDescricao || ''}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), descricao: e.target.value },
                    mensagemDescricao: e.target.value
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a] resize-none"
                rows={4}
                placeholder="Descrição da mensagem"
              />
            </div>

            {/* Imagem */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Imagem (URL)</label>
              <input
                type="text"
                value={config.mensagem?.imagem || config.mensagemImagem || ''}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), imagem: e.target.value },
                    mensagemImagem: e.target.value
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                placeholder="https://exemplo.com/imagem.png"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Thumbnail (URL)</label>
              <input
                type="text"
                value={config.mensagem?.thumbnail || config.mensagemThumbnail || ''}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    mensagem: { ...(config.mensagem || {}), thumbnail: e.target.value },
                    mensagemThumbnail: e.target.value
                  });
                }}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                placeholder="https://exemplo.com/thumbnail.png"
              />
            </div>

                {/* Cor */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Cor</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.mensagem?.cor || config.mensagemCor || '#5865F2'}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          mensagem: { ...(config.mensagem || {}), cor: e.target.value },
                          mensagemCor: e.target.value
                        });
                      }}
                      className="w-16 h-12 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.mensagem?.cor || config.mensagemCor || '#5865F2'}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          mensagem: { ...(config.mensagem || {}), cor: e.target.value },
                          mensagemCor: e.target.value
                        });
                      }}
                      className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                      placeholder="#5865F2"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Botão Salvar */}
            <div className="pt-4 border-t border-[#1a1a1a]">
              <button
                onClick={handleSaveMensagem}
                disabled={loading}
                className="w-full px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Mensagem'}
              </button>
            </div>

            {/* Botão de Enviar */}
            <div className="pt-4 border-t border-[#1a1a1a]">
              <button
                onClick={async () => {
                  const canalId = config.mensagem?.canalId || config.mensagemCanalId;
                  if (!canalId) {
                    toast({
                      title: 'Erro',
                      description: 'Selecione um canal primeiro',
                      type: 'error',
                    });
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const guildId = application?.guild_id;
                    const botId = application?.configuration?.clientId || application?.client_id;
                    if (!botId || !guildId) {
                      toast({
                        title: 'Erro',
                        description: 'Bot ID ou Guild ID não encontrado',
                        type: 'error',
                      });
                      return;
                    }

                    const mensagemTipo = config.mensagem?.tipo || 'embed';
                    const payload: any = {
                      bot_id: botId,
                      guild_id: guildId,
                      canal_id: canalId,
                      tipo: mensagemTipo,
                      botao_texto: config.mensagem?.botaoTexto || 'Verificar',
                      link_autorizacao: links?.authorization || null
                    };

                    if (mensagemTipo === 'container') {
                      payload.container_titulo = config.mensagem?.container?.titulo;
                      payload.container_descricao = config.mensagem?.container?.descricao;
                      payload.container_sub_descricao = config.mensagem?.container?.subDescricao;
                      payload.container_banner = config.mensagem?.container?.banner;
                      payload.container_icon = config.mensagem?.container?.icon;
                      payload.container_botao_nome = config.mensagem?.container?.botaoNome;
                      payload.container_botao_emoji = config.mensagem?.container?.botaoEmoji;
                      payload.container_botao_cor = config.mensagem?.container?.botaoCor;
                    } else {
                      payload.titulo = config.mensagem?.titulo || config.mensagemTitulo || 'Verificação';
                      payload.descricao = config.mensagem?.descricao || config.mensagemDescricao || 'Clique no botão abaixo para se verificar';
                      payload.imagem = config.mensagem?.imagem || config.mensagemImagem || null;
                      payload.thumbnail = config.mensagem?.thumbnail || config.mensagemThumbnail || null;
                      payload.cor = config.mensagem?.cor || config.mensagemCor || '#5865F2';
                    }

                    const response = await fetch(getApiPath('/api/dreamcloud/enviar-mensagem'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(payload)
                    });

                    const data = await response.json();
                    if (data.success) {
                      // Atualizar config com messageId
                      setConfig({
                        ...config,
                        mensagem: {
                          ...config.mensagem,
                          messageId: data.messageId,
                          canalId: data.channelId,
                          tipo: data.tipo || mensagemTipo
                        },
                        mensagemCanalId: data.channelId
                      });
                      toast({
                        title: 'Sucesso',
                        description: 'Mensagem enviada com sucesso!',
                        type: 'success',
                      });
                    } else {
                      toast({
                        title: 'Erro',
                        description: data.error || 'Erro ao enviar mensagem',
                        type: 'error',
                      });
                    }
                  } catch (error) {
                    console.error('Erro ao enviar mensagem:', error);
                    toast({
                      title: 'Erro',
                      description: 'Erro ao enviar mensagem',
                      type: 'error',
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !(config.mensagem?.canalId || config.mensagemCanalId)}
                className="w-full px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem no Discord'}
              </button>

              {/* Botão Atualizar Mensagem (só aparece se já existe mensagem) */}
              {config.mensagem?.messageId && (
                <button
                  onClick={async () => {
                    if (!config.mensagem?.messageId) {
                      toast({
                        title: 'Erro',
                        description: 'Nenhuma mensagem enviada para atualizar',
                        type: 'error',
                      });
                      return;
                    }
                    
                    setLoading(true);
                    try {
                      const guildId = application?.guild_id;
                      const botId = application?.configuration?.clientId || application?.client_id;
                      if (!botId || !guildId) {
                        toast({
                          title: 'Erro',
                          description: 'Bot ID ou Guild ID não encontrado',
                          type: 'error',
                        });
                        return;
                      }

                      const mensagemTipo = config.mensagem?.tipo || 'embed';
                      const payload: any = {
                        bot_id: botId,
                        guild_id: guildId,
                        tipo: mensagemTipo,
                        botao_texto: config.mensagem?.botaoTexto || 'Verificar',
                        link_autorizacao: links?.authorization || null
                      };

                      if (mensagemTipo === 'container') {
                        payload.container_titulo = config.mensagem?.container?.titulo;
                        payload.container_descricao = config.mensagem?.container?.descricao;
                        payload.container_sub_descricao = config.mensagem?.container?.subDescricao;
                        payload.container_banner = config.mensagem?.container?.banner;
                        payload.container_icon = config.mensagem?.container?.icon;
                        payload.container_botao_nome = config.mensagem?.container?.botaoNome;
                        payload.container_botao_emoji = config.mensagem?.container?.botaoEmoji;
                        payload.container_botao_cor = config.mensagem?.container?.botaoCor;
                      } else {
                        payload.titulo = config.mensagem?.titulo || config.mensagemTitulo || 'Verificação';
                        payload.descricao = config.mensagem?.descricao || config.mensagemDescricao || 'Clique no botão abaixo para se verificar';
                        payload.imagem = config.mensagem?.imagem || config.mensagemImagem || null;
                        payload.thumbnail = config.mensagem?.thumbnail || config.mensagemThumbnail || null;
                        payload.cor = config.mensagem?.cor || config.mensagemCor || '#5865F2';
                      }

                      const response = await fetch(getApiPath('/api/dreamcloud/atualizar-mensagem'), {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                      });

                      const data = await response.json();
                      if (data.success) {
                        toast({
                          title: 'Sucesso',
                          description: 'Mensagem atualizada com sucesso!',
                          type: 'success',
                        });
                      } else {
                        toast({
                          title: 'Erro',
                          description: data.error || 'Erro ao atualizar mensagem',
                          type: 'error',
                        });
                      }
                    } catch (error) {
                      console.error('Erro ao atualizar mensagem:', error);
                      toast({
                        title: 'Erro',
                        description: 'Erro ao atualizar mensagem',
                        type: 'error',
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !config.mensagem?.messageId}
                  className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl font-medium hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Atualizando...' : 'Atualizar Mensagem Existente'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba Membros */}
      {abaAtiva === 'membros' && config && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Users size={24} />
                Membros OAuth2
              </h3>
              <p className="text-sm text-gray-400">Gerencie os membros que autorizaram o acesso via OAuth2.</p>
            </div>
            <button
              onClick={() => setShowPuxarModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <Download size={18} className="text-white" />
              <span className="text-sm font-medium">Puxar membros</span>
            </button>
          </div>

          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar membros..."
                className="w-full pl-12 pr-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2a2a2a]"
              />
            </div>
          </div>

          {/* Tabela de membros */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">NOME</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">DATA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">SERVIDOR</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">LOCALIZAÇÃO</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">STATUS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {membros.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum membro verificado ainda.
                    </td>
                  </tr>
                ) : (
                  membros
                    .filter((membro) => 
                      membro.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      membro.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((membro) => (
                      <tr key={membro.userId} className="border-b border-[#1a1a1a] hover:bg-[#0b0b0b] transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {(membro.avatarUrl || membro.avatar) ? (
                              <img 
                                src={membro.avatarUrl || (membro.avatar 
                                  ? (membro.avatar.startsWith('a_') 
                                    ? `https://cdn.discordapp.com/avatars/${membro.userId}/${membro.avatar}.gif?size=256`
                                    : `https://cdn.discordapp.com/avatars/${membro.userId}/${membro.avatar}.png?size=256`)
                                  : `https://cdn.discordapp.com/embed/avatars/${parseInt(membro.discriminator || '0') % 5}.png`)} 
                                alt={membro.username}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  // Fallback se a imagem não carregar
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {!membro.avatarUrl && !membro.avatar && (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-400 flex items-center justify-center text-black font-bold">
                                {membro.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div className="text-white font-medium">{membro.username}</div>
                              <div className="text-gray-400 text-sm">@{membro.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {membro.verifiedAt ? new Date(membro.verifiedAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {membro.guildId || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {membro.location?.regionName && membro.location?.city 
                            ? `${membro.location.regionName}, ${membro.location.city}`
                            : membro.location?.city 
                            ? membro.location.city
                            : membro.location?.country
                            ? membro.location.country
                            : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                            Ativo
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button 
                            onClick={() => {
                              setSelectedMember(membro);
                              setShowMemberModal(true);
                            }}
                            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                          >
                            <MoreVertical size={20} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {membros.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mostrando {membros.length > 0 ? 1 : 0}-{membros.length} de {membros.length} membros
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl font-medium hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Voltar
                </button>
                <button className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  1
                </button>
                <button className="px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl font-medium hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Puxar Membros */}
      {showPuxarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Download size={24} />
                Puxar Membros
              </h3>
              <button
                onClick={() => {
                  setShowPuxarModal(false);
                  setServidorSelecionado(null);
                }}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Selecione o servidor de destino para adicionar os membros verificados.
            </p>

            {loadingServidores ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Carregando servidores...</div>
              </div>
            ) : servidores.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">Nenhum servidor encontrado</div>
                <div className="text-sm text-gray-500">Adicione o bot a outros servidores primeiro</div>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {servidores.map((servidor) => (
                  <button
                    key={servidor.id}
                    onClick={() => setServidorSelecionado(servidor.id)}
                    className={`w-full p-3 rounded-xl border transition-colors text-left ${
                      servidorSelecionado === servidor.id
                        ? 'border-white/30 bg-white/5'
                        : 'border-[#1a1a1a] hover:border-[#2a2a2a] bg-[#0b0b0b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {servidor.icon ? (
                        <img
                          src={servidor.icon}
                          alt={servidor.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-400 flex items-center justify-center text-black font-bold">
                          {servidor.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{servidor.name}</span>
                          {servidor.isPrincipal && (
                            <span className="text-xs text-[#999999] bg-[#0f0f0f] border border-[#1a1a1a] px-2 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{servidor.id}</div>
                      </div>
                      {servidorSelecionado === servidor.id && (
                        <CheckCircle size={20} className="text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPuxarModal(false);
                  setServidorSelecionado(null);
                }}
                className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] text-white rounded-xl hover:border-[#2a2a2a] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePuxarMembros}
                disabled={!servidorSelecionado || puxandoMembros || loadingServidores}
                className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {puxandoMembros ? 'Processando...' : 'Puxar Membros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba Estatísticas */}
      {abaAtiva === 'estatisticas' && config && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 size={24} />
              Estatísticas
            </h3>
            <p className="text-sm text-gray-400">Estatísticas de verificação</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">Total de Verificações</div>
                <div className="text-3xl font-bold text-white">{config?.authCount || 0}</div>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">Status do Sistema</div>
                <div className={`text-lg font-semibold ${config?.ativo ? 'text-white' : 'text-gray-500'}`}>
                  {config?.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* Gráfico de Verificações */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-1">Verificações por Mês</h4>
                <p className="text-sm text-gray-400">Acompanhe o número de verificações mensais</p>
              </div>

              {graficoVerificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <BarChart3 size={40} className="mb-3 opacity-50" strokeWidth={1.5} />
                  <p className="text-sm font-medium mb-1">Sem dados disponíveis</p>
                  <p className="text-xs">Aguarde verificações para ver os dados aqui</p>
                </div>
              ) : (
                <div className="w-full" style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={graficoVerificacoes}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorVerificacoes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                      <XAxis 
                        dataKey="data" 
                        stroke="#666666"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#666666"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0b0b0b',
                          border: '1px solid #1a1a1a',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="quantidade"
                        stroke="#ffffff"
                        fillOpacity={1}
                        fill="url(#colorVerificacoes)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil do Membro */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Perfil do Membro</h3>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMember(null);
                }}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {(selectedMember.avatarUrl || selectedMember.avatar) ? (
                  <img 
                    src={selectedMember.avatarUrl || (selectedMember.avatar 
                      ? (selectedMember.avatar.startsWith('a_') 
                        ? `https://cdn.discordapp.com/avatars/${selectedMember.userId}/${selectedMember.avatar}.gif?size=256`
                        : `https://cdn.discordapp.com/avatars/${selectedMember.userId}/${selectedMember.avatar}.png?size=256`)
                      : `https://cdn.discordapp.com/embed/avatars/${parseInt(selectedMember.discriminator || '0') % 5}.png`)} 
                    alt={selectedMember.username}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-400 flex items-center justify-center text-black font-bold text-2xl">
                    {selectedMember.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-white">{selectedMember.username}</h4>
                  <p className="text-gray-400">@{selectedMember.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">ID do Usuário</div>
                  <div className="text-white font-mono text-sm">{selectedMember.userId}</div>
                </div>
                
                <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">ID do Servidor</div>
                  <div className="text-white font-mono text-sm">{selectedMember.guildId || 'N/A'}</div>
                </div>
                
                <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Data de Verificação</div>
                  <div className="text-white">
                    {selectedMember.verifiedAt 
                      ? new Date(selectedMember.verifiedAt).toLocaleString('pt-BR')
                      : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                    Ativo
                  </span>
                </div>
                
                {selectedMember.location?.regionName && selectedMember.location?.city && (
                  <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">LOCALIZAÇÃO</div>
                    <div className="text-white text-sm">{selectedMember.location.regionName}, {selectedMember.location.city}</div>
                  </div>
                )}
                
                {selectedMember.ipAddress && (
                  <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">IP (Parcial)</div>
                    <div className="text-white font-mono text-sm">{selectedMember.ipAddress.substring(0, 15)}...</div>
                  </div>
                )}
                
                {selectedMember.userAgent && (
                  <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4 col-span-2">
                    <div className="text-sm text-gray-400 mb-1">User Agent</div>
                    <div className="text-white text-sm break-all">{selectedMember.userAgent}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
