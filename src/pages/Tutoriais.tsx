import React from 'react';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Tutoriais() {
  // Sem tutoriais por enquanto
  const tutorials: any[] = [];
  const filteredTutorials: any[] = [];

  return (
    <>
      <Header onOpenSidebar={undefined} showSidebarButton={undefined} />
      <div style={{ height: 80 }} />
      <main className="bg-[#000000] text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Como Configurar Dream Pro
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto">
              Aprenda passo a passo as Aplicações da Dream Applications	
            </p>
          </div>

          {/* Empty State - Sem tutoriais por enquanto */}
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-[#0a0a0a] border border-[#1a1a1a] rounded-full flex items-center justify-center">
                  <Search className="text-gray-400" size={40} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Sem tutoriais por enquanto
              </h2>
              <p className="text-gray-400 text-lg">
                Estamos preparando conteúdo incrível para você. Em breve teremos tutoriais disponíveis!!
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

