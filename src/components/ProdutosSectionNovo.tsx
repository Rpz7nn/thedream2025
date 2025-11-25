import React from 'react';
import { Plus, Edit, Trash2, XCircle, Package, Zap } from 'lucide-react';
import CamposProduto from './CamposProduto';
import { useI18n } from '@/i18n';

interface Campo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoAnterior?: number;
  estoque: string[];
  emoji?: string;
}

interface Cupom {
  id: string;
  codigo: string;
  desconto: number;
  maximoUso: number;
  cargosPermitidos: string[];
  cargosNegados: string[];
  ativo: boolean;
}

interface Extras {
  requerCargo?: string; // ID do cargo requerido
  quantidadeMinima?: number;
  quantidadeMaxima?: number;
  cargoAdicionar?: string; // ID do cargo para adicionar após compra
  cargoRemover?: string; // ID do cargo para remover após compra
}

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  useContainers: boolean;
  icon?: string;
  banner?: string;
  channelId?: string;
  embedColor?: string;
  embedFooter?: string;
  tipoEntrega: 'automatica' | 'manual';
  campos: Campo[];
  cupons?: Cupom[];
  extras?: Extras;
  selectPromptText?: string;
  selectPlaceholder?: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id?: string;
  guild_id?: string;
  configuration?: {
    clientId?: string;
    configured?: boolean;
  };
  client_id?: string;
}

interface ProdutosSectionProps {
  produtos: Produto[];
  produtosLoading: boolean;
  produtoNome: string;
  setProdutoNome: (nome: string) => void;
  produtoDescricao: string;
  setProdutoDescricao: (descricao: string) => void;
  produtoDestaques: string;
  setProdutoDestaques: (destaques: string) => void;
  produtoUseContainers: boolean;
  setProdutoUseContainers: (use: boolean) => void;
  produtoTemplateType: 'embed' | 'container';
  setProdutoTemplateType: (type: 'embed' | 'container') => void;
  produtoIcon: string;
  setProdutoIcon: (icon: string) => void;
  produtoBanner: string;
  setProdutoBanner: (banner: string) => void;
  produtoChannelId: string;
  setProdutoChannelId: (channelId: string) => void;
  produtoCorEmbed: string;
  setProdutoCorEmbed: (cor: string) => void;
  produtoButtonLabel: string;
  setProdutoButtonLabel: (label: string) => void;
  produtoButtonEmoji: string;
  setProdutoButtonEmoji: (emoji: string) => void;
  produtoCorButton: string;
  setProdutoCorButton: (cor: string) => void;
  produtoCampos: Campo[];
  setProdutoCampos: (campos: Campo[]) => void;
  produtoCupons: Cupom[];
  setProdutoCupons: (cupons: Cupom[]) => void;
  produtoExtras: Extras;
  setProdutoExtras: (extras: Extras) => void;
  tipoEntrega: 'automatica' | 'manual';
  setTipoEntrega: (tipo: 'automatica' | 'manual') => void;
  abaAtiva: 'geral' | 'campos' | 'cupons' | 'extras';
  setAbaAtiva: (aba: 'geral' | 'campos' | 'cupons' | 'extras') => void;
  editandoProduto: string | null;
  hasUnsavedChanges: boolean;
  guildChannels: Array<{ id: string; name: string; type: number }>;
  application?: Application | null;
  botApiUrl?: string;
  handleCriarProduto: () => void;
  handleEnviarProduto: () => Promise<void>;
  handleDeletarProduto: (id: string) => void;
  handleEditarProduto: (produto: Produto) => void;
  limparFormulario: () => void;
}

