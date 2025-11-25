import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, AlertCircle, Image as ImageIcon, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiPath } from '@/utils/api';

interface PersonalizacaoSectionProps {
  application: any;
  botApiUrl: string;
}

interface BotInfo {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  banner: string | null;
  status: string;
  activities: any[];
}

export default function PersonalizacaoSection({ application, botApiUrl }: PersonalizacaoSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [botName, setBotName] = useState('');
  const [botStatus, setBotStatus] = useState<'online' | 'idle' | 'dnd'>('online');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (application?.guild_id) {
      carregarBotInfo();
    }
  }, [application?.guild_id]);

  const carregarBotInfo = async () => {
    try {
      setLoading(true);
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      if (!botId || !guildId) {
        console.warn('PersonalizacaoSection: botId ou guildId não encontrado', { botId, guildId });
        setLoading(false);
        return;
      }

      const url = getApiPath(`/api/personalizacao?bot_id=${botId}&guild_id=${guildId}`);
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.botInfo) {
          setBotInfo(data.botInfo);
          setBotName(data.botInfo.username || '');
          // Mapear status do Discord para nosso formato
          const statusMap: Record<string, 'online' | 'idle' | 'dnd'> = {
            'online': 'online',
            'idle': 'idle',
            'dnd': 'dnd',
            'do_not_disturb': 'dnd',
            'invisible': 'online' // Invisible não é suportado, usar online
          };
          setBotStatus(statusMap[data.botInfo.status] || 'online');
        }
      } else {
        console.error('Erro ao carregar informações do bot');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as informações do bot',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar informações do bot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar informações do bot',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para redimensionar e comprimir imagem
  const resizeAndCompressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo proporção
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Converter para base64 com qualidade ajustada
          const base64 = canvas.toDataURL('image/png', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'Arquivo muito grande. Máximo 8MB.',
        type: 'error'
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Arquivo deve ser uma imagem',
        type: 'error'
      });
      return;
    }

    try {
      setUploadingAvatar(true);
      // Redimensionar avatar para 512x512 e comprimir para reduzir tamanho
      const base64 = await resizeAndCompressImage(file, 512, 512, 0.85);

      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      const response = await fetch(getApiPath(`/api/personalizacao/avatar`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          avatar: base64
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Avatar atualizado com sucesso!',
          type: 'success'
        });
        await carregarBotInfo();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar avatar',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar avatar',
        type: 'error'
      });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máximo 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'Arquivo muito grande. Máximo 8MB.',
        type: 'error'
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Arquivo deve ser uma imagem',
        type: 'error'
      });
      return;
    }

    try {
      setUploadingBanner(true);
      // Redimensionar banner para 1920x1080 e comprimir para reduzir tamanho
      const base64 = await resizeAndCompressImage(file, 1920, 1080, 0.85);

      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      const response = await fetch(getApiPath(`/api/personalizacao/banner`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          banner: base64
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Banner atualizado com sucesso!',
          type: 'success'
        });
        await carregarBotInfo();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar banner',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar banner',
        type: 'error'
      });
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }
    }
  };

  const handleUpdateName = async () => {
    if (!botName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome não pode estar vazio',
        type: 'error'
      });
      return;
    }

    if (botName.length > 32) {
      toast({
        title: 'Erro',
        description: 'Nome muito longo. Máximo 32 caracteres.',
        type: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      const response = await fetch(getApiPath(`/api/personalizacao/nome`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          nome: botName.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Nome atualizado com sucesso!',
          type: 'success'
        });
        await carregarBotInfo();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar nome',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar nome',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSaving(true);
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.client_id;

      const response = await fetch(getApiPath(`/api/personalizacao/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          guild_id: guildId,
          status: botStatus
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Status atualizado com sucesso!',
          type: 'success'
        });
        await carregarBotInfo();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (!botInfo) return null;
    if (botInfo.avatar) {
      return `https://cdn.discordapp.com/avatars/${botInfo.id}/${botInfo.avatar}.png?size=256`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(botInfo.discriminator || '0') % 5}.png`;
  };

  const getBannerUrl = () => {
    if (!botInfo?.banner) return null;
    return `https://cdn.discordapp.com/banners/${botInfo.id}/${botInfo.banner}.png?size=1024`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Ausente';
      case 'dnd':
        return 'Ocupado';
      default:
        return 'Online';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#999999] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#ffffff] mb-1">Personalização</h1>
        <p className="text-sm text-[#999999]">Customize a aparência da sua aplicação</p>
      </div>

      {/* Banner e Avatar */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 relative">
        {/* Banner */}
        <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-[#0f0f0f] border border-[#1a1a1a]">
          {getBannerUrl() ? (
            <img 
              src={getBannerUrl()!} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-[#666666] mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-[#999999]">Sem banner</p>
              </div>
            </div>
          )}
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute top-3 right-3 p-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingBanner ? (
              <Loader2 className="w-4 h-4 text-[#999999] animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-[#999999]" strokeWidth={1.5} />
            )}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
        </div>

        {/* Avatar e Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            {getAvatarUrl() ? (
              <img 
                src={getAvatarUrl()!} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-2 border-[#1a1a1a] object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#0f0f0f] border-2 border-[#1a1a1a] flex items-center justify-center">
                <User className="w-10 h-10 text-[#666666]" strokeWidth={1.5} />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 p-1.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3 h-3 text-[#999999] animate-spin" />
              ) : (
                <Upload className="w-3 h-3 text-[#999999]" strokeWidth={1.5} />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            {botInfo ? (
              <>
                <p className="text-white font-medium text-sm mb-1">
                  {botInfo.username || 'Carregando...'}
                </p>
                <p className="text-[#999999] text-xs">Bot ID: {botInfo.id}</p>
              </>
            ) : (
              <>
                <p className="text-white font-medium text-sm mb-1">Carregando...</p>
                <p className="text-[#999999] text-xs">Bot ID: ...</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nome do Bot e Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Nome do Bot */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 relative">
          <div className="absolute top-4 right-4">
            <FileText className="w-5 h-5 text-[#666666]" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4">Nome do Bot</h3>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="Digite o novo nome"
            maxLength={32}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-[#666666] focus:outline-none focus:border-[#2a2a2a] mb-3"
          />
          <p className="text-xs text-[#999999] mb-4">
            O nome será atualizado no Discord
          </p>
          <button
            onClick={handleUpdateName}
            disabled={saving || !botName.trim() || botName === botInfo?.username}
            className="w-full px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar Nome</span>
            )}
          </button>
        </div>

        {/* Status do Bot */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 relative">
          <div className="absolute top-4 right-4">
            <FileText className="w-5 h-5 text-[#666666]" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4">Status do Bot</h3>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value="online"
                checked={botStatus === 'online'}
                onChange={(e) => setBotStatus(e.target.value as 'online' | 'idle' | 'dnd')}
                className="w-4 h-4 text-white border-[#1a1a1a] focus:ring-0 focus:ring-offset-0"
              />
              <div className={`w-3 h-3 rounded-full ${getStatusColor('online')}`}></div>
              <span className="text-sm text-white group-hover:text-white transition-colors">Online</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value="idle"
                checked={botStatus === 'idle'}
                onChange={(e) => setBotStatus(e.target.value as 'online' | 'idle' | 'dnd')}
                className="w-4 h-4 text-white border-[#1a1a1a] focus:ring-0 focus:ring-offset-0"
              />
              <div className={`w-3 h-3 rounded-full ${getStatusColor('idle')}`}></div>
              <span className="text-sm text-white group-hover:text-white transition-colors">Ausente</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value="dnd"
                checked={botStatus === 'dnd'}
                onChange={(e) => setBotStatus(e.target.value as 'online' | 'idle' | 'dnd')}
                className="w-4 h-4 text-white border-[#1a1a1a] focus:ring-0 focus:ring-offset-0"
              />
              <div className={`w-3 h-3 rounded-full ${getStatusColor('dnd')}`}></div>
              <span className="text-sm text-white group-hover:text-white transition-colors">Ocupado</span>
            </label>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={saving}
            className="w-full px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar Status</span>
            )}
          </button>
        </div>
      </div>

      {/* Nota Importante */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-white mb-2">Nota Importante</h4>
            <p className="text-sm text-[#999999] leading-relaxed">
              Alterações no avatar e banner devem seguir as políticas do Discord. Arquivos devem ser menores que 8MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

