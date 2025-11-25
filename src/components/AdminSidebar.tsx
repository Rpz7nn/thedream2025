import React from 'react';
import { Activity, DollarSign, Bot, Upload, Shield } from 'lucide-react';

interface AdminSidebarProps {
  activeSection: 'monitoramento' | 'financeiro' | 'bots' | 'atualizacoes' | 'seguranca';
  onSectionChange: (section: 'monitoramento' | 'financeiro' | 'bots' | 'atualizacoes' | 'seguranca') => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const sections = [
    {
      id: 'monitoramento' as const,
      label: 'Monitoramento',
      icon: Activity,
      description: 'Status em tempo real'
    },
    {
      id: 'financeiro' as const,
      label: 'Financeiro',
      icon: DollarSign,
      description: 'Rendimentos e histórico'
    },
    {
      id: 'bots' as const,
      label: 'Gerenciamento',
      icon: Bot,
      description: 'Controle de bots'
    },
    {
      id: 'atualizacoes' as const,
      label: 'Atualizações',
      icon: Upload,
      description: 'Update global'
    },
    {
      id: 'seguranca' as const,
      label: 'Segurança',
      icon: Shield,
      description: 'Configurações de acesso'
    }
  ];

  return (
    <div className="w-full lg:w-56 bg-[#050505] border-r border-[#1a1a1a] lg:border-r lg:border-0 lg:border-[#1a1a1a] lg:rounded-lg lg:mr-4 p-3 lg:self-start lg:sticky lg:top-6 flex-shrink-0 min-h-fit lg:min-h-[calc(100vh-160px)]">
      <div className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-[#999999] hover:text-white hover:bg-[#111]'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? 'text-black' : 'text-white'}`}>
                  {section.label}
                </p>
                <p className={`text-xs ${isActive ? 'text-gray-600' : 'text-[#666666]'}`}>
                  {section.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

