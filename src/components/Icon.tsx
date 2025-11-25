import React, { useState } from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

// Mapeamento dos nomes esperados para os nomes reais dos arquivos
const iconMapping: Record<string, string> = {
  // SVGs que realmente existem
  'start': 'start',
  
  // SVGs que realmente existem (todos são brancos FFFFFF)
  'barcode-reader': 'barcode_reader_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'box-edit': 'box_edit_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'contactless-payment': 'contactless_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'credit-card-gear': 'credit_card_gear_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'handshake': 'handshake_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'leaderboard': 'leaderboard_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'loyalty-program': 'loyalty_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'monitoring-white': 'monitoring_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'owl': 'owl_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'payments': 'payments_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'public': 'public_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'rocket-launch': 'rocket_launch_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'shopping-mode': 'shoppingmode_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'tsunami': 'tsunami_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'wallet': 'wallet_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  'workspace-premium': 'workspace_premium_41dp_FFFFFF_FILL0_wght400_GRAD0_opsz40',
  
  // Mapeamentos para ícones que não existem - usar existentes como fallback
  'automation-gear': 'owl', // Usar coruja para automação
  'build-circle': 'workspace-premium', // Usar workspace para construção
  'cannabis-leaf': 'tsunami', // Usar tsunami para monitoramento
  'database-upload': 'payments', // Usar pagamentos para upload
  'gesture-control': 'handshake', // Usar handshake para gestos
  'monitoring-chart': 'monitoring-white', // Usar monitoring branco
  'precision-manufacturing': 'box-edit', // Usar box-edit para manufatura
  
  // Mapeamentos para ícones antigos que não existem mais
  'shield-security': 'owl',
  'server-security': 'monitoring-white',
  'access-control': 'handshake',
  'fraud-prevention': 'credit-card-gear',
  'automated-moderation': 'owl',
  'analytics-insights': 'leaderboard',
  'control-dashboard': 'workspace-premium',
  'stability-protection': 'box-edit',
  'management-simplified': 'payments',
  'comfort-user': 'handshake',
  'automation': 'owl',
  'automation-smart': 'owl',
  'flow-control': 'tsunami',
  'learn-automation': 'box-edit',
  'learn-stats': 'monitoring-white',
  'improve-business': 'workspace-premium'
};

const Icon: React.FC<IconProps> = ({ name, size = 28, className = '', animated = false }) => {
  const [imageError, setImageError] = useState(false);
  
  // Usa o mapeamento para encontrar o nome correto do arquivo
  let actualFileName = iconMapping[name] || name;
  
  // Se o mapeamento aponta para outro nome, resolve recursivamente
  while (iconMapping[actualFileName] && iconMapping[actualFileName] !== actualFileName) {
    actualFileName = iconMapping[actualFileName];
  }
  
  const iconPath = `/icons/${actualFileName}.svg`;
  
  // Fallback para quando o ícone não existir
  if (imageError) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-700 rounded-lg ${animated ? 'smooth-hover' : ''} ${className}`}
        style={{ width: size, height: size }}
        title={`Ícone ${name} não encontrado`}
      >
        <span className="text-white text-xs font-bold">?</span>
      </div>
    );
  }
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={iconPath} 
        alt={name}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default Icon;
