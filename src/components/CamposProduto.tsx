import React, { useState } from 'react';
import { Upload, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Campo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoAnterior?: number;
  estoque: string[];
  emoji?: string;
}

interface CamposProdutoProps {
  campos: Campo[];
  setCampos: (campos: Campo[]) => void;
}

export default function CamposProduto({ campos, setCampos }: CamposProdutoProps) {
  const [campoSelecionado, setCampoSelecionado] = useState<string | null>(null);
  const [modoEstoque, setModoEstoque] = useState<'txt' | 'fantasma' | 'manual'>('manual');
  const [estoqueTemp, setEstoqueTemp] = useState('');
  const [quantidadeFantasma, setQuantidadeFantasma] = useState('');
  const [valorFantasma, setValorFantasma] = useState('');

  const adicionarCampo = () => {
    const novoCampo: Campo = {
      id: Date.now().toString(),
      nome: '',
      descricao: '',
      preco: 0,
      estoque: [],
      emoji: ''
    };
    setCampos([...campos, novoCampo]);
    setCampoSelecionado(novoCampo.id);
  };

  const atualizarCampo = (id: string, dados: Partial<Campo>) => {
    setCampos(campos.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const removerCampo = (id: string) => {
    setCampos(campos.filter(c => c.id !== id));
    if (campoSelecionado === id) {
      setCampoSelecionado(null);
    }
  };

  const adicionarEstoqueTXT = (id: string, arquivo: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const conteudo = e.target?.result as string;
      const linhas = conteudo.split('\n').filter(l => l.trim() !== '');
      const campo = campos.find(c => c.id === id);
      if (campo) {
        atualizarCampo(id, { estoque: [...campo.estoque, ...linhas] });
      }
    };
    reader.readAsText(arquivo);
  };

  const adicionarEstoqueFantasma = (id: string) => {
    const qtd = parseInt(quantidadeFantasma);
    const valor = valorFantasma.trim();
    
    if (qtd > 0 && valor) {
      const campo = campos.find(c => c.id === id);
      if (campo) {
        const novoEstoque = Array(qtd).fill(valor);
        atualizarCampo(id, { estoque: [...campo.estoque, ...novoEstoque] });
        setQuantidadeFantasma('');
        setValorFantasma('');
      }
    }
  };

  const adicionarEstoqueManual = (id: string) => {
    if (estoqueTemp.trim()) {
      const campo = campos.find(c => c.id === id);
      if (campo) {
        atualizarCampo(id, { estoque: [...campo.estoque, estoqueTemp.trim()] });
        setEstoqueTemp('');
      }
    }
  };

  const removerEstoque = (campoId: string, index: number) => {
    const campo = campos.find(c => c.id === campoId);
    if (campo) {
      const novoEstoque = campo.estoque.filter((_, i) => i !== index);
      atualizarCampo(campoId, { estoque: novoEstoque });
    }
  };

  const campo = campos.find(c => c.id === campoSelecionado);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Campos */}
      <div className="lg:col-span-1">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Campos</h3>
            <button
              onClick={adicionarCampo}
              className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Novo Campo
            </button>
          </div>

          {campos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-2">Nenhum campo criado</p>
              <p className="text-gray-600 text-xs">Clique em "Novo Campo" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campos.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => setCampoSelecionado(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    campoSelecionado === c.id
                      ? 'bg-white text-black'
                      : 'bg-[#111] border border-[#1a1a1a] text-white hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {c.nome || `Campo #${index + 1}`}
                      </p>
                      <p className="text-xs opacity-70">
                        {c.estoque.length} em estoque | R$ {c.preco.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerCampo(c.id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor de Campo */}
      <div className="lg:col-span-2">
        {!campo ? (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#111] mb-4">
              <Edit2 size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Selecione um campo</h3>
            <p className="text-gray-500">Escolha um campo da lista para editar</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-1">Editar Campo</h3>
              <p className="text-gray-500">Configure o nome, preço e estoque deste campo</p>
            </div>

            {/* Nome do Campo e Emoji */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Nome do Campo *</label>
                <input
                  type="text"
                  placeholder="Ex: Conta VIP 2025"
                  value={campo.nome}
                  onChange={(e) => atualizarCampo(campo.id, { nome: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Emoji (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: <:vip:1234567890> ou 🛒"
                  value={campo.emoji || ''}
                  onChange={(e) => atualizarCampo(campo.id, { emoji: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                />
                <p className="text-xs text-gray-500 mt-2">
                   Emoji personalizado do servidor ou emoji padrão
                </p>
              </div>
            </div>


            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Descrição</label>
              <textarea
                placeholder="Descrição opcional do campo"
                value={campo.descricao}
                onChange={(e) => atualizarCampo(campo.id, { descricao: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a] resize-none"
              />
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Preço Atual (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={campo.preco || ''}
                  onChange={(e) => atualizarCampo(campo.id, { preco: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Preço Anterior (R$) <span className="text-gray-500">(Opcional)</span></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={campo.precoAnterior || ''}
                  onChange={(e) => atualizarCampo(campo.id, { precoAnterior: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                />
                <p className="text-xs text-gray-500 mt-2">
                   Para exibir desconto, defina um valor maior que o preço atual
                </p>
              </div>
            </div>

            {/* Estoque */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Estoque ({campo.estoque.length})</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModoEstoque('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      modoEstoque === 'manual'
                        ? 'bg-white text-black'
                        : 'bg-[#111] text-gray-400 hover:text-white'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setModoEstoque('fantasma')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      modoEstoque === 'fantasma'
                        ? 'bg-white text-black'
                        : 'bg-[#111] text-gray-400 hover:text-white'
                    }`}
                  >
                    Fantasma
                  </button>
                  <button
                    onClick={() => setModoEstoque('txt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      modoEstoque === 'txt'
                        ? 'bg-white text-black'
                        : 'bg-[#111] text-gray-400 hover:text-white'
                    }`}
                  >
                    .TXT
                  </button>
                </div>
              </div>

              {/* Modo Manual */}
              {modoEstoque === 'manual' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite o item do estoque"
                      value={estoqueTemp}
                      onChange={(e) => setEstoqueTemp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && adicionarEstoqueManual(campo.id)}
                      className="flex-1 px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                    />
                    <button
                      onClick={() => adicionarEstoqueManual(campo.id)}
                      className="px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Modo Fantasma */}
              {modoEstoque === 'fantasma' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Quantidade"
                      value={quantidadeFantasma}
                      onChange={(e) => setQuantidadeFantasma(e.target.value)}
                      className="px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                    />
                    <input
                      type="text"
                      placeholder="Valor do item"
                      value={valorFantasma}
                      onChange={(e) => setValorFantasma(e.target.value)}
                      className="px-4 py-3 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a]"
                    />
                  </div>
                  <button
                    onClick={() => adicionarEstoqueFantasma(campo.id)}
                    className="w-full px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Gerar Estoque Fantasma
                  </button>
                  <p className="text-xs text-gray-500">
                     Cria múltiplos itens idênticos no estoque
                  </p>
                </div>
              )}

              {/* Modo TXT */}
              {modoEstoque === 'txt' && (
                <div className="space-y-3">
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-[#1a1a1a] rounded-xl p-8 text-center hover:border-[#2a2a2a] transition-colors">
                      <Upload size={32} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-white text-sm mb-1">Clique para anexar arquivo .txt</p>
                      <p className="text-gray-500 text-xs">Cada linha será um item do estoque</p>
                    </div>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) adicionarEstoqueTXT(campo.id, file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Lista de Estoque */}
              {campo.estoque.length > 0 && (
                <div className="mt-4 max-h-64 overflow-y-auto space-y-2 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                  {campo.estoque.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-black border border-[#1a1a1a] rounded-lg px-3 py-2">
                      <span className="text-white text-sm font-mono truncate flex-1">{item}</span>
                      <button
                        onClick={() => removerEstoque(campo.id, index)}
                        className="ml-2 text-red-500 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

