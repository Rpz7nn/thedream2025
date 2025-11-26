import React, { useState, useEffect } from 'react';
import { getApiPath } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useDiscordAuth } from "../hooks/useDiscordAuth";
import { useToast } from "../hooks/use-toast";

interface Application {
  id: string;
  application_name: string;
  application_type: string;
  plan_type: string;
  memory_usage: number;
  icon_color: string;
  days_total: number;
  days_remaining: number;
  is_prime: boolean;
  status: string;
  created_at: string;
  expires_at: string;
  guild_id?: string;
  guild_name?: string;
  guild_icon?: string;
  guild_members?: number;
  bot_token?: string;
  client_id?: string;
  configuration?: {
    configured: boolean;
    configured_at?: string;
    bot_token?: string;
    client_id?: string;
  };
  discloud?: {
    appId?: string;
    status?: string;
  };
}

interface Invoice {
  id: string;
  invoiceId?: string;
  applicationId?: string | any;
  amount?: number;
  plan: string;
  planName: string;
  price: number;
  period: {
    period_type: string;
    period_months: number;
  };
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  txId: string | null;
  pixData?: {
    txid?: string;
    copiaCola?: string;
    imageDataUrl?: string;
    provider?: string;
  } | null;
  canRenew: boolean;
  isExpired?: boolean;
}

