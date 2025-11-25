import { useState, useEffect, useRef } from "react";
import { MessageSquare, Copy, Trash2, Send, Users, Hash, UserMinus, Ban, X,Upload , UserX, LogOut, ChevronDown, CheckCircle, Zap, ChevronLeft, ChevronRight, Mail, Phone, Wrench, DollarSign, Monitor, Cloud, BarChart3, Smartphone, Cpu, Database, Lock, Globe2, Activity, Server, Shield, Globe, ShoppingCart, TrendingUp, ShieldCheck, UserCheck, MessageCircle as MessageCircleIcon, Sparkles, Code, Rocket, Brain, PiggyBank, Stars, ArrowRight, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import CategoryFilter from "@/components/CategoryFilter";
import Icon from "@/components/Icon";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useI18n } from "@/i18n";

// Componente separado para estatística animada
function StatsAnimated({ icon, value, label, visible }: { icon: React.ReactNode, value: number, label: string, visible: boolean }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    if (!visible || hasAnimated) return;
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1200 + Math.random() * 800; // 1.2s - 2s
    const increment = Math.ceil(end / (duration / 16));
    let current = start;
    const step = () => {
      current += increment;
      if (current > end) current = end;
      setCount(current);
      if (current < end) {
        requestAnimationFrame(step);
      } else {
        setHasAnimated(true);
      }
    };
    step();
    // eslint-disable-next-line
  }, [visible]);
  return (
    <div className="flex flex-col items-center bg-background/60 rounded-2xl shadow-lg py-8 px-4">
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-extrabold text-white mb-1">
        {count.toLocaleString('pt-BR')}
      </div>
      <div className="text-base text-gray-400 font-semibold text-center">{label}</div>
    </div>
  );
}