export default function ProdutosSection({
  produtos,
  produtosLoading,
  produtoNome,
  setProdutoNome,
  produtoDescricao,
  setProdutoDescricao,
  produtoDestaques,
  setProdutoDestaques,
  produtoUseContainers,
  setProdutoUseContainers,
  produtoTemplateType,
  setProdutoTemplateType,
  produtoIcon,
  setProdutoIcon,
  produtoBanner,
  setProdutoBanner,
  produtoChannelId,
  setProdutoChannelId,
  produtoCorEmbed,
  setProdutoCorEmbed,
  produtoButtonLabel,
  setProdutoButtonLabel,
  produtoButtonEmoji,
  setProdutoButtonEmoji,
  produtoCorButton,
  setProdutoCorButton,
  produtoCampos,
  setProdutoCampos,
  produtoCupons,
  setProdutoCupons,
  produtoExtras,
  setProdutoExtras,
  tipoEntrega,
  setTipoEntrega,
  abaAtiva,
  setAbaAtiva,
  editandoProduto,
  hasUnsavedChanges,
  guildChannels,
  application,
  botApiUrl,
  handleCriarProduto,
  handleEnviarProduto,
  handleDeletarProduto,
  handleEditarProduto,
  limparFormulario,
}: ProdutosSectionProps) {
  const { t } = useI18n();
  const [guildRoles, setGuildRoles] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loadingRoles, setLoadingRoles] = React.useState(false);

  // Buscar cargos do servidor
  React.useEffect(() => {
    const fetchGuildRoles = async () => {
      if (!application?.guild_id || !botApiUrl) return;
      
      setLoadingRoles(true);
      try {
        const botId = application?.configuration?.clientId || application?.client_id;
        if (!botId) return;
        
        const response = await fetch(`${botApiUrl}/definicoes/cargos/${application.guild_id}?bot_id=${botId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.roles) {
            setGuildRoles(data.roles);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar cargos:', error);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (abaAtiva === 'extras') {
      fetchGuildRoles();
    }
  }, [application?.guild_id, application?.configuration?.clientId, application?.client_id, botApiUrl, abaAtiva]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Produtos</h2>
        <p className="text-[#999999] text-base sm:text-lg">Gerencie os produtos da sua loja</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Produtos */}
        <div className="lg:col-span-1">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {/* Header fixo */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#1a1a1a] flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">{t('products.myProducts')}</h3>
              {editandoProduto && (
                <button
                  onClick={limparFormulario}
                  className="px-2 py-1 text-xs bg-[#111] border border-[#1a1a1a] text-white rounded-lg hover:border-[#2a2a2a] transition-colors"
                >
                  {t('products.new')}
                </button>
              )}
            </div>

            {/* Área com scroll */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
              {produtosLoading ? (
                <div className="text-center py-12 text-[#999999]">{t('products.loading')}</div>
              ) : produtos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto mb-4 text-[#666666]" size={40} strokeWidth={1.5} />
                  <p className="text-[#999999] text-sm font-medium">{t('products.none')}</p>
                  <p className="text-[#666666] text-xs mt-1">{t('products.noneSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {produtos.map(produto => (
                    <div
                      key={produto.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        editandoProduto === produto.id
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-[#111] border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#151515]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {produto.icon ? (
                          <img
                            src={produto.icon}
                            alt={produto.nome}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                            <Package size={18} className={editandoProduto === produto.id ? 'text-black' : 'text-[#666666]'} strokeWidth={1.5} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-sm">{produto.nome}</p>
                          <p className={`text-xs mt-0.5 ${editandoProduto === produto.id ? 'opacity-70' : 'text-[#666666]'}`}>
                            {produto.campos.length} {t('products.fields')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEditarProduto(produto)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            editandoProduto === produto.id
                              ? 'bg-black text-white hover:bg-gray-900'
                              : 'bg-[#0a0a0a] hover:bg-black text-white'
                          }`}
                        >
                          <Edit size={14} className="inline mr-1" />
                          {t('products.edit')}
                        </button>
                        <button
                          onClick={() => handleDeletarProduto(produto.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer com contador */}
            {produtos.length > 0 && (
              <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a] flex-shrink-0">
                <p className="text-xs text-gray-500 text-center">
                  {produtos.length} {t('products.registered')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulário */}
        <div className="lg:col-span-3">
          {/* Abas - Estilo do Dashboard */}
          <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2 mb-6">
            <button
              onClick={() => setAbaAtiva('geral')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                abaAtiva === 'geral'
                  ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              {t('products.tabs.general')}
            </button>
            <button
              onClick={() => setAbaAtiva('campos')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                abaAtiva === 'campos'
                  ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              {t('products.tabs.fields')} ({produtoCampos.length})
            </button>
            <button
              onClick={() => setAbaAtiva('cupons')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                abaAtiva === 'cupons'
                  ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              {t('products.tabs.coupons')} ({produtoCupons.length})
            </button>
            <button
              onClick={() => setAbaAtiva('extras')}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                abaAtiva === 'extras'
                  ? 'bg-[#0f0f0f] text-white border border-[#1a1a1a]'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              {t('products.tabs.extras')}
            </button>
          </div>

          {/* Conteúdo da Aba */}
          {abaAtiva === 'geral' && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {editandoProduto ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <p className="text-gray-500 text-sm">Configure as informações básicas</p>
                </div>
                <div className="flex gap-3">
                  {/* Botão Enviar/Atualizar Produto no Discord */}
                  {editandoProduto && (
                    <button
                      onClick={handleEnviarProduto}
                      disabled={produtosLoading || !produtoNome.trim() || !produtoChannelId || produtoCampos.length === 0}
                      className="px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-200 text-sm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                      Enviar/Atualizar
                    </button>
                  )}
                  
                  {/* Botão Salvar/Criar */}
                  <button
                    onClick={() => {
                      console.log('🖱️ BOTÃO SALVAR CLICADO!');
                      console.log('🖱️ produtoTemplateType no momento do clique:', produtoTemplateType);
                      handleCriarProduto();
                    }}
                    disabled={produtosLoading || !produtoNome.trim() || !produtoChannelId || produtoCampos.length === 0 || (editandoProduto && !hasUnsavedChanges)}
                    className="px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-200 text-sm"
                  >
                    {produtosLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        {editandoProduto ? 'Salvar' : 'Criar Produto'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Nome do Produto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Conta Netflix Premium"
                    value={produtoNome}
                    onChange={(e) => setProdutoNome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-[#666666] focus:outline-none focus:border-[#2a2a2a]"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
                  <textarea
                    placeholder="Descrição do produto..."
                    value={produtoDescricao}
                    onChange={(e) => setProdutoDescricao(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-[#666666] focus:outline-none focus:border-[#2a2a2a] resize-none"
                  />
                </div>

                {/* Destaques do Produto */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Destaques do Produto</label>
                  <textarea
                    placeholder="Ex: • Entrega monitorada e suporte imediato&#10;• Garantia Dream Shield em todas as compras&#10;• Checkout otimizado com pagamento seguro"
                    value={produtoDestaques}
                    onChange={(e) => setProdutoDestaques(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-[#666666] focus:outline-none focus:border-[#2a2a2a] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Estes destaques aparecerão no container do carrinho. Use uma linha por destaque, começando com "• " (opcional).
                  </p>
                </div>

                {/* Canal - Select com canais do servidor */}
                <div>
                  <label className="text-xs text-[#999999] mb-1.5 block font-medium">
                    Canal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={produtoChannelId}
                    onChange={(e) => setProdutoChannelId(e.target.value)}
                    disabled={!guildChannels || guildChannels.length === 0}
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione um canal</option>
                    {guildChannels && guildChannels.length > 0 ? (
                      guildChannels
                      .filter(channel => {
                        // Filtrar apenas canais de texto (type 0) e de anúncios (type 5)
                        // Excluir categorias (type 4), voz (type 2), etc
                        return channel.type === 0 || channel.type === 5;
                      })
                      .sort((a, b) => {
                        // Ordenar por posição, depois por nome
                        const posA = (a as any).position ?? 0;
                        const posB = (b as any).position ?? 0;
                        if (posA !== posB) {
                          return posA - posB;
                        }
                        return a.name.localeCompare(b.name);
                      })
                      .map(channel => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                        ))
                    ) : null}
                  </select>
                  {(!guildChannels || guildChannels.length === 0) && (
                    <p className="text-xs text-[#999999] mt-1.5">
                      Carregando canais...
                    </p>
                  )}
                </div>

                {/* Tipo de Entrega */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Tipo de Entrega</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoEntrega('automatica')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        tipoEntrega === 'automatica'
                          ? 'border-white bg-white/5'
                          : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                      }`}
                    >
                      <Zap size={24} className={tipoEntrega === 'automatica' ? 'text-white' : 'text-gray-600'} />
                      <p className="text-white font-semibold mt-2">Automática</p>
                      <p className="text-gray-500 text-xs mt-1">Entrega instantânea via bot</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoEntrega('manual')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        tipoEntrega === 'manual'
                          ? 'border-white bg-white/5'
                          : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                      }`}
                    >
                      <Package size={24} className={tipoEntrega === 'manual' ? 'text-white' : 'text-gray-600'} />
                      <p className="text-white font-semibold mt-2">Manual</p>
                      <p className="text-gray-500 text-xs mt-1">Você envia manualmente</p>
                    </button>
                  </div>
                </div>

                {/* Cor da Embed */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Cor da Embed</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={produtoCorEmbed}
                      onChange={(e) => setProdutoCorEmbed(e.target.value)}
                      className="h-12 w-20 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={produtoCorEmbed}
                      onChange={(e) => setProdutoCorEmbed(e.target.value)}
                      placeholder="#FFD700"
                      className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a] font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Configuração do Botão de Compra */}
                <div className="p-4 bg-[#111] border border-[#1a1a1a] rounded-xl space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Configuração do Botão de Compra</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Essas configurações serão usadas no botão que aparece na embed/container. Se houver múltiplos campos, o botão mostrará um SelectMenu ao ser clicado.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Nome do Botão <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Comprar Agora"
                        value={produtoButtonLabel}
                        onChange={(e) => setProdutoButtonLabel(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Texto que aparecerá no botão de compra
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Emoji do Botão (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: <:carrinho:1234567890> ou 🛒"
                        value={produtoButtonEmoji}
                        onChange={(e) => setProdutoButtonEmoji(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Emoji que aparecerá no botão de compra
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cor do Botão */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Cor do Botão</label>
                  <select
                    value={produtoCorButton}
                    onChange={(e) => setProdutoCorButton(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white focus:outline-none focus:border-[#2a2a2a]"
                  >
                    <option value="Primary">Azul (Primary)</option>
                    <option value="Secondary">Cinza (Secondary)</option>
                    <option value="Success">Verde (Success)</option>
                    <option value="Danger">Vermelho (Danger)</option>
                  </select>
                </div>

                {/* Tipo de Template do Produto */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">Tipo de Template do Produto</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Tradicional (Embed) */}
                    <label className={`flex flex-col gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${produtoTemplateType === 'embed' ? 'border-[#00ffbf] bg-[#00ffbf]/5' : 'border-[#1a1a1a] bg-[#0b0b0b] hover:border-[#2a2a2a]'}`}>
                      <input
                        type="radio"
                        name="displayFormat"
                        checked={produtoTemplateType === 'embed'}
                        onChange={() => {
                          console.log('📝 Template alterado para: embed');
                          setProdutoTemplateType('embed');
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${produtoTemplateType === 'embed' ? 'border-[#00ffbf]' : 'border-[#666]'}`}>
                          {produtoTemplateType === 'embed' && <div className="w-2 h-2 rounded-full bg-[#00ffbf]" />}
                        </div>
                        <p className="text-white font-medium text-sm">Tradicional (Embed)</p>
                      </div>
                      <p className="text-gray-500 text-xs">Embed clássico do Discord</p>
                    </label>

                    {/* Container v2 */}
                    <label className={`flex flex-col gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${produtoTemplateType === 'container' ? 'border-[#00ffbf] bg-[#00ffbf]/5' : 'border-[#1a1a1a] bg-[#0b0b0b] hover:border-[#2a2a2a]'}`}>
                      <input
                        type="radio"
                        name="displayFormat"
                        checked={produtoTemplateType === 'container'}
                        onChange={() => {
                          console.log('📝 Template alterado para: container');
                          setProdutoTemplateType('container');
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${produtoTemplateType === 'container' ? 'border-[#00ffbf]' : 'border-[#666]'}`}>
                          {produtoTemplateType === 'container' && <div className="w-2 h-2 rounded-full bg-[#00ffbf]" />}
                        </div>
                        <p className="text-white font-medium text-sm">Container v2</p>
                      </div>
                      <p className="text-gray-500 text-xs">Components v2 flexível</p>
                    </label>
                  </div>
                </div>

                {/* Ícone */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">URL do Ícone do Produto</label>
                  <input
                    type="text"
                    placeholder="Cole a URL da imagem aqui..."
                    value={produtoIcon}
                    onChange={(e) => setProdutoIcon(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg px-4 py-2 focus:border-[#00ffbf] focus:outline-none"
                  />
                  {produtoIcon && (
                    <div className="mt-2 relative inline-block">
                      <img src={produtoIcon} alt="Preview" className="max-h-24 object-contain" />
                      <button
                        onClick={() => setProdutoIcon('')}
                        className="absolute top-0 right-0 text-red-500 hover:text-red-400"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Banner */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">URL do Banner</label>
                  <input
                    type="text"
                    placeholder="Cole a URL da imagem aqui..."
                    value={produtoBanner}
                    onChange={(e) => setProdutoBanner(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg px-4 py-2 focus:border-[#00ffbf] focus:outline-none"
                  />
                  {produtoBanner && (
                    <div className="mt-2 relative inline-block">
                      <img src={produtoBanner} alt="Preview" className="max-h-32 object-contain" />
                      <button
                        onClick={() => setProdutoBanner('')}
                        className="absolute top-0 right-0 text-red-500 hover:text-red-400"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {abaAtiva === 'campos' && (
            <CamposProduto campos={produtoCampos} setCampos={setProdutoCampos} />
          )}
          
          {abaAtiva === 'cupons' && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Cupons</h3>
                  <p className="text-gray-500 text-sm">Gerencie cupons de desconto para este produto</p>
                </div>
                <button
                  onClick={() => {
                    const novoCupom: Cupom = {
                      id: Date.now().toString(),
                      codigo: '',
                      desconto: 0,
                      maximoUso: -1,
                      cargosPermitidos: [],
                      cargosNegados: [],
                      ativo: true,
                    };
                    setProdutoCupons([...produtoCupons, novoCupom]);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Adicionar Cupom
                </button>
              </div>
              
              <div className="space-y-4">
                {produtoCupons.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Nenhum cupom criado ainda</p>
                    <p className="text-xs text-gray-500 mt-2">Clique em "Adicionar Cupom" para começar</p>
                  </div>
                ) : (
                  produtoCupons.map((cupom, index) => (
                    <div key={cupom.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Cupom {index + 1}</h4>
                        <button
                          onClick={() => {
                            setProdutoCupons(produtoCupons.filter(c => c.id !== cupom.id));
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Código do Cupom *</label>
                          <input
                            type="text"
                            value={cupom.codigo}
                            onChange={(e) => {
                              const novosCupons = [...produtoCupons];
                              novosCupons[index].codigo = e.target.value.toUpperCase();
                              setProdutoCupons(novosCupons);
                            }}
                            placeholder="EX: PROMO10"
                            className="w-full px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Desconto (%) *</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cupom.desconto}
                            onChange={(e) => {
                              const novosCupons = [...produtoCupons];
                              novosCupons[index].desconto = Number(e.target.value);
                              setProdutoCupons(novosCupons);
                            }}
                            className="w-full px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Máximo de Uso</label>
                          <input
                            type="number"
                            min="-1"
                            value={cupom.maximoUso === -1 ? '' : cupom.maximoUso}
                            onChange={(e) => {
                              const novosCupons = [...produtoCupons];
                              novosCupons[index].maximoUso = e.target.value === '' ? -1 : Number(e.target.value);
                              setProdutoCupons(novosCupons);
                            }}
                            placeholder="Ilimitado (deixe vazio)"
                            className="w-full px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                          />
                          <p className="text-xs text-gray-500 mt-1">Deixe vazio para ilimitado</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cupom.ativo}
                              onChange={(e) => {
                                const novosCupons = [...produtoCupons];
                                novosCupons[index].ativo = e.target.checked;
                                setProdutoCupons(novosCupons);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-white">Ativo</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Cargos Permitidos (IDs)</label>
                          <input
                            type="text"
                            value={cupom.cargosPermitidos.join(', ')}
                            onChange={(e) => {
                              const novosCupons = [...produtoCupons];
                              novosCupons[index].cargosPermitidos = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setProdutoCupons(novosCupons);
                            }}
                            placeholder="123456789, 987654321"
                            className="w-full px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separe múltiplos IDs por vírgula</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-white mb-2 block">Cargos Negados (IDs)</label>
                          <input
                            type="text"
                            value={cupom.cargosNegados.join(', ')}
                            onChange={(e) => {
                              const novosCupons = [...produtoCupons];
                              novosCupons[index].cargosNegados = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setProdutoCupons(novosCupons);
                            }}
                            placeholder="123456789, 987654321"
                            className="w-full px-4 py-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separe múltiplos IDs por vírgula</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {abaAtiva === 'extras' && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Extras</h3>
                </div>
                <button
                  onClick={handleCriarProduto}
                  disabled={!produtoNome || produtoCampos.length === 0}
                  className="px-6 py-2.5 bg-[#ffffff] text-[#000000] rounded-lg font-medium hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Seção Condições */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Condições</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Requer Cargo</label>
                      <select
                        value={produtoExtras.requerCargo || ''}
                        onChange={(e) => {
                          setProdutoExtras({
                            ...produtoExtras,
                            requerCargo: e.target.value || undefined,
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                      >
                        <option value="">Nenhum</option>
                        {guildRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Quantidade Mínima</label>
                      <input
                        type="number"
                        min="0"
                        value={produtoExtras.quantidadeMinima || 0}
                        onChange={(e) => {
                          setProdutoExtras({
                            ...produtoExtras,
                            quantidadeMinima: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Quantidade Máxima</label>
                      <input
                        type="number"
                        min="0"
                        value={produtoExtras.quantidadeMaxima || 0}
                        onChange={(e) => {
                          setProdutoExtras({
                            ...produtoExtras,
                            quantidadeMaxima: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Cargos */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Cargos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Cargo para Adicionar</label>
                      <select
                        value={produtoExtras.cargoAdicionar || ''}
                        onChange={(e) => {
                          setProdutoExtras({
                            ...produtoExtras,
                            cargoAdicionar: e.target.value || undefined,
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                      >
                        <option value="">Nenhum</option>
                        {guildRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Cargo para Remover</label>
                      <select
                        value={produtoExtras.cargoRemover || ''}
                        onChange={(e) => {
                          setProdutoExtras({
                            ...produtoExtras,
                            cargoRemover: e.target.value || undefined,
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-[#0b0b0b] border border-[#1a1a1a] rounded-lg text-white text-sm focus:outline-none focus:border-[#2a2a2a]"
                      >
                        <option value="">Nenhum</option>
                        {guildRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#999999] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm text-[#999999]">
                      Os cargos serão adicionados/removidos automaticamente após a compra ser confirmada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

