export type BotConfig = {
  name: string;
  status: string;
  token: string;
  ping: string;
  statusList: string[];
  embedColors: {
    primary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  serverName: string;
  serverId: string;
  memberCount: string;
  onlineCount: string;
  isOnline: boolean;
  autoRestart: boolean;
  notifications: boolean;
  whatsappNotifications?: boolean;
  logLevel: string;
  prefix: string;
  language: string;
}; 