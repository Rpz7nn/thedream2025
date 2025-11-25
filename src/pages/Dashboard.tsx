import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDiscordAuth } from '../hooks/useDiscordAuth';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { getApiPath } from '@/utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/DashboardSidebar';
import ProdutosSection from '../components/ProdutosSectionNovo';
import DefinicoesSection from '../components/DefinicoesSection';
import PagamentosSection from '../components/PagamentosSection';
import AutomacoesSection from '../components/AutomacoesSection';
import BoasVindasSection from '../components/BoasVindasSection';
import TicketSection from '../components/TicketSection';
import DreamCloudSection from '../components/DreamCloudSection';
import RendimentosSection from '../components/RendimentosSection';
import SorteiosSection from '../components/SorteiosSection';
import MudarServidorSection from '../components/MudarServidorSection';
import RiscoSection from '../components/RiscoSection';
import ProtecoesSection from '../components/ProtecoesSection';
import PersonalizacaoSection from '../components/PersonalizacaoSection';
import { ArrowLeft, Cloud } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area } from 'recharts';

interface Application {
  id: string;
  application_name: string;
  application_type: string;
  plan_type: string;
  guild_id?: string;
  guild_name?: string;
  guild_icon?: string;
  guild_members?: number;
  createdAt?: string | Date;
  expiresAt?: string | Date;
  discloudAppId?: string;
  discloudStatus?: 'running' | 'stopped' | 'deployed' | null;
  configuration?: {
    configured: boolean;
    bot_token?: string;
    client_id?: string;
    clientId?: string;
    botId?: string;
    serverId?: string;
  };
  client_id?: string;
}

// URLs das APIs - usar getApiPath para garantir URLs corretas em produção
const PRODUTOS_API_URL = getApiPath('/api/produtos');
const BOT_API_URL = getApiPath('/api/bot');

interface Campo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoAnterior?: number;
  estoque: string[];
  emoji?: string;
}

interface Cupom {
  id: string;
  codigo: string;
  desconto: number;
  maximoUso: number;
  cargosPermitidos: string[];
  cargosNegados: string[];
  ativo: boolean;
}

