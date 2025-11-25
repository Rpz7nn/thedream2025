import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Lock, Key, AlertTriangle } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  discordId: string;
  addedAt: string;
  addedBy: string;
}

export default function SegurancaSection() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminId, setNewAdminId] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/security/admins', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de administradores.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminId.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o ID do Discord do usuário.',
        type: 'error',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/security/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ discordId: newAdminId.trim() }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Administrador adicionado com sucesso.',
          type: 'success',
        });
        setNewAdminId('');
        fetchAdmins();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao adicionar administrador.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar administrador:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/security/admins/${adminId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Administrador removido com sucesso.',
          type: 'success',
        });
        fetchAdmins();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao remover administrador.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao remover administrador:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="minimal-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00ffbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Carregando configurações de segurança...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Segurança e Acesso</h1>
        <p className="text-sm text-[#999999]">Gerencie os administradores autorizados</p>
      </div>

      {/* Adicionar Administrador */}
      <div className="minimal-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User size={20} />
          Adicionar Administrador
        </h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            placeholder="ID do Discord (ex: 123456789012345678)"
            className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white text-sm placeholder:text-[#666666] focus:outline-none focus:border-[#2a2a2a]"
          />
          <button
            onClick={handleAddAdmin}
            className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Adicionar
          </button>
        </div>
        
        <p className="text-xs text-[#666666] mt-2">
          O ID do Discord pode ser obtido ativando o "Modo Desenvolvedor" no Discord e clicando com o botão direito no usuário.
        </p>
      </div>

      {/* Lista de Administradores */}
      <div className="minimal-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={20} />
          Administradores Autorizados
        </h2>

        {admins.length === 0 ? (
          <div className="text-center py-12">
            <Shield size={48} className="text-[#666666] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Nenhum administrador encontrado</p>
            <p className="text-sm text-[#666666]">Adicione administradores para permitir acesso ao painel.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                    <User size={20} className="text-[#999999]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{admin.username}</p>
                    <p className="text-xs text-[#666666]">ID: {admin.discordId}</p>
                    <p className="text-xs text-[#666666]">
                      Adicionado em {new Date(admin.addedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.id)}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avisos de Segurança */}
      <div className="minimal-card p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-500">
            <p className="font-medium mb-2">Recomendações de Segurança:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-500/80">
              <li>Mantenha a lista de administradores atualizada</li>
              <li>Remova administradores que não precisam mais de acesso</li>
              <li>Não compartilhe a URL do painel administrativo</li>
              <li>Use senhas fortes e autenticação de dois fatores no Discord</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

