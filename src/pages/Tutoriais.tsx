import React, { useState } from 'react';
import { Search, Play, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Tutoriais() {
  const [searchQuery, setSearchQuery] = useState('');

  // Apenas 1 tutorial conforme solicitado
  const tutorials = [
    {
      id: 1,
      title: 'Como configurar o bot de vendas',
      description: 'Aprenda a configurar e personalizar seu bot de vendas em poucos minutos',
      youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
      thumbnail: '/tutorial-thumbnail.png', // Você pode adicionar uma imagem personalizada
      tags: ['bot de vendas', 'configuração', 'discord']
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Header onOpenSidebar={undefined} showSidebarButton={undefined} />
      <div style={{ height: 80 }} />
      <main className="bg-[#000000] text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tutoriais: Como Configurar Bot de Vendas Discord
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto">
              Aprenda passo a passo a configurar bot de vendas, verificação OAuth2, tickets com IA e automatizar completamente seu servidor Discord
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Buscar tutoriais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2a2a2a] text-base"
              />
            </div>
          </div>

          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-64 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] overflow-hidden">
                  {/* Background pattern com símbolos de dólar */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-green-500/20 text-4xl font-bold">$</div>
                    <div className="absolute top-20 right-20 text-green-500/20 text-3xl font-bold">$</div>
                    <div className="absolute bottom-16 left-20 text-green-500/20 text-2xl font-bold">$</div>
                    <div className="absolute bottom-10 right-16 text-green-500/20 text-3xl font-bold">$</div>
                  </div>

                  {/* Conteúdo central do thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-medium text-white/40 mb-1 uppercase tracking-wider">bot de vendas</div>
                      <div className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">Tutorial</div>
                      <div className="text-sm md:text-base font-semibold text-white/50 uppercase tracking-wider">DE CONFIGURAÇÃO</div>
                    </div>
                  </div>
                  
                  {/* Logo no canto superior direito */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded border border-white/20">
                      <span className="text-xs font-bold text-white">Dream</span>
                    </div>
                  </div>

                  {/* Ícone de dólar no canto inferior esquerdo */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center border-2 border-green-500/50 backdrop-blur-sm">
                      <span className="text-green-400 text-xl font-bold">$</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                    {tutorial.description}
                  </p>

                  {/* Action Button */}
                  <a
                    href={tutorial.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-3.5 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-green-500/20"
                  >
                    <Play size={18} strokeWidth={2.5} fill="currentColor" />
                    <span className="text-sm">Assistir tutorial no YouTube</span>
                  </a>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check size={14} strokeWidth={2} className="text-green-500" />
                      <span>100% Seguro</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check size={14} strokeWidth={2} className="text-green-500" />
                      <span>Discord bots</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTutorials.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Nenhum tutorial encontrado</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