interface Extras {
  requerCargo?: string; // ID do cargo requerido
  quantidadeMinima?: number;
  quantidadeMaxima?: number;
  cargoAdicionar?: string; // ID do cargo para adicionar após compra
  cargoRemover?: string; // ID do cargo para remover após compra
}

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  useContainers: boolean;
  icon?: string;
  banner?: string;
  channelId?: string;
  embedColor?: string;
  embedFooter?: string;
  corButton?: string; // Cor do botão (Primary, Secondary, Success, Danger)
  tipoEntrega: 'automatica' | 'manual';
  campos: Campo[];
  cupons?: Cupom[];
  extras?: Extras;
  selectPromptText?: string; // Texto acima do SelectMenu
  selectPlaceholder?: string; // Placeholder do SelectMenu
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard(): JSX.Element {
  const { confirm, ConfirmDialog } = useConfirm();
  const [activeSection, setActiveSection] = useState('principal');
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [botProfile, setBotProfile] = useState<any>(null);
  const [guildChannels, setGuildChannels] = useState<Array<{ id: string; name: string; type: number }>>([]);
  const [personalizeLoading, setPersonalizeLoading] = useState(false);
  
  // Estados para produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosLoading, setProdutosLoading] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  
  // Estados para rendimentos
  const [rendimentosStats, setRendimentosStats] = useState<any>(null);
  const [rendimentosChart, setRendimentosChart] = useState<any[]>([]);
  const [rendimentosRecent, setRendimentosRecent] = useState<any[]>([]);
  const [rendimentosLoading, setRendimentosLoading] = useState(false);
  
  // Estados do formulário de produto
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoDescricao, setProdutoDescricao] = useState('');
  const [produtoDestaques, setProdutoDestaques] = useState(''); // Destaques do produto (usado no container do carrinho)
  const [produtoUseContainers, setProdutoUseContainers] = useState(false);
  const [produtoTemplateType, setProdutoTemplateType] = useState<'embed' | 'container'>('embed');
  const [produtoIcon, setProdutoIcon] = useState('');
  const [produtoBanner, setProdutoBanner] = useState('');
  const [produtoChannelId, setProdutoChannelId] = useState('');
  const [produtoCorEmbed, setProdutoCorEmbed] = useState('#FFD700');
  const [produtoButtonLabel, setProdutoButtonLabel] = useState(''); // Nome do botão de compra
  const [produtoButtonEmoji, setProdutoButtonEmoji] = useState(''); // Emoji do botão de compra
  const [produtoCorButton, setProdutoCorButton] = useState('Primary'); // Cor do botão (Primary, Secondary, Success, Danger)
  
  // Estados para campos customizáveis (agora com estoque e preço por campo)
  const [produtoCampos, setProdutoCampos] = useState<Campo[]>([]);
  
  // Estados para cupons
  const [produtoCupons, setProdutoCupons] = useState<Cupom[]>([]);
  
  // Estados para extras
  const [produtoExtras, setProdutoExtras] = useState<Extras>({
    requerCargo: undefined,
    quantidadeMinima: 0,
    quantidadeMaxima: 0,
    cargoAdicionar: undefined,
    cargoRemover: undefined,
  });
  
  // Estado para modo de edição
  const [editandoProduto, setEditandoProduto] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'campos' | 'cupons' | 'extras'>('geral');
  
  // Estado para tipo de entrega
  const [tipoEntrega, setTipoEntrega] = useState<'automatica' | 'manual'>('automatica');
  
  // Estado para rastrear mudanças não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [produtoOriginal, setProdutoOriginal] = useState<Produto | null>(null);
  
  const { user } = useDiscordAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app');
  const { toast } = useToast();

  // Buscar dados da aplicação
  useEffect(() => {
    const fetchApplication = async () => {
      if (!user?.id || !appId) {
        setLoading(false);
      return;
    }

      try {
        const response = await fetch(getApiPath(`/api/applications?user_id=${user.id}`), {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.applications) {
          const app = data.applications.find((a: Application) => a.id === appId);
          
          // Verificar se a aplicação existe e pertence ao usuário
          if (!app) {
            console.warn(`⚠️ Aplicação ${appId} não encontrada ou não pertence ao usuário ${user.id}`);
            toast({
              type: 'error',
              title: 'Acesso negado',
              description: 'Você não tem permissão para acessar esta aplicação.'
            });
            navigate('/applications');
            return;
          }
          
          // Verificar se a aplicação expirou
          if (app.expires_at) {
            const expiresAt = new Date(app.expires_at);
            const now = new Date();
            if (now > expiresAt) {
              toast({
                type: 'error',
                title: 'Aplicação expirada',
                description: 'Esta aplicação expirou. Renove através das faturas para continuar usando.'
              });
              navigate('/applications');
              return;
            }
          }
          
          // Verificar se a aplicação está configurada
          if (app && app.configuration?.configured && app.guild_id) {
            setApplication(app);
          } else {
            // Se não estiver configurada, voltar para applications
            navigate('/applications');
          }
        } else {
          // Se não conseguir buscar aplicações, redirecionar
          console.error('Erro ao buscar aplicações:', data.error);
          navigate('/applications');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível carregar a aplicação.'
        });
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user?.id, appId, navigate]);

  // Buscar canais do servidor (otimizado com cache)
  const fetchGuildChannels = useCallback(async () => {
    if (!application?.guild_id) {
      console.warn('⚠️ fetchGuildChannels: guild_id não encontrado');
      return;
    }
    
    // Verificar cache local primeiro
    const cacheKey = `channels_${application.guild_id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        // Cache válido por 2 minutos (sincronizado com backend)
        if (now - timestamp < 120000) {
          console.log('✅ Canais carregados do cache:', data.length);
          setGuildChannels(data);
          return;
        }
      } catch (e) {
        // Ignorar erro de cache
      }
    }
    
    try {
      const botId = application?.configuration?.clientId || application?.client_id;
      if (!botId) {
        console.warn('⚠️ fetchGuildChannels: botId não encontrado');
        return;
      }
      
      console.log('🔍 Buscando canais:', { guildId: application.guild_id, botId });
      
        // Usar endpoint otimizado de definições (mais rápido - API REST direta)
        const response = await fetch(`${BOT_API_URL}/definicoes/canais/${application.guild_id}?bot_id=${botId}`, {
          credentials: 'include',
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
            // Armazenar no cache local (2 minutos - sincronizado com backend)
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: data.channels,
              timestamp: Date.now()
            }));
        } else {
          console.warn('⚠️ Resposta não tem success ou channels:', data);
          setGuildChannels([]);
          }
        } else {
        const errorText = await response.text();
        console.error('❌ Erro HTTP ao buscar canais:', response.status, errorText);
          // Se erro, limpar cache inválido
          sessionStorage.removeItem(cacheKey);
        setGuildChannels([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar canais:', error);
      // Limpar cache em caso de erro
      sessionStorage.removeItem(cacheKey);
      setGuildChannels([]);
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id]);

  // Buscar dados do bot e atualizar periodicamente (otimizado - menos requisições)
  useEffect(() => {
    const fetchBotProfile = async () => {
      if (!application?.id || !user?.id) return;

      try {
        // Cache local para evitar requisições desnecessárias
        const cacheKey = `bot_profile_${application.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            // Cache válido por 60 segundos
            if (now - timestamp < 60000) {
              setBotProfile(data);
              return;
            }
          } catch (e) {
            // Ignorar erro de cache
          }
        }

        const response = await fetch(getApiPath(`/api/applications/${application.id}/bot-profile?user_id=${user.id}&_t=${Date.now()}`), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.bot) {
            setBotProfile(data.bot);
            // Armazenar no cache local
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: data.bot,
              timestamp: Date.now()
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching bot profile:', error);
      }
    };

    fetchBotProfile();
    
    // Atualizar a cada 60 segundos (reduzido de 30s) para pegar mudanças no avatar do bot
    const interval = setInterval(() => {
      fetchBotProfile();
    }, 60000);

    return () => clearInterval(interval);
  }, [application?.id, user?.id]);

  // Buscar informações atualizadas do servidor periodicamente (otimizado - menos requisições)
  useEffect(() => {
    const fetchApplication = async () => {
      if (!user?.id) return;

      try {
        // Cache local para evitar requisições desnecessárias
        const cacheKey = `application_${user.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            // Cache válido por 60 segundos
            if (now - timestamp < 60000) {
              const app = data.find((a: Application) => a.id === application?.id);
              if (app && (app.guild_icon !== application?.guild_icon || app.guild_name !== application?.guild_name)) {
                setApplication(app);
              }
              return;
            }
          } catch (e) {
            // Ignorar erro de cache
          }
        }

        const response = await fetch(getApiPath(`/api/applications?user_id=${user.id}&_t=${Date.now()}`), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.applications && data.applications.length > 0) {
            // Armazenar no cache local
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: data.applications,
              timestamp: Date.now()
            }));

            const app = data.applications.find((a: Application) => a.id === application?.id);
            if (app) {
              // Atualizar apenas se houver mudanças no guild_icon ou guild_name
              if (app.guild_icon !== application?.guild_icon || app.guild_name !== application?.guild_name) {
                setApplication(app);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      }
    };
    
    if (application?.id) {
      fetchApplication();
      
      // Atualizar a cada 60 segundos (reduzido de 30s) para pegar mudanças no ícone do servidor
      const interval = setInterval(() => {
        fetchApplication();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [application?.id, user?.id]);

  useEffect(() => {
    fetchGuildChannels();
  }, [fetchGuildChannels]);

  // Buscar produtos da API do bot (otimizado com cache e memoização)
  const fetchProdutos = useCallback(async () => {
    const guildId = application?.guild_id;
    const botId = application?.configuration?.clientId || application?.client_id;
    
    if (!botId) {
      setProdutos([]);
      setProdutosLoading(false);
      return;
    }
    
    // Verificar cache local primeiro
    const cacheKey = `produtos_${botId}_${guildId || 'all'}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        // Cache válido por 30 segundos (aumentado para reduzir requisições)
        if (now - timestamp < 30000) {
          setProdutos(data);
          setProdutosLoading(false);
          return;
        }
      } catch (e) {
        // Ignorar erro de cache
      }
    }
    
    setProdutosLoading(true);
    try {
      const params = new URLSearchParams({ bot_id: botId });
      if (guildId) {
        params.append('guild_id', guildId);
      }
      
      const url = `${PRODUTOS_API_URL}?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok && data.produtos) {
        setProdutos(data.produtos);
        // Armazenar no cache local
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: data.produtos,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setProdutosLoading(false);
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id]);

  const fetchRendimentos = async () => {
    setRendimentosLoading(true);
    try {
      const guildId = application?.guild_id;
      if (!guildId) {
        setRendimentosLoading(false);
        return;
      }
      
      const guildParam = `guild_id=${guildId}`;
      
      // Buscar estatísticas (usando a rota principal de rendimentos)
      const statsResponse = await fetch(getApiPath(`/api/rendimentos?${guildParam}`), {
        credentials: 'include'
      });
      const statsData = await statsResponse.json();
      if (statsResponse.ok && statsData.success) {
        setRendimentosStats(statsData.stats);
        setRendimentosChart(statsData.grafico || []);
        setRendimentosRecent(statsData.ultimasVendas || []);
      }
    } catch (error) {
      console.error('Erro ao buscar rendimentos:', error);
    } finally {
      setRendimentosLoading(false);
    }
  };

  // Carregar produtos quando entrar na seção produtos
  useEffect(() => {
    if (activeSection === 'produtos' && application?.id) {
      fetchProdutos();
      // Garantir que os canais sejam carregados quando entrar na seção de produtos
      fetchGuildChannels();
    }
  }, [activeSection, application?.id, fetchProdutos, fetchGuildChannels]);

  // Carregar rendimentos quando entrar na seção rendimentos
  useEffect(() => {
    if (activeSection === 'rendimentos') {
      fetchRendimentos();
    }
  }, [activeSection]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (!editandoProduto || !produtoOriginal) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges = 
      produtoNome !== produtoOriginal.nome ||
      (produtoDescricao || '') !== (produtoOriginal.descricao || '') ||
      (produtoDestaques || '') !== ((produtoOriginal as any).destaques || '') ||
      produtoTemplateType !== ((produtoOriginal as any).templateType || 'embed') ||
      (produtoIcon || '') !== (produtoOriginal.icon || '') ||
      (produtoBanner || '') !== (produtoOriginal.banner || '') ||
      (produtoChannelId || '') !== (produtoOriginal.channelId || '') ||
      produtoCorEmbed !== (produtoOriginal.embedColor || '#FFD700') ||
      produtoCorButton !== (produtoOriginal.corButton || 'Primary') ||
      tipoEntrega !== (produtoOriginal.tipoEntrega || 'automatica') ||
      JSON.stringify(produtoCampos) !== JSON.stringify(produtoOriginal.campos || []) ||
      JSON.stringify(produtoCupons) !== JSON.stringify(produtoOriginal.cupons || []);

    setHasUnsavedChanges(hasChanges);
  }, [editandoProduto, produtoOriginal, produtoNome, produtoDescricao, produtoDestaques, produtoTemplateType, produtoIcon, produtoBanner, 
      produtoChannelId, produtoCorEmbed, produtoCorButton, tipoEntrega, produtoCampos, produtoCupons]);

  // Limpar formulário
  const limparFormulario = () => {
    setProdutoNome('');
    setProdutoDescricao('');
    setProdutoDestaques('');
    setProdutoUseContainers(false);
    setProdutoTemplateType('embed');
    setProdutoIcon('');
    setProdutoBanner('');
    setProdutoChannelId('');
    setProdutoCorEmbed('#FFD700');
    setProdutoButtonLabel('');
    setProdutoButtonEmoji('');
    setProdutoCorButton('Primary');
    setProdutoCampos([]);
    setProdutoCupons([]);
    setProdutoExtras({
      requerCargo: undefined,
      quantidadeMinima: 0,
      quantidadeMaxima: 0,
      cargoAdicionar: undefined,
      cargoRemover: undefined,
    });
    setTipoEntrega('automatica');
    setEditandoProduto(null);
    setProdutoOriginal(null);
    setHasUnsavedChanges(false);
  };

  // Editar produto
  const handleEditarProduto = (produto: Produto) => {
    console.log('🔧 handleEditarProduto chamado com:', produto);
    console.log('🔧 templateType recebido:', (produto as any).templateType);
    setProdutoNome(produto.nome);
    setProdutoDescricao(produto.descricao || '');
    setProdutoDestaques((produto as any).destaques || '');
    setProdutoUseContainers(produto.useContainers);
    // Converter tipos antigos (container1, container2, container3) para 'container'
    const templateType = (produto as any).templateType || 'embed';
    let normalizedTemplateType: 'embed' | 'container';
    if (templateType === 'container1' || templateType === 'container2' || templateType === 'container3') {
      normalizedTemplateType = 'container';
    } else {
      normalizedTemplateType = templateType as 'embed' | 'container';
    }
    setProdutoTemplateType(normalizedTemplateType);
    console.log('🔧 setProdutoTemplateType definido para:', normalizedTemplateType);
    setProdutoIcon(produto.icon || '');
    setProdutoBanner(produto.banner || '');
    setProdutoChannelId(produto.channelId || '');
    setProdutoCorEmbed(produto.embedColor || '#FFD700');
    setProdutoButtonLabel((produto as any).buttonLabel || '');
    setProdutoButtonEmoji((produto as any).buttonEmoji || '');
    setProdutoCorButton(produto.corButton || 'Primary');
    setProdutoCampos(produto.campos || []);
    setProdutoCupons(produto.cupons || []);
    const extras = produto.extras || {};
    setProdutoExtras({
      requerCargo: extras.requerCargo || undefined,
      quantidadeMinima: extras.quantidadeMinima || 0,
      quantidadeMaxima: extras.quantidadeMaxima || 0,
      cargoAdicionar: extras.cargoAdicionar || undefined,
      cargoRemover: extras.cargoRemover || undefined,
    });
    setTipoEntrega(produto.tipoEntrega || 'automatica');
    setEditandoProduto(produto.id);
    setAbaAtiva('geral');
    
    // Guardar produto original e resetar estado de mudanças
    setProdutoOriginal(produto);
    setHasUnsavedChanges(false);
  };

  // Criar/Atualizar produto
  const handleCriarProduto = async () => {
    console.log('🚀 ========== handleCriarProduto CHAMADO! ==========');
    console.log('🚀 Estado atual - produtoTemplateType:', produtoTemplateType);
    console.log('🚀 Estado atual - editandoProduto:', editandoProduto);
    console.log('🚀 Estado atual - produtoNome:', produtoNome);
    
    if (!produtoNome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do produto é obrigatório',
        type: 'error',
      });
      return;
    }

    if (!produtoChannelId.trim()) {
      toast({
        title: 'Erro',
        description: 'Selecione o canal onde o produto será postado',
        type: 'error',
      });
      return;
    }

    if (produtoCampos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um campo ao produto',
        type: 'error',
      });
      return;
    }

    setProdutosLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      
      if (!botId) {
        toast({
          title: 'Erro',
          description: 'Client ID do bot não encontrado. Configure o bot primeiro.',
          type: 'error',
        });
        setProdutosLoading(false);
        return;
      }
      
      if (!guildId) {
        toast({
          title: 'Configure o Bot',
          description: 'Você precisa configurar o bot antes de criar produtos. Clique em "Aplicações" no menu para configurar.',
          type: 'error',
        });
        setProdutosLoading(false);
        return;
      }
      
      const url = editandoProduto 
        ? `${PRODUTOS_API_URL}/${editandoProduto}?bot_id=${botId}&guild_id=${guildId}`
        : `${PRODUTOS_API_URL}`;
      
      const method = editandoProduto ? 'PATCH' : 'POST';

      // Garantir que undefined seja convertido para null nos extras
      const extrasSanitized = {
        requerCargo: produtoExtras.requerCargo || null,
        quantidadeMinima: produtoExtras.quantidadeMinima || 0,
        quantidadeMaxima: produtoExtras.quantidadeMaxima || 0,
        cargoAdicionar: produtoExtras.cargoAdicionar || null,
        cargoRemover: produtoExtras.cargoRemover || null
      };
      
      const requestBody = {
          bot_id: botId,
          nome: produtoNome,
          descricao: produtoDescricao || null,
        destaques: produtoDestaques || null,
          useContainers: produtoUseContainers,
        templateType: produtoTemplateType,
          icon: produtoIcon || null,
          banner: produtoBanner || null,
          channelId: produtoChannelId,
          embedColor: produtoCorEmbed,
          buttonLabel: produtoButtonLabel?.trim() || null,
          buttonEmoji: produtoButtonEmoji?.trim() || null,
          corButton: produtoCorButton || 'Primary',
          tipoEntrega: tipoEntrega || 'automatica',
          campos: produtoCampos,
          cupons: produtoCupons,
          extras: extrasSanitized,
          guild_id: guildId,
        };
      
      console.log('📤 Enviando requisição:', { method, url, botId, guildId });
      console.log('📤 templateType sendo enviado:', produtoTemplateType);
      console.log('📤 Body completo:', requestBody);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('Resposta recebida:', { status: response.status, statusText: response.statusText, contentType: response.headers.get('content-type') });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 500));
        throw new Error(`Resposta não é JSON. Status: ${response.status}. Conteúdo: ${text.substring(0, 200)}`);
      }
      
      console.log('Resposta do servidor:', { status: response.status, data });

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: editandoProduto ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
          type: 'success',
        });
        
        // Se estiver editando, manter no produto editado; se for novo, limpar formulário
        if (editandoProduto) {
          // Buscar o produto atualizado diretamente do backend
          const produtoId = editandoProduto;
          const params = new URLSearchParams({ bot_id: botId });
          if (guildId) {
            params.append('guild_id', guildId);
          }
          
          try {
            const produtoResponse = await fetch(`${PRODUTOS_API_URL}/${produtoId}?${params.toString()}`, {
              credentials: 'include',
            });
            
            if (produtoResponse.ok) {
              const produtoData = await produtoResponse.json();
              if (produtoData.produto) {
                console.log('🔍 Produto atualizado buscado do backend:', produtoData.produto);
                console.log('🔍 templateType do produto:', produtoData.produto.templateType);
                handleEditarProduto(produtoData.produto);
              }
            }
          } catch (error) {
            console.warn('⚠️ Erro ao buscar produto atualizado, usando dados da resposta:', error);
            // Fallback: usar produto da resposta se disponível
          if (data.produto) {
            handleEditarProduto(data.produto);
          }
          }
          
          // Recarregar lista de produtos
          await fetchProdutos();
          // Resetar estado de mudanças não salvas
          setHasUnsavedChanges(false);
        } else {
          limparFormulario();
          fetchProdutos();
          setAbaAtiva('geral');
        }
      } else {
        const errorMessage = data.error || data.message || 'Erro desconhecido';
        console.error('Erro ao salvar produto:', errorMessage);
        toast({
          title: 'Erro',
          description: `Erro ao salvar produto: ${errorMessage}`,
          type: 'error',
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao criar produto';
      toast({
        title: 'Erro',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setProdutosLoading(false);
    }
  };


  // Deletar produto
  const handleDeletarProduto = async (id: string) => {
    confirm({
      title: 'Deletar produto',
      description: 'Deseja realmente deletar este produto?',
      onConfirm: async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      
      if (!botId) {
        toast({
          title: 'Erro',
          description: 'Client ID do bot não encontrado.',
          type: 'error',
        });
        return;
      }
      
      const params = new URLSearchParams({ bot_id: botId });
      if (guildId) {
        params.append('guild_id', guildId);
      }
      
      const response = await fetch(`${PRODUTOS_API_URL}/${id}?${params.toString()}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Produto deletado com sucesso!',
          type: 'success',
        });
        fetchProdutos();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao deletar produto',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar produto',
        type: 'error',
      });
    }
      }
    });
  };

  // Enviar produto ao Discord
  const handleEnviarProduto = async () => {
    if (!editandoProduto) {
      toast({
        title: 'Erro',
        description: 'Nenhum produto selecionado para enviar',
        type: 'error',
      });
      return;
    }

    if (!produtoChannelId.trim()) {
      toast({
        title: 'Erro',
        description: 'Configure o ID do canal antes de enviar',
        type: 'error',
      });
      return;
    }

    setProdutosLoading(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      
      if (!botId) {
        toast({
          title: 'Erro',
          description: 'Client ID do bot não encontrado. Configure o bot primeiro.',
          type: 'error',
        });
        setProdutosLoading(false);
        return;
      }
      
      // Primeiro, salvar o produto com tipoEntrega atualizado
      console.log('Salvando produto antes de enviar...');
      console.log(`Tipo Entrega: ${tipoEntrega}`);
      await handleCriarProduto();
      
      // Aguardar um pouco para garantir que salvou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`${PRODUTOS_API_URL}/${editandoProduto}/postar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          bot_id: botId,
          channelId: produtoChannelId,
          guild_id: guildId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto enviado ao Discord com sucesso!',
          type: 'success',
        });
        // Recarregar produtos para obter messageId atualizado
        await fetchProdutos();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao enviar produto: ' + (data.error || data.details || 'Erro desconhecido'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar produto ao Discord',
        type: 'error',
      });
    } finally {
      setProdutosLoading(false);
    }
  };

  const renderContent = (): JSX.Element => {
    // Função para converter arquivo para base64
    const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

    // Função para trigger do input de arquivo
    const triggerFileInput = (type: 'avatar' | 'banner') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Validar tamanho (8MB)
        if (file.size > 8 * 1024 * 1024) {
          toast({
            title: 'Erro',
            description: 'Arquivo muito grande. Máximo 8MB.',
            type: 'error',
          });
      return;
    }
    
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Erro',
            description: 'Por favor, selecione uma imagem.',
            type: 'error',
          });
          return;
        }

        try {
          const base64 = await readFileAsBase64(file);
          await handleSavePersonalization(type === 'avatar' ? 'avatar' : 'banner', base64);
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          toast({
            title: 'Erro',
            description: 'Erro ao processar imagem',
            type: 'error',
          });
        }
      };
      
      input.click();
    };

    // Função para salvar personalização
    const handleSavePersonalization = async (type: 'username' | 'status' | 'avatar' | 'banner', imageBase64?: string) => {
      if (!application?.id || !user?.id) return;

      setPersonalizeLoading(true);

      try {
        const payload: any = {};
        
        if (type === 'username') {
          const input = document.getElementById('bot-username') as HTMLInputElement;
          if (input && input.value.trim()) {
            payload.username = input.value.trim();
          }
        } else if (type === 'status') {
          const statusInput = document.querySelector('input[name="status"]:checked') as HTMLInputElement;
          if (statusInput) {
            payload.status = statusInput.value;
          }
        } else if (type === 'avatar' && imageBase64) {
          payload.avatar = imageBase64;
        } else if (type === 'banner' && imageBase64) {
          payload.banner = imageBase64;
        }

        if (Object.keys(payload).length === 0) {
          toast({
            title: 'Info',
            description: 'Nada para atualizar',
            type: 'info',
          });
          setPersonalizeLoading(false);
        return;
      }
      
        const response = await fetch(getApiPath(`/api/applications/${application.id}/bot-personalization?user_id=${user.id}`), {
        method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          // Atualizar perfil do bot localmente
          if (data.bot) {
        setBotProfile(data.bot);
      }
          toast({
            title: 'Sucesso',
            description: data.message || 'Personalização atualizada com sucesso!',
            type: 'success',
          });
          
          // Recarregar perfil do bot
          if (application?.id && user?.id) {
            const botRes = await fetch(getApiPath(`/api/applications/${application.id}/bot-profile?user_id=${user.id}`), {
              credentials: 'include'
            });
            const botData = await botRes.json();
            if (botData.bot) {
              setBotProfile(botData.bot);
            }
          }
      } else {
          toast({
            title: 'Erro',
            description: data.error || 'Erro ao atualizar personalização',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Erro ao salvar personalização:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar alterações',
          type: 'error',
        });
    } finally {
        setPersonalizeLoading(false);
      }
    };

    switch (activeSection) {
      case 'principal':
        const createdAt = application?.createdAt ? new Date(application.createdAt) : null;
        const formattedDate = createdAt ? createdAt.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }) : 'N/A';

        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-semibold text-[#ffffff] mb-1">
                {application?.guild_name || 'Servidor Principal'}
              </h1>
              <p className="text-sm text-[#999999]">
                Servidor onde {application?.application_name || 'o bot'} está operando.
              </p>
            </div>

            {/* Layout Principal: Grid com 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Esquerda - Informações do Bot (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card: Informações do Bot */}
                <div className="minimal-card p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar do Bot */}
                    <div className="flex-shrink-0">
                      {botProfile?.avatar ? (
                    <img
                          src={`https://cdn.discordapp.com/avatars/${botProfile.id}/${botProfile.avatar}.png?size=128`}
                          alt={botProfile.username}
                          className="w-16 h-16 rounded-lg border border-[#1a1a1a]"
                          loading="lazy"
                          key={`bot-avatar-${botProfile.id}-${botProfile.avatar}`}
                    />
                  ) : (
                        <div className="w-16 h-16 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#666666]">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                    </div>
                  )}
                  </div>

                    {/* Informações do Bot */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-[#ffffff] truncate">
                          {botProfile?.username || application?.application_name || 'Bot'}
                        </h2>
                        {/* Status Indicator */}
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0f0f0f] rounded border border-[#1a1a1a]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff]"></div>
                          <span className="text-xs text-[#999999] font-medium">Online</span>
                </div>
              </div>
                      <p className="text-xs text-[#666666] font-mono mb-3">
                        ID: {botProfile?.id || application?.configuration?.clientId || 'N/A'}
                      </p>
                      
                      {/* Informações do Servidor */}
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center px-3 py-1 bg-[#0f0f0f] rounded border border-[#1a1a1a]">
                          <span className="text-xs text-[#999999]">
                            {application?.guild_name || 'Servidor'}
                            </span>
                          </div>
                        <div className="inline-flex items-center px-3 py-1 bg-[#0f0f0f] rounded border border-[#1a1a1a]">
                          <span className="text-xs text-[#999999] font-mono">
                            ({application?.guild_id || 'N/A'})
                          </span>
                        </div>
                      </div>
                    </div>
                        </div>
                      </div>

                {/* Card: Ações Rápidas */}
                <div className="minimal-card p-6">
                  <h3 className="text-sm font-medium text-[#ffffff] mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <button 
                      onClick={() => {
                        confirm({
                          title: '⚡ Iniciar Aplicação',
                          description: 'Escolha como deseja iniciar:',
                          confirmText: 'Aplicação Única',
                          cancelText: 'Todas as Aplicações',
                          onConfirm: async () => {
                            // Iniciar aplicação única
                            if (!application?.id || !application?.discloudAppId) {
                              toast({
                                title: 'Erro',
                                description: 'Aplicação não encontrada ou não deployada',
                                type: 'error',
                              });
                              return;
                            }
                            try {
                              const response = await fetch(getApiPath(`/api/applications/${application.id}/start`), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: 'Aplicação iniciada com sucesso!',
                                  type: 'success',
                                });
                                // Atualizar status da aplicação
                                if (application) {
                                  setApplication({ ...application, discloudStatus: 'running' as const });
                                }
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao iniciar aplicação',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao iniciar aplicação',
                                type: 'error',
                              });
                            }
                          },
                          onCancel: async () => {
                            // Iniciar todas as aplicações
                            try {
                              const response = await fetch(getApiPath('/api/applications/start-all'), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: data.message || `Iniciadas ${data.successful} de ${data.total} aplicações`,
                                  type: 'success',
                                });
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao iniciar aplicações',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao iniciar aplicações',
                                type: 'error',
                              });
                            }
                          }
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-[#0f0f0f] hover:bg-[#151515] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-md transition-all duration-200 group"
                      title="Iniciar Aplicação"
                        >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#999999] group-hover:text-green-400 transition-colors">
                        <polygon points="5 3 19 12 5 21 5 3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      <span className="text-xs text-[#999999] group-hover:text-green-400 font-medium transition-colors">Iniciar</span>
                        </button>

                        <button 
                      onClick={() => {
                        confirm({
                          title: '🔴 Parar Aplicação',
                          description: 'Escolha como deseja parar:',
                          confirmText: 'Aplicação Única',
                          cancelText: 'Todas as Aplicações',
                          onConfirm: async () => {
                            // Parar aplicação única
                            if (!application?.id || !application?.discloudAppId) {
                              toast({
                                title: 'Erro',
                                description: 'Aplicação não encontrada ou não deployada',
                                type: 'error',
                              });
                              return;
                            }
                            try {
                              const response = await fetch(getApiPath(`/api/applications/${application.id}/stop`), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: 'Aplicação parada com sucesso!',
                                  type: 'success',
                                });
                                // Atualizar status da aplicação
                                if (application) {
                                  setApplication({ ...application, discloudStatus: 'stopped' as const });
                                }
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao parar aplicação',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao parar aplicação',
                                type: 'error',
                              });
                            }
                          },
                          onCancel: async () => {
                            // Parar todas as aplicações
                            try {
                              const response = await fetch(getApiPath('/api/applications/stop-all'), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: data.message || `Paradas ${data.successful} de ${data.total} aplicações`,
                                  type: 'success',
                                });
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao parar aplicações',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao parar aplicações',
                                type: 'error',
                              });
                            }
                          }
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-[#0f0f0f] hover:bg-[#151515] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-md transition-all duration-200 group"
                      title="Parar Aplicação"
                        >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#999999] group-hover:text-red-400 transition-colors">
                        <rect x="6" y="4" width="4" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="14" y="4" width="4" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      <span className="text-xs text-[#999999] group-hover:text-red-400 font-medium transition-colors">Parar</span>
                        </button>

                        <button 
                      onClick={() => {
                        confirm({
                          title: '🔄 Reiniciar Aplicação',
                          description: 'Escolha como deseja reiniciar:',
                          confirmText: 'Aplicação Única',
                          cancelText: 'Todas as Aplicações',
                          onConfirm: async () => {
                            // Reiniciar aplicação única
                            if (!application?.id || !application?.discloudAppId) {
                              toast({
                                title: 'Erro',
                                description: 'Aplicação não encontrada ou não deployada',
                                type: 'error',
                              });
                              return;
                            }
                            try {
                              const response = await fetch(getApiPath(`/api/applications/${application.id}/restart`), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: 'Aplicação reiniciada com sucesso!',
                                  type: 'success',
                                });
                                // Atualizar status da aplicação
                                if (application) {
                                  setApplication({ ...application, discloudStatus: 'running' as const });
                                }
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao reiniciar aplicação',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao reiniciar aplicação',
                                type: 'error',
                              });
                            }
                          },
                          onCancel: async () => {
                            // Reiniciar todas as aplicações
                            try {
                              const response = await fetch(getApiPath('/api/applications/restart-all'), {
                                method: 'POST',
                                credentials: 'include'
                              });
                              const data = await response.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Sucesso',
                                  description: data.message || `Reiniciadas ${data.successful} de ${data.total} aplicações`,
                                  type: 'success',
                                });
                              } else {
                                toast({
                                  title: 'Erro',
                                  description: data.error || 'Erro ao reiniciar aplicações',
                                  type: 'error',
                                });
                              }
                            } catch (error: any) {
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao reiniciar aplicações',
                                type: 'error',
                              });
                            }
                          }
                        });
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-[#0f0f0f] hover:bg-[#151515] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-md transition-all duration-200 group"
                          title="Reiniciar Aplicação"
                        >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#999999] group-hover:text-yellow-400 transition-colors">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      <span className="text-xs text-[#999999] group-hover:text-yellow-400 font-medium transition-colors">Reiniciar</span>
                    </button>

                    <button 
                      onClick={() => {
                        // Recarregar dados da aplicação
                        if (user?.id && appId) {
                          fetch(getApiPath(`/api/applications?user_id=${user.id}`), {
                            credentials: 'include'
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success && data.applications) {
                                const app = data.applications.find((a: any) => a.id === appId);
                                if (app) {
                                  setApplication(app);
                                  toast({
                                    title: '✅ Sincronizado',
                                    description: 'Dados da aplicação atualizados!',
                                    type: 'success',
                                  });
                                }
                              }
                            })
                            .catch(() => {
                              toast({
                                title: 'Erro',
                                description: 'Erro ao sincronizar dados',
                                type: 'error',
                              });
                            });
                        }
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-[#0f0f0f] hover:bg-[#151515] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-md transition-all duration-200 group"
                      title="Sincronizar Dados"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#999999] group-hover:text-blue-400 transition-colors">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs text-[#999999] group-hover:text-blue-400 font-medium transition-colors">Sincronizar</span>
                        </button>
                      </div>

                  {/* Mudar Servidor */}
                  {application?.configuration?.configured && (
                    <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                      <MudarServidorSection 
                        application={application}
                        onServidorChanged={() => {
                          if (user?.id && appId) {
                            fetch(getApiPath(`/api/applications?user_id=${user.id}`), {
                              credentials: 'include'
                            })
                              .then(res => res.json())
                              .then(data => {
                                if (data.applications) {
                                  const app = data.applications.find((a: Application) => a.id === appId);
                                  if (app) {
                                    setApplication(app);
                                    window.location.reload();
                                  }
                                }
                              });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                    </div>

              {/* Coluna Direita - Status e Logs (1/3) */}
              <div className="space-y-6">
                {/* Card: Status da Versão */}
                <div className="minimal-card p-6">
                  <h3 className="text-sm font-medium text-[#ffffff] mb-4">Status da Versão</h3>
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-3 py-1.5 bg-[#0f0f0f] rounded border border-[#1a1a1a]">
                      <span className="text-xs font-medium text-[#ffffff]">BETA V1.0.0</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#666666] mt-0.5 flex-shrink-0">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-[#ffffff]">Sistema Estável</p>
                          <p className="text-xs text-[#666666] mt-0.5">Funcionando corretamente</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#666666] mt-0.5 flex-shrink-0">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-[#ffffff]">Criado em</p>
                          <p className="text-xs text-[#666666] mt-0.5">{formattedDate}</p>
                        </div>
                      </div>
                    </div>
                        </div>
                      </div>

                {/* Card: Logs e Alertas */}
                <div className="minimal-card p-6">
                  <h3 className="text-sm font-medium text-[#ffffff] mb-4">Logs Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded border border-[#1a1a1a]">
                      <div className="w-6 h-6 rounded border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-[#666666]">
                          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#ffffff] truncate">
                          {user?.username || 'Usuário'}
                        </p>
                        <p className="text-xs text-[#666666] mt-0.5">
                          Aplicação iniciada
                        </p>
                        <p className="text-xs text-[#666666] mt-1">
                          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rendimentos':
        return (
          <RendimentosSection 
            application={application}
            botApiUrl={BOT_API_URL}
          />
        );

      case 'personalizacao':
        return (
          <PersonalizacaoSection 
            application={application}
            botApiUrl="/api"
          />
        );

      case 'definicoes':
        return (
          <DefinicoesSection 
            application={application}
            botApiUrl={BOT_API_URL}
          />
        );

      case 'automacoes':
  return (
          <AutomacoesSection 
            application={application}
            botApiUrl={BOT_API_URL}
          />
        );

      case 'boas-vindas':
        return (
          <BoasVindasSection 
            application={application}
            botApiUrl={BOT_API_URL}
          />
        );

      case 'produtos':
        // Verificar se o bot está configurado
        if (!application?.guild_id || !application?.configuration?.configured) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[400px] minimal-card p-12">
              <div className="w-16 h-16 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#666666]">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-[#ffffff] mb-2">
                Configure o Bot Primeiro
              </h2>
              <p className="text-sm text-[#666666] text-center mb-6 max-w-md">
                Para criar produtos, você precisa configurar o bot primeiro. Vá para "Aplicações" no menu e configure seu bot Discord.
              </p>
              <button
                onClick={() => navigate('/applications')}
                className="minimal-button flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ir para Aplicações
              </button>
            </div>
          );
        }
        
        return (
          <ProdutosSection
            produtos={produtos}
            produtosLoading={produtosLoading}
            produtoNome={produtoNome}
            setProdutoNome={setProdutoNome}
            produtoDescricao={produtoDescricao}
            setProdutoDescricao={setProdutoDescricao}
            produtoDestaques={produtoDestaques}
            setProdutoDestaques={setProdutoDestaques}
            produtoUseContainers={produtoUseContainers}
            setProdutoUseContainers={setProdutoUseContainers}
            produtoTemplateType={produtoTemplateType}
            setProdutoTemplateType={setProdutoTemplateType}
            produtoIcon={produtoIcon}
            setProdutoIcon={setProdutoIcon}
            produtoBanner={produtoBanner}
            setProdutoBanner={setProdutoBanner}
            produtoChannelId={produtoChannelId}
            setProdutoChannelId={setProdutoChannelId}
            produtoCorEmbed={produtoCorEmbed}
            setProdutoCorEmbed={setProdutoCorEmbed}
            produtoButtonLabel={produtoButtonLabel}
            setProdutoButtonLabel={setProdutoButtonLabel}
            produtoButtonEmoji={produtoButtonEmoji}
            setProdutoButtonEmoji={setProdutoButtonEmoji}
            produtoCorButton={produtoCorButton}
            setProdutoCorButton={setProdutoCorButton}
            produtoCampos={produtoCampos}
            setProdutoCampos={setProdutoCampos}
            produtoCupons={produtoCupons}
            setProdutoCupons={setProdutoCupons}
            produtoExtras={produtoExtras}
            setProdutoExtras={setProdutoExtras}
            tipoEntrega={tipoEntrega}
            setTipoEntrega={setTipoEntrega}
            abaAtiva={abaAtiva}
            setAbaAtiva={setAbaAtiva}
            editandoProduto={editandoProduto}
            hasUnsavedChanges={hasUnsavedChanges}
            guildChannels={guildChannels}
            application={application}
            botApiUrl={BOT_API_URL}
            handleCriarProduto={handleCriarProduto}
            handleEnviarProduto={handleEnviarProduto}
            handleDeletarProduto={handleDeletarProduto}
            handleEditarProduto={handleEditarProduto}
            limparFormulario={limparFormulario}
          />
        );

      case 'pagamentos':
        return <PagamentosSection application={application} />;


      case 'ticket':
        return <TicketSection application={application} botApiUrl={BOT_API_URL} />;

      case 'dreamcloud':
        return <DreamCloudSection application={application} botApiUrl={BOT_API_URL} />;

      case 'sorteios':
        return <SorteiosSection application={application} botApiUrl={BOT_API_URL} />;

      case 'risco':
        return <RiscoSection application={application} />;

      case 'protecoes':
        return <ProtecoesSection application={application} botApiUrl="/api" />;

      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#ffffff] mb-1 capitalize">{activeSection}</h1>
              <p className="text-sm text-[#999999]">Seção em desenvolvimento</p>
            </div>
            <div className="minimal-card p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#666666]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#ffffff] mb-2">Em Desenvolvimento</h3>
              <p className="text-sm text-[#666666]">Esta seção está sendo construída</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <>
        <Header onOpenSidebar={undefined} showSidebarButton={false} />
        <div className="min-h-screen bg-[#000000] flex items-center justify-center">
          <div className="text-sm text-[#666666]">Carregando...</div>
        </div>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Header onOpenSidebar={undefined} showSidebarButton={false} />
        <div className="min-h-screen bg-[#000000] flex items-center justify-center">
          <div className="text-sm text-[#666666]">Aplicação não encontrada</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onOpenSidebar={undefined} showSidebarButton={false} />
      <div className="min-h-screen bg-[#000000] text-[#ffffff] pt-20">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          {/* Botão voltar */}
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center gap-2 text-[#999999] hover:text-[#ffffff] transition-colors mb-6 group"
          >
            <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Voltar para Aplicações</span>
          </button>

          {/* Layout principal */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Movida mais para a esquerda */}
            <div className="flex-shrink-0">
            <DashboardSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              application={application}
              botApiUrl={BOT_API_URL}
            />
            </div>

            {/* Conteúdo principal - Mais espaço */}
            <div className="flex-1 min-w-0 lg:max-w-none">
              {renderContent()}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

