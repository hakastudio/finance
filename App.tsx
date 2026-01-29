
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
  Database as DbIcon, Megaphone, Bell, Download, Calendar, Filter,
  Fingerprint, ArrowRight, Eye, EyeOff
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
  const [showPassword, setShowPassword] = useState(false);

  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Realtime Sync Status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success'}[]>([]);
  
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
      const savedBroadcast = localStorage.getItem('jejaklangkah_broadcast');
      
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      else setCategories(DEFAULT_CATEGORIES);
      
      if (savedAppName) setAppName(savedAppName);
      if (savedBroadcast) setBroadcastMessage(savedBroadcast);
      
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

  const addNotification = (message: string, type: 'info' | 'success' = 'info') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [{id, message, type}, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    loadData();

    syncChannel.onmessage = (event) => {
      setSyncStatus('syncing');
      loadData();
      
      if (event.data.type === 'BROADCAST_UPDATED') {
        setBroadcastMessage(event.data.data);
      }
      
      if (event.data.type === 'TRANSACTIONS_UPDATED' && userRole === 'admin') {
        addNotification("Data baru telah masuk ke database!", "success");
      }

      setTimeout(() => setSyncStatus('synced'), 800);
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (['jejaklangkah_data', 'jejaklangkah_categories', 'jejaklangkah_app_name', 'jejaklangkah_broadcast'].includes(e.key || '')) {
        setSyncStatus('syncing');
        loadData();
        setTimeout(() => setSyncStatus('synced'), 800);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userRole]);

  const updateTransactionsWithSync = (newTransactions: Transaction[]) => {
    setSyncStatus('syncing');
    setTransactions(newTransactions);
    localStorage.setItem('jejaklangkah_data', JSON.stringify(newTransactions));
    syncChannel.postMessage({ type: 'TRANSACTIONS_UPDATED', timestamp: Date.now() });
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const updateCategoriesWithSync = (newCategories: Category[]) => {
    setSyncStatus('syncing');
    setCategories(newCategories);
    localStorage.setItem('jejaklangkah_categories', JSON.stringify(newCategories));
    syncChannel.postMessage({ type: 'CATEGORIES_UPDATED' });
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const updateAppNameWithSync = (newName: string) => {
    setSyncStatus('syncing');
    setAppName(newName);
    localStorage.setItem('jejaklangkah_app_name', newName);
    syncChannel.postMessage({ type: 'APP_NAME_UPDATED' });
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const updateBroadcastWithSync = (message: string) => {
    setSyncStatus('syncing');
    setBroadcastMessage(message);
    localStorage.setItem('jejaklangkah_broadcast', message);
    syncChannel.postMessage({ type: 'BROADCAST_UPDATED', data: message });
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    
    // Simple Auth Logic
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setUserRole('admin');
      localStorage.setItem('jejaklangkah_auth_role', 'admin');
      addNotification("Selamat datang kembali, Admin!", "success");
    } else if (loginUsername === 'user' && loginPassword === 'user123') {
      setIsAuthenticated(true);
      setUserRole('user');
      localStorage.setItem('jejaklangkah_auth_role', 'user');
      setActiveTab('dashboard');
      addNotification("Halo! Mulai catat langkah keuanganmu.", "success");
    } else {
      setLoginError(true);
      // Animasi shake ditangani oleh class CSS
    }
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem('jejaklangkah_auth_role');
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  const addTransaction = (transaction: Transaction) => {
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
    if (window.confirm("Hapus catatan ini secara permanen?")) {
      updateTransactionsWithSync(transactions.filter(t => t.id !== id));
    }
  };

  const handleExport = (filters: { startDate: string; endDate: string; type: string }) => {
    let filtered = transactions;
    if (filters.startDate) filtered = filtered.filter(t => t.date >= filters.startDate);
    if (filters.endDate) filtered = filtered.filter(t => t.date <= filters.endDate);
    if (filters.type !== 'all') filtered = filtered.filter(t => t.type === filters.type);

    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Tanggal,Tipe,Kategori,Deskripsi,Jumlah,Oleh"].concat(
        filtered.map(t => `${t.id},${t.date},${t.type},${t.category},${t.description},${t.amount},${t.createdBy}`)
      ).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "master_ledger.csv");
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

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        {/* Abstract Background Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 relative z-10 transition-all duration-500 ${loginError ? 'animate-shake' : 'animate-fadeIn'}`}>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 dark:shadow-none animate-bounce">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">JEJAK LANGKAH</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Sistem Manajemen Keuangan Realtime</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <UserCircle className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-800 dark:text-white focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-800 dark:text-white focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/20">
                <AlertCircle className="w-4 h-4" />
                Kredensial tidak valid!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Autentikasi Sesi <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Key className="w-3 h-3" /> Akun Demo
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">Admin Access</p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">User: admin</p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Pass: admin123</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">User Access</p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">User: user</p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Pass: user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Realtime Toasts */}
      <div className="fixed top-20 right-6 z-[120] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border pointer-events-auto ${n.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-indigo-600 text-white border-indigo-500'}`}>
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest">{n.message}</span>
          </div>
        ))}
      </div>

      {broadcastMessage && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-indigo-600 text-white py-2 overflow-hidden shadow-lg">
          <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-2 px-4">
                <Megaphone className="w-3 h-3 text-indigo-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">{broadcastMessage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-slate-900 dark:bg-slate-950 text-white p-8 z-50 transition-colors duration-500">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Wallet className="w-6 h-6" /></div>
          <h1 className="text-lg font-black tracking-tighter">{appName}</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'transactions', label: 'Master DB', icon: DbIcon },
            { id: 'reports', label: 'Laporan', icon: BarChart3 },
            { id: 'ai', label: 'AI Analis', icon: Sparkles },
            { id: 'settings', label: 'Profil', icon: Settings },
          ].map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === link.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{link.label}</span>
            </button>
          ))}
          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mt-4 ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/10' : 'text-purple-400 hover:bg-purple-900/30'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Control Panel</span>
            </button>
          )}
        </nav>
        
        <div className="mt-auto space-y-4">
          <div className="p-4 bg-slate-800/50 dark:bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${userRole === 'admin' ? 'bg-purple-500' : 'bg-indigo-500'}`}>
               {(userRole || 'u').charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sesi Aktif</p>
               <p className="text-xs font-bold text-white truncate">{userRole === 'admin' ? 'Administrator' : 'Pengguna Standar'}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300">
            <LogOut className="w-4 h-4" /> Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen pt-4">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-12 py-4 sticky top-10 z-40 flex justify-between items-center transition-all duration-500">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
               {syncStatus === 'syncing' ? 'Sinkronisasi Realtime...' : 'Cloud Synced'}
             </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-all hover:scale-110 active:scale-95">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="md:hidden">
              <button onClick={handleLogout} className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-12 animate-fadeIn flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <SummaryCards summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"><FinancialCharts transactions={transactions} isDarkMode={theme === 'dark'} /></div>
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                     <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Plus className="w-5 h-5 text-indigo-500" /> Input Cepat</h3>
                     <TransactionForm onSubmit={addTransaction} categories={categories} />
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 h-full shadow-sm">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Aktivitas Terakhir</h3>
                     <TransactionList transactions={transactions.slice(0, 10)} onDelete={deleteTransaction} onEdit={setEditingTransaction} compact showActions={userRole === 'admin'} />
                   </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'transactions' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Master Ledger</h2>
                  <p className="text-slate-400 text-sm font-medium">Database sinkronisasi realtime lintas perangkat.</p>
                </div>
                <button onClick={() => setIsQuickAddOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Record</button>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={setEditingTransaction} showActions={userRole === 'admin'} />
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
              broadcastMessage={broadcastMessage}
              onUpdateAppName={updateAppNameWithSync}
              onUpdateBroadcast={updateBroadcastWithSync}
              onAddCategory={(n, t) => { 
                const newCat = { id: crypto.randomUUID(), name: n, type: t, isCustom: true }; 
                updateCategoriesWithSync([...categories, newCat]);
              }} 
              onUpdateCategory={(id, newName) => {
                const oldCategory = categories.find(c => c.id === id);
                if (!oldCategory) return;
                
                const oldName = oldCategory.name;
                const newCategories = categories.map(c => c.id === id ? { ...c, name: newName } : c);
                updateCategoriesWithSync(newCategories);

                if (oldName !== newName) {
                  const newTransactions = transactions.map(t => t.category === oldName ? { ...t, category: newName } : t);
                  updateTransactionsWithSync(newTransactions);
                  addNotification(`Kategori diperbarui ke "${newName}".`, "success");
                }
              }} 
              onDeleteCategory={(id) => {
                updateCategoriesWithSync(categories.filter(c => c.id !== id));
              }} 
              onUpdateTransaction={setEditingTransaction} 
              onDeleteTransaction={deleteTransaction}
              onResetData={() => { if(confirm("Hapus seluruh record?")) updateTransactionsWithSync([]); }} 
              onExport={handleExport} 
            />
          )}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto py-10 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden shadow-sm">
                <div className={`w-24 h-24 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${userRole === 'admin' ? 'bg-purple-600 shadow-purple-200' : 'bg-indigo-600 shadow-indigo-200'} dark:shadow-none`}>
                  <UserCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{userRole} Profile</h2>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Access Node: Secure & Active</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Peran Sistem</span>
                    <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">{userRole}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Sesi Berakhir</span>
                    <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Permanen</span>
                  </div>
                </div>

                <button onClick={handleLogout} className="mt-12 w-full p-6 bg-rose-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-rose-100 dark:shadow-none active:scale-95">
                  <LogOut className="w-6 h-6" /> Akhiri Sesi Aktif
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {(isQuickAddOpen || editingTransaction) && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden h-[90vh] md:h-auto overflow-y-auto p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{editingTransaction ? 'Edit Master Data' : 'Tambah Record Baru'}</h3>
              <button onClick={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <TransactionForm onSubmit={editingTransaction ? updateTransaction : addTransaction} onCancel={() => { setIsQuickAddOpen(false); setEditingTransaction(null); }} categories={categories} initialData={editingTransaction} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
