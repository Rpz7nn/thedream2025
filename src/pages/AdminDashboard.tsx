import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscordAuth } from '../hooks/useDiscordAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import AdminLogin from '../components/admin/AdminLogin';
import MonitoramentoSection from '../components/admin/MonitoramentoSection';
import FinanceiroSection from '../components/admin/FinanceiroSection';
import BotsSection from '../components/admin/BotsSection';
import AtualizacoesSection from '../components/admin/AtualizacoesSection';
import SegurancaSection from '../components/admin/SegurancaSection';

const ADMIN_ROUTE_SECRET = '7x9k2m-panel-admin-2024';

export default function AdminDashboard(): JSX.Element {
  const { user, loading: authLoading } = useDiscordAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'monitoramento' | 'financeiro' | 'bots' | 'atualizacoes' | 'seguranca'>('monitoramento');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        navigate('/');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          // Verificar se o ID do Discord está autorizado
          if (!data.isAuthorizedId) {
            setIsAuthorized(false);
            toast({
              title: 'Acesso Negado',
              description: 'Seu ID do Discord não está autorizado para acessar esta área.',
              type: 'error',
            });
            navigate('/');
            return;
          }

          // Se não fez login com senha, mostrar tela de login
          if (!data.hasPasswordAuth) {
            setNeedsPassword(true);
            setIsAuthorized(false);
            setCheckingAuth(false);
            return;
          }

          // Se passou em todas as verificações
          if (data.authorized) {
            setIsAuthorized(true);
            setNeedsPassword(false);
          } else {
            setIsAuthorized(false);
            setNeedsPassword(true);
          }
        } else {
          setIsAuthorized(false);
          toast({
            title: 'Erro de Autenticação',
            description: 'Não foi possível verificar suas permissões.',
            type: 'error',
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar acesso admin:', error);
        setIsAuthorized(false);
        navigate('/');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, navigate, toast]);

  const handleLoginSuccess = () => {
    setIsAuthorized(true);
    setNeedsPassword(false);
    // Recarregar verificação
    window.location.reload();
  };

  if (checkingAuth || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ffbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login com senha se necessário
  if (needsPassword || !isAuthorized) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'monitoramento':
        return <MonitoramentoSection />;
      case 'financeiro':
        return <FinanceiroSection />;
      case 'bots':
        return <BotsSection />;
      case 'atualizacoes':
        return <AtualizacoesSection />;
      case 'seguranca':
        return <SegurancaSection />;
      default:
        return <MonitoramentoSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header onOpenSidebar={() => {}} showSidebarButton={false} showPromoBanner={false} />
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

