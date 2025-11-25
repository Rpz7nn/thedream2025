import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface FinancialData {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
  history: Array<{
    date: string;
    amount: number;
  }>;
}

export default function FinanceiroSection() {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      const response = await fetch(`/api/admin/financial?period=${period}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFinancialData(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados financeiros.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="minimal-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00ffbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Rendimentos e Financeiro</h1>
        <p className="text-sm text-[#999999]">Visão geral do faturamento de todos os bots</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="minimal-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Total Acumulado</p>
              <p className="text-2xl font-bold text-white">
                {financialData ? formatCurrency(financialData.total) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Hoje</p>
              <p className="text-2xl font-bold text-white">
                {financialData ? formatCurrency(financialData.daily) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Esta Semana</p>
              <p className="text-2xl font-bold text-white">
                {financialData ? formatCurrency(financialData.weekly) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="minimal-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Este Mês</p>
              <p className="text-2xl font-bold text-white">
                {financialData ? formatCurrency(financialData.monthly) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="minimal-card p-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#999999] mr-4">Período:</p>
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-black'
                  : 'bg-[#0f0f0f] text-[#999999] hover:text-white border border-[#1a1a1a]'
              }`}
            >
              {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <div className="minimal-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Histórico Financeiro</h2>
        {financialData && financialData.history.length > 0 ? (
          <div className="space-y-2">
            {financialData.history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {new Date(item.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-500">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 size={48} className="text-[#666666] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Nenhum dado disponível</p>
            <p className="text-sm text-[#666666]">Não há histórico financeiro para o período selecionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