export default function Applications(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'apps' | 'faturas'>('apps');
  const [applications, setApplications] = useState<Application[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [botToken, setBotToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [botGuilds, setBotGuilds] = useState<any[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [guildsError, setGuildsError] = useState<string | null>(null);
  const [deployingApp, setDeployingApp] = useState<Application | null>(null);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStatus, setDeployStatus] = useState<string>('');
  const { user } = useDiscordAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Buscar aplicações e faturas do usuário
  useEffect(() => {
    const fetchData = async () => {
      // Permitir acesso sem login - apenas não carregar dados se não houver usuário
      if (!user?.id) {
        setLoading(false);
        setApplications([]);
        setInvoices([]);
        return;
      }

      try {
        // Buscar aplicações e faturas em paralelo
        const [appsResponse, invoicesResponse] = await Promise.all([
          fetch(getApiPath(`/api/applications?user_id=${user.id}`), {
            credentials: 'include'
          }),
          fetch(getApiPath('/api/invoices'), {
            credentials: 'include'
          })
        ]);
        
        const appsData = await appsResponse.json();
        const invoicesData = await invoicesResponse.json();
        
        if (appsResponse.ok) {
          const applicationsList = appsData.applications || appsData.success?.applications || [];
          setApplications(applicationsList);
          console.log(`✅ ${applicationsList.length} aplicação(ões) carregada(s)`);
        } else {
          console.error('Error fetching applications:', appsData.error);
        }

        if (invoicesResponse.ok) {
          const invoicesList = invoicesData.invoices || [];
          console.log(`✅ ${invoicesList.length} fatura(s) recebida(s) do backend`);
          
          // Transformar faturas do formato do backend para o formato esperado pelo frontend
          const transformedInvoices = invoicesList.map((inv: any) => {
            // O invoice pode vir do array user.invoices (payments.js) ou do modelo Invoice (invoices.js)
            const invoiceId = inv.id || inv.invoiceId || inv._id?.toString();
            let applicationId = inv.applicationId?._id || inv.applicationId?.toString() || inv.applicationId;
            
            // Se applicationId não está definido mas existe um objeto applicationId com _id
            if (!applicationId && inv.applicationId && typeof inv.applicationId === 'object' && inv.applicationId._id) {
              applicationId = inv.applicationId._id.toString();
            }
            
            const applicationName = inv.applicationId?.applicationName || inv.applicationId?.application_name || inv.planName || 'Aplicação';
            
            return {
              id: invoiceId,
              invoiceId: invoiceId,
              applicationId: applicationId,
              amount: inv.amount || inv.price || 0,
              status: inv.status || 'pending',
              createdAt: inv.createdAt || inv.created_at || new Date().toISOString(),
              paidAt: inv.paidAt || inv.paid_at || null,
              expiresAt: inv.expiresAt || inv.expires_at || null,
              pixData: inv.pixData || null,
              // Campos para compatibilidade
              plan: inv.plan || 'basic',
              planName: inv.planName || applicationName,
              price: inv.price || inv.amount || 0,
              period: inv.period || {
                period_type: 'monthly',
                period_months: 1
              },
              txId: inv.txId || inv.pixData?.txid || null,
              canRenew: inv.status === 'pending' && inv.expiresAt && new Date(inv.expiresAt) > new Date(),
              // Verificar se a fatura está expirada
              isExpired: inv.status === 'expired' || (inv.expiresAt && new Date(inv.expiresAt) < new Date()),
              // Manter objeto applicationId completo para referência
              _applicationIdObj: inv.applicationId
            };
          });
          
          console.log(`✅ ${transformedInvoices.length} fatura(s) transformada(s) e pronta(s) para exibição`);
          console.log('📋 Faturas transformadas (debug):', transformedInvoices.map(inv => ({
            id: inv.id,
            planName: inv.planName,
            status: inv.status,
            applicationId: inv.applicationId,
            hasApplicationId: !!inv.applicationId
          })));
          setInvoices(transformedInvoices);
        } else {
          console.error('❌ Erro ao buscar faturas:', invoicesData.error || invoicesData.message);
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Função para obter cor da barra de progresso baseada nos dias restantes
  const getProgressColor = (daysRemaining: number, daysTotal: number) => {
    const percentage = (daysRemaining / daysTotal) * 100;
    if (percentage > 50) return '#4CAF50'; // Verde
    if (percentage > 25) return '#FF9800'; // Laranja
    return '#F44336'; // Vermelho
  };

  // Função para calcular tempo restante em tempo real (dias, horas, minutos)
  const calculateTimeRemaining = (expiresAt: string) => {
    if (!expiresAt) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const diff = expirationDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
  };

  // Estado para tempo restante atualizado em tempo real
  const [timeRemaining, setTimeRemaining] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number; expired: boolean }>>({});

  // Atualizar tempo restante a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const updated: Record<string, { days: number; hours: number; minutes: number; seconds: number; expired: boolean }> = {};
      applications.forEach(app => {
        if (app.expires_at) {
          updated[app.id] = calculateTimeRemaining(app.expires_at);
        }
      });
      setTimeRemaining(updated);
    }, 1000); // Atualizar a cada segundo

    // Atualizar imediatamente
    const updated: Record<string, { days: number; hours: number; minutes: number; seconds: number; expired: boolean }> = {};
    applications.forEach(app => {
      if (app.expires_at) {
        updated[app.id] = calculateTimeRemaining(app.expires_at);
      }
    });
    setTimeRemaining(updated);

    return () => clearInterval(interval);
  }, [applications]);

  // Abrir modal de configuração
  const handleOpenModal = (app: Application) => {
    setSelectedApp(app);
    const existingToken = app.bot_token || app.configuration?.bot_token || '';
    const existingClientId = app.client_id || app.configuration?.client_id || '';
    setBotToken(existingToken);
    setClientId(existingClientId);
    setModalStep(1);
    setModalOpen(true);
    setBotGuilds([]);
    setGuildsError(null);
  };

  // Validar e avançar para etapa 2
  const handleNextStep = async () => {
    if (!botToken.trim() || !clientId.trim()) {
      toast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
      });
      return;
    }

    setSaving(true);
    try {
      // Validar token e buscar servidores do bot
      const response = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
          'Authorization': `Bot ${botToken.trim()}`
        }
      });

      if (!response.ok) {
        toast({
          type: 'error',
          title: 'Token inválido',
          description: 'Verifique o token do bot.',
        });
        setSaving(false);
        return;
      }

      // Buscar servidores do bot
      setLoadingGuilds(true);
      setGuildsError(null);
      try {
        const guildsResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
          headers: {
            'Authorization': `Bot ${botToken.trim()}`
          }
        });

        if (guildsResponse.ok) {
          const contentType = guildsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const guilds = await guildsResponse.json();
            setBotGuilds(guilds || []);
            setModalStep(2);
          } else {
            const text = await guildsResponse.text();
            console.error('Resposta não é JSON:', text.substring(0, 100));
            setGuildsError('Resposta inválida da API do Discord');
          }
        } else {
          const errorText = await guildsResponse.text();
          console.error('Erro ao buscar servidores:', guildsResponse.status, errorText);
          setGuildsError(`Erro ao buscar servidores do bot (${guildsResponse.status})`);
        }
      } catch (error) {
        console.error('Erro ao buscar servidores:', error);
        setGuildsError('Erro ao conectar com a API do Discord');
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      toast({
        type: 'error',
        title: 'Erro ao validar token',
        description: 'Verifique o token do bot e tente novamente.',
      });
    } finally {
      setSaving(false);
      setLoadingGuilds(false);
    }
  };

  // Selecionar servidor e salvar configuração
  const handleSelectGuild = async (guild: any) => {
    if (!selectedApp || !user?.id) return;

    setSaving(true);
    try {
      // Salvar configuração no backend
      const response = await fetch(getApiPath(`/api/applications/${selectedApp.id}/configure?user_id=${user.id}`), {
        method: 'PUT',
         credentials: 'include', // CRÍTICO: Enviar cookies para autenticação
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration: { 
            configured: true, 
            configured_at: new Date().toISOString(),
            bot_token: botToken.trim(),
            client_id: clientId.trim()
          },
          guild_id: guild.id,
          guild_name: guild.name,
          guild_icon: guild.icon,
          guild_members: guild.approximate_member_count || 0
        })
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Atualizar aplicação localmente
      const updatedApplications = applications.map(app => 
        app.id === selectedApp.id 
          ? { 
              ...app, 
                application_name: guild.name,
              guild_id: guild.id, 
              guild_name: guild.name, 
              guild_icon: guild.icon,
                guild_members: guild.approximate_member_count || 0,
                configuration: {
                  configured: true,
                  configured_at: new Date().toISOString(),
                  bot_token: botToken.trim(),
                  client_id: clientId.trim()
                }
            } 
          : app
      );
      setApplications(updatedApplications);
      
        // Fechar modal e iniciar progresso de deploy
        setModalOpen(false);
        setModalStep(1);
        setDeployingApp({
          ...selectedApp,
          application_name: guild.name,
          guild_name: guild.name,
          guild_icon: guild.icon,
          discloud: responseData.application?.discloud || { appId: undefined, status: undefined }
        } as Application);
        setDeployProgress(0);
        setDeployStatus('Salvando configurações...');
      
        // Simular progresso do deploy (o deploy real está em background)
        simulateDeployProgress();
      } else {
        toast({
          type: 'error',
          title: 'Erro ao configurar',
          description: 'Não foi possível configurar o bot. Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Erro ao configurar bot:', error);
      toast({
        type: 'error',
        title: 'Erro ao configurar',
        description: 'Ocorreu um erro ao configurar o bot. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Simular progresso do deploy
  const simulateDeployProgress = () => {
    const steps = [
      { progress: 20, status: 'Preparando o bot...' },
      { progress: 40, status: 'Preparando o bot...' },
      { progress: 60, status: 'Preparando o bot...' },
      { progress: 80, status: 'Preparando o bot...' },
      { progress: 95, status: 'Preparando o bot...' },
      { progress: 100, status: 'Bot preparado! 🎉' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDeployProgress(steps[currentStep].progress);
        setDeployStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        // Aguardar um pouco e então finalizar
        setTimeout(() => {
          setDeployingApp(null);
          setDeployProgress(0);
          setDeployStatus('');
          // Recarregar aplicações
          if (user?.id) {
            fetch(getApiPath(`/api/applications?user_id=${user.id}`), {
              credentials: 'include'
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.applications) {
                  setApplications(data.applications);
                }
              })
              .catch(console.error);
          }
        }, 2000);
      }
    }, 2000); // 2 segundos por etapa
  };

  return (
    <>
      <Header onOpenSidebar={undefined} showSidebarButton={false} />
      <div className="min-h-screen bg-[#000000] text-gray-100 font-sans pt-20" style={{ filter: 'grayscale(1)' }}>
        <div className="max-w-[1200px] mx-auto px-8 py-16">
      {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6">
            <span>Minha conta</span>
            <span className="mx-2">›</span>
            <span className="text-white">Aplicações</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
               
                <h1
                  className="text-4xl font-extrabold leading-tight"
                  style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}
                >
                  Minhas Aplicações
                </h1>
      </div>
              <p className="text-lg text-gray-400 ml-1 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
        Gerencie suas aplicações, bots de verificação e automações
      </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-transparent border border-[#2a2a2a] px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:border-[#3a3a3a] transition-all duration-300" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Recuperar</span>
              </button>

              <button className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-0.5" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Adquirir Aplicação</span>
              </button>
        </div>
      </div>

      {/* Tabs */}
          <div className="mt-10">
            <div className="flex items-center gap-6 border-b border-[#151515] pb-4">
              <button
                onClick={() => setActiveTab('apps')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'apps'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Aplicações
              </button>
              <button
                onClick={() => setActiveTab('faturas')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'faturas'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Faturas
              </button>
            </div>

            {activeTab === 'apps' ? (
              <div className="mt-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-400">Carregando aplicações...</div>
                  </div>
                ) : applications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {applications.map((app) => {
                      const time = timeRemaining[app.id] || calculateTimeRemaining(app.expires_at);
                      const isExpired = time.expired;
                      
                      return (
                      <div
                        key={app.id}
                        className={
                          `bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 group transition-all duration-300 relative ${
                            isExpired 
                              ? 'opacity-50 cursor-not-allowed' 
                              : app.configuration?.configured && app.guild_id 
                                ? 'cursor-pointer hover:border-white hover:shadow-lg hover:shadow-white/5' 
                                : 'cursor-pointer hover:border-white hover:shadow-lg hover:shadow-white/10'
                          }`
                        }
                        onClick={() => {
                          if (isExpired) {
                            toast({
                              type: 'warning',
                              title: 'Aplicação expirada',
                              description: 'Esta aplicação expirou. Renove através das faturas para continuar usando.'
                            });
                            return;
                          }
                          if (app.configuration?.configured && app.guild_id) {
                            // Redirecionar para o dashboard se estiver totalmente configurada
                            navigate(`/dashboard?app=${app.id}`);
                          } else {
                            // Abrir modal de configuração em qualquer outro caso
                            handleOpenModal(app);
                          }
                        }}
                      >
                        {/* Seta no canto superior direito */}
                        <div className="absolute top-2 right-2 z-10">
                          <svg 
                            width="22" 
                            height="60" 
                            viewBox="0 0 20 20" 
                            fill="none" 
                            className={`transition-colors ${
                              app.configuration?.configured && app.guild_id
                                ? 'text-gray-400 group-hover:text-white'
                                : 'text-gray-400 group-hover:text-white'
                            }`}
                          >
                            <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {/* Header do card */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl relative shadow-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center border border-gray-700">
                            {app.guild_icon ? (
                              <img
                                src={`https://cdn.discordapp.com/icons/${app.guild_id}/${app.guild_icon}.png`}
                                alt={app.guild_name || app.application_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>{app.guild_name || app.application_name}</h3>
                            <div className="flex items-center gap-2">
                              {app.configuration?.configured && app.guild_id ? (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-500"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  <span className="text-sm text-green-500">Configurado</span>
                                </>
                              ) : app.configuration?.configured ? (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-yellow-500"><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  <span className="text-sm text-yellow-500">Aguardando servidor</span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor" /></svg>
                                  <span className="text-sm text-red-500">Não configurado</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Barra de progresso e contador de tempo em tempo real */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span className="text-sm text-gray-400 font-medium">
                                {(() => {
                                  const time = timeRemaining[app.id] || calculateTimeRemaining(app.expires_at);
                                  if (time.expired) {
                                    return <span className="text-red-500 font-semibold">Expirado</span>;
                                  }
                                  if (time.days > 0) {
                                    return `${time.days}d ${time.hours}h ${time.minutes}m`;
                                  } else if (time.hours > 0) {
                                    return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
                                  } else if (time.minutes > 0) {
                                    return `${time.minutes}m ${time.seconds}s`;
                                  } else {
                                    return <span className="text-red-500 font-semibold">{time.seconds}s</span>;
                                  }
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5"/>
                              </svg>
                              <span className="text-xs text-gray-500">de {app.days_total} dias</span>
                            </div>
                          </div>
                          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${(() => {
                                  const time = timeRemaining[app.id] || calculateTimeRemaining(app.expires_at);
                                  if (time.expired) return 0;
                                  const totalMs = app.days_total * 24 * 60 * 60 * 1000;
                                  const remainingMs = time.days * 24 * 60 * 60 * 1000 + time.hours * 60 * 60 * 1000 + time.minutes * 60 * 1000 + time.seconds * 1000;
                                  return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
                                })()}%`,
                                backgroundColor: (() => {
                                  const time = timeRemaining[app.id] || calculateTimeRemaining(app.expires_at);
                                  if (time.expired) return '#F44336';
                                  const totalMs = app.days_total * 24 * 60 * 60 * 1000;
                                  const remainingMs = time.days * 24 * 60 * 60 * 1000 + time.hours * 60 * 60 * 1000 + time.minutes * 60 * 1000 + time.seconds * 1000;
                                  const percentage = (remainingMs / totalMs) * 100;
                                  return getProgressColor(percentage / 100 * app.days_total, app.days_total);
                                })()
                              }}
                            />
                          </div>
                        </div>
                        {/* Indicador de expirado */}
                        {isExpired && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-20">
                            <div className="text-center">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red-500 mx-auto mb-2">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <p className="text-white font-semibold mb-1">Aplicação Expirada</p>
                              <p className="text-gray-400 text-sm">Renove através das faturas</p>
                            </div>
                          </div>
                        )}
      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-16 min-h-[420px] flex items-center justify-center">
                    <div className="w-full max-w-2xl text-center">
                      <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center mb-8 shadow-lg">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <rect
                            x="6"
                            y="3"
                            width="12"
                            height="6"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <rect
                            x="9"
                            y="11"
                            width="6"
                            height="7"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle cx="12" cy="6" r="1" fill="currentColor" />
                        </svg>
          </div>

                      <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                        Nenhuma aplicação encontrada
                      </h2>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                        Escolha um plano e ative sua primeira aplicação<br />
            ou bot de verificação para automatizar vendas,<br />
            suporte ou integrações no seu servidor.
          </p>

                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => navigate('/plans')}
                          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-200 text-black transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-0.5" 
                          style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 5v14M5 12h14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Adquirir Aplicação</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-400">Carregando faturas...</div>
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {invoices.map((invoice) => {
                      // Verificar se a aplicação associada à fatura está expirada
                      let appId = null;
                      if (invoice.applicationId) {
                        if (typeof invoice.applicationId === 'object') {
                          appId = invoice.applicationId._id || invoice.applicationId.id;
                        } else {
                          appId = invoice.applicationId;
                        }
                      }
                      
                      // Buscar a aplicação nas aplicações do usuário para verificar se está expirada
                      const relatedApp = appId ? applications.find((app: Application) => app.id === appId) : null;
                      const appIsExpired = relatedApp && relatedApp.expires_at 
                        ? new Date(relatedApp.expires_at) < new Date()
                        : false;
                      const showRenewButton = appIsExpired || (relatedApp && relatedApp.status === 'expired');
                      
                      return (
                      <div
                        key={invoice.id}
                        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center border border-gray-800">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-semibold text-white text-lg">{invoice.planName}</h3>
                                {invoice.status === 'paid' && (
                                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-400">
                                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Pago
                                  </span>
                                )}
                                {invoice.status === 'pending' && invoice.canRenew && (
                                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                    Renovação disponível
                                  </span>
                                )}
                                {showRenewButton && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Se não tem applicationId na fatura, tentar buscar nas aplicações do usuário
                                      if (!appId && applications.length > 0) {
                                        // Pegar a primeira aplicação expirada
                                        const expiredApp = applications.find((app: Application) => {
                                          const isExpired = app.expires_at && new Date(app.expires_at) < new Date();
                                          return app.status === 'expired' || isExpired;
                                        });
                                        if (expiredApp) {
                                          appId = expiredApp.id;
                                        }
                                      }
                                      
                                      if (appId) {
                                        navigate(`/checkout?renew=true&applicationId=${appId}`);
                                      } else {
                                        toast({
                                          type: 'warning',
                                          title: 'Atenção',
                                          description: 'Não foi possível encontrar uma aplicação para renovar. Selecione uma aplicação na aba "Aplicações".'
                                        });
                                      }
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                                      <path d="M4 4v5h5M20 20v-5h-5M20 4l-5 5M4 20l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Renovar
                                  </button>
                                )}
                              </div>
                              <div className="text-sm text-gray-400 space-y-1">
                                {invoice.applicationId && typeof invoice.applicationId === 'object' && invoice.applicationId.applicationName && (
                                  <div>Aplicação: {invoice.applicationId.applicationName}</div>
                                )}
                                {invoice.status === 'paid' && invoice.paidAt && (
                                  <div>Pago em: {new Date(invoice.paidAt).toLocaleDateString('pt-BR')}</div>
                                )}
                                {invoice.status === 'pending' && (
                                  <>
                                    {invoice.expiresAt && (
                                      <div className="text-yellow-400 font-medium">
                                        Expira em: {new Date(invoice.expiresAt).toLocaleDateString('pt-BR')} às {new Date(invoice.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    )}
                                    {!invoice.pixData && (
                                      <div className="text-gray-500 text-xs">Aguardando geração do QR Code...</div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {invoice.status === 'paid' ? (
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Valor</div>
                                <div className="text-lg font-semibold text-white">
                                  {invoice.price > 0 ? `R$ ${invoice.price.toFixed(2).replace('.', ',')}` : '—'}
                                </div>
                              </div>
                            ) : invoice.status === 'pending' ? (
                              <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                  <div className="text-sm text-gray-400">Valor</div>
                                  <div className="text-lg font-semibold text-white">
                                    R$ {invoice.amount?.toFixed(2).replace('.', ',') || invoice.price.toFixed(2).replace('.', ',')}
                                  </div>
                                </div>
                                {invoice.pixData?.imageDataUrl && (
                                  <div className="mt-2">
                                    <img 
                                      src={invoice.pixData.imageDataUrl} 
                                      alt="QR Code PIX" 
                                      className="w-32 h-32 border border-gray-700 rounded-lg"
                                    />
                                  </div>
                                )}
                                {invoice.pixData?.copiaCola && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(invoice.pixData.copiaCola);
                                      toast({
                                        type: 'success',
                                        title: 'Copiado!',
                                        description: 'Código PIX copiado para a área de transferência'
                                      });
                                    }}
                                    className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm text-white flex items-center gap-2"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Copiar PIX
                                  </button>
                                )}
                                {invoice.expiresAt && (
                                  <div className="text-xs text-gray-500">
                                    Expira em: {new Date(invoice.expiresAt).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Status</div>
                                <div className="text-sm text-gray-500">
                                  {invoice.status === 'expired' ? 'Expirada' : 'Pendente'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
              </div>
            ) : (
              <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-16 min-h-[420px] flex items-center justify-center">
                <div className="text-center w-full max-w-xl">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center mb-8 shadow-lg">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                          stroke="currentColor"
                      strokeWidth="1.5"
                          className="text-gray-600"
                    >
                      <path
                        d="M3 6h18M3 10h18M7 14h10M10 18h4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-semibold mb-4 text-white" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    Nenhuma fatura disponível
                  </h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Você ainda não possui faturas. Assim que adquirir uma aplicação,<br />
                    suas cobranças aparecerão aqui.
                  </p>

                      <button 
                        onClick={() => navigate('/plans')}
                        className="flex items-center gap-3 mx-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-200 text-black transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-0.5" 
                        style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}
                      >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Adquirir Plano</span>
                  </button>
                </div>
                  </div>
                )}
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
      
      {/* Modal de Configuração */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative" style={{ filter: 'grayscale(1)' }}>
            {/* Botão fechar */}
            <button
              onClick={() => {
                setModalOpen(false);
                setModalStep(1);
                setBotToken('');
                setClientId('');
                setBotGuilds([]);
                setGuildsError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {modalStep === 1 ? (
              <>
                {/* Etapa 1: Token e Client ID */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    Configurar Bot
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {selectedApp?.application_name || 'Aplicação'}
                  </p>
                </div>

                <p className="text-gray-400 mb-6 text-sm">
                  Conecte seu bot Discord para começar a usar o dashboard
                </p>

                <div className="space-y-4">
                  {/* Token do Bot */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Token do Bot
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="Cole aqui o token do seu bot Discord"
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-gray-400 hover:text-white transition-colors"
                      >
                        {showToken ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seu token será criptografado e armazenado de forma segura
                    </p>
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      Client ID (ID do Bot)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Cole o Application ID do Discord Developer Portal"
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Encontre em: Discord Developer Portal → Seu App → General Information
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setModalStep(1);
                      setBotToken('');
                      setClientId('');
                    }}
                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={saving || !botToken.trim() || !clientId.trim()}
                    className="flex-1 px-4 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647A7.962 7.962 0 0112 20c4.418 0 8-3.582 8-8h-4a7.962 7.962 0 01-3 2.647z" />
                        </svg>
                        Validando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Etapa 2: Seleção de Servidor */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                    Escolher Servidor
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Selecione o servidor onde o bot está configurado
                  </p>
                </div>

                {loadingGuilds ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-400">Carregando servidores...</div>
                  </div>
                ) : guildsError ? (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
                    {guildsError}
                  </div>
                ) : botGuilds.length === 0 ? (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-yellow-400 text-sm">
                    Nenhum servidor encontrado. Verifique se o bot está em pelo menos um servidor.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {botGuilds.map((guild) => (
                      <button
                        key={guild.id}
                        onClick={() => handleSelectGuild(guild)}
                        disabled={saving}
                        className="w-full p-4 border border-[#1a1a1a] rounded-xl bg-[#0a0a0a] hover:border-white hover:bg-[#1a1a1a] transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                          {guild.icon ? (
                            <img
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                              alt={guild.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                              {guild.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-semibold">{guild.name}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {guild.id}</p>
                        </div>
                        {saving ? (
                          <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647A7.962 7.962 0 0112 20c4.418 0 8-3.582 8-8h-4a7.962 7.962 0 01-3 2.647z" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalStep(1)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Container de Progresso do Deploy */}
      {deployingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative" style={{ filter: 'grayscale(1)' }}>
            <div className="flex items-center gap-4 mb-6">
              {/* Logo do Servidor */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {deployingApp.guild_icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${deployingApp.guild_id}/${deployingApp.guild_icon}.png`}
                    alt={deployingApp.guild_name || deployingApp.application_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                    {(deployingApp.guild_name || deployingApp.application_name || 'Bot').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Nome do Servidor */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Cooveltica, Inter, system-ui, sans-serif' }}>
                  {deployingApp.guild_name || deployingApp.application_name || 'Bot'}
                </h2>
                <p className="text-sm text-gray-400">{deployStatus || 'Iniciando deploy...'}</p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-4">
              <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${deployProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{deployStatus}</span>
                <span className="text-xs text-gray-400 font-mono">{deployProgress}%</span>
              </div>
            </div>

            {/* Indicador de Carregamento */}
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647A7.962 7.962 0 0112 20c4.418 0 8-3.582 8-8h-4a7.962 7.962 0 01-3 2.647z" />
              </svg>
              <span>Processando...</span>
            </div>
          </div>
        </div>
      )}
</>
  );
}

