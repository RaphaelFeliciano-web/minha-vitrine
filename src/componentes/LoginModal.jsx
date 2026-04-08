import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onLogin, isProcessing }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShieldCheck size={32} />
        </div>

        <h3 className="text-xl font-black uppercase mb-2 italic text-center text-slate-900">Acesso Restrito</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8 text-center leading-relaxed">
          Identifique-se para gerenciar a vitrine.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            <input
              type="email"
              required
              placeholder="E-mail do Administrador"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-xs font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
            <input
              type="password"
              required
              placeholder="Sua Senha"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-xs font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
};