import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Palette, Zap, Store, Ticket, Cloud, Gift, Shield, Package, AlertTriangle, ChevronDown, ChevronRight, ShoppingBag, CreditCard, Settings, Sparkles, MessageSquare } from 'lucide-react';
import { useI18n } from '@/i18n';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  hasSubmenu?: boolean;
}

// Menu items serão criados dentro do componente para usar traduções

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  application?: any;
  botApiUrl?: string;
}

export default function DashboardSidebar({ activeSection, onSectionChange, application, botApiUrl }: DashboardSidebarProps) {
  const { t } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['dream-app', 'gerencie']);
  const [boasVindasAtivo, setBoasVindasAtivo] = useState(false);

  useEffect(() => {
    const verificarBoasVindas = async () => {
      if (!application?.guild_id || !botApiUrl) return;
      
      try {
        const guildId = application.guild_id;
        const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
        
        if (!botId) return;

        const url = `${botApiUrl}/definicoes?bot_id=${botId}&guild_id=${guildId}`;
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
          const data = await response.json();
          const ativo = data.adicionais?.boasVindas?.ativo || false;
          setBoasVindasAtivo(ativo);
          
          // Expandir a categoria loja se boas-vindas estiver ativo
          if (ativo) {
            setExpandedCategories(prev => {
              const newCategories = [...prev];
              if (!newCategories.includes('loja')) newCategories.push('loja');
              return newCategories;
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar boas-vindas:', error);
      }
    };

    verificarBoasVindas();
    
    // Verificar periodicamente quando estiver na seção de automações ou boas-vindas
    const interval = setInterval(() => {
      if (activeSection === 'automacoes' || activeSection === 'boas-vindas') {
        verificarBoasVindas();
      }
    }, 2000); // Verificar a cada 2 segundos quando estiver nessas seções

    return () => clearInterval(interval);
  }, [application?.guild_id, botApiUrl, activeSection]);

  const menuItems: MenuItem[] = [
    {
      id: 'dream-app',
      label: t('dashboard.sidebar.dreamApp'),
      children: [
        { id: 'principal', label: t('dashboard.sections.principal'), icon: <Home size={16} /> },
      ],
    },
    {
      id: 'gerencie',
      label: t('dashboard.sidebar.manageApp'),
      children: [
        { id: 'rendimentos', label: t('dashboard.sections.rendimentos'), icon: <DollarSign size={16} /> },
        { id: 'personalizacao', label: t('dashboard.sections.personalizacao'), icon: <Palette size={16} /> },
        { id: 'definicoes', label: t('dashboard.sections.definicoes'), icon: <Settings size={16} /> },
      ],
    },
    {
      id: 'loja',
      label: t('dashboard.sidebar.configureStore'),
      children: [
        {
          id: 'loja-submenu',
          label: t('dashboard.sidebar.store'),
          icon: <Store size={16} />,
          hasSubmenu: true,
          children: [
            { id: 'produtos', label: t('dashboard.sections.produtos'), icon: <ShoppingBag size={16} /> },
            { id: 'pagamentos', label: t('dashboard.sections.pagamentos'), icon: <CreditCard size={16} /> },
          ]
        },
        { id: 'automacoes', label: t('dashboard.sections.automacoes'), icon: <Zap size={16} /> },
        ...(boasVindasAtivo ? [{ id: 'boas-vindas', label: 'Boas-Vindas', icon: <MessageSquare size={16} /> }] : []),
        { id: 'ticket', label: t('dashboard.sections.tickets'), icon: <Ticket size={16} /> },
        { id: 'dreamcloud', label: t('dashboard.sections.dreamCloud'), icon: <Cloud size={16} /> },
        { id: 'sorteios', label: t('dashboard.sections.sorteios'), icon: <Gift size={16} /> },
        { id: 'protecoes', label: t('dashboard.sections.protecoes'), icon: <Shield size={16} /> },
        { id: 'extensoes', label: t('dashboard.sections.extensoes'), icon: <Package size={16} /> },
      ],
    },
    {
      id: 'risco',
      label: 'Risco',
      children: [
        { id: 'risco', label: 'Área de Risco', icon: <AlertTriangle size={16} /> },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-full lg:w-56 bg-[#050505] border-r border-[#1a1a1a] lg:border-r lg:border-0 lg:border-[#1a1a1a] lg:rounded-lg lg:mr-4 p-3 lg:self-start lg:sticky lg:top-6 flex-shrink-0 min-h-fit lg:min-h-[calc(100vh-160px)]">
      <div className="space-y-0.5">
        {menuItems.map((category) => (
          <div key={category.id}>
            {/* Categoria */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[#999999] hover:text-[#ffffff] hover:bg-[#0a0a0a] rounded-md transition-all duration-150 group"
            >
              <span className="text-xs font-medium uppercase tracking-wider">{category.label}</span>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown size={14} strokeWidth={1.5} className="text-[#666666] group-hover:text-[#999999] transition-colors" />
              ) : (
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#666666] group-hover:text-[#999999] transition-colors" />
              )}
            </button>

            {/* Items da categoria */}
            {expandedCategories.includes(category.id) && category.children && (
              <div className="mt-0.5 ml-1 space-y-0.5">
                {category.children.map((item) => (
                  <div key={item.id}>
                    {item.children && item.hasSubmenu ? (
                      // Item com submenu (apenas para loja-submenu)
                      <div>
                        <div className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-150 group ${
                          activeSection === 'produtos' || activeSection === 'pagamentos'
                            ? 'bg-[#ffffff] text-[#000000] font-medium'
                            : 'text-[#999999] hover:text-[#ffffff] hover:bg-[#0a0a0a]'
                        }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(item.id);
                            }}
                            className="flex items-center gap-2.5 flex-1 text-left"
                          >
                            {item.icon && (
                              <span className={activeSection === 'produtos' || activeSection === 'pagamentos' ? 'text-[#000000]' : 'text-[#666666] group-hover:text-[#999999] transition-colors'}>
                                {item.icon}
                              </span>
                            )}
                            <span className="text-sm font-normal">{item.label}</span>
                          </button>
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(item.id);
                            }}
                            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                          >
                          {expandedCategories.includes(item.id) ? (
                              <ChevronDown size={14} strokeWidth={1.5} className={activeSection === 'produtos' || activeSection === 'pagamentos' ? 'text-[#000000]' : 'text-[#666666]'} />
                          ) : (
                              <ChevronRight size={14} strokeWidth={1.5} className={activeSection === 'produtos' || activeSection === 'pagamentos' ? 'text-[#000000]' : 'text-[#666666]'} />
                          )}
                        </button>
                        </div>
                        {/* Sub-itens */}
                        {expandedCategories.includes(item.id) && item.children && (
                          <div className="ml-3 mt-0.5 space-y-0.5">
                            {item.children.map((subItem) => (
                              <button
                                key={subItem.id}
                                onClick={() => onSectionChange(subItem.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left rounded-md transition-all duration-150 ${
                                  activeSection === subItem.id
                                    ? 'bg-[#ffffff] text-[#000000] font-medium'
                                    : 'text-[#999999] hover:text-[#ffffff] hover:bg-[#0a0a0a]'
                                }`}
                              >
                                {subItem.icon && (
                                  <span className={activeSection === subItem.id ? 'text-[#000000]' : 'text-[#666666]'}>
                                    {subItem.icon}
                                  </span>
                                )}
                                <span className="text-sm font-normal">{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Item normal
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-md transition-all duration-150 ${
                          activeSection === item.id
                            ? 'bg-[#ffffff] text-[#000000] font-medium'
                            : 'text-[#999999] hover:text-[#ffffff] hover:bg-[#0a0a0a]'
                        }`}
                      >
                        {item.icon && (
                          <span className={activeSection === item.id ? 'text-[#000000]' : 'text-[#666666]'}>
                            {item.icon}
                          </span>
                        )}
                        <span className="text-sm font-normal">{item.label}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

