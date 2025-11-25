import React, { useState } from 'react';
import { Power, PowerOff, RotateCcw, RefreshCw, TrendingUp, BarChart3, Crown, Clock, Activity, Cpu, Server, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VisaoGeral = () => {
  // Mock de dados do bot
  const botConfig = {
    name: 'DreamSellers',
    ping: '28 ms',
    serverName: 'Goat Applications',
    serverId: '123456789012345678',
    memberCount: '5,247',
    onlineCount: '823',
    isOnline: true,
  };
  const [isOnline, setIsOnline] = useState(botConfig.isOnline);
  const [loadingPower, setLoadingPower] = useState(false);
  const [loadingRestart, setLoadingRestart] = useState(false);
  const { toast } = useToast();

  const handleTogglePower = () => {
    if (loadingPower) return;
    setLoadingPower(true);
    const turningOn = !isOnline;
    const action = turningOn ? 'Ligando' : 'Desligando';
    const success = turningOn ? 'Aplicação Ligada com Sucesso' : 'Aplicação Desligada com Sucesso';
    const successDesc = turningOn ? 'O bot está online.' : 'O bot está offline.';
    const { update, id } = toast({
      title: action,
      duration: 999999,
    });
    setTimeout(() => {
      setIsOnline(turningOn);
      update({
        id,
        title: success,
        description: successDesc,
        icon: <CheckCircle className="text-green-500" />,
        duration: 3000,
      });
      setLoadingPower(false);
    }, 1500);
  };

  const handleRestart = () => {
    if (loadingRestart) return;
    setLoadingRestart(true);
    const { update, id } = toast({
      title: 'Reiniciando',
      duration: 999999,
    });
    setTimeout(() => {
      update({
        id,
        title: 'Aplicação Reiniciada com Sucesso',
        description: 'O bot foi reiniciado.',
        icon: <CheckCircle className="text-green-500" />,
        duration: 3000,
      });
      setLoadingRestart(false);
    }, 1500);
  };

  return (
    <>
      {/* Botão Dashboard alinhado à direita dos cards */}
      <div className="mb-6 flex justify-end">
        <a href="/dashboard">
          <button className="flex items-center gap-2 px-4 py-2 bg-black/50 border rounded-md shadow hover:bg-primary/90 transition-colors font-medium">
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </button>
        </a>
      </div>
      {/* Bot Status Card */}
      <div className="bg-black/50 border rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-lg overflow-hidden max-w-full w-full flex flex-col items-center">
        <div className="p-4 md:p-8 flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-[#1d1c24] flex items-center justify-center">
            {/* BotIcon pode ser adicionado aqui */}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-12">
              <div>
                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white">{botConfig.name}</h2>
                <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                  <span className="text-xs md:text-base text-white/70">discord.gg/dreamapps</span>
                  <span className="flex items-center gap-1 md:gap-2 text-green-400 text-xs md:text-base">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {botConfig.ping}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3 mt-3 sm:mt-0">
                <button
                  className={
                    `${isOnline
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'} text-white px-4 md:px-6 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-base font-semibold flex items-center gap-1.5 md:gap-2 transition-colors`
                  }
                  onClick={handleTogglePower}
                  disabled={loadingPower}
                >
                  {loadingPower ? (
                    <RefreshCw className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : isOnline ? (
                    <>
                      <PowerOff className="h-4 w-4 md:h-5 md:w-5" />Desligar
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 md:h-5 md:w-5" />Ligar
                    </>
                  )}
                </button>
                <button
                  className="bg-white hover:bg-gray-200 text-black px-4 md:px-6 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-base font-semibold flex items-center gap-1.5 md:gap-2 transition-colors"
                  onClick={handleRestart}
                  disabled={loadingRestart}
                >
                  {loadingRestart ? (
                    <RefreshCw className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />Reiniciar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full">
        {/* Bot Info Card */}
        <div className="bg-black/50 border rounded-xl md:rounded-2xl shadow-lg overflow-hidden w-full">
          <div className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 border-b">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-white/70" />
            <h3 className="text-base md:text-lg font-semibold text-white">Informações do Bot</h3>
          </div>
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              <div className="text-center p-3 md:p-5 rounded-lg md:rounded-xl bg-black/50 border">
                <Crown className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 mx-auto mb-1 md:mb-2" />
                <div className="text-base md:text-lg font-semibold text-white">Premium</div>
                <div className="text-xs md:text-sm text-white/50">Plano Ativo</div>
              </div>
              <div className="text-center p-3 md:p-5 rounded-lg md:rounded-xl bg-black/50 border">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-orange-400 mx-auto mb-1 md:mb-2" />
                <div className="text-base md:text-lg font-semibold text-white">15 dias</div>
                <div className="text-xs md:text-sm text-white/50">Duração do Plano</div>
              </div>
              <div className="text-center p-3 md:p-5 rounded-lg md:rounded-xl bg-black/50 border">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-green-400 mx-auto mb-1 md:mb-2" />
                <div className="text-base md:text-lg font-semibold text-white">24h 15m</div>
                <div className="text-xs md:text-sm text-white/50">Tempo Online</div>
              </div>
              <div className="text-center p-3 md:p-5 rounded-lg md:rounded-xl bg-black/50 border">
                <Cpu className="h-5 w-5 md:h-6 md:w-6 text-white mx-auto mb-1 md:mb-2" />
                <div className="text-base md:text-lg font-semibold text-white">347.01 MB / 1 GB</div>
                <div className="text-xs md:text-sm text-white/50">RAM</div>
              </div>
            </div>
          </div>
        </div>
        {/* Server Info Card */}
        <div className="bg-black/50 border rounded-xl md:rounded-2xl shadow-lg overflow-hidden w-full">
          <div className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 border-b">
            <Server className="h-4 w-4 md:h-5 md:w-5 text-white/70" />
            <h3 className="text-base md:text-lg font-semibold text-white">Informações do Servidor</h3>
          </div>
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-2 gap-y-1 md:gap-y-2 text-xs md:text-base mb-2 md:mb-4">
              <div className="text-white/50">Nome do Servidor:</div>
              <div className="text-right text-base md:text-lg text-white">{botConfig.serverName}</div>
              <div className="text-white/50">ID do Servidor:</div>
              <div className="text-right text-white">{botConfig.serverId}</div>
              <div className="text-white/50">Membros totais:</div>
              <div className="text-right text-white">{botConfig.memberCount}</div>
              <div className="text-white/50">Online agora:</div>
              <div className="text-right text-green-400">{botConfig.onlineCount}</div>
              <div className="text-white/50">Região:</div>
              <div className="text-right text-white">Brazil</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VisaoGeral; 