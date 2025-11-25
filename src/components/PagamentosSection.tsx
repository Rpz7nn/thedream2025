import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Upload, AlertCircle, Loader2, Pencil, Headphones, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getApiPath } from '@/utils/api';

interface PagamentosConfig {
  mercadopago: {
    ativo: boolean;
    accessToken: string;
  };
  efibank: {
    ativo: boolean;
    clientId: string;
    clientSecret: string;
    certificado: string;
    chavePix: string;
  };
  pixSemiAutomatico: {
    ativo: boolean;
    chavePix: string;
    instrucoes: string;
  };
  pushinpay: {
    ativo: boolean;
  };
  asaas: {
    ativo: boolean;
    accessToken?: string;
    sandbox?: boolean;
  };
  suitpay: {
    ativo: boolean;
  };
  dreampay: {
    ativo: boolean;
  };
}

interface PagamentosSectionProps {
  application: any;
}

export default function PagamentosSection({ application }: PagamentosSectionProps) {
  const [config, setConfig] = useState<PagamentosConfig>({
    mercadopago: { ativo: false, accessToken: '' },
    efibank: { ativo: false, clientId: '', clientSecret: '', certificado: '', chavePix: '' },
    pixSemiAutomatico: { ativo: false, chavePix: '', instrucoes: '' },
    pushinpay: { ativo: false },
    asaas: { ativo: false, accessToken: '', sandbox: false },
    suitpay: { ativo: false },
    dreampay: { ativo: false },
  });

  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [validandoMP, setValidandoMP] = useState(false);
  const [validandoEfiBank, setValidandoEfiBank] = useState(false);
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [conectando, setConectando] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMethod, setModalMethod] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<any>({});

  useEffect(() => {
    if (application?.guild_id) {
      carregarConfiguracoes();
    }
  }, [application?.guild_id]);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      const url = getApiPath(guildId ? `/api/pagamentos?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos`);
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.pagamentos) {
          setConfig({
            mercadopago: data.pagamentos.mercadopago || { ativo: false, accessToken: '' },
            efibank: data.pagamentos.efibank || { ativo: false, clientId: '', clientSecret: '', certificado: '', chavePix: '' },
            pixSemiAutomatico: data.pagamentos.pixSemiAutomatico || { ativo: false, chavePix: '', instrucoes: '' },
            pushinpay: data.pagamentos.pushinpay || { ativo: false },
            asaas: data.pagamentos.asaas || { ativo: false },
            suitpay: data.pagamentos.suitpay || { ativo: false },
            dreampay: data.pagamentos.dreampay || { ativo: false },
          });
        } else if (data.success) {
          setConfig({
            mercadopago: data.mercadopago || { ativo: false, accessToken: '' },
            efibank: data.efibank || { ativo: false, clientId: '', clientSecret: '', certificado: '', chavePix: '' },
            pixSemiAutomatico: data.pixSemiAutomatico || { ativo: false, chavePix: '', instrucoes: '' },
            pushinpay: data.pushinpay || { ativo: false },
            asaas: data.asaas || { ativo: false },
            suitpay: data.suitpay || { ativo: false },
            dreampay: data.dreampay || { ativo: false },
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Desativar todos os outros métodos quando um é ativado
  const desativarOutrosMetodos = async (metodoAtivo: string) => {
    const guildId = application?.guild_id;
    const botId = application?.configuration?.clientId || application?.client_id;
    
    const metodosParaDesativar = ['mercadopago', 'efibank', 'pixsemi', 'pushinpay', 'asaas', 'suitpay', 'dreampay']
      .filter(m => m !== metodoAtivo);

    for (const metodo of metodosParaDesativar) {
      try {
        const url = getApiPath(guildId ? `/api/pagamentos/${metodo}?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/${metodo}`);
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ativo: false, guild_id: guildId, bot_id: botId })
        });
      } catch (error) {
        console.error(`Erro ao desativar ${metodo}:`, error);
      }
    }
  };

  const validarEfiBank = async (clientId: string, clientSecret: string, certificado: File | null, certificadoExistente: string, chavePix: string): Promise<boolean> => {
    if (!clientId || !clientSecret || !chavePix) return false;
    
    setValidandoEfiBank(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      
      if (certificado) {
        const formData = new FormData();
        formData.append('clientId', clientId);
        formData.append('clientSecret', clientSecret);
        formData.append('chavePix', chavePix);
        formData.append('certificado', certificado);
        formData.append('guild_id', guildId || '');
        formData.append('bot_id', botId || '');

        const url = getApiPath(guildId ? `/api/pagamentos/validar-efibank?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/validar-efibank`);
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const data = await response.json();
        setValidandoEfiBank(false);
        
        if (data.success && data.valid) {
          mostrarMensagem('sucesso', 'Credenciais válidas!');
          return true;
        } else {
          const erros = data.erros || [data.error || 'Credenciais inválidas'];
          mostrarMensagem('erro', `Erro na validação: ${erros.join ? erros.join(', ') : erros}`);
          return false;
        }
      } else {
        const jsonBody = {
          clientId,
          clientSecret,
          chavePix,
          certificado: certificadoExistente || undefined,
          guild_id: guildId,
          bot_id: botId
        };
        
        const url = getApiPath(guildId ? `/api/pagamentos/validar-efibank?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/validar-efibank`);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(jsonBody)
        });
        
        const data = await response.json();
        setValidandoEfiBank(false);
        
        if (data.success && data.valid) {
          mostrarMensagem('sucesso', 'Credenciais válidas!');
          return true;
        } else {
          const erros = data.erros || [data.error || 'Credenciais inválidas'];
          mostrarMensagem('erro', `Erro na validação: ${erros.join ? erros.join(', ') : erros}`);
          return false;
        }
      }
    } catch (error) {
      setValidandoEfiBank(false);
      mostrarMensagem('erro', 'Erro ao validar credenciais. Tente novamente.');
      return false;
    }
  };

  const validarMercadoPago = async (token: string): Promise<boolean> => {
    if (!token) return false;
    
    setValidandoMP(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      const url = getApiPath(guildId ? `/api/pagamentos/validar-mercadopago?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/validar-mercadopago`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accessToken: token, guild_id: guildId, bot_id: botId })
      });
      
      const data = await response.json();
      setValidandoMP(false);
      return data.success && data.valid;
    } catch (error) {
      console.error('❌ Erro ao validar MP:', error);
      setValidandoMP(false);
      return false;
    }
  };

  const abrirModal = (methodId: string) => {
    setModalMethod(methodId);
    // Carregar configuração atual do método
    if (methodId === 'mercadopago') {
      setModalConfig({ accessToken: config.mercadopago.accessToken });
    } else if (methodId === 'efibank') {
      setModalConfig({ 
        clientId: config.efibank.clientId,
        clientSecret: config.efibank.clientSecret,
        chavePix: config.efibank.chavePix,
        certificado: config.efibank.certificado
      });
    } else if (methodId === 'pixsemi') {
      setModalConfig({
        chavePix: config.pixSemiAutomatico.chavePix,
        instrucoes: config.pixSemiAutomatico.instrucoes
      });
    } else if (methodId === 'asaas') {
      setModalConfig({ 
        accessToken: config.asaas.accessToken
      });
    } else {
      setModalConfig({});
    }
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setModalMethod(null);
    setModalConfig({});
    setCertificadoFile(null);
  };

  const handleConectar = async () => {
    if (!modalMethod) return;

    setConectando(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      if (modalMethod === 'mercadopago') {
        if (!modalConfig.accessToken) {
          mostrarMensagem('erro', 'Access Token é obrigatório');
          setConectando(false);
          return;
        }
        const tokenValido = await validarMercadoPago(modalConfig.accessToken);
        if (tokenValido) {
          await desativarOutrosMetodos('mercadopago');
          const url = getApiPath(guildId ? `/api/pagamentos/mercadopago?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/mercadopago`);
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ accessToken: modalConfig.accessToken, ativo: true, guild_id: guildId, bot_id: botId })
          });
          if (response.ok) {
            mostrarMensagem('sucesso', 'Mercado Pago conectado com sucesso!');
            fecharModal();
            await carregarConfiguracoes();
          } else {
            const data = await response.json().catch(() => ({}));
            mostrarMensagem('erro', data.error || 'Erro ao conectar Mercado Pago');
          }
        } else {
          mostrarMensagem('erro', 'Token inválido ou expirado');
        }
      } else if (modalMethod === 'efibank') {
        if (!modalConfig.chavePix || !modalConfig.clientId || !modalConfig.clientSecret) {
          mostrarMensagem('erro', 'Preencha todos os campos obrigatórios!');
          setConectando(false);
          return;
        }
        if (!certificadoFile && !modalConfig.certificado) {
          mostrarMensagem('erro', 'Certificado .p12 é obrigatório!');
          setConectando(false);
          return;
        }
        const credenciaisValidas = await validarEfiBank(
          modalConfig.clientId,
          modalConfig.clientSecret,
          certificadoFile,
          modalConfig.certificado,
          modalConfig.chavePix
        );
        if (credenciaisValidas) {
          await desativarOutrosMetodos('efibank');
          const formData = new FormData();
          formData.append('ativo', 'true');
          formData.append('clientId', modalConfig.clientId);
          formData.append('clientSecret', modalConfig.clientSecret);
          formData.append('chavePix', modalConfig.chavePix);
          if (certificadoFile) {
            formData.append('certificado', certificadoFile);
          } else if (modalConfig.certificado) {
            formData.append('certificadoExistente', modalConfig.certificado);
          }
          const url = getApiPath(guildId ? `/api/pagamentos/efibank?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/efibank`);
          formData.append('guild_id', guildId || '');
          formData.append('bot_id', botId || '');
          const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            body: formData
          });
          if (response.ok) {
            mostrarMensagem('sucesso', 'EfiBank conectado com sucesso!');
            fecharModal();
            await carregarConfiguracoes();
          } else {
            const data = await response.json().catch(() => ({}));
            mostrarMensagem('erro', data.error || 'Erro ao conectar EfiBank');
          }
        }
      } else if (modalMethod === 'pixsemi') {
        if (!modalConfig.chavePix) {
          mostrarMensagem('erro', 'Chave PIX é obrigatória');
          setConectando(false);
          return;
        }
        await desativarOutrosMetodos('pixsemi');
        const url = getApiPath(guildId ? `/api/pagamentos/pix-semi?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/pix-semi`);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            chavePix: modalConfig.chavePix,
            instrucoes: modalConfig.instrucoes || '',
            ativo: true, 
            guild_id: guildId, 
            bot_id: botId 
          })
        });
        if (response.ok) {
          mostrarMensagem('sucesso', 'PIX Semi-Automático conectado com sucesso!');
          fecharModal();
          await carregarConfiguracoes();
        } else {
          const data = await response.json().catch(() => ({}));
          mostrarMensagem('erro', data.error || 'Erro ao conectar PIX Semi-Automático');
        }
      } else if (modalMethod === 'asaas') {
        if (!modalConfig.accessToken) {
          mostrarMensagem('erro', 'Access Token é obrigatório');
          setConectando(false);
          return;
        }
        // A validação do token será feita no backend
        await desativarOutrosMetodos('asaas');
        const url = getApiPath(guildId ? `/api/pagamentos/asaas?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/asaas`);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            accessToken: modalConfig.accessToken, 
            sandbox: false,
            ativo: true, 
            guild_id: guildId, 
            bot_id: botId 
          })
        });
        if (response.ok) {
          mostrarMensagem('sucesso', 'Banco Asaas conectado com sucesso!');
          fecharModal();
          await carregarConfiguracoes();
        } else {
          const data = await response.json().catch(() => ({}));
          mostrarMensagem('erro', data.error || 'Erro ao conectar Banco Asaas');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      mostrarMensagem('erro', 'Erro ao conectar. Tente novamente.');
    } finally {
      setConectando(false);
    }
  };

  const handleDesconectar = async (methodId: string) => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;
      const endpoint = methodId === 'pixsemi' ? 'pix-semi' : methodId;
      const url = getApiPath(guildId ? `/api/pagamentos/${endpoint}?guild_id=${guildId}&bot_id=${botId}` : `/api/pagamentos/${endpoint}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ativo: false, guild_id: guildId, bot_id: botId })
      });
      if (response.ok) {
        mostrarMensagem('sucesso', 'Método desconectado com sucesso!');
        await carregarConfiguracoes();
      }
    } catch (error) {
      mostrarMensagem('erro', 'Erro ao desconectar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const paymentMethods = [
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Conecte sua conta do Mercado Pago',
      icon: '/logo-mercado-pago-icone-512.png',
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: 'https://www.mercadopago.com.br',
      isActive: config.mercadopago.ativo,
      available: true,
    },
    {
      id: 'efibank',
      name: 'EfiBank',
      description: 'Conecte sua conta da EfiBank',
      icon: '/logo-efi-bank-horizontal.png',
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: 'https://www.efibank.com.br',
      isActive: config.efibank.ativo,
      available: true,
    },
    {
      id: 'pushinpay',
      name: 'PushinPay',
      description: 'Gateway de pagamento PushinPay',
      icon: '/PushinPay.png',
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: 'https://pushinpay.com.br',
      isActive: config.pushinpay.ativo,
      available: true,
    },
    {
      id: 'asaas',
      name: 'Banco Asaas',
      description: 'Conecte sua conta do Banco Asaas',
      icon: '/Asaas.png',
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: 'https://www.asaas.com',
      isActive: config.asaas.ativo,
      available: true,
    },
    {
      id: 'suitpay',
      name: 'SuitPay',
      description: 'Gateway de pagamento SuitPay',
      icon: '/SuitPay.png',
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: 'https://suitpay.com.br',
      isActive: config.suitpay.ativo,
      available: true,
    },
    {
      id: 'pixsemi',
      name: 'PIX Semi-Automático',
      description: 'Gera instruções manuais para pagamento via PIX',
      icon: null,
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: '#',
      isActive: config.pixSemiAutomatico.ativo,
      available: true,
    },
    {
      id: 'dreampay',
      name: 'DreamPay',
      description: 'Carteira com Saque, taxa 1%',
      icon: null,
      supportLink: 'https://discord.gg/dreamapplications',
      createAccountLink: '#',
      isActive: config.dreampay.ativo,
      available: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Pagamentos</h1>
        <p className="text-[#999999] text-base sm:text-lg">Configure seus métodos de pagamento</p>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-md border ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-[#0f0f0f] border-[#1a1a1a] text-[#ffffff]' 
            : 'bg-[#0f0f0f] border-[#1a1a1a] text-[#ffffff]'
        } flex items-center gap-3`}>
          {mensagem.tipo === 'sucesso' ? <Check size={18} strokeWidth={1.5} /> : <AlertCircle size={18} strokeWidth={1.5} />}
          <span className="text-sm">{mensagem.texto}</span>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const isConnected = method.isActive;
          const hasActiveMethod = paymentMethods.some(m => m.isActive);
          
          return (
            <div key={method.id} className={`minimal-card p-6 ${!method.available ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    {method.icon ? (
                      <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <CreditCard size={24} className="text-[#666666]" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-[#ffffff]">{method.name}</h3>
                      {!method.available && (
                        <span className="px-2 py-0.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded text-xs text-[#666666] font-medium">
                          Em breve
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#999999]">{method.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {!isConnected && method.available && (
                    <a
                      href={method.createAccountLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#999999] hover:text-[#ffffff] transition-colors flex items-center gap-1"
                    >
                      Criar conta
                      <ExternalLink size={14} strokeWidth={1.5} />
                    </a>
                  )}
                  {method.available ? (
                    isConnected ? (
                      <button
                        onClick={() => handleDesconectar(method.id)}
                        className="px-4 py-2 rounded-md border bg-[#0f0f0f] border-[#1a1a1a] text-[#999999] hover:text-[#ffffff] hover:border-[#2a2a2a] text-sm font-medium transition-all duration-200"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button
                        onClick={() => abrirModal(method.id)}
                        disabled={hasActiveMethod && !isConnected}
                        className={`px-4 py-2 rounded-md border transition-all duration-200 text-sm font-medium ${
                          hasActiveMethod && !isConnected
                            ? 'bg-[#0f0f0f] border-[#1a1a1a] text-[#666666] cursor-not-allowed'
                            : 'bg-[#ffffff] border-[#1a1a1a] text-[#000000] hover:bg-[#f5f5f5] hover:border-[#2a2a2a]'
                        }`}
                      >
                        Conectar
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-md border bg-[#0f0f0f] border-[#1a1a1a] text-[#666666] text-sm font-medium cursor-not-allowed"
                    >
                      Em breve
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <a
                  href={method.supportLink}
                  className="flex items-center gap-2 text-sm text-[#999999] hover:text-[#ffffff] transition-colors"
                >
                  <Headphones size={16} strokeWidth={1.5} />
                  <span>Entrar em contato com o suporte</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Configuração */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-[#ffffff] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#ffffff]">
              Configurar {modalMethod === 'mercadopago' ? 'Mercado Pago' : modalMethod === 'efibank' ? 'EfiBank' : modalMethod === 'pixsemi' ? 'PIX Semi-Automático' : modalMethod === 'asaas' ? 'Banco Asaas' : ''}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#999999]">
              Preencha as credenciais para conectar o método de pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {modalMethod === 'mercadopago' && (
              <div>
                <label className="block text-sm font-medium text-[#999999] mb-2">Access Token *</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="APP_USR-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                    value={modalConfig.accessToken || ''}
                    onChange={(e) => setModalConfig({ ...modalConfig, accessToken: e.target.value })}
                    className="minimal-input w-full"
                  />
                  {validandoMP && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-[#999999]" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {modalMethod === 'efibank' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#999999] mb-2">Chave PIX *</label>
                  <input
                    type="text"
                    placeholder="sua-chave@email.com"
                    value={modalConfig.chavePix || ''}
                    onChange={(e) => setModalConfig({ ...modalConfig, chavePix: e.target.value })}
                    className="minimal-input w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-[#999999] mb-2">Client ID *</label>
                    <input
                      type="text"
                      placeholder="Client_Id_XXXXXXXXXXXXXXXXXXXXXXXX"
                      value={modalConfig.clientId || ''}
                      onChange={(e) => setModalConfig({ ...modalConfig, clientId: e.target.value })}
                      className="minimal-input w-full"
                    />
                    {validandoEfiBank && (
                      <div className="absolute right-3 top-1/2 translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-[#999999]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#999999] mb-2">Client Secret *</label>
                    <input
                      type="password"
                      placeholder="Client_Secret_XXXXXXXXXXXXXXXXXXXXXXXX"
                      value={modalConfig.clientSecret || ''}
                      onChange={(e) => setModalConfig({ ...modalConfig, clientSecret: e.target.value })}
                      className="minimal-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#999999] mb-2">Certificado .p12 *</label>
                  <label className="flex border border-dashed border-[#1a1a1a] rounded-md px-4 py-3 text-sm cursor-pointer transition-colors hover:border-[#2a2a2a]">
                    <div className="flex items-center gap-3 flex-1">
                      <Upload size={16} className="text-[#666666]" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        {certificadoFile ? (
                          <p className="text-sm text-[#ffffff] truncate">{certificadoFile.name}</p>
                        ) : modalConfig.certificado ? (
                          <p className="text-sm text-[#ffffff]">
                            {modalConfig.certificado.length > 100 ? 'Certificado configurado' : modalConfig.certificado}
                          </p>
                        ) : (
                          <p className="text-sm text-[#999999]">Clique para selecionar o arquivo</p>
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".p12"
                      onChange={(e) => setCertificadoFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            )}

            {modalMethod === 'pixsemi' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#999999] mb-2">Chave PIX *</label>
                  <input
                    type="text"
                    placeholder="sua-chave@email.com"
                    value={modalConfig.chavePix || ''}
                    onChange={(e) => setModalConfig({ ...modalConfig, chavePix: e.target.value })}
                    className="minimal-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#999999] mb-2">Instruções ao cliente (opcional)</label>
                  <textarea
                    value={modalConfig.instrucoes || ''}
                    onChange={(e) => setModalConfig({ ...modalConfig, instrucoes: e.target.value })}
                    rows={4}
                    className="minimal-input w-full"
                    placeholder="Instruções que serão exibidas para o cliente no painel ou no Discord"
                  />
                </div>
              </>
            )}

            {modalMethod === 'asaas' && (
              <div>
                <label className="block text-sm font-medium text-[#999999] mb-2">Access Token *</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="$aact_XXXXXXXXXXXXXXXXXXXXXXXX"
                    value={modalConfig.accessToken || ''}
                    onChange={(e) => setModalConfig({ ...modalConfig, accessToken: e.target.value })}
                    className="minimal-input w-full"
                  />
                  {(validandoMP || (modalMethod === 'asaas' && conectando)) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-[#999999]" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={fecharModal}
              variant="outline"
              className="bg-[#0f0f0f] border-[#1a1a1a] text-[#999999] hover:bg-[#1a1a1a] hover:text-[#ffffff]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConectar}
              disabled={conectando || validandoMP || validandoEfiBank}
              className="bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conectando || validandoMP || validandoEfiBank ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {validandoMP ? 'Validando...' : validandoEfiBank ? 'Validando certificado...' : 'Conectando...'}
                </>
              ) : (
                'Conectar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
