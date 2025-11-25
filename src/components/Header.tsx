import { Shield, Settings, LogIn, LogOut, Menu, ChevronDown, Copy, Home, Monitor, Clock, UserIcon, Grid3X3, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { maskEmailPartial, formatTimeAgo, getDiscordAvatarUrl } from "@/lib/utils";
import { useI18n } from "@/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { getApiPath } from "@/utils/api";

// Adicione a função para mascarar o e-mail antes do componente Header
function maskEmail(email) {
  if (!email) return '';
  const [user, domain] = email.split('@');
  return `${'*'.repeat(Math.max(0, user.length - 4))}@${domain}`;
}

const Header = ({ onOpenSidebar, showSidebarButton, showPromoBanner = true }) => {
  const { user, loading, logout } = useDiscordAuth();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowHeader(window.scrollY > 40);
      setShowBanner(window.scrollY <= 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userButtonRef.current) {
      setMenuWidth(userButtonRef.current.offsetWidth);
    }
  }, [user, menuOpen, windowWidth]);

  const mobileTop = 32; // px
  const desktopTop = 40; // px
  const isMobile = windowWidth < 768;

  const handleMenuTrigger = (open) => {
    if (open) {
      // Usa 17px como valor fixo para compensação (ajustável se necessário)
      const scrollbarWidth = -1; // Valor fixo para evitar discrepâncias
      document.body.style.paddingRight = `${scrollbarWidth}px`; // Compensar o espaço da scroll
      document.body.style.overflow = "hidden"; // Bloqueia rolagem do body
      document.body.style.width = `calc(100vw - ${scrollbarWidth}px + ${scrollbarWidth}px)`; // Estica o body com precisão
    } else {
      // Restaura instantaneamente ao fechar
      document.body.style.paddingRight = "0";
      document.body.style.overflow = "";
      document.body.style.width = "";
    }
    setMenuOpen(open);
  };

  const handleDiscordLogin = () => {
    window.location.href = getApiPath(`/api/auth/discord/login`);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Se houver (user as any).lastLogin, use; senão, simule "há 2 minutos"
  const lastAccessDate = user ? ((user as any).lastLogin ? new Date((user as any).lastLogin) : new Date(Date.now() - 2 * 60 * 1000)) : null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-[#1a1a1a] transition-all duration-200 ${scrolled ? 'bg-[#000000]' : 'bg-[#000000]'}`}
        style={{ height: '64px' }}
      >
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 h-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-shrink-0 z-10">
            {showSidebarButton && (
              <button
                className="md:hidden p-2 rounded-md hover:bg-[#0a0a0a] focus:outline-none transition-colors"
                aria-label="Abrir menu"
                onClick={typeof onOpenSidebar === 'function' ? onOpenSidebar : undefined}
                type="button"
              >
                <Menu className="w-5 h-5 text-[#ffffff]" strokeWidth={1.5} />
              </button>
            )}
            <img src="/logo.png" alt="Dream Applications Logo" className="h-8 w-8 cursor-pointer flex-shrink-0" onClick={() => navigate('/')} />
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-8 flex-shrink-0">
            <Link to="/plans" className="text-sm text-[#999999] hover:text-[#ffffff] transition-colors duration-150 font-medium">
              {t('header.plans')}
            </Link>
            <Link to="/terms" className="text-sm text-[#999999] hover:text-[#ffffff] transition-colors duration-150 font-medium">
              {t('header.terms')}
            </Link>
            <Link 
              to="/tutoriais"
              className="text-sm text-[#999999] hover:text-[#ffffff] transition-colors duration-150 font-medium flex items-center gap-1.5"
            >
              {t('header.tutorials')}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          </nav>
          <div className="flex-1 hidden md:block" />
          
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            {loading ? null : user ? (
              <DropdownMenu onOpenChange={handleMenuTrigger}>
                <DropdownMenuTrigger asChild>
                  <button
                    ref={userButtonRef}
                    className="flex items-center gap-2 px-2 py-1 focus:outline-none rounded-lg transition-colors duration-150 hover:bg-white/10"
                  >
                    <Avatar className="h-8 w-8 border border-[#1a1a1a]">
                      <AvatarImage src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined} />
                      <AvatarFallback className="bg-[#0f0f0f] text-[#ffffff] text-sm">
                        <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 text-gray-400 ${menuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="p-2 rounded-lg bg-[#18191c] shadow-xl border border-gray-700 min-w-[160px]"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <Home className="h-4 w-4" />
                      {t('header.home')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/applications" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <Grid3X3 className="h-4 w-4" />
                      {t('header.applications')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <User className="h-4 w-4" />
                      {t('header.account')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/invoices" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <FileText className="h-4 w-4" />
                      {t('header.invoices')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleDiscordLogin} variant="default" className="minimal-button flex items-center gap-2">
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                {t('header.login')}
              </Button>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2 relative z-50 flex-shrink-0 ml-auto">
            {/* Menu Mobile para Atalhos - À direita */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[#999999] hover:text-[#ffffff] hover:bg-[#0a0a0a]">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0a] border border-[#1a1a1a]">
                <DropdownMenuItem asChild>
                  <Link to="/plans" className="text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f]">
                    {t('header.plans')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/terms" className="text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f]">
                    {t('header.terms')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/tutoriais"
                    className="text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] flex items-center gap-1.5"
                  >
                    {t('header.tutorials')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15,3 21,3 21,9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <LanguageSelector />
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-[#0a0a0a] animate-pulse" />
            ) : user ? (
              <DropdownMenu onOpenChange={handleMenuTrigger}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-1.5 py-1 focus:outline-none rounded-md hover:bg-[#0a0a0a] transition-colors active:bg-[#0f0f0f]"
                    aria-label="Menu do usuário"
                    type="button"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer rounded-full border border-[#1a1a1a] flex-shrink-0 ring-1 ring-transparent hover:ring-[#333333] transition-all">
                      <AvatarImage 
                        src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined}
                        alt={user.username || 'Usuário'}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#0f0f0f] text-[#ffffff] text-xs border border-[#1a1a1a]">
                        <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-[#999999] flex-shrink-0 transition-transform duration-200" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="p-2 rounded-md bg-[#0a0a0a] border border-[#1a1a1a] min-w-[180px]"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md">
                      <Home className="h-4 w-4" strokeWidth={1.5} />
                      {t('header.home')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/applications" className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md">
                      <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
                      {t('header.applications')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md">
                      <User className="h-4 w-4" strokeWidth={1.5} />
                      {t('header.account')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/invoices" className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md">
                      <FileText className="h-4 w-4" strokeWidth={1.5} />
                      {t('header.invoices')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-[#1a1a1a]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleDiscordLogin} variant="default" className="minimal-button flex items-center gap-2 text-sm px-4 py-2">
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                {t('header.loginShort')}
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

// SimpleHeader: versão simplificada para Dashboard e Panel
export const SimpleHeader = ({ onOpenSidebar }) => {
  const { user, loading, logout } = useDiscordAuth();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userButtonRef.current) {
      setMenuWidth(userButtonRef.current.offsetWidth);
    }
  }, [user, menuOpen, windowWidth]);

  const handleMenuTrigger = (open) => {
    setMenuOpen(open);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDiscordLogin = () => {
    window.location.href = getApiPath(`/api/auth/discord/login`);
  };

  // Se houver (user as any).lastLogin, use; senão, simule "há 2 minutos"
  const lastAccessDate = user ? ((user as any).lastLogin ? new Date((user as any).lastLogin) : new Date(Date.now() - 2 * 60 * 1000)) : null;

  return (
    <header className="w-full border-b border-[#1a1a1a] flex items-center justify-between py-3 px-4 bg-[#000000] fixed top-0 left-0 z-50">
      <div className="flex items-center gap-2">
        {/* Botão menu mobile */}
        <button
          className="flex items-center justify-center p-2 text-[#999999] rounded-md text-sm font-medium transition-colors focus-visible:outline-none hover:bg-[#0a0a0a] hover:text-[#ffffff] md:hidden"
          type="button"
          aria-label="Abrir menu"
          onClick={typeof onOpenSidebar === 'function' ? onOpenSidebar : undefined}
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <a href="/">
          <img width={32} height={32} src="/logo.png" alt="DreamApps" className="object-contain" />
        </a>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <LanguageSelector />
        {loading ? null : user ? (
          <DropdownMenu onOpenChange={handleMenuTrigger}>
            <DropdownMenuTrigger asChild>
              <button
                ref={userButtonRef}
                className="flex items-center gap-2 px-2 py-1 focus:outline-none rounded-md transition-colors duration-150 hover:bg-[#0a0a0a]"
              >
                <Avatar className="h-7 w-7 border border-[#1a1a1a]">
                  <AvatarImage src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined} />
                  <AvatarFallback className="bg-[#0f0f0f] text-[#ffffff] text-xs">
                    <UserIcon className="h-3 w-3" strokeWidth={1.5} />
                  </AvatarFallback>
                </Avatar>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 text-[#666666] ${menuOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="p-2 rounded-md bg-[#0a0a0a] border border-[#1a1a1a] min-w-[160px]"
            >
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-md p-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-md overflow-hidden flex-shrink-0 border border-[#1a1a1a]">
                    <img 
                      className="h-full w-full object-cover" 
                      alt={user.username} 
                      src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-[#ffffff] text-sm leading-tight truncate">{user.username}</span>
                    <span className="text-xs text-[#666666] truncate">{maskEmailPartial(user.email)}</span>
                  </div>
                </div>
                {lastAccessDate && (
                  <div className="flex items-center gap-2 text-xs text-[#666666] mt-2">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    <span>Último acesso: {formatTimeAgo(lastAccessDate)}</span>
                  </div>
                )}
              </div>
              <div className="py-1 flex flex-col gap-0.5">
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer"
                >
                  <Link to="/" className="flex items-center gap-2 w-full">
                    <Home className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.home')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer">
                  <Link to="/dashboard" className="flex items-center gap-2 w-full">
                    <Monitor className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer">
                  <a href="/account" className="flex items-center gap-2 w-full">
                    <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.myAccount')}</span>
                  </a>
                </DropdownMenuItem>
              </div>
              <div className="my-1 border-t border-[#1a1a1a]" />
              <div className="px-1 pb-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-medium">{t('header.logout')}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleDiscordLogin} variant="default" className="minimal-button flex items-center gap-2">
            <LogIn className="w-4 h-4" strokeWidth={1.5} />
            {t('header.login')}
          </Button>
        )}
      </div>
      <div className="md:hidden flex items-center gap-2 relative">
        <LanguageSelector />
        {loading ? null : user ? (
          <DropdownMenu onOpenChange={handleMenuTrigger}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 min-w-[48px] bg-transparent border border-[#1a1a1a] rounded-md focus:outline-none hover:bg-[#0a0a0a]">
                <span className="flex items-center">
                  <Avatar className="h-7 w-7 cursor-pointer rounded-full border border-[#1a1a1a]">
                    <AvatarImage src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined} />
                    <AvatarFallback className="bg-[#0f0f0f] text-[#ffffff] text-xs">
                      <UserIcon className="h-3 w-3" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </span>
                <ChevronDown className="h-3 w-3 text-[#666666]" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="bottom"
              sideOffset={8}
              className="w-full max-w-full md:w-80 md:max-w-md mx-auto p-0 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] mt-2 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)]"
              style={{ width: menuWidth ? `${menuWidth}px` : undefined, minWidth: 220, marginTop: 8 }}
            >
              <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] p-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-md overflow-hidden flex-shrink-0 border border-[#1a1a1a]">
                    <img 
                      className="h-full w-full object-cover" 
                      alt={user.username} 
                      src={getDiscordAvatarUrl(user.id, user.avatar, '0', 128) || undefined}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-[#ffffff] text-sm leading-tight truncate">{user.username}</span>
                    <span className="text-xs text-[#666666] truncate">{maskEmailPartial(user.email)}</span>
                  </div>
                </div>
                {lastAccessDate && (
                  <div className="flex items-center gap-2 text-xs text-[#666666] mt-2">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    <span>{t('header.lastAccess')}: {formatTimeAgo(lastAccessDate)}</span>
                  </div>
                )}
              </div>
              <div className="py-1 flex flex-col gap-0.5">
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer"
                >
                  <Link to="/" className="flex items-center gap-2 w-full">
                    <Home className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.home')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer">
                  <Link to="/dashboard" className="flex items-center gap-2 w-full">
                    <Monitor className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-2 px-3 py-2 text-sm text-[#999999] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer">
                  <a href="/account" className="flex items-center gap-2 w-full">
                    <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">{t('header.myAccount')}</span>
                  </a>
                </DropdownMenuItem>
              </div>
              <div className="my-1 border-t border-[#1a1a1a]" />
              <div className="px-1 pb-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:text-[#ffffff] hover:bg-[#0f0f0f] rounded-md cursor-pointer"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-medium">{t('header.logout')}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleDiscordLogin} variant="default" className="minimal-button flex items-center gap-2 text-sm px-4 py-2">
            <LogIn className="w-4 h-4" strokeWidth={1.5} />
            {t('header.loginShort')}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
