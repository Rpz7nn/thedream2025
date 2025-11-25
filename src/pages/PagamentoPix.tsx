import { useParams, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const PagamentoPix = () => {
  const { id } = useParams();
  const query = useQuery();
  const { toast } = useToast();

  const pedido = query.get('pedido') || '000000';
  const valor = query.get('valor') || 'R$ 0,00';
  const pixCode = query.get('pix') || '';
  const expiresAt = parseInt(query.get('expires') || '0') || Date.now() + 600000;
  const guildName = query.get('guildName') || 'Dream Applications';
  const guildId = query.get('guildId');
  const guildIcon = query.get('guildIcon') || '';
  const redirectUrl = query.get('redirectUrl') || '';
  
  const qrUrl = pixCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(pixCode)}`
    : '';

  const [copiado, setCopiado] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTimeRemaining, setInitialTimeRemaining] = useState(600000); // 10 minutos

  const copiarCodigo = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiado(true);
      toast({
        type: 'success',
        title: 'Código PIX copiado!',
        description: 'O código foi copiado para a área de transferência.'
      });
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.warn('Não foi possível copiar automaticamente', error);
      toast({
        type: 'error',
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar automaticamente. Copie manualmente o código destacado.'
      });
    }
  };

  // Timer de expiração
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeRemaining(remaining);
    };

    updateTimer();
    setInitialTimeRemaining(expiresAt - Date.now());
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [expiresAt]);

  // Monitorar status do pagamento
  useEffect(() => {
    if (!id) return;

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pagamentos/status/${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setPaymentCompleted(true);
          clearInterval(checkInterval);

          toast({
            type: 'success',
            title: '✅ Pagamento confirmado!',
            description: 'Redirecionando para o Discord...'
          });

          setTimeout(() => {
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [id]);

  const formatTimer = (ms: number) => {
    if (ms <= 0) return 'Expirado';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const voltarServidor = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-5">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {guildIcon ? (
              <img 
                src={guildIcon} 
                alt={guildName}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            ) : guildId ? (
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center text-black text-xl font-bold">
                {guildName.charAt(0).toUpperCase()}
              </div>
            ) : null}
            <h1 className="text-xl font-bold">
              {paymentCompleted ? 'Pagamento Confirmado!' : guildName}
            </h1>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            paymentCompleted ? 'bg-black text-white animate-pulse' : 'bg-white text-black'
          }`}>
            <span>⏱️</span>
            <span>{paymentCompleted ? 'Redirecionando...' : formatTimer(timeRemaining)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Info Card */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">
              Informações do Pedido
            </div>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[#1a1a1a]">
                <span className="text-sm text-[#999]">Pedido</span>
                <span className="text-sm font-semibold">#{pedido}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#999]">Valor Total</span>
                <span className="text-sm font-semibold">{valor}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">
              Escaneie o QR Code
            </div>
            <div className="bg-white rounded-2xl p-6 inline-block">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code PIX" className="w-72 h-72" />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center text-[#999]">
                  QR Code indisponível
                </div>
              )}
            </div>
          </div>

          {/* PIX Code */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">
              Ou copie o código PIX
            </div>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
              <div className="font-mono text-xs break-all leading-relaxed mb-4 text-white">
                {pixCode}
              </div>
              <button
                onClick={copiarCodigo}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
                  copiado
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-[#e6e6e6]'
                }`}
              >
                {copiado ? '✓ Código Copiado!' : 'Copiar Código PIX'}
              </button>
            </div>
          </div>

          {/* Botão de Retorno */}
          <div className="mt-6">
            <button
              onClick={voltarServidor}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] transition-all text-white"
            >
              Já Realizou o Pagamento? Clique aqui para Voltar ao Servidor
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0f0f0f] border-t border-[#1a1a1a] p-5 text-center">
          <p className="text-xs text-[#666]">© 2025 Dream Applications • Pagamento Seguro</p>
        </div>
      </div>
    </div>
  );
};

export default PagamentoPix;
