import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#000000] border-t border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Logo e Informações à Esquerda */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Dream Applications Logo" className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">Dream</span>
                <span className="text-xl font-bold text-white">Applications</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">© 2025 Todos os direitos reservados</p>
            <p className="text-sm text-gray-400">CNPJ: 13.169.568/0001-82</p>
            {/* Ícones de Redes Sociais */}
            <div className="flex items-center gap-4 mt-2">
              <a 
                href="https://discord.gg/dreamapplications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Discord"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/dreamapplications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@DreamApplicationsofc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Coluna Informações */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white">Informações</h3>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/saiba-mais" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Saiba mais
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Termos de uso
              </Link>
              <Link 
                to="/plans" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Preços e planos
              </Link>
              <Link 
                to="/tutoriais" 
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Tutoriais
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </Link>
            </nav>
          </div>

          {/* Coluna Configurações */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white">Configurações</h3>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/dashboard" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Painel de controle
              </Link>
              <Link 
                to="/invoices" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Faturas
              </Link>
              <Link 
                to="/account" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Configurações
              </Link>
            </nav>
          </div>

          {/* Coluna Social */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white">Social</h3>
            <nav className="flex flex-col gap-3">
              <a 
                href="mailto:contato@dreamapplications.com.br" 
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                E-mail
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
              <a 
                href="https://discord.gg/dreamapplications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Discord
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
              <a 
                href="https://www.youtube.com/@DreamApplicationsofc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Youtube
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
