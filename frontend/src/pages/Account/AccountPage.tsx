import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Mail, ShieldCheck, LogOut, Package, ArrowRight, Sparkles } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { language } = useLanguageStore();
  const navigate = useNavigate();

  const isId = language === 'id';

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-lime text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isId ? 'Profil Klien Atelier' : 'Atelier Client Profile'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-bone">
            {user.fullName}
          </h1>
          <p className="text-xs font-mono text-muted-light">
            {isId ? 'ID Klien' : 'Client ID'}: <span className="text-bone">{user.id}</span>
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{isId ? 'Keluar' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-lime text-obsidian flex items-center justify-center font-bold text-sm font-mono">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase text-bone">{isId ? 'Akun' : 'Account'}</h2>
              <span className="text-[10px] font-mono text-accent-lime uppercase tracking-wider">
                {user.role} Member
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5 text-xs font-mono text-muted-light">
            <div className="flex items-center gap-2 text-bone">
              <Mail className="w-3.5 h-3.5 text-muted-light" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>{isId ? 'Status' : 'Status'}:</span>
              <span className="text-bone uppercase">{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span>{isId ? 'Preferensi Bahasa' : 'Language'}:</span>
              <span className="text-bone uppercase">{user.preferences?.language || language}</span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="md:col-span-2 p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-bone text-sm font-mono font-bold uppercase tracking-wider">
              <Package className="w-4 h-4 text-accent-lime" />
              <span>{isId ? 'Riwayat Pesanan' : 'Order History'}</span>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-mono text-accent-lime hover:underline flex items-center gap-1"
            >
              <span>{isId ? 'Jelajahi Koleksi' : 'Explore Catalog'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-8 border border-dashed border-white/10 rounded-sm text-center space-y-2 bg-obsidian/40">
            <p className="text-xs font-mono text-muted-light">
              {isId
                ? 'Belum ada pesanan aktif. Pesanan Anda yang telah diverifikasi akan ditampilkan di sini.'
                : 'No active orders yet. Your confirmed atelier orders will appear here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Security & Provenance Banner */}
      <div className="p-4 bg-obsidian border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono text-muted-light">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-lime" />
          <span>{isId ? 'Sesi Aman Terenkripsi Supabase Auth' : 'Encrypted Supabase Auth Session'}</span>
        </div>
        <span className="text-[10px] text-muted-light/60">NOVAÉ ATELIER v1.2</span>
      </div>
    </div>
  );
};
