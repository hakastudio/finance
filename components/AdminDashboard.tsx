
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import CategoryManager from './CategoryManager';
import TransactionList from './TransactionList';
import { 
  ShieldCheck, Database, Trash2, 
  Download, Activity, BarChart, 
  Settings2, Info, Save, CheckCircle2,
  Layout, Globe, RefreshCw, ListFilter,
  ArrowRightCircle, Edit3, CloudLightning,
  Calendar, Filter, Megaphone, Send, X,
  Clock, UserCheck, Zap
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  appName: string;
  broadcastMessage: string;
  onUpdateAppName: (name: string) => void;
  onUpdateBroadcast: (message: string) => void;
  onAddCategory: (name: string, type: TransactionType) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void; 
  onDeleteTransaction: (id: string) => void;
  onResetData: () => void;
  onExport: (filters: { startDate: string; endDate: string; type: string }) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  transactions, 
  categories, 
  appName: currentAppName,
  broadcastMessage: currentBroadcast,
  onUpdateAppName,
  onUpdateBroadcast,
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onUpdateTransaction,
  onDeleteTransaction,
  onResetData,
  onExport
}) => {
  const [tempAppName, setTempAppName] = useState(currentAppName);
  const [tempBroadcast, setTempBroadcast] = useState(currentBroadcast);
  const [activeAdminView, setActiveAdminView] = useState<'settings' | 'categories' | 'transactions' | 'broadcast'>('settings');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setTempAppName(currentAppName);
    setTempBroadcast(currentBroadcast);
  }, [currentAppName, currentBroadcast]);

  // Efek visual saat data berubah (Sinkronisasi masuk)
  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(timer);
  }, [transactions.length]);

  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    return { 
      totalTransactions, 
      totalCategories: categories.length,
      avgTransaction: totalTransactions > 0 
        ? transactions.reduce((acc, t) => acc + t.amount, 0) / totalTransactions 
        : 0,
      totalValue: transactions.reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0)
    };
  }, [transactions, categories]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 border border-slate-800/50">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-black uppercase tracking-[0.2em] text-[8px]">Tunnel Realtime Aktif</span>
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              Master Control
              {pulse && <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>}
            </h2>
            <p className="text-slate-400 text-sm max-w-sm font-medium">Monitor aktivitas user dan sinkronisasi data global secara instan.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-full lg:w-auto">
            {[
              { id: 'settings', label: 'Identity', icon: Globe },
              { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
              { id: 'categories', label: 'Categories', icon: Settings2 },
              { id: 'transactions', label: 'Master DB', icon: Database }
            ].map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveAdminView(v.id as any)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeAdminView === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <v.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {activeAdminView === 'settings' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Globe className="w-6 h-6 text-indigo-500" /> Branding Global</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Perubahan nama akan langsung terupdate di semua tab user.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={tempAppName}
                  onChange={(e) => setTempAppName(e.target.value)}
                  className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-black text-lg focus:border-indigo-500 dark:text-white"
                  placeholder="App Name"
                />
                <button onClick={() => onUpdateAppName(tempAppName)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Push Update
                </button>
              </div>
            </div>
          )}

          {activeAdminView === 'broadcast' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><Megaphone className="w-6 h-6 text-indigo-500" /> Live Alert Banner</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kirim pesan yang akan berjalan di header semua user.</p>
              </div>
              <div className="space-y-4">
                <textarea 
                  value={tempBroadcast}
                  onChange={(e) => setTempBroadcast(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-lg focus:border-indigo-500 dark:text-white min-h-[120px]"
                  placeholder="Ketik pesan penting..."
                />
                <button onClick={() => onUpdateBroadcast(tempBroadcast)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Send className="w-5 h-5" /> Broadcast Sekarang
                </button>
              </div>
            </div>
          )}

          {activeAdminView === 'categories' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800">
              <CategoryManager categories={categories} transactions={transactions} onAdd={onAddCategory} onUpdate={onUpdateCategory} onDelete={onDeleteCategory} />
            </div>
          )}

          {activeAdminView === 'transactions' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Master Ledger (Edit Mode)</h3>
              <TransactionList transactions={transactions} onDelete={onDeleteTransaction} onEdit={onUpdateTransaction} showActions={true} />
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Live Activity Feed */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Traffic</h4>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             </div>
             <div className="space-y-6">
                {transactions.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="flex gap-4 group animate-fadeIn">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${t.createdBy === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {(t.createdBy || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4">
                       <div className="flex justify-between mb-1">
                         <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.createdBy || 'user'}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.date}</p>
                       </div>
                       <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate w-32">{t.description}</p>
                       <p className={`text-[10px] font-black mt-1 ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {t.type === TransactionType.INCOME ? '+' : '-'} Rp{t.amount.toLocaleString('id-ID')}
                       </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white">
             <div className="flex items-center gap-3 mb-6">
               <Zap className="w-6 h-6" />
               <h4 className="text-xs font-black uppercase tracking-widest">Sinkronisasi Instan</h4>
             </div>
             <p className="text-xs text-indigo-100 font-bold mb-6 leading-relaxed">Sistem mendeteksi {stats.totalTransactions} baris data yang tersinkron otomatis antar user.</p>
             <button onClick={() => onExport({startDate: '', endDate: '', type: 'all'})} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Download Full Ledger</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
