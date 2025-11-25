import React from 'react';
import { Shield, Clock } from 'lucide-react';

interface ProtecoesSectionProps {
  application: any;
  botApiUrl: string;
}

export default function ProtecoesSection({ application, botApiUrl }: ProtecoesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Proteção</h1>
        <p className="text-[#999999] text-base sm:text-lg">Configure as proteções da aplicação contra raids e abusos</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
          <Clock className="text-[#666666]" size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Em Breve</h2>
        <p className="text-[#999999] text-sm max-w-md">
          Esta área está sendo desenvolvida e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
