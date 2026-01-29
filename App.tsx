
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
  LayoutDashboard, BarChart3, 
  ShieldCheck, LogOut, Lock, X, AlertCircle, 
  Plus, Search, User,
  Moon, Sun, CloudCheck, RefreshCw, Activity,
  Key, UserCircle, CheckCircle2, Wifi, WifiOff,
  Database as DbIcon
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
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Sync status state: idle | syncing | synced | error
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = () => {
    try {
      const savedTransactions = localStorage.getItem('jejaklangkah_data');
      const savedCategories = localStorage.getItem('jejaklangkah_categories');
      const savedAppName = localStorage.getItem('jejaklangkah_app_name');
      const savedTheme = localStorage.getItem('jejaklangkah_theme') as 'light' | 'dark';
      const savedAuth = localStorage.getItem('jejaklangkah_auth_role');
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      if (savedAppName) setAppName(savedAppName);
      if (savedAuth) {
        setIsAuthenticated(true);
        setUserRole(savedAuth as 'admin' | 'user');
      }
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const broadcastChange = (type: string, data?: any) => {
    syncChannel.postMessage({ type, data, timestamp: Date.now() });
  };

  useEffect(() => {
    loadData();

    syncChannel.onmessage = (event) => {
      setSyncStatus('syncing');
      loadData();
      setTimeout(() => setSyncStatus('synced'), 800);
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    const handleStorageChange = (e: StorageEvent) => {
      const keysToSync = ['jejaklangkah_data', 'jejaklangkah_categories', 'jejaklangkah_app_name', 'jejaklangkah_theme'];
      if (keysToSync.includes(e.key || '')) {
        setSyncStatus('syncing');
        loadData();
        setTimeout(() => setSyncStatus('synced'), 800);
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateTransactionsWithSync = (newTransactions: Transaction[]) => {
    setSyncStatus('syncing');
    setTransactions(newTransactions);
    localStorage.setItem('jejaklangkah_data', JSON.stringify(newTransactions));
    broadcastChange('TRANSACTIONS_UPDATED');
    setTimeout(() => setSyncStatus('synced'), 800);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const updateCategoriesWithSync = (newCategories: Category[]) => {
    setSyncStatus('syncing');
    setCategories(newCategories);
    localStorage.setItem('jejaklangkah_categories', JSON.stringify(newCategories));
    broadcastChange('CATEGORIES_UPDATED');
    setTimeout(() => setSyncStatus('synced'), 800);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const updateAppNameWithSync = (newName: string) => {
    setSyncStatus('syncing');
    setAppName(newName);
    localStorage.setItem('jejaklangkah_app_name', newName);
    broadcastChange('APP_NAME_UPDATED');
    setTimeout(() => setSyncStatus('synced'), 800);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setUserRole('admin');
      localStorage.setItem('jejaklangkah_auth_role', 'admin');
      setLoginError(false);
    } else if (loginUsername === 'user' && loginPassword === 'user123') {
      setIsAuthenticated(true);
      setUserRole('user');
      localStorage.setItem('jejaklangkah_auth_role', 'user');
      setLoginError(false);
      setActiveTab('dashboard');
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('jejaklangkah_auth_role');
    setLoginUsername('');
    setLoginPassword('');
  };

  const addTransaction = (transaction: Transaction) => {
    // Inject user role as creator
    const transactionWithCreator = { ...transaction, createdBy: userRole || 'user' };
    updateTransactionsWithSync([transactionWithCreator, ...transactions]);
    setIsQuickAddOpen(false);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    if (userRole !== 'admin') return;
    updateTransactionsWithSync(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (userRole !== 'admin') return;
    if (window.confirm("Hapus catatan ini secara permanen dari database?")) {
      updateTransactionsWithSync(transactions.filter(t => t.id !== id));
    }
  };

  const handleExport = (filters: { startDate: string; endDate: string; type: string }) => {
    let filtered = transactions;
    if (filters.startDate) filtered = filtered.filter(t => t.date >= filters.startDate);
    if (filters.endDate) filtered = filtered.filter(t => t.date <= filters.endDate);
    if (filters.type !== 'all') filtered = filtered.filter(t => t.type === filters.type);

    if (filtered.length === 0) {
      alert("Tidak ada data untuk diekspor dengan filter ini.");
      return;
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Dibuat Oleh'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      t.type,
      t.category,
      t.description,
      t.amount,
      t.createdBy || 'user'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Export_Finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 transition-colors duration-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative animate-fadeIn">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{appName}</h1>
            <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">Database Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin / user"
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-4 rounded-xl text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4" />
                Username atau Password salah.
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">
              Akses Database
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Akun Admin</p>
               <p className="text-[10px] font-bold text-slate-400">admin / admin123</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Akun User</p>
               <p className="text-[10px] font-bold text-slate-400">user / user123</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] transition-colors duration-300">
      
      {(isQuickAddOpen || editingTransaction) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn h-[90vh] md:h-auto overflow-y-auto">
            <div className="bg-indigo-600 p-6 md:p-8 text-white sticky top-0 z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-1">{editingTransaction ? 'Update Master Data' : 'Tambah Record Baru'}</h3>
                <p className="text-indigo-100 text-xs md:text-sm">Input data otomatis tersimpan di database APP.</p>
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

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-slate-900 dark:bg-slate-950 text-white p-8 z-50 border-r border-slate-800/50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Wallet className="w-6 h-6" /></div>
          <div>
             <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial</h1>
             <h1 className="text-lg font-black text-white">{appName}</h1>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'transactions', label: 'Master Database', icon: DbIcon },
            { id: 'reports', label: 'Statistik Laporan', icon: BarChart3 },
            { id: 'ai', label: 'Analisis Cerdas', icon: Sparkles },
            { id: 'settings', label: 'Profil Akun', icon: Settings },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === link.id ? 'bg-indigo-600 text-white shadow-xl sidebar-active' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{link.label}</span>
            </button>
          ))}
          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mt-4 ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400 hover:text-white hover:bg-purple-900/30'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Control Center</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <div className="mb-4 flex items-center gap-3 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase ${userRole === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                {userRole?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate uppercase">{userRole === 'admin' ? 'Database Admin' : 'Standard Input'}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Live Status: Active</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-900/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-900/40 transition-colors">
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-12 py-4 sticky top-0 z-40 flex justify-between items-center h-16 md:h-20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Wallet className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter md:text-sm">
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'transactions' ? 'Master Database' : activeTab === 'reports' ? 'Rekap Laporan' : activeTab === 'ai' ? 'AI Insights' : activeTab === 'admin' ? 'Pusat Kontrol' : 'Account'}
              </h2>
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{appName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Realtime Sync Indicator Pill */}
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border transition-all duration-500 ${
              syncStatus === 'syncing' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' :
              syncStatus === 'synced' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' :
              syncStatus === 'error' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-shake' :
              'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
               {syncStatus === 'syncing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                syncStatus === 'synced' ? <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" /> :
                syncStatus === 'error' ? <WifiOff className="w-3.5 h-3.5" /> :
                <div className="relative">
                  <Wifi className="w-3.5 h-3.5 opacity-50" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                </div>
               }
               <span className="hidden xs:inline text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                 {syncStatus === 'syncing' ? 'Updating Database...' : 
                  syncStatus === 'synced' ? 'Database Synced' : 
                  syncStatus === 'error' ? 'Connection Error' : 
                  'Database Online'}
               </span>
            </div>
            
            <button onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              localStorage.setItem('jejaklangkah_theme', newTheme);
              if (newTheme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
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
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                     <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                       <Plus className="w-5 h-5 text-indigo-500" />
                       Catat ke Database
                     </h3>
                     <TransactionForm onSubmit={addTransaction} categories={categories} />
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                     <div className="flex justify-between items-center mb-6 px-2">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Activity</h3>
                       <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-[11px] font-black uppercase hover:underline">Full Database</button>
                     </div>
                     <TransactionList 
                      transactions={transactions.slice(0, 8)} 
                      onDelete={deleteTransaction} 
                      onEdit={setEditingTransaction} 
                      compact 
                      showActions={userRole === 'admin'} 
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
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Master Database Ledger</h2>
                  <p className="text-slate-400 font-medium">Seluruh input data tersimpan secara otomatis di database APP.</p>
                </div>
                <button onClick={() => setIsQuickAddOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"><Plus className="w-5 h-5" /> Add Transaction</button>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" /></div>
                  <input type="text" placeholder="Cari data di database..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold shadow-sm" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <TransactionList 
                  transactions={filteredTransactions} 
                  onDelete={deleteTransaction} 
                  onEdit={setEditingTransaction} 
                  showActions={userRole === 'admin'} 
                />
              </div>
            </div>
          )}

          {activeTab === 'reports' && <MonthlyReport transactions={transactions} isDarkMode={theme === 'dark'} />}
          {activeTab === 'ai' && <AIInsights transactions={transactions} summary={summary} />}
          {activeTab === 'admin' && userRole === 'admin' && (
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
              onUpdateTransaction={setEditingTransaction} 
              onDeleteTransaction={deleteTransaction}
              onResetData={() => { 
                if(confirm("Hapus seluruh record dari database?")) {
                  updateTransactionsWithSync([]); 
                }
              }} 
              onExport={handleExport} 
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto py-10 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                <div className={`w-24 h-24 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-slate-50 dark:border-slate-700 ${userRole === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tighter">{userRole} Identity</h2>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className={`w-2 h-2 rounded-full ${syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Database Node: {syncStatus === 'error' ? 'Interrupted' : 'Active'}</p>
                </div>
                
                <div className="space-y-4">
                  <button onClick={handleLogout} className="w-full p-6 bg-rose-600 text-white rounded-[1.5rem] font-black hover:bg-rose-700 transition-all flex justify-between items-center shadow-xl group">
                    <div className="flex items-center gap-4">
                      <LogOut className="w-6 h-6" />
                      <span className="text-sm">Sign Out from Session</span>
                    </div>
                  </button>
                </div>
              </div>
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
          { id: 'transactions', icon: DbIcon },
          { id: 'reports', icon: BarChart3 },
          { id: 'ai', icon: Sparkles },
          { id: 'settings', icon: Settings },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`p-3.5 rounded-2xl transition-all relative ${activeTab === item.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-slate-500'}`}>
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
