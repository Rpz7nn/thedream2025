import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import React from "react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  onUse: () => void;
}

const categoryColors: Record<string, string> = {
  'Mensagens': 'from-[#5865f2] to-[#00d4ff]',
  'Servidor': 'from-[#43e97b] to-[#38f9d7]',
  'Moderação': 'from-[#ff512f] to-[#dd2476]',
  'Automação': 'from-[#f7971e] to-[#ffd200]',
  'Pessoal': 'from-[#a770ef] to-[#f6d365]',
  'Imagens': 'from-[#f953c6] to-[#b91d73]',
  'Utilidades': 'from-[#43cea2] to-[#185a9d]',
  'default': 'from-[#5865f2] to-[#7289da]'
};

const ToolCard = React.memo(({ title, description, icon: Icon, category, onUse }: ToolCardProps) => {
  const gradient = categoryColors[category] || categoryColors['default'];
  return (
    <Card
      className={
        typeof window !== 'undefined' && document.body.classList.contains('tool-page')
          ? "min-h-[80px] h-auto w-full flex flex-col flex-1 justify-center rounded-xl overflow-hidden border border-[#101012] bg-[#0b0b0d] backdrop-blur-md p-2 sm:p-6 text-xs sm:text-sm"
          : "min-h-[80px] h-auto w-full flex flex-col flex-1 justify-center rounded-xl overflow-hidden border border-[#101012] hover:outline hover:outline-1 hover:outline-[#101012] bg-[#0b0b0d] backdrop-blur-md p-2 sm:p-6 text-xs sm:text-sm"
      }
    >
      <CardHeader className="space-y-2 sm:space-y-4 pb-2 sm:pb-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center">
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <Badge 
            variant="outline" 
            className="text-xs px-3 py-1 rounded-lg border border-[#101012] bg-[#101012] text-gray-300 font-normal"
          >
            {category}
          </Badge>
        </div>
        <div className="space-y-2">
          <CardTitle
            className={
              typeof window !== 'undefined' && document.body.classList.contains('tool-page')
                ? "text-sm sm:text-base font-semibold text-white transition-colors duration-300 leading-tight truncate"
                : "text-sm sm:text-base font-semibold text-white group-hover:text-gray-300 transition-colors duration-300 leading-tight truncate"
            }
          >
            {title}
          </CardTitle>
          <CardDescription
            className={
              typeof window !== 'undefined' && document.body.classList.contains('tool-page')
                ? "text-xs sm:text-sm text-gray-300 leading-relaxed transition-colors duration-300 break-words"
                : "text-xs sm:text-sm text-gray-300 leading-relaxed group-hover:text-gray-100 transition-colors duration-300 break-words"
            }
          >
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <Button 
          onClick={onUse}
          className="w-full bg-[#242529] border border-[#18191b] text-gray-100 text-xs sm:text-sm py-2 sm:py-2.5 h-9 sm:h-10 rounded-lg font-bold tracking-tight transition-all duration-200 hover:bg-[#2a2b2f] hover:shadow-lg hover:scale-105 focus-visible:scale-105 focus-visible:shadow-lg"
        >
          <span className="tracking-wide">Usar Ferramenta</span>
        </Button>
      </CardContent>
    </Card>
  );
});

export default ToolCard;
