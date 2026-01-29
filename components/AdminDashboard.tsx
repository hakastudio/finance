
import React, { useMemo, useState } from 'react';
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
  const [appName, setAppName] = useState('KEUANGAN JEJAK LANGKAH');
  const [currency, setCurrency] = useState('IDR');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalIncomeItems = transactions.filter(t => t.type === TransactionType.INCOME).length;
    const totalExpenseItems = transactions.filter(t => t.type === TransactionType.EXPENSE).length;
    const avgTransaction = totalTransactions > 0 
      ? transactions.reduce((acc, t) => acc + t.amount, 0) / totalTransactions 
      : 0;

    return { totalTransactions, totalIncomeItems, totalExpenseItems, avgTransaction };
  }, [transactions]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulasi proses penyimpanan
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      // Di sini bisa ditambahkan logika penyimpanan ke localStorage atau backend jika diperlukan
      localStorage.setItem('jejaklangkah_app_name', appName);
    }, 8000);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Akses Level: Super Administrator</span>
          </div>
          <h2 className="text-3xl font-black mb-2">Pusat Kendali Sistem</h2>
          <p className="text-purple-200 max-w-lg">Kelola kategori transaksi, audit data sistem, dan lakukan pemeliharaan database aplikasi.</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-64 h-64 rotate-12" />
        </div>
      </div>

      {/* Statistik Sistem */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Transaksi', value: stats.totalTransactions, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Kategori', value: categories.length, icon: Settings2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Log Aktivitas', value: 'Active', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rerata Nilai', value: `Rp ${Math.round(stats.avgTransaction).toLocaleString('id-ID')}`, icon: BarChart, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Management Kategori */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Settings2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Master Kategori Transaksi</h3>
                  <p className="text-xs text-slate-500">Edit jenis transaksi yang tersedia bagi pengguna.</p>
                </div>
              </div>
            </div>
            
            <CategoryManager 
              categories={categories}
              onAdd={onAddCategory}
              onUpdate={onUpdateCategory}
              onDelete={onDeleteCategory}
            />
          </div>

          {/* Pengaturan Umum */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Pengaturan Umum</h3>
                <p className="text-xs text-slate-500">Konfigurasi dasar identitas aplikasi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Aplikasi</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Layout className="w-5 h-5 text-slate-300" />
                  </div>
                  <input 
                    type="text" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold focus:border-indigo-500 transition-all"
                    placeholder="Contoh: Dompet Cerdas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mata Uang Dasar</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="IDR">IDR - Rupiah Indonesia</option>
                  <option value="USD">USD - Dollar Amerika</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              {showSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5" />
                  Pengaturan berhasil disimpan ke sistem!
                </div>
              )}
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`group relative overflow-hidden w-full md:w-auto md:min-w-[280px] py-4 px-10 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl ${
                  isSaving 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {isSaving ? (
                    <div className="w-5 h-5 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Zona Bahaya</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Aksi di bawah ini bersifat permanen dan tidak dapat dibatalkan. Pastikan Anda telah mencadangkan data terlebih dahulu.</p>
              </div>

              <button 
                onClick={onExport}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="font-bold text-slate-700">Backup Seluruh Database</span>
                </div>
              </button>

              <button 
                onClick={onResetData}
                className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-rose-600" />
                  <span className="font-bold text-rose-700">Kosongkan Semua Data</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h4 className="font-black text-lg mb-4">Informasi Sesi</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ID Admin:</span>
                <span className="font-mono">AD-JL-9921</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Login Terakhir:</span>
                <span className="font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status Database:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-tighter">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
