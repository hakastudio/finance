
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
  Calendar, Filter
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  appName: string;
  onUpdateAppName: (name: string) => void;
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

  // Export Filters State
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportType, setExportType] = useState('all');

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

  const handleExportClick = () => {
    onExport({
      startDate: exportStartDate,
      endDate: exportEndDate,
      type: exportType
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 border border-slate-800/50">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-black uppercase tracking-[0.2em] text-[8px]">Live Data Tunnel</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                <Activity className="w-3.5 h-3.5" />
                <span className="font-black uppercase tracking-[0.2em] text-[8px]">Latency 0ms</span>
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Root Master Panel</h2>
            <p className="text-slate-400 text-sm max-w-sm font-medium">Pengendali pusat seluruh client aplikasi dalam satu jaringan sinkron.</p>
          </div>
          
          <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-full lg:w-auto">
            {[
              { id: 'settings', label: 'Global Branding', icon: Globe },
              { id: 'categories', label: 'Schema Design', icon: Settings2 },
              { id: 'transactions', label: 'Raw Ledger', icon: Database }
            ].map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveAdminView(v.id as any)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeAdminView === v.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <v.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] -z-10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/5 blur-[80px] -z-10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Objects', value: stats.totalTransactions, icon: Database, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Active Schema', value: stats.totalCategories, icon: Settings2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Net Exposure', value: `Rp ${stats.totalValue.toLocaleString('id-ID')}`, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg Pulse', value: `Rp ${Math.round(stats.avgTransaction).toLocaleString('id-ID')}`, icon: BarChart, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-xl group">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12`}><s.icon className="w-5 h-5" /></div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
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
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Application Branding Control</p>
                </div>
                {showSuccess && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase shadow-[0_10px_20px_rgba(16,185,129,0.3)] animate-bounce">
                    <CheckCircle2 className="w-4 h-4" /> Global Update Pushed
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">App Branding Title</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={tempAppName}
                      onChange={(e) => setTempAppName(e.target.value)}
                      className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] outline-none font-black text-lg focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                      placeholder="ENTER APP NAME"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 transition-colors group-focus-within:text-indigo-500">
                      <Edit3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Broadcasting Node Ready</p>
                  </div>
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
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)]'
                }`}
              >
                {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isSaving ? 'Pushing Global Data...' : 'Broadcast to All Tabs'}
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
                    <Database className="w-6 h-6 text-indigo-500" /> Transaction Ledger Base
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Root level data manipulation access</p>
                </div>
              </div>
              
              <div className="border border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden">
                <TransactionList 
                  transactions={transactions} 
                  onDelete={onDeleteTransaction} 
                  onEdit={onUpdateTransaction} 
                  showActions={true} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                   <Download className="w-5 h-5" />
                 </div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Master Export Hub</h4>
               </div>
               
               <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date" 
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none focus:border-indigo-500"
                      />
                      <input 
                        type="date" 
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Filter className="w-3 h-3" /> Transaction Type
                    </label>
                    <select 
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="all" className="bg-slate-900">All Transactions</option>
                      <option value="INCOME" className="bg-slate-900">Incomes Only</option>
                      <option value="EXPENSE" className="bg-slate-900">Expenses Only</option>
                    </select>
                  </div>
               </div>

               <button 
                onClick={handleExportClick} 
                className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
              >
                 Generate Dump
               </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-3 mb-4 text-rose-800 dark:text-rose-400">
              <div className="p-2 bg-rose-500 text-white rounded-xl shadow-[0_5px_15px_rgba(244,63,94,0.4)]">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs">Purge Database</h3>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-500 mb-6 font-bold leading-relaxed uppercase tracking-tight">
              PERINGATAN: Menghapus seluruh data secara permanen di semua perangkat sinkron.
            </p>
            <button onClick={onResetData} className="w-full py-5 bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95 shadow-lg">
              Purge Master Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
