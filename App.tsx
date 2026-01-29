
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import FinancialCharts from './components/FinancialCharts';
import AIInsights from './components/AIInsights';
import MonthlyReport from './components/MonthlyReport';
import AdminDashboard from './components/AdminDashboard';
import { 
  Wallet, History, Sparkles, Settings, 
  Download, LayoutDashboard, BarChart3, 
  ShieldCheck, LogOut, Lock, X, Key, AlertCircle, 
  Plus, Search, Calendar, FilterX, ArrowRight, User,
  Moon, Sun
} from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Gaji', type: TransactionType.INCOME, isCustom: false },
  { id: '2', name: 'Bonus', type: TransactionType.INCOME, isCustom: false },
  { id: '3', name: 'Investasi', type: TransactionType.INCOME, isCustom: false },
  { id: '4', name: 'Makanan', type: TransactionType.EXPENSE, isCustom: false },
  { id: '5', name: 'Transportasi', type: TransactionType.EXPENSE, isCustom: false },
  { id: '6', name: 'Belanja', type: TransactionType.EXPENSE, isCustom: false },
  { id: '7', name: 'Tagihan', type: TransactionType.EXPENSE, isCustom: false },
  { id: '8', name: 'Hiburan', type: TransactionType.EXPENSE, isCustom: false },
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'ai' | 'settings' | 'admin'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('jejaklangkah_data');
    const savedCategories = localStorage.getItem('jejaklangkah_categories');
    const savedAdmin = localStorage.getItem('jejaklangkah_admin_status');
    const savedAppName = localStorage.getItem('jejaklangkah_app_name');
    const savedTheme = localStorage.getItem('jejaklangkah_theme') as 'light' | 'dark';
    
    if (savedTransactions) {
      try { setTransactions(JSON.parse(savedTransactions)); } catch (e) { console.error(e); }
    }
    if (savedCategories) {
      try { setCategories(JSON.parse(savedCategories)); } catch (e) { setCategories(DEFAULT_CATEGORIES); }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
    if (savedAdmin === 'true') setIsAdmin(true);
    if (savedAppName) setAppName(savedAppName);
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jejaklangkah_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('jejaklangkah_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('jejaklangkah_admin_status', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('jejaklangkah_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setIsQuickAddOpen(false);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Hapus catatan ini?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin123") {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setActiveTab('admin');
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleUpdateAppName = (newName: string) => {
    setAppName(newName);
    localStorage.setItem('jejaklangkah_app_name', newName);
  };

  const summary = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === TransactionType.INCOME) {
        acc.totalIncome += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower) ||
        t.amount.toString().includes(lower)
      );
    }
    if (startDate) result = result.filter(t => t.date >= startDate);
    if (endDate) result = result.filter(t => t.date <= endDate);
    return result;
  }, [transactions, searchTerm, startDate, endDate]);

  const hasActiveFilters = searchTerm !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] transition-colors duration-300">
      
      {/* Quick Add Modal (Mobile Friendly) */}
      {(isQuickAddOpen || editingTransaction) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn h-[90vh] md:h-auto overflow-y-auto">
            <div className="bg-indigo-600 p-6 md:p-8 text-white sticky top-0 z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-1">{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
                <p className="text-indigo-100 text-xs md:text-sm">Input data keuangan Anda.</p>
              </div>
              <button onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 md:p-8">
              <TransactionForm 
                onSubmit={editingTransaction ? updateTransaction : addTransaction} 
                onCancel={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }} 
                categories={categories} 
                initialData={editingTransaction} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 dark:bg-slate-800 p-8 text-white">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Lock className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black">Akses Administrator</h3>
              <p className="text-slate-400 text-sm mt-1">Gunakan password 'admin123'</p>
            </div>
            <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border-2 rounded-2xl outline-none font-bold transition-all ${loginError ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-100 dark:border-slate-700 focus:border-indigo-500'}`}
                  autoFocus
                />
                {loginError && <p className="text-rose-600 text-[10px] font-bold flex items-center gap-1 ml-1"><AlertCircle className="w-3 h-3" /> Password salah, coba lagi.</p>}
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95">Masuk Sekarang</button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-slate-900 dark:bg-slate-950 text-white p-8 z-50 border-r border-slate-800/50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Wallet className="w-6 h-6" /></div>
          <div>
             <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keuangan</h1>
             <h1 className="text-lg font-black text-white">{appName}</h1>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'transactions', label: 'Riwayat', icon: History },
            { id: 'reports', label: 'Laporan Bulanan', icon: BarChart3 },
            { id: 'ai', label: 'Analisis AI', icon: Sparkles },
            { id: 'settings', label: 'Pengaturan', icon: Settings },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === link.id ? 'bg-indigo-600 text-white shadow-xl sidebar-active' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{link.label}</span>
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mt-4 ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400 hover:text-white hover:bg-purple-900/30'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Panel Admin</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           {!isAdmin ? (
             <button onClick={() => setIsLoginModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700 transition-colors"><Lock className="w-4 h-4" /> Mode Admin</button>
           ) : (
             <button onClick={() => setIsAdmin(false)} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-900/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-900/40 transition-colors"><LogOut className="w-4 h-4" /> Keluar Admin</button>
           )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-12 py-4 sticky top-0 z-40 flex justify-between items-center h-16 md:h-20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Wallet className="w-5 h-5" /></div>
            <div className="hidden sm:block">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter md:text-sm">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'transactions' ? 'Arsip Kas' : activeTab === 'reports' ? 'Rekap Laporan' : activeTab === 'ai' ? 'Analisis Cerdas' : activeTab === 'admin' ? 'Pusat Kontrol' : 'Profil & Apps'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{appName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-xl items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">Rp {summary.balance.toLocaleString('id-ID')}</span>
            </div>
            
            <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Quick Admin Access Toggle for Mobile */}
            {!isAdmin ? (
              <button onClick={() => setIsLoginModalOpen(true)} className="md:hidden p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-all">
                <Lock className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setActiveTab('admin')} className={`md:hidden p-2.5 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
            
            <button onClick={() => setActiveTab('settings')} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-indigo-500 transition-all">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-6 md:p-12 animate-fadeIn flex-1 pb-32 md:pb-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <SummaryCards summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800"><FinancialCharts transactions={transactions} isDarkMode={theme === 'dark'} /></div>
                   <div className="hidden md:block bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                     <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-slate-100">Catat Baru</h3>
                     <TransactionForm onSubmit={addTransaction} categories={categories} />
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                     <div className="flex justify-between items-center mb-6 px-2">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Aktivitas Terakhir</h3>
                       <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-[11px] font-black uppercase hover:underline">Lihat Semua</button>
                     </div>
                     <TransactionList transactions={transactions.slice(0, 8)} onDelete={deleteTransaction} onEdit={setEditingTransaction} compact />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Arsip Keuangan</h2>
                  <p className="text-slate-400 font-medium">Lacak setiap rupiah yang Anda kelola.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => setIsQuickAddOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"><Plus className="w-5 h-5" /> Catat Kas</button>
                   <button onClick={() => { /* export logic */ }} className="p-4 bg-white dark:bg-slate-900 text-indigo-600 rounded-2xl font-black border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"><Download className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" /></div>
                  <input type="text" placeholder="Cari deskripsi atau kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold shadow-sm" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                   <div className="relative flex-1">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold shadow-sm text-sm" />
                   </div>
                   <div className="flex items-center justify-center text-slate-300 hidden sm:flex"><ArrowRight className="w-4 h-4" /></div>
                   <div className="relative flex-1">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold shadow-sm text-sm" />
                   </div>
                   {hasActiveFilters && <button onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="px-5 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all active:scale-95"><FilterX className="w-5 h-5" /></button>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={setEditingTransaction} />
              </div>
            </div>
          )}

          {activeTab === 'reports' && <MonthlyReport transactions={transactions} />}
          {activeTab === 'ai' && <AIInsights transactions={transactions} summary={summary} />}
          {activeTab === 'admin' && isAdmin && (
            <AdminDashboard 
              transactions={transactions} 
              categories={categories} 
              appName={appName}
              onUpdateAppName={handleUpdateAppName}
              onAddCategory={(n, t) => { const newCat = { id: crypto.randomUUID(), name: n, type: t, isCustom: true }; setCategories(prev => [...prev, newCat]); }} 
              onUpdateCategory={(id, name) => setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c))} 
              onDeleteCategory={(id) => setCategories(prev => prev.filter(c => c.id !== id))} 
              onResetData={() => setTransactions([])} 
              onExport={() => { /* reused logic */ }} 
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto py-10 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-50 dark:from-indigo-950/30 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-slate-50 dark:border-slate-700">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Profil Pengguna</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Data Lokal Terenkripsi</p>
                  
                  <div className="space-y-4">
                    {/* Dark Mode Toggle In Settings */}
                    <button onClick={toggleTheme} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </div>
                        <span className="text-sm">Mode {theme === 'light' ? 'Gelap' : 'Terang'}</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                      </div>
                    </button>

                    <button onClick={() => { /* export */ }} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500 group-hover:scale-110 transition-transform"><Download className="w-5 h-5" /></div>
                        <span className="text-sm">Cadangkan Data (CSV)</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                    
                    {!isAdmin ? (
                      <button onClick={() => setIsLoginModalOpen(true)} className="w-full p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[1.5rem] font-black hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex justify-between items-center shadow-xl shadow-slate-200 dark:shadow-none group active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-transform"><ShieldCheck className="w-6 h-6" /></div>
                          <div className="text-left">
                            <span className="block text-sm">Aktifkan Mode Admin</span>
                            <span className="block text-[10px] text-slate-400 font-medium">Kelola kategori & sistem</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button onClick={() => setActiveTab('admin')} className="w-full p-6 bg-purple-600 text-white rounded-[1.5rem] font-black hover:bg-purple-700 transition-all flex justify-between items-center shadow-xl shadow-purple-100 dark:shadow-none group active:scale-[0.98]">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500 rounded-xl group-hover:rotate-12 transition-transform"><LayoutDashboard className="w-6 h-6" /></div>
                            <span className="text-sm">Dashboard Admin</span>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsAdmin(false)} className="w-full py-4 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                          Keluar dari Mode Admin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{appName} v2.1 • 2024</p>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => setIsQuickAddOpen(true)}
        className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all shadow-indigo-200 dark:shadow-none"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around p-4 z-[60] pb-8 transition-colors">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'transactions', icon: History },
          { id: 'reports', icon: BarChart3 },
          { id: 'ai', icon: Sparkles },
          { id: 'settings', icon: Settings },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)} 
            className={`p-3.5 rounded-2xl transition-all relative ${activeTab === item.id ? (isAdmin ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20') : 'text-slate-400 dark:text-slate-500'}`}
          >
            <item.icon className="w-6 h-6" />
            {activeTab === item.id && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-purple-600' : 'bg-indigo-600'}`}></div>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
