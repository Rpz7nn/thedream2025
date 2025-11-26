import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, Copy, Clock, Tag, X } from 'lucide-react';
import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { apiFetch } from '@/utils/api';

const PLAN_DATA: Record<string, { name: string; price: number; period?: string }> = {
  basic: { name: 'Dream Basic', price: 4.97, period: '/mês' },
  pro: { name: 'Dream Pro', price: 5.99, period: '/mês' },
  cloud: { name: 'Dream Cloud', price: 4.97, period: '/mês' },
};

// Preços fixos por duração (valores reais exibidos)
const DURATION_PRICES = {
  monthly: 5.99,
  quarterly: 19.99,
  yearly: 79.99,
};

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type DurationType = 'monthly' | 'quarterly' | 'yearly';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const { user } = useDiscordAuth();

  const [intent, setIntent] = useState<{ plan?: string; planName?: string; basePrice?: number; megaCode?: string; renew?: boolean; applicationId?: string } | null>(null);
  const isRenewal = useMemo(() => qs.get('renew') === 'true', [qs]);
  const renewalApplicationId = useMemo(() => qs.get('applicationId') || null, [qs]);
  
  useEffect(() => {
    if (state && typeof state === 'object' && (state as any).plan) {
      setIntent(state as any);
      return;
    }
    try {
      const raw = sessionStorage.getItem('checkout_intent');
      if (raw) {
        setIntent(JSON.parse(raw));
        return;
      }
    } catch (e) {}
    const qPlan = qs.get('plan');
    const qCode = qs.get('code');
    const qRenew = qs.get('renew') === 'true';
    const qApplicationId = qs.get('applicationId');
    
    if (qRenew && qApplicationId) {
      // Modo renovação - buscar dados da aplicação
      setIntent({ 
        plan: 'pro', 
        planName: 'Renovação de Aplicação',
        basePrice: DURATION_PRICES.monthly,
        renew: true,
        applicationId: qApplicationId
      });
    } else if (qPlan || qCode) {
      setIntent({ plan: qPlan ?? undefined, megaCode: qCode ?? undefined, basePrice: qPlan ? PLAN_DATA[qPlan as keyof typeof PLAN_DATA]?.price ?? 0 : 0 });
    }
  }, [state, qs]);

  const [step, setStep] = useState<number>(1);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponName, setCouponName] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerCPF, setBuyerCPF] = useState('');
  const [cpfValid, setCpfValid] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'paypal' | 'card'>('pix'); // Sempre PIX (único habilitado)
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [txId, setTxId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string>('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [expirationTime, setExpirationTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Preço exibido (valor real)
  const displayPrice = useMemo(() => {
    return DURATION_PRICES[selectedDuration];
  }, [selectedDuration]);

  // Preço enviado ao backend (sempre R$ 0,01 durante testes)
  const backendPrice = 0.01;

  // Desconto de cupom aplicado
  const couponDiscountAmount = useMemo(() => {
    return (displayPrice * couponDiscount) / 100;
  }, [displayPrice, couponDiscount]);

  // Total final exibido
  const totalDisplay = useMemo(() => {
    return +(displayPrice - couponDiscountAmount).toFixed(2);
  }, [displayPrice, couponDiscountAmount]);

  // Aplicar cupom
  const applyCoupon = async () => {
    if (!coupon.trim() || applyingCoupon) return;
    
    setApplyingCoupon(true);
    setCouponError('');
    
    // Simular validação do cupom (você pode fazer uma chamada à API aqui)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Exemplo de cupons válidos (substitua por lógica real)
    const validCoupons: Record<string, { discount: number; name: string }> = {
      'DREAM10': { discount: 10, name: 'DREAM10' },
      'DREAM20': { discount: 20, name: 'DREAM20' },
      'DESCONTO': { discount: 15, name: 'DESCONTO' },
    };
    
    const couponUpper = coupon.trim().toUpperCase();
    const couponData = validCoupons[couponUpper];
    
    if (couponData) {
      setCouponApplied(true);
      setCouponDiscount(couponData.discount);
      setCouponName(couponData.name);
      setCouponError('');
    } else {
      setCouponError('Cupom inválido ou expirado');
      setCouponApplied(false);
      setCouponDiscount(0);
      setCouponName('');
    }
    
    setApplyingCoupon(false);
  };

  // Remover cupom
  const removeCoupon = () => {
    setCoupon('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponName('');
    setCouponError('');
    setShowCouponInput(false);
  };

  // Timer de expiração
  useEffect(() => {
    if (expirationTime > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = expirationTime - now;
        
        if (remaining <= 0) {
          setTimeRemaining('00:00');
          clearInterval(interval);
          return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [expirationTime]);

  const copyPix = async () => {
    try {
      if (!pixCode) return;
      await navigator.clipboard.writeText(pixCode);
      // Feedback visual (pode adicionar toast aqui)
    } catch (e) {}
  };

  // Mapear duração para período do backend
  const getPeriodForBackend = () => {
    if (selectedDuration === 'monthly') {
      return { period_type: 'monthly', period_months: 1 };
    } else if (selectedDuration === 'quarterly') {
      return { period_type: 'monthly', period_months: 3 };
    } else {
      return { period_type: 'yearly', period_months: 1 };
    }
  };

  // Create order at backend (called when entering step 2)
  const createOrder = React.useCallback(async () => {
    if (creatingOrder || txId) {
      console.log('[CHECKOUT] createOrder bloqueado - já em execução ou txId existe');
      return;
    }
    try {
      setCreatingOrder(true);
      console.log('[CHECKOUT] Criando pedido...');
      const period = getPeriodForBackend();
      
      const body: any = {
        plan: intent?.plan || 'unknown',
        planName: intent?.planName || PLAN_DATA[intent?.plan as keyof typeof PLAN_DATA]?.name || 'Plano',
        price: backendPrice, // Sempre R$ 0,01 para testes
        period: period,
        buyer: {
          name: buyerName || user?.username || 'Cliente',
          document: buyerCPF.replace(/\D/g, '') || '',
          user_id: user?.id || null
        }
      };

      // Se for renovação, adicionar applicationId
      if (isRenewal && renewalApplicationId) {
        body.renew = true;
        body.applicationId = renewalApplicationId;
      }

      // Adicionar displayPrice (preço real exibido)
      body.displayPrice = totalDisplay;

      const res = await apiFetch('/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ Erro ao criar pedido:', {
          status: res.status,
          statusText: res.statusText,
          error: text
        });
        throw new Error(text || 'Erro ao criar ordem');
      }

      const data = await res.json();
      
      if (data.txId) setTxId(String(data.txId));
      if (data.qr_code_text || data.pixCode) setPixCode(String(data.qr_code_text || data.pixCode || ''));
      if (data.qr_code || data.qrData) setQrData(String(data.qr_code || data.qrData || ''));
      
      // Configurar timer de expiração (1 hora = 3600 segundos)
      if (data.expiracao) {
        setExpirationTime(Date.now() + (data.expiracao * 1000));
      } else {
        setExpirationTime(Date.now() + (3600 * 1000)); // Default 1 hora
      }

      // start polling
      startPolling(String(data.txId));
    } catch (err) {
      console.error('createOrder error', err);
    } finally {
      setCreatingOrder(false);
    }
  }, [creatingOrder, txId, intent, isRenewal, renewalApplicationId, backendPrice, totalDisplay, user, buyerName, buyerCPF, selectedDuration]);

  // Polling using ref with improved efficiency
  const pollRef = React.useRef<number | null>(null);
  const pollCount = React.useRef<number>(0);
  const maxPollAttempts = 50;
  
  const startPolling = (tx: string) => {
    if (!tx) return;
    if (pollRef.current) return;
    
    pollCount.current = 0;
    
    const check = async () => {
      try {
        pollCount.current++;
        setCheckingStatus(true);
        
        const res = await apiFetch(`/orders/${encodeURIComponent(tx)}/status`);
        if (!res.ok) {
          console.error('Status check failed:', res.status);
          return;
        }
        
        const d = await res.json();
        
        if (d.paid || d.status === 'CONCLUIDA' || d.pago === true) {
          console.log('[CHECKOUT] Payment confirmed!');
          setCheckingStatus(false);
          if (pollRef.current) clearInterval(pollRef.current as any);
          pollRef.current = null;
          
          // Verificar se já foi confirmado (evitar múltiplas confirmações)
          const confirmKey = `order_confirmed_${tx}`;
          if (sessionStorage.getItem(confirmKey)) {
            console.log('[CHECKOUT] Pedido já foi confirmado anteriormente, pulando...');
            setStep(3);
            return;
          }
          
          // Marcar como confirmado imediatamente para evitar duplicação
          sessionStorage.setItem(confirmKey, 'true');
          
          // Salvar subscription no backend (apenas uma vez)
          try {
            const period = getPeriodForBackend();
            console.log('[CHECKOUT] Confirmando pedido no backend...');
            const confirmRes = await apiFetch(`/orders/${encodeURIComponent(tx)}/confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                plan: intent?.plan,
                planName: intent?.planName,
                period: period,
                displayPrice: totalDisplay, // Preço real exibido na interface
                renew: isRenewal || false,
                applicationId: renewalApplicationId || null
              })
            });
            
            if (!confirmRes.ok) {
              console.error('[CHECKOUT] Erro ao confirmar pedido:', confirmRes.status);
              // Remover flag se falhar para permitir retry
              sessionStorage.removeItem(confirmKey);
            } else {
              console.log('[CHECKOUT] Pedido confirmado com sucesso!');
            }
          } catch (e) {
            console.error('[CHECKOUT] Erro ao salvar subscription:', e);
            // Remover flag se falhar para permitir retry
            sessionStorage.removeItem(confirmKey);
          }
          
          setStep(3);
          try { sessionStorage.removeItem('checkout_intent'); } catch(e){}
          return;
        }
        
        if (pollCount.current >= maxPollAttempts) {
          console.log('Max polling attempts reached');
          if (pollRef.current) clearInterval(pollRef.current as any);
          pollRef.current = null;
          setCheckingStatus(false);
        }
        
      } catch (e) {
        console.error('Poll error:', e);
        setCheckingStatus(false);
      }
    };

    check();
    pollRef.current = window.setInterval(check, 6000) as unknown as number;
  };

  useEffect(() => {
    return () => {
      try { if (pollRef.current) clearInterval(pollRef.current as any); } catch(e){}
    };
  }, []);

  // Flag para evitar múltiplas execuções
  const orderCreatedRef = React.useRef(false);
  
  useEffect(() => {
    if (step === 2 && !orderCreatedRef.current && !txId && !creatingOrder) {
      orderCreatedRef.current = true;
      createOrder();
    }
    
    // Reset flag quando sair do step 2
    if (step !== 2) {
      orderCreatedRef.current = false;
    }
  }, [step, createOrder, txId, creatingOrder]);

  // CPF validation
  const validateCPF = (raw: string) => {
    const v = raw.replace(/\D/g, '');
    if (!v || v.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(v)) return false;
    const calc = (t: number) => {
      const s = v.slice(0, t).split('').reduce((acc, c, i) => acc + Number(c) * (t + 1 - i), 0);
      const r = (s * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(9) === Number(v[9]) && calc(10) === Number(v[10]);
  };

  useEffect(() => {
    setCpfValid(validateCPF(buyerCPF));
  }, [buyerCPF]);

  const planName = intent?.planName || (intent?.plan ? PLAN_DATA[intent.plan as keyof typeof PLAN_DATA]?.name : null) || 'Plano';
  const transactionId = txId || intent?.megaCode || '';
  
  // Se não há intent válido e não está em uma transação, mostrar mensagem
  if (!intent && !txId && step === 1) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col">
        <Header onOpenSidebar={() => {}} showSidebarButton={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Nenhum plano selecionado</h2>
            <p className="text-gray-400 mb-6">Redirecionando para a página de planos...</p>
            <button 
              onClick={() => navigate('/plans')} 
              className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors"
            >
              Ir para Planos
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getDurationLabel = (type: DurationType) => {
    if (type === 'monthly') return 'Mensal';
    if (type === 'quarterly') return 'Trimestral';
    return 'Anual';
  };

  const getDurationPrice = (type: DurationType) => {
    return DURATION_PRICES[type];
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col">
      <Header onOpenSidebar={() => {}} showSidebarButton={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 flex-1">
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{isRenewal ? 'Renovar Aplicação' : 'Finalizar compra'}</h1>
                <p className="text-gray-400">
                  {isRenewal 
                    ? 'Renove sua aplicação para continuar usando todos os recursos.'
                    : 'Antes de finalizar a compra, confira as informações do plano e os métodos de pagamento disponíveis.'
                  }
                </p>
              </div>

              {/* Plan Information */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{isRenewal ? 'Renovação' : 'Informações do plano'}</h2>
                <div className="mb-2">
                  <h3 className="text-lg font-bold">{planName}</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  {isRenewal ? 'Renove sua aplicação e adicione mais tempo de uso.' : (
                    <>
                      {planName === 'Dream Pro' && 'O plano perfeito para quem busca a experiência mais completa, com acesso total a todos os recursos em um só bot.'}
                      {planName === 'Dream Basic' && 'Perfeito para iniciantes ou quem deseja funcionalidades básicas em uma assistente automatizada simples.'}
                      {planName === 'Dream Cloud' && 'Focado em proteção máxima e prevenção, garantindo que você nunca perca dados importantes.'}
                    </>
                  )}
                </p>
              </div>

              {/* Duration Selection */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Duração do plano</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mensal */}
                  <button
                    onClick={() => setSelectedDuration('monthly')}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      selectedDuration === 'monthly'
                        ? 'border-white bg-white/5'
                        : 'border-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="font-semibold">Mensal</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold">{formatBRL(getDurationPrice('monthly'))}</div>
                        <div className="text-xs text-gray-400 mt-1">/ mês</div>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">-50%</span>
                    </div>
                  </button>

                  {/* Trimestral */}
                  <button
                    onClick={() => setSelectedDuration('quarterly')}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      selectedDuration === 'quarterly'
                        ? 'border-white bg-white/5'
                        : 'border-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="font-semibold">Trimestral</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold">{formatBRL(getDurationPrice('quarterly'))}</div>
                        <div className="text-xs text-gray-400 mt-1">/ trimestre</div>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">-50%</span>
                    </div>
                  </button>

                  {/* Anual */}
                  <button
                    onClick={() => setSelectedDuration('yearly')}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      selectedDuration === 'yearly'
                        ? 'border-white bg-white/5'
                        : 'border-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M3 2v4M21 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="font-semibold">Anual</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold">{formatBRL(getDurationPrice('yearly'))}</div>
                        <div className="text-xs text-gray-400 mt-1">/ ano</div>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">-60%</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Método de pagamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PIX */}
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                      paymentMethod === 'pix'
                        ? 'border-white bg-white/5'
                        : 'border-[#1a1a1a] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M6 9h12M6 13h12M6 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="19" cy="5" r="2" fill="currentColor"/>
                          <path d="M16 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="font-semibold">PIX</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Pagamento aprovado na hora, sem renovação automática
                    </div>
                  </button>

                  {/* PayPal - DESABILITADO */}
                  <button
                    disabled
                    className="p-4 rounded-lg border-2 border-[#1a1a1a] text-left opacity-50 cursor-not-allowed relative"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 8h8c1.1 0 2 .9 2 2s-.9 2-2 2h-2v2h-4v-2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="10" cy="10" r="1" fill="currentColor"/>
                          <circle cx="14" cy="10" r="1" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-500">PayPal</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Pagamento via PayPal, taxas inclusas, renovação automática
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded">Em breve</span>
                    </div>
                  </button>

                  {/* Cartão - DESABILITADO */}
                  <button
                    disabled
                    className="p-4 rounded-lg border-2 border-[#1a1a1a] text-left opacity-50 cursor-not-allowed relative"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                          <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M2 10h20M6 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <rect x="16" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
                          <path d="M2 8l3-2h14l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-500">Cartão (Crédito/Débito)</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Pagamento via cartão de crédito ou débito, renovação automática
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded">Em breve</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Dados do comprador</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Nome completo (opcional)</label>
                    <input 
                      value={buyerName} 
                      onChange={e => setBuyerName(e.target.value)} 
                      placeholder="Seu nome" 
                      className="w-full p-3 rounded bg-[#000000] border border-[#1a1a1a] focus:border-white focus:outline-none transition-colors text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">CPF (necessário)</label>
                    <input 
                      value={buyerCPF} 
                      onChange={e => setBuyerCPF(e.target.value)} 
                      placeholder="000.000.000-00" 
                      className="w-full p-3 rounded bg-[#000000] border border-[#1a1a1a] focus:border-white focus:outline-none transition-colors text-white" 
                    />
                    {!cpfValid && buyerCPF.length > 0 && <div className="text-xs text-red-400 mt-1">CPF inválido</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-2">Resumo do pedido</h3>
                <p className="text-xs text-gray-400 mb-6">
                  Verifique as informações do plano e o método de pagamento escolhido para finalizar a compra. Quando estiver pronto, você será redirecionado para a página de pagamento.
                </p>

                {/* Valor final */}
                <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
                  <div className="text-xs text-gray-400 mb-2">Valor final</div>
                  <div className="text-2xl font-bold">{formatBRL(totalDisplay)} {selectedDuration === 'monthly' ? '/ mês' : selectedDuration === 'quarterly' ? '/ trimestre' : '/ ano'}</div>
                </div>

                {/* Método de pagamento */}
                <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
                  <div className="text-xs text-gray-400 mb-2">Método de pagamento</div>
                  <div className="text-lg font-bold">{paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'paypal' ? 'PayPal' : 'Cartão'}</div>
                </div>

                {/* Cupom */}
                <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
                  {!showCouponInput && !couponApplied && (
                    <button
                      onClick={() => setShowCouponInput(true)}
                      className="w-full p-3 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg hover:bg-[#1f1f1f] transition-colors text-sm"
                    >
                      Cupom de desconto
                    </button>
                  )}

                  {showCouponInput && !couponApplied && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={coupon}
                          onChange={e => {
                            setCoupon(e.target.value);
                            setCouponError('');
                          }}
                          onKeyPress={e => e.key === 'Enter' && applyCoupon()}
                          placeholder="Digite seu cupom"
                          className="flex-1 p-2 rounded bg-[#000000] border border-[#1a1a1a] focus:border-white focus:outline-none text-sm text-white"
                          disabled={applyingCoupon}
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={!coupon.trim() || applyingCoupon}
                          className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {applyingCoupon ? '...' : 'Aplicar'}
                        </button>
                      </div>
                      {couponError && (
                        <div className="text-xs text-red-400">{couponError}</div>
                      )}
                    </div>
                  )}

                  {couponApplied && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-green-400">{couponName}</div>
                        <div className="text-xs text-gray-400">Desconto de {couponDiscount}% aplicado</div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 rounded hover:bg-[#1a1a1a] transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-[#1a1a1a] bg-[#000000] text-white focus:ring-2 focus:ring-white"
                    />
                    <span className="text-xs text-gray-400">
                      Ao finalizar a compra, eu concordo com nossas políticas de reembolso e privacidade de dados estabelecidas, e respeito nossa política de cancelamento.
                    </span>
                  </label>
                </div>

                {/* Finalizar compra button */}
                <button
                  onClick={() => {
                    if (cpfValid && termsAccepted && !creatingOrder) {
                      setStep(2);
                    }
                  }}
                  disabled={!cpfValid || !termsAccepted || creatingOrder}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    cpfValid && termsAccepted && !creatingOrder
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {creatingOrder ? 'Processando...' : 'Finalizar compra'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Pagamento PIX</h2>
                {timeRemaining && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Tempo restante: <span className="text-white font-semibold">{timeRemaining}</span></span>
                  </div>
                )}
              </div>

              <div className="mb-4 text-sm text-gray-400">
                {planName} - #{transactionId.substring(0, 8)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64 bg-white p-4 rounded">
                    {qrData ? (
                      <img src={qrData} alt="QR Code PIX" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Gerando QR Code...</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-white">1.</span>
                      <div>
                        <div className="text-sm font-medium text-white">Abra seu banco</div>
                        <div className="text-xs text-gray-400">Acesse o aplicativo do seu banco.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-white">2.</span>
                      <div>
                        <div className="text-sm font-medium text-white">Escaneie ou use copia e cola</div>
                        <div className="text-xs text-gray-400">Escaneie o QR Code ao lado ou copie o código abaixo.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-white">3.</span>
                      <div>
                        <div className="text-sm font-medium text-white">Efetue o pagamento</div>
                        <div className="text-xs text-gray-400">Confirme o valor e finalize no seu banco.</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="bg-[#000000] border border-[#1a1a1a] rounded p-3 flex items-center gap-3">
                      <div className="flex-1 font-mono text-xs text-gray-300 break-all">{pixCode || '---'}</div>
                      <button 
                        onClick={copyPix} 
                        disabled={!pixCode} 
                        className="p-2 bg-[#1a1a1a] rounded hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Pagamento confirmado!</h2>
              <p className="text-gray-400 mb-6">Obrigado! Recebemos a confirmação do pagamento.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => navigate('/applications')} 
                  className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors"
                >
                  Ir para Aplicações
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="px-6 py-3 border border-[#1a1a1a] rounded hover:border-gray-600 transition-colors"
                >
                  Ir para Início
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
