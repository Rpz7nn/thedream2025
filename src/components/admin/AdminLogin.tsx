import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Sucesso',
          description: 'Autenticação bem-sucedida!',
          type: 'success',
        });
        onSuccess();
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Usuário ou senha incorretos.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="minimal-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-[#00ffbf]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">Área Administrativa</h1>
            <p className="text-sm text-[#666666]">Autenticação adicional necessária</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-[#666666]" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white placeholder:text-[#666666] focus:outline-none focus:border-[#00ffbf]"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-[#666666]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-12 py-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-white placeholder:text-[#666666] focus:outline-none focus:border-[#00ffbf]"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Autenticando...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Acessar Painel
                </>
              )}
            </button>
          </form>

          {/* Aviso de Segurança */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-500 text-center">
              ⚠️ Esta é uma área restrita. Apenas administradores autorizados podem acessar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

