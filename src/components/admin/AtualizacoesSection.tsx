import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { Upload, FileArchive, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface UpdateLog {
  botId: string;
  botName: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: string;
}

export default function AtualizacoesSection() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<UpdateLog[]>([]);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo ZIP.',
        type: 'error',
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Atualização Global',
      description: `Tem certeza que deseja atualizar todos os bots com o arquivo "${file.name}"? Esta ação pode levar vários minutos e não pode ser desfeita.`,
    });

    if (!confirmed) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUpdateInProgress(true);
    setUpdateProgress([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/update-global', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        // Iniciar polling para atualizações de progresso
        pollUpdateProgress();
        
        toast({
          title: 'Upload Iniciado',
          description: 'O arquivo foi enviado. A atualização está em andamento.',
          type: 'success',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao fazer upload do arquivo.',
          type: 'error',
        });
        setUpdateInProgress(false);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
      setUpdateInProgress(false);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const pollUpdateProgress = async () => {
    const maxAttempts = 120; // 10 minutos (5 segundos * 120)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUpdateInProgress(false);
        toast({
          title: 'Timeout',
          description: 'A atualização está demorando mais que o esperado. Verifique os logs.',
          type: 'error',
        });
        return;
      }

      try {
        const response = await fetch('/api/admin/update-progress', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUpdateProgress(data.logs || []);

          const allComplete = data.logs?.every((log: UpdateLog) => 
            log.status === 'success' || log.status === 'error'
          );

          if (allComplete && data.logs?.length > 0) {
            setUpdateInProgress(false);
            const successCount = data.logs.filter((log: UpdateLog) => log.status === 'success').length;
            const errorCount = data.logs.filter((log: UpdateLog) => log.status === 'error').length;
            
            toast({
              title: 'Atualização Concluída',
              description: `${successCount} bots atualizados com sucesso. ${errorCount > 0 ? `${errorCount} com erro.` : ''}`,
              type: successCount > 0 ? 'success' : 'error',
            });
            return;
          }

          attempts++;
          setTimeout(poll, 5000); // Poll a cada 5 segundos
        } else {
          attempts++;
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Erro ao buscar progresso:', error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Loader2 size={16} className="text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Atualização Global</h1>
        <p className="text-sm text-[#999999]">Atualize todos os bots de uma vez com um arquivo ZIP</p>
      </div>

      {/* Upload Area */}
      <div className="minimal-card p-6">
        <div className="border-2 border-dashed border-[#1a1a1a] rounded-lg p-8 text-center hover:border-[#2a2a2a] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || updateInProgress}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center">
              {uploading ? (
                <Loader2 size={32} className="text-[#00ffbf] animate-spin" />
              ) : (
                <FileArchive size={32} className="text-[#999999]" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {uploading ? 'Enviando arquivo...' : 'Selecione o arquivo ZIP'}
              </h3>
              <p className="text-sm text-[#666666] mb-4">
                O arquivo ZIP deve conter a nova versão dos bots. O banco de dados não será afetado.
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || updateInProgress}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Upload size={18} />
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </button>
            </div>
          </div>
        </div>

        {/* Avisos */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-500">
              <p className="font-medium mb-1">Atenção:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-500/80">
                <li>A atualização pode levar vários minutos</li>
                <li>O banco de dados não será afetado</li>
                <li>Haverá fallback automático em caso de erro</li>
                <li>Os bots serão reiniciados automaticamente após a atualização</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Progresso da Atualização */}
      {updateInProgress && (
        <div className="minimal-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Progresso da Atualização</h2>
          
          {updateProgress.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 size={32} className="text-[#00ffbf] animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Iniciando atualização...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {updateProgress.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg"
                >
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{log.botName}</p>
                    <p className="text-xs text-[#666666] mt-1">{log.message}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

