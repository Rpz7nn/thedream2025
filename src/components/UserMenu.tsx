import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Home, Monitor, User as UserIcon, LogOut, Clock, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { getDiscordAvatarUrl } from "@/lib/utils";

interface UserMenuProps {
  user: any;
  lastAccessDate?: string;
  maskEmailPartial: (email: string) => string;
  formatTimeAgo: (dateString: string) => string;
  handleLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, lastAccessDate, maskEmailPartial, formatTimeAgo, handleLogout }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 min-w-[48px] bg-transparent border rounded-lg border-square-600 focus:outline-none">
          <span className="flex items-center">
            <Avatar className="h-8 w-8 shadow-lg cursor-pointer rounded-full">
              <AvatarImage src={getDiscordAvatarUrl(user.id, user.avatar, user.discriminator, 128) || undefined} />
              <AvatarFallback className="gradient-discord text-white text-sm">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="bottom" sideOffset={8} className="w-80 mx-auto p-0 rounded-2xl shadow-xl bg-[#18191c] mt-2 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)]">
        <div className="bg-[#232429] rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                className="h-full w-full object-cover rounded-lg" 
                alt={user.username} 
                src={getDiscordAvatarUrl(user.id, user.avatar, user.discriminator, 128) || undefined}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-white text-base leading-tight truncate">{user.username}</span>
              <span className="text-xs text-gray-400 truncate">{maskEmailPartial(user.email)}</span>
            </div>
          </div>
          {lastAccessDate && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 ml-1">
              <Clock className="h-3 w-3" />
              <span>Último acesso: {formatTimeAgo(lastAccessDate)}</span>
            </div>
          )}
        </div>
        <div className="py-2 px-2 flex flex-col gap-1">
          <DropdownMenuItem asChild>
            <Link to="/" className="flex justify-between items-center w-full">
              <span className="font-medium text-left">Início</span>
              <Home className="h-5 w-5 ml-4" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex justify-between items-center w-full">
              <span className="font-medium text-left">Dashboard</span>
              <Monitor className="h-5 w-5 ml-4" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/account" className="flex justify-between items-center w-full">
              <span className="font-medium text-left">Minha Conta</span>
              <UserIcon className="h-5 w-5 ml-4" />
            </Link>
          </DropdownMenuItem>
        </div>
        <div className="my-2 border-t border-[#23272a]" />
        <div className="px-2 pb-2">
          <DropdownMenuItem onClick={handleLogout} className="flex justify-between items-center w-full px-5 py-3 rounded-lg bg-transparent transition-colors duration-200 cursor-pointer group" style={{ color: '#ef4444' }}>
            <span className="font-medium text-left" style={{ color: 'inherit' }}>Fazer logout</span>
            <LogOut className="h-5 w-5 ml-4" style={{ color: 'inherit' }} />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 