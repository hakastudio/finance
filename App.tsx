
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck, LogOut, Lock, X, AlertCircle, 
  Plus, Search, Calendar, FilterX, ArrowRight, User,
  Moon, Sun, CloudCheck, RefreshCw, Activity
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

const syncChannel = new BroadcastChannel('finance_sync_channel');

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'ai' | 'settings' | 'admin'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = () => {
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
  };

  const broadcastChange = (type: string) => {
    syncChannel.postMessage({ type, timestamp: Date.now() });
  };

  useEffect(() => {
    loadData();

    syncChannel.onmessage = (event) => {
      setIsSyncing(true);
      loadData();
      setTimeout(() => setIsSyncing(false), 1500);
    };

    const handleStorageChange = (e: StorageEvent) => {
      const keysToSync = ['jejaklangkah_data', 'jejaklangkah_categories', 'jejaklangkah_app_name', 'jejaklangkah_theme'];
      if (keysToSync.includes(e.key || '')) {
        setIsSyncing(true);
        loadData();
        setTimeout(() => setIsSyncing(false), 1500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateTransactionsWithSync = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('jejaklangkah_data', JSON.stringify(newTransactions));
    broadcastChange('TRANSACTIONS_UPDATED');
  };

  const updateCategoriesWithSync = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('jejaklangkah_categories', JSON.stringify(newCategories));
    broadcastChange('CATEGORIES_UPDATED');
  };

  const updateAppNameWithSync = (newName: string) => {
    const name = newName.toUpperCase();
    setAppName(name);
    localStorage.setItem('jejaklangkah_app_name', name);
    broadcastChange('APP_NAME_UPDATED');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('jejaklangkah_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    broadcastChange('THEME_UPDATED');
  };

  const addTransaction = (transaction: Transaction) => {
    updateTransactionsWithSync([transaction, ...transactions]);
    setIsQuickAddOpen(false);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    updateTransactionsWithSync(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Hapus catatan ini secara permanen?")) {
      updateTransactionsWithSync(transactions.filter(t => t.id !== id));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin123") {
      setIsAdmin(true);
      localStorage.setItem('jejaklangkah_admin_status', 'true');
      setIsLoginModalOpen(false);
      setActiveTab('admin');
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
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
      
      {isSyncing && (
        <div className="fixed top-24 right-6 z-[110] animate-fadeIn">
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-2xl border border-indigo-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Real-time Syncing...</span>
          </div>
        </div>
      )}

      {(isQuickAddOpen || editingTransaction) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn h-[90vh] md:h-auto overflow-y-auto">
            <div className="bg-indigo-600 p-6 md:p-8 text-white sticky top-0 z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-1">{editingTransaction ? 'Edit Master Data' : 'Tambah Catatan Baru'}</h3>
                <p className="text-indigo-100 text-xs md:text-sm">Sinkronisasi instan aktif di semua perangkat.</p>
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

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 dark:bg-slate-800 p-8 text-white">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Lock className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black">Admin Access</h3>
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
                {loginError && <p className="text-rose-600 text-[10px] font-bold flex items-center gap-1 ml-1"><AlertCircle className="w-3 h-3" /> Password salah.</p>}
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Verify & Login</button>
            </form>
          </div>
        </div>
      )}

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
            { id: 'transactions', label: 'Arsip Kas', icon: History },
            { id: 'reports', label: 'Statistik', icon: BarChart3 },
            { id: 'ai', label: 'Analisis AI', icon: Sparkles },
            { id: 'settings', label: 'Profil', icon: Settings },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === link.id ? 'bg-indigo-600 text-white shadow-xl sidebar-active' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{link.label}</span>
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mt-4 ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400 hover:text-white hover:bg-purple-900/30'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Dasbor Admin</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           {!isAdmin ? (
             <button onClick={() => setIsLoginModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700 transition-colors"><Lock className="w-4 h-4" /> Masuk Admin</button>
           ) : (
             <button onClick={() => { setIsAdmin(false); localStorage.setItem('jejaklangkah_admin_status', 'false'); setActiveTab('dashboard'); }} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-900/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-900/40 transition-colors"><LogOut className="w-4 h-4" /> Keluar Admin</button>
           )}
        </div>
      </aside>

      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-12 py-4 sticky top-0 z-40 flex justify-between items-center h-16 md:h-20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Wallet className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter md:text-sm">
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'transactions' ? 'Arsip Kas' : activeTab === 'reports' ? 'Rekap Laporan' : activeTab === 'ai' ? 'AI Insights' : activeTab === 'admin' ? 'Pusat Kontrol' : 'Account'}
              </h2>
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{appName}</p>
                {isSyncing && <RefreshCw className="w-2.5 h-2.5 text-indigo-500 animate-spin" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-4 py-2 rounded-xl items-center gap-2 transition-all ${isSyncing ? 'scale-105 bg-emerald-100 dark:bg-emerald-900/40' : ''}`}>
               <div className="relative">
                 <CloudCheck className={`w-4 h-4 ${isSyncing ? 'text-indigo-500' : 'text-emerald-500'}`} />
                 {isSyncing && <div className="absolute inset-0 animate-ping bg-indigo-400 rounded-full opacity-75"></div>}
               </div>
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                 {isSyncing ? 'Syncing...' : 'Real-time Linked'}
               </span>
            </div>
            
            <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {!isAdmin && (
              <button onClick={() => setIsLoginModalOpen(true)} className="md:hidden p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                <Lock className="w-5 h-5" />
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
                     <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                       <Plus className="w-5 h-5 text-indigo-500" />
                       Catat Cepat
                     </h3>
                     <TransactionForm onSubmit={addTransaction} categories={categories} />
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                     <div className="flex justify-between items-center mb-6 px-2">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                       <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-[11px] font-black uppercase hover:underline">View All</button>
                     </div>
                     <TransactionList 
                      transactions={transactions.slice(0, 8)} 
                      onDelete={deleteTransaction} 
                      onEdit={setEditingTransaction} 
                      compact 
                      showActions={isAdmin} // Restricted to admin
                     />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Master Ledger</h2>
                  <p className="text-slate-400 font-medium">Semua data tersinkronisasi secara realtime ke Dasbor Admin.</p>
                </div>
                <button onClick={() => setIsQuickAddOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"><Plus className="w-5 h-5" /> Add Transaction</button>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" /></div>
                  <input type="text" placeholder="Cari transaksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold shadow-sm" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                   <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold shadow-sm text-sm" />
                   <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold shadow-sm text-sm" />
                   {hasActiveFilters && <button onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="px-5 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all"><FilterX className="w-5 h-5" /></button>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <TransactionList 
                  transactions={filteredTransactions} 
                  onDelete={deleteTransaction} 
                  onEdit={setEditingTransaction} 
                  showActions={isAdmin} // Restricted to admin
                />
              </div>
            </div>
          )}

          {activeTab === 'reports' && <MonthlyReport transactions={transactions} isDarkMode={theme === 'dark'} />}
          {activeTab === 'ai' && <AIInsights transactions={transactions} summary={summary} />}
          {activeTab === 'admin' && isAdmin && (
            <AdminDashboard 
              transactions={transactions} 
              categories={categories} 
              appName={appName}
              onUpdateAppName={updateAppNameWithSync}
              onAddCategory={(n, t) => { 
                const newCat = { id: crypto.randomUUID(), name: n, type: t, isCustom: true }; 
                updateCategoriesWithSync([...categories, newCat]);
              }} 
              onUpdateCategory={(id, name) => {
                updateCategoriesWithSync(categories.map(c => c.id === id ? { ...c, name } : c));
              }} 
              onDeleteCategory={(id) => {
                updateCategoriesWithSync(categories.filter(c => c.id !== id));
              }} 
              onUpdateTransaction={setEditingTransaction} // Hook back to the main app's edit modal
              onDeleteTransaction={deleteTransaction}
              onResetData={() => { 
                if(confirm("PERINGATAN: Ini akan menghapus SELURUH data di semua tab. Lanjutkan?")) {
                  updateTransactionsWithSync([]); 
                }
              }} 
              onExport={() => {}} 
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto py-10 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-slate-50 dark:border-slate-700">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Personal Account</h2>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <CloudCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Real-time Cloud Node: Active</p>
                </div>
                
                <div className="space-y-4">
                  <button onClick={toggleTheme} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <span className="text-sm">Appearance Mode</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                    </div>
                  </button>
                  
                  {!isAdmin && (
                    <button onClick={() => setIsLoginModalOpen(true)} className="w-full p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[1.5rem] font-black hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex justify-between items-center shadow-xl group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-transform">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm">Masuk Dasbor Admin</span>
                          <span className="block text-[10px] text-slate-400">Master Data & App Control</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Real-time Sync Active • v2.6</p>
            </div>
          )}
        </main>
      </div>

      <button onClick={() => setIsQuickAddOpen(true)} className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all shadow-indigo-300 dark:shadow-none">
        <Plus className="w-8 h-8" />
      </button>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around p-4 z-[60] pb-8">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'transactions', icon: History },
          { id: 'reports', icon: BarChart3 },
          { id: 'ai', icon: Sparkles },
          { id: 'settings', icon: Settings },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`p-3.5 rounded-2xl transition-all relative ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
            <item.icon className="w-6 h-6" />
            {activeTab === item.id && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
