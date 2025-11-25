import React from "react";
import { useNavigate } from "react-router-dom";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Check, Lightbulb } from "lucide-react";
import { useI18n } from "@/i18n";
import { getApiPath } from "@/utils/api";

const plans = [
  {
    name: "Dream Basic",
    price: "R$ 4,97",
    period: "/mês",
    popular: false,
    enabled: false,
    description: "Perfeito para iniciantes ou quem deseja funcionalidades básicas em uma assistente automatizada simples.",
    features: [
      { text: "Múltiplas formas de pagamento incluindo PIX, cartões e criptomoedas", active: true },
      { text: "Ferramentas de gerenciamento e controle de servidores", active: true },
      { text: "Tarefas automatizadas para comunidades", active: true },
      { text: "Camadas de defesa com tecnologia de ponta", active: true },
      { text: "Módulos adicionais para customização", active: true },
      { text: "Compatibilidade total com elementos interativos", active: true },
      { text: "Painel web atualizado dinamicamente e intuitivo", active: true },
      { text: "Registros organizados e completos", active: true },
      { text: "Atendimento automatizado com inteligência artificial", active: true },
      { text: "Controle total sobre itens e transações", active: true },
      { text: "Presentes, benefícios premium e promoções", active: true },
      { text: "Monitoramento de indicações incorporado", active: true },
      { text: "Customização de identidade visual e apresentação", active: true },
    ],
    button: "Selecionar",
    color: "gray"
  },
  {
    name: "Dream Pro",
    price: "R$ 5,99",
    period: "/mês",
    popular: true,
    enabled: true,
    description: "A melhor escolha para usuários que querem tudo em uma única plataforma, incluindo todas as ferramentas disponíveis.",
    features: [
      { text: "Múltiplas formas de pagamento incluindo PIX, cartões e criptomoedas", active: true },
      { text: "Ferramentas de gerenciamento e controle de servidores", active: true },
      { text: "Tarefas automatizadas para comunidades", active: true },
      { text: "Camadas de defesa com tecnologia de ponta", active: true },
      { text: "Módulos adicionais para customização", active: true },
      { text: "Conexão direta com Dream Cloud OAuth2", active: true },
      { text: "Serviço de salvamento Dream incluso", active: true },
      { text: "Compatibilidade total com elementos interativos", active: true },
      { text: "Painel web atualizado dinamicamente e intuitivo", active: true },
      { text: "Registros organizados e completos", active: true },
      { text: "Atendimento automatizado com inteligência artificial", active: true },
      { text: "Controle total sobre itens e transações", active: true },
      { text: "Presentes, benefícios premium e promoções", active: true },
      { text: "Monitoramento de indicações incorporado", active: true },
      { text: "Customização de identidade visual e apresentação", active: true },
    ],
    button: "Adquirir",
    color: "purple"
  },
  {
    name: "Dream Cloud",
    price: "R$ 4,97",
    period: "/mês",
    popular: false,
    enabled: false,
    description: "Focado em proteção máxima e prevenção, garantindo que você nunca perca dados importantes.",
    features: [
      { text: "Dream Cloud OAuth2 integrado diretamente", active: true },
      { text: "Serviço de salvamento Dream incorporado", active: true },
      { text: "Localização através de endereço de rede", active: true },
      { text: "Captura de endereços de correio eletrônico", active: true },
      { text: "Salvamento de usuários através de OAuth2", active: true },
      { text: "Salvamento de permissões dos usuários", active: true },
      { text: "Salvamento de nomes dos usuários", active: true },
      { text: "Salvamento completo da organização do servidor", active: true },
      { text: "Salvamento de ícones e adesivos do servidor", active: true },
      { text: "Salvamento de conversas de todos os espaços", active: true },
      { text: "Funciona com elementos interativos", active: true },
      { text: "Painel web dinâmico e responsivo", active: true },
      { text: "Método de registros completos e unificados", active: true },
      { text: "Customização de identidade visual e apresentação", active: true },
    ],
    button: "Selecionar",
    color: "green"
  },
];

