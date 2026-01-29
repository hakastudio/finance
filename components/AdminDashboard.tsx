
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import CategoryManager from './CategoryManager';
import TransactionList from './TransactionList';
import { 
  ShieldCheck, Database, Trash2, 
  Download, Activity, BarChart, 
  Settings2, Info, Save, CheckCircle2,
  Layout, Globe, RefreshCw, ListFilter,
  ArrowRightCircle, Edit3, CloudLightning
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  appName: string;
  onUpdateAppName: (name: string) => void;
  onAddCategory: (name: string, type: TransactionType) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void; // Used to trigger the edit modal
  onDeleteTransaction: (id: string) => void;
  onResetData: () => void;
  onExport: () => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  transactions, 
  categories, 
  appName: currentAppName,
  onUpdateAppName,
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onUpdateTransaction,
  onDeleteTransaction,
  onResetData,
  onExport
}) => {
  const [tempAppName, setTempAppName] = useState(currentAppName);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeAdminView, setActiveAdminView] = useState<'settings' | 'categories' | 'transactions'>('settings');

  useEffect(() => {
    setTempAppName(currentAppName);
  }, [currentAppName]);

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

  const handleSaveSettings = () => {
    if (!tempAppName.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateAppName(tempAppName);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold uppercase tracking-widest text-[9px]">Live Data Stream</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-widest text-[9px]">Uptime 99.9%</span>
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight">Master Panel</h2>
            <p className="text-slate-400 text-sm max-w-sm">Kelola seluruh ekosistem keuangan aplikasi secara realtime.</p>
          </div>
          
          <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-full lg:w-auto">
            {[
              { id: 'settings', label: 'App Settings', icon: Globe },
              { id: 'categories', label: 'Categories', icon: Settings2 },
              { id: 'transactions', label: 'Master Data', icon: Database }
            ].map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveAdminView(v.id as any)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeAdminView === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <v.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -z-10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Master Logs', value: stats.totalTransactions, icon: Database, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Schema Keys', value: stats.totalCategories, icon: Settings2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Net Liquidity', value: `Rp ${stats.totalValue.toLocaleString('id-ID')}`, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Network Pulse', value: `Rp ${Math.round(stats.avgTransaction).toLocaleString('id-ID')}`, icon: BarChart, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}><s.icon className="w-5 h-5" /></div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {activeAdminView === 'settings' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-indigo-500" /> Identity Hub
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Application Branding</p>
                </div>
                {showSuccess && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-emerald-200 dark:shadow-none animate-bounce">
                    <CheckCircle2 className="w-4 h-4" /> Pushed Successfully
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">App Title (Realtime Sync)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={tempAppName}
                      onChange={(e) => setTempAppName(e.target.value)}
                      className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] outline-none font-black text-lg focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                      placeholder="ENTER APP NAME"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                      <Edit3 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-indigo-500 font-bold ml-1 animate-pulse italic">
                    Perubahan ini akan langsung terupdate di semua tab pengguna secara instan.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving || tempAppName === currentAppName}
                className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl active:scale-95 ${
                  isSaving 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-wait' 
                    : tempAppName === currentAppName
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-300 dark:hover:shadow-none'
                }`}
              >
                {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isSaving ? 'Broadcasting Data...' : 'Push Update Realtime'}
              </button>
            </div>
          )}

          {activeAdminView === 'categories' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn">
              <CategoryManager categories={categories} onAdd={onAddCategory} onUpdate={onUpdateCategory} onDelete={onDeleteCategory} />
            </div>
          )}

          {activeAdminView === 'transactions' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-500" /> Central Transaction Ledger
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Akses root (Edit & Hapus) untuk seluruh data</p>
                </div>
              </div>
              
              <div className="border border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden">
                <TransactionList 
                  transactions={transactions} 
                  onDelete={onDeleteTransaction} 
                  onEdit={onUpdateTransaction} 
                  showActions={true} // Always allow edit here in Admin view
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-rose-50 dark:bg-rose-950/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-3 mb-4 text-rose-800 dark:text-rose-400">
              <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black uppercase tracking-tight">Database Purge</h3>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-500 mb-6 font-bold leading-relaxed">
              Tindakan destruktif: Menghapus seluruh data dari semua client secara permanen.
            </p>
            <button onClick={onResetData} className="w-full py-5 bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300">
              Execute Master Reset
            </button>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-600 text-white rounded-xl">
                   <Download className="w-5 h-5" />
                 </div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Ledger Export</h4>
               </div>
               <button onClick={onExport} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-300">
                 Generate Master CSV
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
