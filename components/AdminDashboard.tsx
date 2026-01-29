
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import CategoryManager from './CategoryManager';
import { 
  ShieldCheck, Database, Trash2, 
  Download, Activity, BarChart, 
  Settings2, Info, Save, CheckCircle2,
  Layout, Globe
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onAddCategory: (name: string, type: TransactionType) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onResetData: () => void;
  onExport: () => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  transactions, 
  categories, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onResetData,
  onExport
}) => {
  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [currency, setCurrency] = useState('IDR');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('jejaklangkah_app_name');
    if (savedName) setAppName(savedName);
  }, []);

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
    setIsSaving(true);
    // Responsif: Simpan langsung ke local storage
    setTimeout(() => {
      localStorage.setItem('jejaklangkah_app_name', appName);
      setIsSaving(false);
      setShowSuccess(true);
      window.location.reload(); // Reload untuk menerapkan branding global
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200); // Delay singkat untuk kepuasan visual
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">System Administrator</span>
          </div>
          <h2 className="text-2xl font-black mb-1">Panel Kendali</h2>
          <p className="text-slate-400 text-xs max-w-sm">Kelola master data dan konfigurasi inti sistem.</p>
        </div>
        <Layout className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5 text-white" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Data Kas', value: stats.totalTransactions, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Kategori', value: stats.totalCategories, icon: Settings2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Aktivitas', value: 'Live', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rerata Rp', value: Math.round(stats.avgTransaction).toLocaleString('id-ID'), icon: BarChart, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}><s.icon className="w-4 h-4" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{s.label}</p>
            <p className="text-base font-black text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> Pengaturan Global
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Aplikasi</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value.toUpperCase())}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mata Uang</label>
                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold">
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
            >
              {isSaving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menerapkan...' : 'Simpan Perubahan'}
            </button>
            {showSuccess && <p className="mt-4 text-emerald-600 text-xs font-bold flex items-center gap-1 animate-fadeIn"><CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil diperbarui!</p>}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <CategoryManager categories={categories} onAdd={onAddCategory} onUpdate={onUpdateCategory} onDelete={onDeleteCategory} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
            <h3 className="text-rose-800 font-black mb-4 flex items-center gap-2"><Info className="w-5 h-5" /> Zona Bahaya</h3>
            <button onClick={onResetData} className="w-full py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Reset Database
            </button>
          </div>
          <div className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200">
             <h4 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Maintenance</h4>
             <button onClick={onExport} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
               <Download className="w-4 h-4" /> Backup Sekarang
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
