import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';

const LanguageSelector = () => {
  const { language, setLanguage } = useI18n();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleLanguage = () => {
    setIsAnimating(true);
    const newLanguage = language === 'pt' ? 'en' : 'pt';
    
    // Pequeno delay para animação suave
    setTimeout(() => {
      setLanguage(newLanguage);
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }, 50);
  };

  const flag = language === 'pt' ? '🇧🇷' : '🇺🇸';

  return (
    <button
      onClick={toggleLanguage}
      className={`
        flex items-center justify-center
        w-10 h-10
        rounded-lg
        transition-all duration-300 ease-in-out
        hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent
        active:scale-95
        ${isAnimating ? 'opacity-50 scale-90' : 'opacity-100 scale-100'}
      `}
      aria-label={language === 'pt' ? 'Switch to English' : 'Alternar para Português'}
      title={language === 'pt' ? 'Switch to English' : 'Alternar para Português'}
    >
      <span 
        className={`
          text-2xl
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}
        `}
        style={{ 
          filter: isAnimating ? 'blur(2px)' : 'blur(0px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {flag}
      </span>
    </button>
  );
};

export default LanguageSelector;

