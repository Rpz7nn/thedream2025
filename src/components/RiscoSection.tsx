import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface RiscoSectionProps {
  application: any;
}

export default function RiscoSection({ application }: RiscoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Área de Risco</h2>
            <p className="text-sm text-gray-400">Ações perigosas que podem afetar sua aplicação</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
            <Clock className="text-[#666666]" size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Em Breve</h3>
          <p className="text-[#999999] text-sm max-w-md">
            Esta área está sendo desenvolvida e estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
