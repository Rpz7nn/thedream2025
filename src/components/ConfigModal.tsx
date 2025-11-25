import React from 'react';
import { Dialog, DialogContent } from "./ui/dialog";

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalStep: 1 | 2;
  setModalStep: (step: 1 | 2) => void;
  selectedApp: any;
  botToken: string;
  setBotToken: (token: string) => void;
  clientId: string;
  setClientId: (id: string) => void;
  showToken: boolean;
  setShowToken: (show: boolean) => void;
  saving: boolean;
  handleSaveConfiguration: () => void;
  loadingGuilds: boolean;
  guildsError: string | null;
  botGuilds: any[];
  fetchBotGuilds: () => void;
  handleSelectBotGuild: (guild: any) => void;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

export default function ConfigModal({
  open,
  onOpenChange,
  modalStep,
  setModalStep,
  selectedApp,
  botToken,
  setBotToken,
  clientId,
  setClientId,
  showToken,
  setShowToken,
  saving,
  handleSaveConfiguration,
  loadingGuilds,
  guildsError,
  botGuilds,
  fetchBotGuilds,
  handleSelectBotGuild,
}: ConfigModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#0a0a0a] border-2 border-[#1a1a1a] text-white rounded-3xl shadow-2xl p-0 overflow-hidden">
        {modalStep === 1 ? (
          // --- ETAPA 1: Token + ClientID ---
          <div className="relative">
            {/* Header com gradiente sutil */}
            <div className="relative px-8 pt-8 pb-6 border-b border-[#1a1a1a]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                      <path d="M12 2L2 7V12C2 16.55 5.84 20.74 12 22C18.16 20.74 22 16.55 22 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Configurar Bot</h2>
                    <p className="text-gray-400 text-sm">{selectedApp?.application_name}</p>
                  </div>
                </div>
                <p className="text-gray-400 mt-4">
                  Conecte seu bot Discord para começar a usar o dashboard
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6">
              {/* TOKEN */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Token do Bot <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Cole aqui o token do seu bot Discord"
                    className="w-full bg-[#0b0b0b] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-all py-4 px-4 pr-24"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-white/10 rounded-lg transition-all"
                  >
                    {showToken ? (
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                        Ocultar
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Mostrar
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Seu token será criptografado e armazenado de forma segura
                </p>
              </div>

              {/* CLIENT ID */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 9h6M9 15h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Client ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Cole o Application ID do Discord Developer Portal"
                  className="w-full bg-[#0b0b0b] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-all py-4 px-4"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Encontre em: Discord Developer Portal → Seu App → General Information
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-[#1a1a1a] flex items-center justify-between gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="px-6 py-3 border-2 border-[#1a1a1a] text-gray-400 hover:text-white hover:border-white transition-all rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfiguration}
                disabled={saving || !botToken.trim() || !clientId.trim()}
                className="px-8 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xl font-bold flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Configurando...
                  </>
                ) : (
                  <>
                    Continuar
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // --- ETAPA 2: Selecionar servidor do bot ---
          <div className="relative">
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-[#1a1a1a]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Selecione o Servidor</h2>
                    <p className="text-gray-400 text-sm">Onde seu bot está instalado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 min-h-[300px]">
              {loadingGuilds ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-400">Buscando servidores do bot...</p>
                </div>
              ) : guildsError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <p className="text-red-400 text-center mb-2">{guildsError}</p>
                  <button
                    onClick={fetchBotGuilds}
                    className="mt-4 px-4 py-2 bg-[#1a1a1a] hover:bg-white/10 rounded-lg text-white text-sm transition-all"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : botGuilds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-yellow-500">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-2">Nenhum servidor encontrado</p>
                  <p className="text-gray-500 text-sm max-w-sm">Adicione o bot ao seu servidor no Discord antes de continuar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {botGuilds.map(guild => (
                    <button
                      key={guild.id}
                      onClick={() => handleSelectBotGuild(guild)}
                      disabled={saving}
                      className="w-full group p-5 border-2 border-[#1a1a1a] rounded-2xl bg-[#0b0b0b] hover:border-white hover:bg-black cursor-pointer transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 group-hover:scale-110 transition-transform">
                        {guild.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            alt={guild.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                            {guild.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate text-lg">{guild.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {guild.id}</p>
                      </div>
                      {saving ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0">
                          <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-[#1a1a1a] flex items-center justify-between gap-4">
              <button
                onClick={() => setModalStep(1)}
                className="px-6 py-3 border-2 border-[#1a1a1a] text-gray-400 hover:text-white hover:border-white transition-all rounded-xl font-medium flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Voltar
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="px-6 py-3 border-2 border-[#1a1a1a] text-gray-400 hover:text-white hover:border-white transition-all rounded-xl font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

