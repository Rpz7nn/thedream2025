import React from 'react';
import {
  Home, FileText, Settings, User, Power, RefreshCw, Trash2, Server, CreditCard, Package,
  UserCog, Shield, Handshake, ShoppingBag, Bot, ShieldCheck, UserPlus, Gift, Crown, Ticket, Cloud, Hash
} from 'lucide-react';

interface SidebarProps {
  application?: any;
  userAvatar?: string;
  username?: string;
  userId?: string;
}

const GERENCIAMENTO = [
  { name: 'Finanças', icon: <CreditCard size={17} />, key: 'financas' },
  { name: 'Personalização', icon: <Settings size={17} />, key: 'personalizacao' },
  { name: 'Recursos', icon: <Package size={17} />, key: 'recursos' }
];

const CONFIGURACOES = [
  { name: 'Canais', icon: <Hash size={17} />, key: 'canais' },
  { name: 'Cargos', icon: <Shield size={17} />, key: 'cargos' },
  { name: 'Boas Vindas', icon: <Handshake size={17} />, key: 'boas-vindas' },
  { name: 'Loja', icon: <ShoppingBag size={17} />, key: 'loja' },
  { name: 'Ações Automáticas', icon: <Bot size={17} />, key: 'acoes-automaticas' },
  { name: 'Proteção', icon: <ShieldCheck size={17} />, key: 'protecao' },
  { name: 'Rastreamento de Convites', icon: <UserPlus size={17} />, key: 'rastreamento-convites' },
  { name: 'Sorteios', icon: <Gift size={17} />, key: 'sorteios' },
  { name: 'VIPs', icon: <Crown size={17} />, key: 'vips' },
  { name: 'Tickets', icon: <Ticket size={17} />, key: 'tickets' },
  { name: 'eCloud', icon: <Cloud size={17} />, key: 'ecloud' }
];

export default function Sidebar({ application, userAvatar, username, userId }: SidebarProps): JSX.Element {
  const guildConfigured = !!application?.guild_id;

  return (
    <>
      {/* Sidebar principal */}
      <aside className="w-20 bg-[#0b0b0b] border-r border-[#1a1a1a] flex flex-col items-center py-6 space-y-8 animate-fade-in">
        <div className="flex items-center justify-center mb-1">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        <nav className="flex flex-col gap-6 mt-10">
          <button className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-all" title="Início">
            <Home size={22} />
          </button>
          <button className="p-2 hover:bg-[#1a1a1a] bg-[#1a1a1a] rounded-xl transition-all" title="Operações">
            <FileText size={22} />
          </button>
          <button className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-all" title="Configurações">
            <Settings size={22} />
          </button>
          <button className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-all" title="Perfil">
            <User size={22} />
          </button>
        </nav>
      </aside>

      {/* Painel lateral direito */}
      <aside className="w-72 bg-[#0b0b0b] border-r border-[#1a1a1a] p-6 space-y-6 flex flex-col animate-fade-in">
        {/* Header Bot/User */}
        <div className="flex items-center gap-3 mb-5">
          {application ? (
            <>
              <div className="w-10 h-10 rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#111] flex items-center justify-center">
                <img src="/logo.png" alt={application.application_name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">{application.application_name}</p>
                <p className="text-xs text-gray-500">{application.id}</p>
              </div>
            </>
          ) : (
            <>
              <img src={userAvatar} alt={username || 'Usuário'} className="w-10 h-10 rounded-lg border border-[#1a1a1a] object-cover" />
              <div>
                <p className="font-medium text-white text-sm">{username || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{userId || ''}</p>
              </div>
            </>
          )}
        </div>

        {/* Botões Ação */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#252525] text-red-400 transition-all" title="Desligar">
            <Power size={16} className="mx-auto" />
          </button>
          <button className="flex-1 py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#252525] text-yellow-400 transition-all" title="Reiniciar">
            <RefreshCw size={16} className="mx-auto" />
          </button>
          <button className="flex-1 py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#252525] text-red-500 transition-all" title="Excluir">
            <Trash2 size={16} className="mx-auto" />
          </button>
        </div>

        {/* Menu - Principal Sempre disponível */}
        <div className="mb-4">
          <h4 className="text-xs text-gray-400 mb-2 uppercase">PRINCIPAL</h4>
          <button className="w-full flex items-center justify-start gap-2 bg-[#1a1a1a] text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-white hover:text-black transition-all">
            <Server size={16} /> Visão Geral
          </button>
        </div>

        {guildConfigured && (
          <>
            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2 uppercase flex items-center">GERENCIAMENTO</h4>
              <nav className="space-y-1">
                {GERENCIAMENTO.map(item => (
                  <button key={item.key} className="w-full flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded transition-all text-sm hover:bg-[#15151a]">
                    {item.icon} {item.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mb-2">
              <h4 className="text-xs text-gray-400 mb-2 uppercase flex items-center">CONFIGURAÇÕES</h4>
              <nav className="space-y-1">
                {CONFIGURACOES.map(item => (
                  <button key={item.key} className="w-full flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded transition-all text-sm hover:bg-[#15151a]">
                    {item.icon} {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
