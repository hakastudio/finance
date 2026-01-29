
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import CategoryManager from './CategoryManager';
import { 
  ShieldCheck, Database, Trash2, 
  Download, Activity, BarChart, 
  Settings2, Info, Save, CheckCircle2,
  Layout, Globe, RefreshCw
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  appName: string;
  onUpdateAppName: (name: string) => void;
  onAddCategory: (name: string, type: TransactionType) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
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
  onResetData,
  onExport
}) => {
  const [tempAppName, setTempAppName] = useState(currentAppName);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync temp value if currentAppName changes from outside
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
        : 0
    };
  }, [transactions, categories]);

  const handleSaveSettings = () => {
    if (!tempAppName.trim()) return;
    
    setIsSaving(true);
    // Simulasi delay untuk feedback visual "Processing"
    setTimeout(() => {
      onUpdateAppName(tempAppName.toUpperCase());
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 dark:bg-slate-900/40 p-8 rounded-[2.5rem] text-white shadow-xl dark:shadow-none border border-transparent dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Pusat Kendali Sistem</span>
          </div>
          <h2 className="text-2xl font-black mb-1">Administrator Dashboard</h2>
          <p className="text-slate-400 text-xs max-w-sm">Kelola identitas aplikasi dan struktur kategori keuangan.</p>
        </div>
        <Layout className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5 text-white" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Data Transaksi', value: stats.totalTransactions, icon: Database, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Kategori', value: stats.totalCategories, icon: Settings2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Status Server', value: 'Synced', icon: RefreshCw, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Rerata Kas', value: `Rp ${Math.round(stats.avgTransaction).toLocaleString('id-ID')}`, icon: BarChart, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}><s.icon className="w-4 h-4" /></div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5">{s.label}</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-200">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Branding Aplikasi
              </h3>
              {showSuccess && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase animate-fadeIn">
                  <CheckCircle2 className="w-3 h-3" /> Tersinkronisasi
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Tampilan App</label>
                <input 
                  type="text" 
                  value={tempAppName}
                  onChange={(e) => setTempAppName(e.target.value)}
                  placeholder="CONTOH: KAS PRIBADI"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
              <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Zona Waktu Sistem</label>
                <div className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-400 dark:text-slate-500">
                  Asia/Jakarta (GMT+7)
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving || tempAppName === currentAppName}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
                isSaving 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                  : tempAppName === currentAppName
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95'
              }`}
            >
              {isSaving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menyimpan...' : 'Sinkronkan Sekarang'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <CategoryManager categories={categories} onAdd={onAddCategory} onUpdate={onUpdateCategory} onDelete={onDeleteCategory} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-2 mb-4 text-rose-800 dark:text-rose-400">
              <Info className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-tight">Zona Pembersihan</h3>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-500 mb-6 font-medium">Tindakan ini akan menghapus seluruh histori transaksi secara permanen dari perangkat ini.</p>
            <button onClick={onResetData} className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-sm hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95">
              <Trash2 className="w-4 h-4" /> Reset Database
            </button>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="text-xs font-black text-indigo-800 dark:text-indigo-400 mb-4 uppercase tracking-widest">Master Backup</h4>
               <p className="text-[11px] text-indigo-600 dark:text-indigo-500 mb-6 font-medium">Unduh salinan data keuangan Anda dalam format .CSV untuk arsip pribadi atau Excel.</p>
               <button onClick={onExport} className="w-full py-4 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-sm hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm dark:shadow-none">
                 <Download className="w-4 h-4" /> Ekspor Data (.CSV)
               </button>
             </div>
             <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform">
               <Database className="w-32 h-32 text-indigo-900 dark:text-indigo-400" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