const Home = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  // const [activeCategory, setActiveCategory] = useState("Todas"); // Remover se só era usado para tools
  // Navegação para páginas de ferramentas
  const navigate = useNavigate();

  // Remover carrossel de tools
  // const [carouselIndex, setCarouselIndex] = useState(0);
  // const selectedTool = tools[carouselIndex];
  // const goToPrev = () => setCarouselIndex((prev) => prev === 0 ? tools.length - 1 : prev - 1);
  // const goToNext = () => setCarouselIndex((prev) => prev === tools.length - 1 ? 0 : prev + 1);

  // Carrossel para estatísticas
  const stats = [
    {
      icon: Icon,
      iconName: 'workspace-premium',
      value: '24',
      label: t('home.stats.availableTools'),
      color: 'text-primary',
    },
    {
      icon: Icon,
      iconName: 'public',
      value: 'Online',
      label: t('home.stats.systemOnline'),
      color: 'text-green-400',
    },
    {
      icon: Icon,
      iconName: 'tsunami',
      value: 'Seguro',
      label: t('home.stats.advancedProtection'),
      color: 'text-orange-400',
    },
  ];
  const [statsIndex, setStatsIndex] = useState(0);
  const goToPrevStats = () => setStatsIndex((prev) => prev === stats.length - 1 ? 0 : prev - 1);
  const goToNextStats = () => setStatsIndex((prev) => prev === stats.length - 1 ? 0 : prev + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatsIndex((prev) => prev === stats.length - 1 ? 0 : prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const centerPage = () => {
      if (window.innerWidth <= 640) {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        if (docWidth > winWidth) {
          const scrollTo = (docWidth - winWidth) / 2;
          document.documentElement.scrollLeft = scrollTo;
          document.body.scrollLeft = scrollTo;
        }
      }
    };
    centerPage();
    window.addEventListener('resize', centerPage);
    return () => window.removeEventListener('resize', centerPage);
  }, []);

  const { user } = useUser();
  const { subscription } = useSubscription();
  const [toolsAlreadyChosen, setToolsAlreadyChosen] = useState(false);
  useEffect(() => {
    if (!subscription || typeof subscription !== 'object' || subscription === null) return;
    const sub = subscription as { plan?: string; tools?: string };
    if (sub.plan === 'personalizado' || sub.plan === 'ticketsia') {
      try {
        const arr = JSON.parse(sub.tools || '[]');
        setToolsAlreadyChosen(Array.isArray(arr) && arr.length > 0);
      } catch {
        setToolsAlreadyChosen(false);
      }
    } else {
      setToolsAlreadyChosen(false);
    }
  }, [subscription]);

  const statsSectionRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const ref = statsSectionRef.current;
    if (!ref) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div>
        {/* Header fixo sempre topo */}
        <Header onOpenSidebar={undefined} showSidebarButton={undefined} showPromoBanner={true} />
        {/* Espaço para Header -- evita sobreposição */}
        <div style={{ height: 80 }} />
        <main className="bg-[#000000] text-white leading-relaxed pt-0">
          {/* HERO */}
          <section className="relative overflow-hidden py-24 px-6 md:px-12">
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
              <div className="col-span-12 opacity-20 bg-gradient-to-b from-transparent to-black" />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center justify-center mb-6 text-reveal">
                <div className="bg-white text-black text-xs rounded-full px-4 py-2 mr-3 smooth-hover">{t('home.hero.launchBadge')}</div>
                <a className="text-sm text-gray-300 hover:underline smooth-hover" href="#">{t('home.hero.checkNow')} ↗</a>
              </div>

              <h1 className="font-extrabold text-6xl md:text-7xl leading-tight tracking-tight text-reveal text-reveal-delay-1">
                {t('home.hero.title')}
                <br /> <span className="text-white smooth-hover">{t('home.hero.titleHighlight')}</span> {t('home.hero.titleSuffix')}
              </h1>

              <p className="text-gray-400 mt-6 max-w-3xl mx-auto text-reveal text-reveal-delay-2">
                {t('home.hero.description')}
                <strong className="text-white"> {t('home.hero.descriptionHighlight')}</strong> {t('home.hero.descriptionSuffix')}
              </p>

              <div className="mt-8 flex items-center justify-center gap-6 text-reveal text-reveal-delay-3">
                <button
                  className="bg-white text-black px-6 py-3 rounded-full font-semibold shadow-sm smooth-hover scale-in inline-flex items-center gap-2"
                  onClick={() => navigate('/plans')}
                >
                  <Icon name="rocket-launch" size={20} />
                  {t('home.hero.startNow')}
                </button>
                <a className="text-gray-300 flex items-center gap-2 smooth-hover" href="#features">{t('home.hero.exploreSolutions')} →</a>
              </div>

              {/* subtle radial glow to match reference */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-[420px] h-[420px] rounded-full mix-blend-screen opacity-10 pointer-events-none" style={{background: 'radial-gradient(closest-side,#ffffff,transparent)'}} />
            </div>
          </section>

          {/* RECURSOS E FUNCIONALIDADES */}
<section id="features" className="py-20 px-6 md:px-12">
  <div className="max-w-6xl mx-auto">
    {/* Header Section */}
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-3 mb-3 text-white text-sm text-reveal">
        <Icon name="automation-gear" size={28} />
        {t('home.features.tagline')}
      </div>

      <h2 className="text-4xl font-extrabold leading-tight mb-4 text-reveal text-reveal-delay-1">
        {t('home.features.title')}
      </h2>
      <p className="text-gray-400 mb-6 max-w-3xl mx-auto text-reveal text-reveal-delay-2">
        {t('home.features.subtitle')}
      </p>
      <button className="inline-flex items-center gap-3 bg-[#111111] border border-gray-800 px-4 py-2 rounded-lg text-reveal text-reveal-delay-3">
        <Icon name="rocket-launch" size={16} />
        <span className="text-sm">{t('home.features.discover')}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" className="ml-2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="#d1d1d1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>

    {/* Grid Layout: 6 cards - recursos e funcionalidades */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card 1 - Sistema Completo */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3 mb-3">
          <Icon name="build-circle" size={44} />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.completeSystem.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.completeSystem.description')}
            </p>
          </div>
        </div>
        <div className="flex items-end justify-center">
          <img
            src="/CARD.png"
            alt="Dream Applications - Sistema completo"
            className="w-full object-contain mb-4 h-[250px]"
          />
        </div>
      </article>

      {/* Card 2 - Segurança e Performance */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3 mb-3">
          <Icon name="precision-manufacturing" size={54} className="mb-3" />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.security.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.security.description')}
            </p>
          </div>
        </div>
        <div className="flex items-end justify-center">
          <img
            src="/epyc-nexusdev.png"
            alt="Dream Applications - Segurança e Performance"
            className="w-full object-contain mb-4 h-[250px]"
          />
        </div>
      </article>

      {/* Card 3 - Personalização e Controle */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3">
          <Icon name="monitoring-chart" size={44} />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.personalization.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.personalization.description')}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-3 mt-3 space-y-2">
          <div className="flex justify-between items-center text-reveal text-reveal-delay-1">
            <div className="flex items-center gap-2">
              <Icon name="handshake" size={18} />
              <div>
                <div className="text-xs font-medium">{t('home.features.cards.personalization.advanced')}</div>
                <div className="text-[10px] text-gray-400">{t('home.features.cards.personalization.advancedDesc')}</div>
              </div>
            </div>
            <div className="text-[10px] text-white border border-white px-2 py-0.5 rounded-md smooth-hover">{t('home.features.cards.personalization.customize')}</div>
          </div>

          <div className="flex justify-between items-center text-reveal text-reveal-delay-2">
            <div className="flex items-center gap-2">
              <Icon name="credit-card-gear" size={18} />
              <div>
                <div className="text-xs font-medium">{t('home.features.cards.personalization.management')}</div>
                <div className="text-[10px] text-gray-400">{t('home.features.cards.personalization.managementDesc')}</div>
              </div>
            </div>
            <div className="text-[10px] text-white border border-white px-2 py-0.5 rounded-md smooth-hover">{t('home.features.cards.personalization.automation')}</div>
          </div>

          <div className="flex justify-between items-center text-reveal text-reveal-delay-3">
            <div className="flex items-center gap-2">
              <Icon name="owl" size={18} />
              <div>
                <div className="text-xs font-medium">{t('home.features.cards.personalization.intuitive')}</div>
                <div className="text-[10px] text-gray-400">{t('home.features.cards.personalization.intuitiveDesc')}</div>
              </div>
            </div>
            <div className="text-[10px] text-white border border-white px-2 py-0.5 rounded-md smooth-hover">{t('home.features.cards.personalization.design')}</div>
          </div>

          <div className="flex justify-between items-center text-reveal text-reveal-delay-4">
            <div className="flex items-center gap-2">
              <Icon name="leaderboard" size={18} />
              <div>
                <div className="text-xs font-medium">{t('home.features.cards.personalization.analytics')}</div>
                <div className="text-[10px] text-gray-400">{t('home.features.cards.personalization.analyticsDesc')}</div>
              </div>
            </div>
            <div className="text-[10px] text-white border border-white px-2 py-0.5 rounded-md smooth-hover">{t('home.features.cards.personalization.analyticsLabel')}</div>
          </div>
        </div>
      </article>

      {/* Card 4 - Automação Inteligente */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3">
          <Icon name="database-upload" size={44} />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.automation.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.automation.description')}
            </p>
          </div>
        </div>
      </article>

      {/* Card 5 - Experiência Fluida */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3">
          <Icon name="gesture-control" size={44} />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.experience.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.experience.description')}
            </p>
          </div>
        </div>
      </article>

      {/* Card 6 - Tecnologia de Ponta */}
      <article className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 smooth-hover scale-in">
        <div className="flex items-start gap-3">
          <Icon name="cannabis-leaf" size={44} />
          <div>
            <h3 className="font-semibold text-reveal text-sm">{t('home.features.cards.technology.title')}</h3>
            <p className="text-gray-400 text-xs mt-1 text-reveal text-reveal-delay-1">
              {t('home.features.cards.technology.description')}
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

            {/* AUTOMAÇÃO E INOVAÇÃO */}
            <section className="py-20 px-6 md:px-12 border-t border-gray-900">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                <div>
                  <div className="inline-flex items-center gap-3 text-white text-sm mb-3 text-reveal">
                    <Icon name="automation-gear" size={20} />
                    {t('home.automation.tagline')}
                  </div>

                  <h3 className="text-3xl font-bold mb-3">{t('home.automation.title')}</h3>
                  <p className="text-gray-400 mb-6">{t('home.automation.description')}</p>
                    <button className="inline-flex items-center gap-2 bg-[#111111] border border-gray-800 px-4 py-2 rounded-lg smooth-hover">
                      <Icon name="build-circle" size={18} />
                      {t('home.automation.optimize')}
                    </button>

                  <div className="mt-10 grid gap-6">
                    <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="font-semibold">{t('home.automation.designTitle')}</h4>
                      <p className="text-gray-400 text-sm mt-2">{t('home.automation.designDesc')}</p>
                      <div className="mt-4 bg-[#0b0b0b] border border-gray-800 rounded-lg p-4 flex items-center gap-4 smooth-hover">
                        <Icon name="precision-manufacturing" size={28} />
                        <div>
                          <div className="font-semibold">{t('home.automation.interface')}</div>
                          <div className="text-xs text-gray-400">{t('home.automation.interfaceDesc')}</div>
                        </div>
                        <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#cfcfcf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6">
                      <h4 className="font-semibold">{t('home.automation.managementTitle')}</h4>
                      <p className="text-gray-400 text-sm mt-2">{t('home.automation.managementDesc')}</p>
                      <div className="mt-4 bg-[#0b0b0b] border border-gray-800 rounded-lg p-4 flex items-center gap-4 smooth-hover">
                        <Icon name="monitoring-chart" size={28} />
                        <div>
                          <div className="font-semibold">{t('home.automation.efficiency')}</div>
                          <div className="text-xs text-gray-400">{t('home.automation.efficiencyDesc')}</div>
                        </div>
                        <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#cfcfcf" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {/* Right side could contain an illustrative panel or remain empty matching reference */}
                  <div className="flex items-end justify-center w-full h-full">
                    <img
                      src="/rocket.png"
                      alt="Painel Foguete - Automação massiva"
                      className="block mx-auto w-full object-contain h-[min(80vh,620px)]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* FUNCIONALIDADES / FAQ */}
            <section className="py-20 px-6 md:px-12 border-t border-gray-900">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-extrabold mb-4">{t('home.faq.title')}</h2>
                    <p className="text-gray-400 max-w-lg">{t('home.faq.description')}</p>
                  </div>
                  <div className="flex gap-4 justify-end items-center">
                    <button className="bg-[#111111] border border-gray-800 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                      <Icon name="rocket-launch" size={22} className="text-white" />
                      <span className="text-sm">{t('home.faq.accessPlatform')} ↗</span>
                    </button>
                    <button
                      className="bg-white text-black px-4 py-2 rounded-full inline-flex items-center gap-2"
                      onClick={() => navigate('/plans')}
                    >
                      <Icon name="gesture-control" size={22} className="text-black" />
                      {t('home.faq.startNow')}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-12 text-sm text-gray-300">
                  <div className="bg-[#111111] rounded-2xl p-6">
                    <div className="inline-flex items-center gap-3">
                      <Icon name="contactless-payment" size={32} className="text-white" />
                      <span className="font-semibold">{t('home.faq.efficiency')}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{t('home.faq.efficiencyDesc')}</div>
                  </div>

                  <div className="bg-[#111111] rounded-2xl p-6">
                    <div className="inline-flex items-center gap-3">
                      <Icon name="loyalty-program" size={32} className="text-white" />
                      <span className="font-semibold">{t('home.faq.design')}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{t('home.faq.designDesc')}</div>
                  </div>

                  <div className="bg-[#111111] rounded-2xl p-6">
                    <div className="inline-flex items-center gap-3">
                      <Icon name="box-edit" size={32} className="text-white" />
                      <span className="font-semibold">{t('home.faq.security')}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{t('home.faq.securityDesc')}</div>
                  </div>

                  <div className="bg-[#111111] rounded-2xl p-6">
                    <div className="inline-flex items-center gap-3">
                      <Icon name="monitoring-white" size={32} className="text-white" />
                      <span className="font-semibold">{t('home.faq.automation')}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{t('home.faq.automationDesc')}</div>
                  </div>
                </div>

                <div className="mt-14 mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon name="owl" size={24} />
                    <h3 className="text-2xl font-bold">Perguntas Frequentes sobre a Dream Applications</h3>
                  </div>
                  <div className="space-y-3">
                    <details className="p-4 bg-[#111111] border border-gray-800 rounded-xl">
                      <summary className="cursor-pointer font-medium text-lg text-white">O que torna a Dream Applications única?</summary>
                      <p className="mt-2 text-gray-400">Mais do que uma ferramenta, a Dream Applications representa um novo conceito de inovação aplicada à gestão e personalização. Unimos design inteligente, automação e desempenho em uma experiência fluida, moderna e acessível.</p>
                    </details>
                    <details className="p-4 bg-[#111111] border border-gray-800 rounded-xl">
                      <summary className="cursor-pointer font-medium text-lg text-white">Como funciona a personalização?</summary>
                      <p className="mt-2 text-gray-400">Cada detalhe foi projetado para entregar eficiência, velocidade e segurança, permitindo que você tenha o controle total das suas atividades sem abrir mão da praticidade. Personalize seu ambiente digital conforme suas necessidades.</p>
                    </details>
                    <details className="p-4 bg-[#111111] border border-gray-800 rounded-xl">
                      <summary className="cursor-pointer font-medium text-lg text-white">Qual é o diferencial da interface?</summary>
                      <p className="mt-2 text-gray-400">Nossa aplicação combina tecnologia de ponta e uma interface intuitiva, oferecendo um sistema completo e responsivo, ideal para quem busca otimizar processos e elevar o padrão de qualidade do seu trabalho.</p>
                    </details>
                    <details className="p-4 bg-[#111111] border border-gray-800 rounded-xl">
                      <summary className="cursor-pointer font-medium text-lg text-white">Como a automação funciona?</summary>
                      <p className="mt-2 text-gray-400">Workflows automáticos e processos otimizados que aceleram suas atividades e eliminam tarefas repetitivas, permitindo que você foque no que realmente importa e descubra uma nova forma de construir, gerenciar e evoluir.</p>
                    </details>
                    <details className="p-4 bg-[#111111] border border-gray-800 rounded-xl">
                      <summary className="cursor-pointer font-medium text-lg text-white">A aplicação é adequada para uso profissional?</summary>
                      <p className="mt-2 text-gray-400">Sim. Tudo em um só lugar — pensado para o futuro, criado para quem sonha grande. Nossa aplicação é ideal para profissionais que buscam eficiência, velocidade e segurança em um ambiente totalmente personalizável.</p>
                    </details>
                  </div>
                </div>

              </div>
            </section>

            <Footer />
      </main>
    </div>
    <style>
      {`
        html, body { max-width: 100vw; overflow-x: hidden; }
        @media (max-width: 640px) {
          ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
          * { scrollbar-width: none !important; }
          .rounded-2xl { border-radius: 1.2rem !important; }
          .sm\\:p-7 { padding: 1.2rem !important; }
          .plan-card {
            max-width: 98vw !important;
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .plan-card h2,
          .plan-card .mt-6 { margin-top: 0.5rem !important; }
          .plan-card .mb-6 { margin-bottom: 0.5rem !important; }
          .plan-card .mt-4 { margin-top: 0.25rem !important; }
          .plan-card .mb-4 { margin-bottom: 0.25rem !important; }
          .plan-card .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .plan-card .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
          .plan-card .gap-2 { gap: 0.25rem !important; }
          iframe, .aspect-video { max-width: 100vw !important; width: 100% !important; }
          img { max-width: 100vw !important; height: auto !important; }
        }
        .animate-fadein {
          animation: fadein 0.5s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scroll-mouse {
          0% { opacity: 1; transform: translateY(0); }
          60% { opacity: 1; transform: translateY(18px);}
          100% { opacity: 0; transform: translateY(24px);}
        }
        .animate-scroll-mouse {
          animation: scroll-mouse 1.4s infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 2s linear infinite;
        }
        /* Promo Banner Animation */
        @keyframes promo-banner-move {
          0% { opacity: 0; transform: translateY(-30px) scale(0.98); }
          60% { opacity: 1; transform: translateY(8px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-promo-banner {
          animation: promo-banner-move 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}
    </style>
  </>
);
};

export default Home;
  
