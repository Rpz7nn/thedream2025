import React from 'react';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'scale-in' | 'text-reveal';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  children, 
  delay = 0, 
  className = '', 
  animation = 'text-reveal' 
}) => {
  const delayClass = delay > 0 ? `text-reveal-delay-${Math.ceil(delay / 100)}` : '';
  
  return (
    <div 
      className={`${animation} ${delayClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedText;