const PlanCard = ({ plan, onSelectPlan }: { plan: any; onSelectPlan: (planName: string) => void }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { user, loading, refresh } = useDiscordAuth();

  const handlePlanSelect = async () => {
    if (!plan.enabled) return;
    
    console.log('[PLANS] handlePlanSelect chamado', { loading, user: user ? { id: user.id, username: user.username } : null });
    
    // Se não tem usuário, fazer refresh antes de verificar
    if (!user) {
      console.log('🔄 [PLANS] Usuário não encontrado, fazendo refresh...');
      refresh();
      // Aguardar um tempo para o refresh completar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Gerar mega código único para o checkout
    const megaCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // Mapear nome do plano para slug
    const planSlug = plan.name.toLowerCase().replace('dream ', '').replace(/\s+/g, '-');

    // Parse do preço: remover "R$ " e converter vírgula para ponto
    const priceString = String(plan.price).replace(/[R$\s]/g, '').replace(',', '.');
    const parsedPrice = parseFloat(priceString) || 0;
    
    // Monta objeto de intenção do checkout
    const intent = {
      plan: planSlug,
      planName: plan.name,
      basePrice: parsedPrice,
      megaCode,
    };

    // Verificar usuário após refresh - usar uma verificação direta da API
    try {
      const response = await fetch(getApiPath('/auth/me'), {
        credentials: 'include',
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        const authenticatedUser = data.user || data;
        
        if (authenticatedUser && authenticatedUser.id) {
          console.log('✅ [PLANS] Usuário autenticado confirmado via API, navegando para checkout...', { username: authenticatedUser.username, id: authenticatedUser.id });
          navigate('/checkout', { state: intent });
          return;
        }
      }
    } catch (error) {
      console.error('[PLANS] Erro ao verificar autenticação:', error);
    }
    
    // Se chegou aqui, não está autenticado
    console.log('❌ [PLANS] Usuário não autenticado, redirecionando para login...');
    try {
      sessionStorage.setItem('checkout_intent', JSON.stringify(intent));
    } catch (e) {
      console.error('Erro ao salvar intent:', e);
    }
    const loginUrl = getApiPath(`/api/auth/discord/login?redirect=${encodeURIComponent('/checkout')}`);
    console.log('[PLANS] Redirecionando para login:', loginUrl);
    window.location.href = loginUrl;
  };

  const getCardStyles = () => {
    if (plan.popular) {
      return "border-2 border-white bg-[#0a0a0a]";
    }
    return "border border-gray-600 bg-[#0a0a0a]";
  };

  const getButtonStyles = () => {
    if (!plan.enabled) {
      return "bg-gray-800 text-gray-500 cursor-not-allowed";
    }
    return "bg-white hover:bg-gray-200 text-black";
  };

  const getPriceColor = () => {
    return "text-white";
  };

  return (
    <div className={`relative group transform transition-all duration-300 ${plan.popular ? 'scale-105' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg">
            <Lightbulb className="h-4 w-4" />
            {t('plans.mostChosen')}
          </div>
        </div>
      )}
      
      <div className={`relative overflow-hidden ${getCardStyles()} rounded-2xl p-8 flex flex-col justify-between w-full h-full min-w-[320px] max-w-md mx-auto transition-all duration-300`}>
        {/* Título do plano */}
        <h2 className="text-2xl font-bold text-white mb-4">{plan.name}</h2>

        {/* Descrição */}
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {plan.description}
        </p>

        {/* Preço */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-extrabold ${getPriceColor()}`}>{plan.price}</span>
            <span className="text-gray-400 font-medium">{plan.period}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature: any, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-200">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Botão */}
        <div className="relative z-10 mt-auto">
          <button
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 ${getButtonStyles()}`}
            onClick={(e) => {
              e.preventDefault();
              console.log('[PLANS] Botão clicado', { loading, user: user ? { id: user.id } : null });
              handlePlanSelect();
            }}
            disabled={!plan.enabled}
          >
            {loading ? 'Verificando...' : plan.button}
          </button>
        </div>
      </div>
    </div>
  );
};

const Plans = () => {
  const handlePlanSelect = (planName: string) => {
    // Handler para seleção de plano (usado pelo PlanCard internamente)
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-hidden flex flex-col">
      <Header onOpenSidebar={() => {}} showSidebarButton={false} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-20 pb-24 flex flex-col justify-center">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Escolha sua solução
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Selecione a opção que se encaixa melhor com o que você precisa.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch w-full">
          {plans.map((plan, idx) => (
            <PlanCard 
              key={idx} 
              plan={plan} 
              onSelectPlan={handlePlanSelect}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Plans;
