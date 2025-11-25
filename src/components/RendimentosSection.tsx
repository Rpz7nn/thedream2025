import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getApiPath } from '@/utils/api';

interface RendimentosSectionProps {
  application: any;
  botApiUrl: string;
}

interface RendimentoStats {
  faturamentoTotal: string;
  totalVendas: number;
  totalProdutos: number;
  rendimentoMes: string;
}

interface Venda {
  id: string;
  pedido: string;
  produto: string;
  cliente: string;
  valor: number;
  data: string;
}

interface BestSeller {
  produto: string;
  quantidade: number;
  totalFaturamento: number;
  totalVendas: number;
}

interface RecentBuyer {
  userId: string;
  cliente: string;
  total: number;
  ultimaCompra: string;
  compras: Array<{
    produto: string;
    valor: number;
    data: string;
  }>;
}

export default function RendimentosSection({ application, botApiUrl }: RendimentosSectionProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RendimentoStats | null>(null);
  const [grafico, setGrafico] = useState<Array<{ mes: string; valor: number }>>([]);
  const [ultimasVendas, setUltimasVendas] = useState<Venda[]>([]);

  // New state and effect for detailed sales performance
  const [periodFilter, setPeriodFilter] = useState('7d'); // Default to last 7 days
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [recentBuyers, setRecentBuyers] = useState<RecentBuyer[]>([]);

  const periodOptions = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ];

  useEffect(() => {
    carregarRendimentos();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarRendimentos, 30000);
    return () => clearInterval(interval);
  }, [application?.guild_id]);

  const carregarRendimentos = async () => {
    try {
      setLoading(true);
      const guildId = application?.guild_id;
      
      if (!guildId) {
        setLoading(false);
        return;
      }

      const url = getApiPath(`/api/rendimentos?guild_id=${encodeURIComponent(guildId)}`);
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setGrafico(data.grafico || []);
          setUltimasVendas(data.ultimasVendas || []);
        }
      } else {
        console.error('Erro ao buscar rendimentos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch sales performance data
  const fetchSalesPerformance = async () => {
    try {
      const guildId = application?.guild_id;
      if (!guildId) return;

      const url = getApiPath(`/api/sales-performance?guild_id=${encodeURIComponent(guildId)}&period=${encodeURIComponent(periodFilter)}`);
      const response = await fetch(url, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBestSellers(data.bestSellers || []);
          setRecentBuyers(data.recentBuyers || []);
        }
      } else {
        console.error('Erro ao buscar desempenho de vendas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar desempenho de vendas:', error);
    }
  };

  useEffect(() => {
    fetchSalesPerformance();
  }, [periodFilter, application?.guild_id]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  // Formatar dados do gráfico para recharts
  const chartData = useMemo(() => {
    if (!grafico || grafico.length === 0) return [];
    
    return grafico.map(item => ({
      mes: item.mes,
      valor: typeof item.valor === 'string' ? parseFloat(item.valor) : item.valor,
      formatted: formatCurrency(item.valor)
    }));
  }, [grafico]);

  // Custom tooltip para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-md p-3 shadow-lg">
          <p className="text-xs text-[#999999] mb-1">{payload[0].payload.mes}</p>
          <p className="text-sm font-semibold text-[#ffffff]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a1a] border-t-[#ffffff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Rendimentos</h1>
        <p className="text-[#999999] text-base sm:text-lg">Acompanhe as finanças da sua aplicação</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Faturamento Total */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#999999]">Faturamento Total</h3>
            <DollarSign className="text-[#ffffff]" size={20} strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-[#ffffff] mb-1">
            {stats ? formatCurrency(stats.faturamentoTotal) : 'R$ 0,00'}
          </p>
          <p className="text-xs text-[#666666]">Total acumulado</p>
        </div>

        {/* Vendas */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#999999]">Vendas</h3>
            <ShoppingCart className="text-[#ffffff]" size={20} strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-[#ffffff] mb-1">
            {stats?.totalVendas || 0}
          </p>
          <p className="text-xs text-[#666666]">Total de transações</p>
        </div>

        {/* Produtos Criados */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#999999]">Produtos Criados</h3>
            <Package className="text-[#ffffff]" size={20} strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-[#ffffff] mb-1">
            {stats?.totalProdutos || 0}
          </p>
          <p className="text-xs text-[#666666]">Na loja</p>
        </div>
      </div>

      {/* Rendimento do Mês */}
      <div className="minimal-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#ffffff] mb-1">Rendimento do Mês</h3>
          <p className="text-sm text-[#999999]">Acompanhe o desempenho financeiro mensal</p>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#666666]">
            <BarChart3 size={40} className="mb-3 opacity-50" strokeWidth={1.5} />
            <p className="text-sm font-medium mb-1">Sem dados disponíveis</p>
            <p className="text-xs">Comece a vender para ver os dados aqui</p>
          </div>
        ) : (
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#1a1a1a" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="mes" 
                  stroke="#666666"
                  tick={{ fill: '#999999', fontSize: 12 }}
                  axisLine={{ stroke: '#1a1a1a' }}
                  tickLine={{ stroke: '#1a1a1a' }}
                />
                <YAxis 
                  stroke="#666666"
                  tick={{ fill: '#999999', fontSize: 12 }}
                  axisLine={{ stroke: '#1a1a1a' }}
                  tickLine={{ stroke: '#1a1a1a' }}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `R$ ${(value / 1000).toFixed(0)}k`;
                    }
                    return `R$ ${value}`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Desempenho de Vendas */}
      <div className="minimal-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#ffffff] mb-1">Desempenho de Vendas</h3>
            <p className="text-sm text-[#999999]">Produtos mais vendidos e compradores recentes</p>
          </div>
          <div className="flex items-center gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriodFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  periodFilter === option.value
                    ? 'bg-white text-black'
                    : 'bg-[#0f0f0f] text-[#999999] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Mais vendidos */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-white">Mais vendidos</h4>
                <p className="text-xs text-[#999999]">Top produtos no período selecionado</p>
              </div>
              <TrendingUp className="text-white" size={18} strokeWidth={1.5} />
            </div>
            {bestSellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 text-[#666666]">
                <AlertCircle size={32} className="mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium mb-1">Sem dados no período</p>
                <p className="text-xs">Nenhum produto vendido neste intervalo.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bestSellers.map((item, index) => {
                  const maxQuantity = bestSellers[0]?.quantidade || 1;
                  const progress = Math.max((item.quantidade / maxQuantity) * 100, 8);
                  return (
                    <div key={item.produto} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            #{index + 1} {item.produto}
                          </p>
                          <p className="text-xs text-[#999999]">
                            {item.quantidade} vendas · {formatCurrency(item.totalFaturamento)}
                          </p>
                        </div>
                        <span className="text-xs text-[#666666]">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimos compradores */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-white">Últimos compradores</h4>
                <p className="text-xs text-[#999999]">Quem comprou e o que levaram</p>
              </div>
              <ShoppingCart className="text-white" size={18} strokeWidth={1.5} />
            </div>
            {recentBuyers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 text-[#666666]">
                <AlertCircle size={32} className="mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium mb-1">Sem compras recentes</p>
                <p className="text-xs">Nenhum cliente registrado neste intervalo.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBuyers.map((buyer) => (
                  <div key={buyer.userId} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{buyer.cliente}</p>
                        <p className="text-xs text-[#999999]">
                          Última compra em {formatDateTime(buyer.ultimaCompra)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(buyer.total)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {buyer.compras.map((compra, idx) => (
                        <span
                          key={`${buyer.userId}-${idx}`}
                          className="px-3 py-1 bg-[#111111] border border-[#1f1f1f] text-xs text-[#cccccc] rounded-full"
                        >
                          {compra.produto} · {formatCurrency(compra.valor)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimas Vendas */}
      <div className="minimal-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Últimas vendas</h3>
            <p className="text-sm text-[#999999]">Pedidos confirmados recentemente</p>
          </div>
          <Package className="text-white" size={18} strokeWidth={1.5} />
        </div>

        {ultimasVendas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#666666]">
            <AlertCircle size={36} className="mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium mb-1">Nenhuma venda registrada</p>
            <p className="text-xs">Assim que novas vendas acontecerem, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#dddddd]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[#777777] border-b border-[#1a1a1a]">
                  <th className="py-3">Pedido</th>
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Produto</th>
                  <th className="py-3">Valor</th>
                  <th className="py-3 text-right">Data</th>
                </tr>
              </thead>
              <tbody>
                {ultimasVendas.map((venda) => (
                  <tr key={venda.id} className="border-b border-[#111111] last:border-none">
                    <td className="py-3 text-xs text-[#999999]">{venda.pedido}</td>
                    <td className="py-3 font-medium text-white">{venda.cliente}</td>
                    <td className="py-3 text-[#cccccc]">{venda.produto}</td>
                    <td className="py-3 text-white">{formatCurrency(venda.valor)}</td>
                    <td className="py-3 text-right text-[#bbbbbb]">{venda.data || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

