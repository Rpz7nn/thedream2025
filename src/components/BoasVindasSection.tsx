import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, MessageSquare, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface BoasVindasConfig {
  ativo: boolean;
  tipo: 'embed' | 'container' | 'texto';
  // Embed
  embedColor?: string;
  embedTitle?: string;
  embedTitleUrl?: string;
  embedDescription?: string;
  embedThumbnail?: string;
  embedImage?: string;
  embedFooter?: string;
  embedFooterIcon?: string;
  embedAuthorName?: string;
  embedAuthorIcon?: string;
  embedAuthorUrl?: string;
  embedFields?: EmbedField[];
  // Container
  containerTitulo?: string;
  containerDescricao?: string;
  containerSubDescricao?: string;
  containerBanner?: string;
  containerIcon?: string;
  containerBotaoNome?: string;
  containerBotaoEmoji?: string;
  containerBotaoCor?: string;
  containerBotaoAcao?: 'nenhuma' | 'redirecionar_canal' | 'redirecionar_url';
  containerBotaoAcaoValor?: string;
  // Texto
  mensagem?: string;
  // Delay para exclusão (segundos)
  delayExclusao?: number;
}

interface BoasVindasSectionProps {
  application: any;
  botApiUrl: string;
}

export default function BoasVindasSection({ application, botApiUrl }: BoasVindasSectionProps) {
  const [config, setConfig] = useState<BoasVindasConfig>({
    ativo: false,
    tipo: 'embed',
    embedColor: '#5865F2',
    embedTitle: 'Bem-vindo ao servidor!',
    embedDescription: '',
    delayExclusao: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [canalBoasVindas, setCanalBoasVindas] = useState<string>('');
  const [novoField, setNovoField] = useState<EmbedField>({ name: '', value: '', inline: false });

  useEffect(() => {
    carregarConfiguracoes();
    carregarCanalBoasVindas();
  }, [application?.guild_id]);

  const carregarCanalBoasVindas = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      
      if (!botId || !guildId) return;

      const url = `${botApiUrl}/definicoes?bot_id=${botId}&guild_id=${guildId}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        if (data.canaisLogs && data.canaisLogs['boas-vindas']) {
          setCanalBoasVindas(data.canaisLogs['boas-vindas']);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar canal de boas-vindas:', error);
    }
  };

  const carregarConfiguracoes = async () => {
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      
      if (!botId || !guildId) {
        setLoading(false);
        return;
      }

      const url = `${botApiUrl}/definicoes?bot_id=${botId}&guild_id=${guildId}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        const boasVindas = data.adicionais?.boasVindas || {};
        setConfig({
          ativo: boasVindas.ativo || false,
          tipo: boasVindas.tipo || 'embed',
          embedColor: boasVindas.embedColor || '#5865F2',
          embedTitle: boasVindas.embedTitle || 'Bem-vindo ao servidor!',
          embedTitleUrl: boasVindas.embedTitleUrl || '',
          embedDescription: boasVindas.embedDescription || '',
          embedThumbnail: boasVindas.embedThumbnail || '',
          embedImage: boasVindas.embedImage || '',
          embedFooter: boasVindas.embedFooter || '',
          embedFooterIcon: boasVindas.embedFooterIcon || '',
          embedAuthorName: boasVindas.embedAuthorName || '',
          embedAuthorIcon: boasVindas.embedAuthorIcon || '',
          embedAuthorUrl: boasVindas.embedAuthorUrl || '',
          embedFields: boasVindas.embedFields || [],
          containerTitulo: boasVindas.containerTitulo || '',
          containerDescricao: boasVindas.containerDescricao || '',
          containerSubDescricao: boasVindas.containerSubDescricao || '',
          containerBanner: boasVindas.containerBanner || '',
          containerIcon: boasVindas.containerIcon || '',
          containerBotaoNome: boasVindas.containerBotaoNome || '',
          containerBotaoEmoji: boasVindas.containerBotaoEmoji || '',
          containerBotaoCor: boasVindas.containerBotaoCor || 'Primary',
          containerBotaoAcao: boasVindas.containerBotaoAcao || 'nenhuma',
          containerBotaoAcaoValor: boasVindas.containerBotaoAcaoValor || '',
          mensagem: boasVindas.mensagem || '',
          delayExclusao: boasVindas.delayExclusao || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      const guildId = application?.guild_id;
      const botId = application?.configuration?.clientId || application?.configuration?.botId || application?.client_id;
      
      if (!botId || !guildId) {
        toast({
          title: 'Erro',
          description: 'Bot ID ou Guild ID não encontrado. Configure o bot primeiro.',
          type: 'error',
        });
        setSaving(false);
        return;
      }

      const url = `${botApiUrl}/definicoes/adicionais`;
      const body = {
        bot_id: botId,
        guild_id: guildId,
        boasVindas: config
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao salvar configurações';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Erro ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        toast({
          title: 'Erro',
          description: errorMessage,
          type: 'error',
        });
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Configurações salvas com sucesso!',
          type: 'success',
        });
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao salvar configurações',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: `Erro ao salvar configurações: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const adicionarField = () => {
    if (!novoField.name || !novoField.value) return;
    setConfig({
      ...config,
      embedFields: [...(config.embedFields || []), { ...novoField }]
    });
    setNovoField({ name: '', value: '', inline: false });
  };

  const removerField = (index: number) => {
    const fields = [...(config.embedFields || [])];
    fields.splice(index, 1);
    setConfig({ ...config, embedFields: fields });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#ffffff] mb-1">Boas-Vindas</h1>
        <p className="text-sm text-[#999999]">Personalize a mensagem de boas-vindas para novos membros</p>
      </div>


      {/* Informação sobre o canal */}
      {canalBoasVindas && (
        <div className="minimal-card p-4 bg-[#0f0f0f] border border-[#1a1a1a]">
          <p className="text-sm text-[#999999]">
            <span className="text-[#ffffff] font-medium">Canal de Boas-Vindas:</span> Configurado em Definições
          </p>
          <p className="text-xs text-[#666666] mt-1">
            As mensagens serão enviadas no canal definido em Definições → Canais de Logs → Boas-vindas
          </p>
        </div>
      )}

      {!canalBoasVindas && (
        <div className="minimal-card p-4 bg-[#0f0f0f] border border-[#ff6b6b]">
          <p className="text-sm text-[#ff6b6b]">
            ⚠️ Configure o canal de boas-vindas em <span className="font-medium">Definições → Canais de Logs → Boas-vindas</span>
          </p>
        </div>
      )}

      {/* Tipo de Mensagem */}
      <div className="minimal-card p-6">
        <label className="block text-sm font-medium text-[#ffffff] mb-4">Tipo de Mensagem</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setConfig({ ...config, tipo: 'texto' })}
            className={`p-4 rounded-lg border transition-colors ${
              config.tipo === 'texto'
                ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                : 'bg-[#0f0f0f] text-[#999999] border-[#1a1a1a] hover:border-[#2a2a2a]'
            }`}
          >
            <MessageSquare size={20} className="mx-auto mb-2" strokeWidth={1.5} />
            <span className="text-sm font-medium">Texto</span>
          </button>
          <button
            onClick={() => setConfig({ ...config, tipo: 'embed' })}
            className={`p-4 rounded-lg border transition-colors ${
              config.tipo === 'embed'
                ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                : 'bg-[#0f0f0f] text-[#999999] border-[#1a1a1a] hover:border-[#2a2a2a]'
            }`}
          >
            <MessageSquare size={20} className="mx-auto mb-2" strokeWidth={1.5} />
            <span className="text-sm font-medium">Embed</span>
          </button>
          <button
            onClick={() => setConfig({ ...config, tipo: 'container' })}
            className={`p-4 rounded-lg border transition-colors ${
              config.tipo === 'container'
                ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                : 'bg-[#0f0f0f] text-[#999999] border-[#1a1a1a] hover:border-[#2a2a2a]'
            }`}
          >
            <MessageSquare size={20} className="mx-auto mb-2" strokeWidth={1.5} />
            <span className="text-sm font-medium">Container</span>
          </button>
        </div>
      </div>

      {/* Delay para Exclusão */}
      <div className="minimal-card p-6">
        <label className="block text-sm font-medium text-[#ffffff] mb-2">Delay para Exclusão (Segundos)</label>
        <input
          type="number"
          value={config.delayExclusao || 0}
          onChange={(e) => setConfig({ ...config, delayExclusao: Math.max(0, parseInt(e.target.value) || 0) })}
          min="0"
          placeholder="0"
          className="minimal-input w-full"
        />
        <p className="text-xs text-[#666666] mt-2">Deixe 0 para não excluir automaticamente</p>
      </div>

      {/* Configuração de Texto */}
      {config.tipo === 'texto' && (
        <div className="minimal-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Mensagem</label>
            <textarea
              value={config.mensagem || ''}
              onChange={(e) => setConfig({ ...config, mensagem: e.target.value })}
              placeholder="Bem-vindo {user} ao servidor {serverName}!"
              rows={5}
              className="minimal-input w-full"
            />
            <div className="mt-2 p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
              <p className="text-xs font-medium text-[#ffffff] mb-2">Variáveis disponíveis:</p>
              <ul className="text-xs text-[#999999] space-y-1">
                <li><code className="text-[#666666]">{'{user}'}</code> - Menção do usuário</li>
                <li><code className="text-[#666666]">{'{user.name}'}</code> - Nome global do usuário</li>
                <li><code className="text-[#666666]">{'{user.username}'}</code> - Username do usuário</li>
                <li><code className="text-[#666666]">{'{serverName}'}</code> - Nome do servidor</li>
                <li><code className="text-[#666666]">{'{memberCount}'}</code> - Total de membros</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Configuração de Embed */}
      {config.tipo === 'embed' && (
        <div className="minimal-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#ffffff] mb-4">Configuração de Embed</h3>
          
          {/* Cor da Embed */}
          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Cor da Embed</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.embedColor || '#5865F2'}
                onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                className="h-10 w-20 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={config.embedColor || '#5865F2'}
                onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                placeholder="#5865F2"
                className="flex-1 minimal-input font-mono text-sm"
              />
            </div>
          </div>

          {/* Autor */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#ffffff]">Autor</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.embedAuthorName || ''}
                onChange={(e) => setConfig({ ...config, embedAuthorName: e.target.value })}
                placeholder="Nome"
                className="flex-1 minimal-input"
              />
              <input
                type="url"
                value={config.embedAuthorIcon || ''}
                onChange={(e) => setConfig({ ...config, embedAuthorIcon: e.target.value })}
                placeholder="URL do Ícone"
                className="flex-1 minimal-input"
              />
            </div>
            <input
              type="url"
              value={config.embedAuthorUrl || ''}
              onChange={(e) => setConfig({ ...config, embedAuthorUrl: e.target.value })}
              placeholder="Link (opcional)"
              className="w-full minimal-input"
            />
          </div>

          {/* Título */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#ffffff]">Título</label>
            <input
              type="text"
              value={config.embedTitle || ''}
              onChange={(e) => setConfig({ ...config, embedTitle: e.target.value })}
              placeholder="Escreva um título..."
              className="w-full minimal-input"
            />
            <input
              type="url"
              value={config.embedTitleUrl || ''}
              onChange={(e) => setConfig({ ...config, embedTitleUrl: e.target.value })}
              placeholder="Link (opcional)"
              className="w-full minimal-input"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Descrição</label>
            <textarea
              value={config.embedDescription || ''}
              onChange={(e) => setConfig({ ...config, embedDescription: e.target.value })}
              placeholder="Escreva uma descrição..."
              rows={4}
              className="minimal-input w-full"
            />
            <div className="mt-2 p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
              <p className="text-xs font-medium text-[#ffffff] mb-2">Variáveis disponíveis:</p>
              <ul className="text-xs text-[#999999] space-y-1">
                <li><code className="text-[#666666]">{'{user}'}</code> - Menção do usuário</li>
                <li><code className="text-[#666666]">{'{user.name}'}</code> - Nome global do usuário</li>
                <li><code className="text-[#666666]">{'{user.username}'}</code> - Username do usuário</li>
                <li><code className="text-[#666666]">{'{serverName}'}</code> - Nome do servidor</li>
                <li><code className="text-[#666666]">{'{memberCount}'}</code> - Total de membros</li>
              </ul>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Fields (Campos)</label>
            <div className="space-y-3">
              {config.embedFields?.map((field, index) => (
                <div key={index} className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => {
                        const fields = [...(config.embedFields || [])];
                        fields[index].name = e.target.value;
                        setConfig({ ...config, embedFields: fields });
                      }}
                      placeholder="Nome do campo"
                      className="flex-1 minimal-input text-sm"
                    />
                    <button
                      onClick={() => removerField(index)}
                      className="p-2 text-[#ff6b6b] hover:bg-[#1a1a1a] rounded-lg transition-colors"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <textarea
                    value={field.value}
                    onChange={(e) => {
                      const fields = [...(config.embedFields || [])];
                      fields[index].value = e.target.value;
                      setConfig({ ...config, embedFields: fields });
                    }}
                    placeholder="Descrição do campo"
                    rows={2}
                    className="w-full minimal-input text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => {
                        const fields = [...(config.embedFields || [])];
                        fields[index].inline = e.target.checked;
                        setConfig({ ...config, embedFields: fields });
                      }}
                      className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0f0f0f] checked:bg-[#ffffff] checked:border-[#ffffff]"
                    />
                    <label className="text-xs text-[#999999]">Inline</label>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="text"
                    value={novoField.name}
                    onChange={(e) => setNovoField({ ...novoField, name: e.target.value })}
                    placeholder="Nome do campo"
                    className="flex-1 minimal-input text-sm"
                  />
                  <button
                    onClick={adicionarField}
                    className="p-2 bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <textarea
                  value={novoField.value}
                  onChange={(e) => setNovoField({ ...novoField, value: e.target.value })}
                  placeholder="Descrição do campo"
                  rows={2}
                  className="w-full minimal-input text-sm mb-2"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={novoField.inline}
                    onChange={(e) => setNovoField({ ...novoField, inline: e.target.checked })}
                    className="w-4 h-4 rounded border-[#1a1a1a] bg-[#0f0f0f] checked:bg-[#ffffff] checked:border-[#ffffff]"
                  />
                  <label className="text-xs text-[#999999]">Inline</label>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail e Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Thumbnail (URL)</label>
              <input
                type="url"
                value={config.embedThumbnail || ''}
                onChange={(e) => setConfig({ ...config, embedThumbnail: e.target.value })}
                placeholder="https://..."
                className="w-full minimal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Imagem (URL)</label>
              <input
                type="url"
                value={config.embedImage || ''}
                onChange={(e) => setConfig({ ...config, embedImage: e.target.value })}
                placeholder="https://..."
                className="w-full minimal-input"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#ffffff]">Footer</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.embedFooter || ''}
                onChange={(e) => setConfig({ ...config, embedFooter: e.target.value })}
                placeholder="Texto do footer (deixe vazio para usar nome do servidor)"
                className="flex-1 minimal-input"
              />
              <input
                type="url"
                value={config.embedFooterIcon || ''}
                onChange={(e) => setConfig({ ...config, embedFooterIcon: e.target.value })}
                placeholder="URL do ícone (deixe vazio para usar ícone do servidor)"
                className="flex-1 minimal-input"
              />
            </div>
            <p className="text-xs text-gray-400">Por padrão, usa nome do servidor + ícone do servidor</p>
          </div>

          {/* Botão na Embed */}
          <div className="border-t border-[#1a1a1a] pt-4 mt-4">
            <h4 className="text-sm font-semibold text-[#ffffff] mb-3">Botão (Opcional)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#ffffff] mb-2">Nome do Botão</label>
                <input
                  type="text"
                  value={config.containerBotaoNome || ''}
                  onChange={(e) => setConfig({ ...config, containerBotaoNome: e.target.value })}
                  placeholder="Ex: Entrar"
                  className="w-full minimal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#ffffff] mb-2">Emoji do Botão</label>
                <input
                  type="text"
                  value={config.containerBotaoEmoji || ''}
                  onChange={(e) => setConfig({ ...config, containerBotaoEmoji: e.target.value })}
                  placeholder="🎉"
                  className="w-full minimal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#ffffff] mb-2">Cor do Botão</label>
                <select
                  value={config.containerBotaoCor || 'Primary'}
                  onChange={(e) => setConfig({ ...config, containerBotaoCor: e.target.value })}
                  className="w-full minimal-input"
                >
                  <option value="Primary">Azul (Primary)</option>
                  <option value="Secondary">Cinza (Secondary)</option>
                  <option value="Success">Verde (Success)</option>
                  <option value="Danger">Vermelho (Danger)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#ffffff] mb-2">Ação do Botão</label>
                <select
                  value={config.containerBotaoAcao || 'nenhuma'}
                  onChange={(e) => setConfig({ ...config, containerBotaoAcao: e.target.value as any, containerBotaoAcaoValor: '' })}
                  className="w-full minimal-input"
                >
                  <option value="nenhuma">Nenhuma</option>
                  <option value="redirecionar_canal">Redirecionar para Canal</option>
                  <option value="redirecionar_url">Redirecionar para URL</option>
                </select>
              </div>
              <div>
                {config.containerBotaoAcao === 'redirecionar_canal' && (
                  <>
                    <label className="block text-sm font-medium text-[#ffffff] mb-2">ID do Canal</label>
                    <input
                      type="text"
                      value={config.containerBotaoAcaoValor || ''}
                      onChange={(e) => setConfig({ ...config, containerBotaoAcaoValor: e.target.value })}
                      placeholder="1234567890123456789"
                      className="w-full minimal-input"
                    />
                    <p className="text-xs text-gray-400 mt-1">Cole o ID do canal de destino</p>
                  </>
                )}
                {config.containerBotaoAcao === 'redirecionar_url' && (
                  <>
                    <label className="block text-sm font-medium text-[#ffffff] mb-2">URL</label>
                    <input
                      type="url"
                      value={config.containerBotaoAcaoValor || ''}
                      onChange={(e) => setConfig({ ...config, containerBotaoAcaoValor: e.target.value })}
                      placeholder="https://..."
                      className="w-full minimal-input"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuração de Container */}
      {config.tipo === 'container' && (
        <div className="minimal-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#ffffff] mb-4">Configuração de Container</h3>
          
          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Título</label>
            <input
              type="text"
              value={config.containerTitulo || ''}
              onChange={(e) => setConfig({ ...config, containerTitulo: e.target.value })}
              placeholder="Título do container"
              className="w-full minimal-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Descrição</label>
            <textarea
              value={config.containerDescricao || ''}
              onChange={(e) => setConfig({ ...config, containerDescricao: e.target.value })}
              placeholder="Descrição principal"
              rows={3}
              className="w-full minimal-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ffffff] mb-2">Sub-descrição</label>
            <textarea
              value={config.containerSubDescricao || ''}
              onChange={(e) => setConfig({ ...config, containerSubDescricao: e.target.value })}
              placeholder="Sub-descrição (opcional)"
              rows={2}
              className="w-full minimal-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Banner (URL)</label>
              <input
                type="url"
                value={config.containerBanner || ''}
                onChange={(e) => setConfig({ ...config, containerBanner: e.target.value })}
                placeholder="https://..."
                className="w-full minimal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Ícone (URL)</label>
              <input
                type="url"
                value={config.containerIcon || ''}
                onChange={(e) => setConfig({ ...config, containerIcon: e.target.value })}
                placeholder="https://..."
                className="w-full minimal-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Nome do Botão</label>
              <input
                type="text"
                value={config.containerBotaoNome || ''}
                onChange={(e) => setConfig({ ...config, containerBotaoNome: e.target.value })}
                placeholder="Ex: Entrar"
                className="w-full minimal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Emoji do Botão</label>
              <input
                type="text"
                value={config.containerBotaoEmoji || ''}
                onChange={(e) => setConfig({ ...config, containerBotaoEmoji: e.target.value })}
                placeholder="🎉"
                className="w-full minimal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Cor do Botão</label>
              <select
                value={config.containerBotaoCor || 'Primary'}
                onChange={(e) => setConfig({ ...config, containerBotaoCor: e.target.value })}
                className="w-full minimal-input"
              >
                <option value="Primary">Azul (Primary)</option>
                <option value="Secondary">Cinza (Secondary)</option>
                <option value="Success">Verde (Success)</option>
                <option value="Danger">Vermelho (Danger)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#ffffff] mb-2">Ação do Botão</label>
              <select
                value={config.containerBotaoAcao || 'nenhuma'}
                onChange={(e) => setConfig({ ...config, containerBotaoAcao: e.target.value as any, containerBotaoAcaoValor: '' })}
                className="w-full minimal-input"
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="redirecionar_canal">Redirecionar para Canal</option>
                <option value="redirecionar_url">Redirecionar para URL</option>
              </select>
            </div>
            <div>
              {config.containerBotaoAcao === 'redirecionar_canal' && (
                <>
                  <label className="block text-sm font-medium text-[#ffffff] mb-2">ID do Canal</label>
                  <input
                    type="text"
                    value={config.containerBotaoAcaoValor || ''}
                    onChange={(e) => setConfig({ ...config, containerBotaoAcaoValor: e.target.value })}
                    placeholder="1234567890123456789"
                    className="w-full minimal-input"
                  />
                  <p className="text-xs text-gray-400 mt-1">Cole o ID do canal de destino</p>
                </>
              )}
              {config.containerBotaoAcao === 'redirecionar_url' && (
                <>
                  <label className="block text-sm font-medium text-[#ffffff] mb-2">URL</label>
                  <input
                    type="url"
                    value={config.containerBotaoAcaoValor || ''}
                    onChange={(e) => setConfig({ ...config, containerBotaoAcaoValor: e.target.value })}
                    placeholder="https://..."
                    className="w-full minimal-input"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5] rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} strokeWidth={1.5} />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check size={16} strokeWidth={1.5} />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

