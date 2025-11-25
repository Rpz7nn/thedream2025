import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      <Header onOpenSidebar={undefined} showSidebarButton={false} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center">
          {/* Número 404 */}
          <div className="mb-8">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 leading-none">
              404
            </h1>
          </div>

          {/* Título e Descrição */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-[#999999] max-w-md mx-auto">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 group"
            >
              <Home size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              Voltar para Home
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 group"
            >
              <ArrowLeft size={20} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
              Voltar
            </button>
          </div>

          {/* Links úteis */}
          <div className="mt-16 pt-8 border-t border-[#1a1a1a]">
            <p className="text-sm text-[#666666] mb-4">Ou explore algumas páginas úteis:</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/applications')}
                className="text-sm text-[#999999] hover:text-white transition-colors"
              >
                Aplicações
              </button>
              <span className="text-[#333333]">•</span>
              <button
                onClick={() => navigate('/plans')}
                className="text-sm text-[#999999] hover:text-white transition-colors"
              >
                Planos
              </button>
              <span className="text-[#333333]">•</span>
              <button
                onClick={() => navigate('/tutoriais')}
                className="text-sm text-[#999999] hover:text-white transition-colors"
              >
                Tutoriais
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

