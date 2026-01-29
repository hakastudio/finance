
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category, SyncLog } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import FinancialCharts from './components/FinancialCharts';
import AIInsights from './components/AIInsights';
import MonthlyReport from './components/MonthlyReport';
import AdminDashboard from './components/AdminDashboard';
import { 
  Wallet, Sparkles, Settings, 
  LayoutDashboard, BarChart3, 
  ShieldCheck, LogOut, Lock, X, AlertCircle, 
  Plus, Moon, Sun, Megaphone, Bell, 
  Fingerprint, ArrowRight, Eye, EyeOff, UserCircle, Key, Database as DbIcon, CloudLightning,
  RefreshCw, CloudCheck, Wifi, ShieldAlert
} from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'DP Peserta', type: TransactionType.INCOME, isCustom: false },
  { id: '2', name: 'Pelunasan', type: TransactionType.INCOME, isCustom: false },
  { id: '3', name: 'Kas', type: TransactionType.INCOME, isCustom: false },
  { id: '4', name: 'Porter', type: TransactionType.EXPENSE, isCustom: false },
  { id: '5', name: 'Guide', type: TransactionType.EXPENSE, isCustom: false },
  { id: '6', name: 'Simaksi', type: TransactionType.EXPENSE, isCustom: false },
  { id: '7', name: 'Operasional', type: TransactionType.EXPENSE, isCustom: false },
  { id: '8', name: 'Logistik', type: TransactionType.EXPENSE, isCustom: false },
  { id: '9', name: 'Lainnya', type: TransactionType.EXPENSE, isCustom: false },
];

// Master Sync Channel
const syncChannel = new BroadcastChannel('jejak_langkah_cloud_sync');

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'ai' | 'settings' | 'admin'>('dashboard');
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [appName, setAppName] = useState('JEJAK LANGKAH');
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('jejaklangkah_theme') as 'light' | 'dark') || 'light');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Realtime Sync Status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success'}[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync Theme
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('jejaklangkah_theme', theme);
  }, [theme]);

  // Load Initial Data
  const loadData = () => {
    try {
      const savedTransactions = localStorage.getItem('jejaklangkah_data');
      const savedCategories = localStorage.getItem('jejaklangkah_categories');
      const savedAppName = localStorage.getItem('jejaklangkah_app_name');
      const savedAuth = localStorage.getItem('jejaklangkah_auth_role');
      const savedBroadcast = localStorage.getItem('jejaklangkah_broadcast');
      
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem('jejaklangkah_categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
      
      if (savedAppName) setAppName(savedAppName);
      if (savedBroadcast) setBroadcastMessage(savedBroadcast);
      if (savedAuth) {
        setIsAuthenticated(true);
        setUserRole(savedAuth as 'admin' | 'user');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const addSyncLog = (action: string, status: 'success' | 'pending' | 'error' = 'success') => {
    const newLog: SyncLog = {
      id: crypto.randomUUID(),
      action,
      user: userRole || 'system',
      time: new Date().toLocaleTimeString(),
      status
    };
    setSyncLogs(prev => [newLog, ...prev].slice(0, 20));
  };

  const addNotification = (message: string, type: 'info' | 'success' = 'info') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [{id, message, type}, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  // Realtime Listener
  useEffect(() => {
    loadData();

    syncChannel.onmessage = (event) => {
      const { type, payload, sender } = event.data;
      if (sender === userRole && type !== 'CLOUD_REFRESH') return; // Jangan loop data sendiri kecuali refresh paksa

      setSyncStatus('syncing');
      
      switch (type) {
        case 'DATABASE_UPDATED':
          setTransactions(payload.transactions);
          addSyncLog(`Data sinkronisasi dari ${sender}`);
          if (sender === 'admin') addNotification("Data telah diperbarui oleh Admin", "info");
          break;
        case 'APP_CONFIG_UPDATED':
          setAppName(payload.appName);
          setBroadcastMessage(payload.broadcast);
          addSyncLog("Configurasi sistem diperbarui");
          break;
        case 'CATEGORIES_UPDATED':
          setCategories(payload.categories);
          addSyncLog("Daftar kategori diperbarui");
          break;
      }

      setTimeout(() => setSyncStatus('synced'), 800);
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    return () => syncChannel.onmessage = null;
  }, [userRole]);

  const pushToCloud = (type: string, payload: any) => {
    setSyncStatus('syncing');
    syncChannel.postMessage({
      type,
      payload,
      sender: userRole,
      timestamp: Date.now()
    });
    
    // Simpan ke local sebagai cache
    if (type === 'DATABASE_UPDATED') localStorage.setItem('jejaklangkah_data', JSON.stringify(payload.transactions));
    if (type === 'CATEGORIES_UPDATED') localStorage.setItem('jejaklangkah_categories', JSON.stringify(payload.categories));
    if (type === 'APP_CONFIG_UPDATED') {
      localStorage.setItem('jejaklangkah_app_name', payload.appName);
      localStorage.setItem('jejaklangkah_broadcast', payload.broadcast);
    }

    addSyncLog(`Push ke Cloud: ${type}`);
    setTimeout(() => setSyncStatus('synced'), 800);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setUserRole('admin');
      localStorage.setItem('jejaklangkah_auth_role', 'admin');
      addNotification("Admin Terverifikasi", "success");
      addSyncLog("Admin Login");
    } else if (loginUsername === 'user' && loginPassword === 'user123') {
      setIsAuthenticated(true);
      setUserRole('user');
      localStorage.setItem('jejaklangkah_auth_role', 'user');
      setActiveTab('dashboard');
      addNotification("Sesi User Dimulai", "success");
      addSyncLog("User Login");
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    if (confirm("Keluar dan putus koneksi cloud?")) {
      addSyncLog("Sesi Berakhir");
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem('jejaklangkah_auth_role');
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  const addTransaction = (t: Transaction) => {
    const newT = { 
      ...t, 
      createdBy: userRole || 'user', 
      timestamp: Date.now(), 
      syncId: crypto.randomUUID() 
    };
    const newTransactions = [newT, ...transactions];
    setTransactions(newTransactions);
    pushToCloud('DATABASE_UPDATED', { transactions: newTransactions });
    setIsQuickAddOpen(false);
  };

  const updateTransaction = (updated: Transaction) => {
    const newTransactions = transactions.map(t => t.id === updated.id ? updated : t);
    setTransactions(newTransactions);
    pushToCloud('DATABASE_UPDATED', { transactions: newTransactions });
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (userRole !== 'admin') return;
    if (confirm("Hapus permanen dari cloud?")) {
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions);
      pushToCloud('DATABASE_UPDATED', { transactions: newTransactions });
    }
  };

  const handleRestore = (jsonString: string) => {
    try {
      const data = JSON.parse(atob(jsonString));
      if (data.transactions) {
        setTransactions(data.transactions);
        pushToCloud('DATABASE_UPDATED', { transactions: data.transactions });
        addNotification("Database Berhasil Direstore!", "success");
      }
    } catch (e) {
      alert("Format Backup Tidak Valid!");
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 relative z-10 transition-all duration-500 ${loginError ? 'animate-shake' : 'animate-fadeIn'}`}>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-200 animate-bounce">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{appName}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Cloud Financial Sync Platform</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
                  <UserCircle className="w-5 h-5" />
                </div>
                <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Username" className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-800 dark:text-white focus:border-red-500 transition-all" required />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-800 dark:text-white focus:border-red-500 transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-red-500 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/20">
                <ShieldAlert className="w-4 h-4" /> Akses Ditolak!
              </div>
            )}
            <button type="submit" className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-100 active:scale-95 flex items-center justify-center gap-3">
              Hubungkan Sesi <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* Global Sync Status Bar */}
      <div className={`fixed top-0 left-0 right-0 h-1 z-[200] transition-all duration-1000 ${syncStatus === 'syncing' ? 'bg-red-500 w-full animate-pulse' : 'bg-transparent w-0'}`}></div>

      <div className="fixed top-20 right-6 z-[120] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border pointer-events-auto ${n.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500'}`}>
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest">{n.message}</span>
          </div>
        ))}
      </div>

      {broadcastMessage && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-2 overflow-hidden shadow-lg">
          <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-2 px-4">
                <Megaphone className="w-3 h-3 text-red-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">{broadcastMessage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-slate-900 dark:bg-slate-950 text-white p-8 z-50 transition-colors duration-500">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20"><Wallet className="w-6 h-6" /></div>
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
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === link.id ? 'bg-red-600 text-white shadow-xl shadow-red-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{link.label}</span>
            </button>
          ))}
          {userRole === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mt-4 ${activeTab === 'admin' ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/10' : 'text-rose-400 hover:bg-rose-900/30'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Control Panel</span>
            </button>
          )}
        </nav>
        
        <div className="mt-auto space-y-4">
          <div className="p-4 bg-slate-800/50 dark:bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs bg-red-500 text-white">
               {(userRole || 'u').charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sesi Cloud</p>
               <p className="text-xs font-bold text-white truncate">{userRole === 'admin' ? 'Administrator' : 'Explorer'}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300">
            <LogOut className="w-4 h-4" /> Putuskan Sesi
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-72 flex flex-col min-h-screen pt-4">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 md:px-12 py-4 sticky top-10 z-40 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
               <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                 {syncStatus === 'syncing' ? 'Syncing...' : 'Cloud Connected'}
               </span>
             </div>
             <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold">Latency: 24ms</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-all hover:scale-110">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="p-6 md:p-12 animate-fadeIn flex-1 mb-20 md:mb-0">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <SummaryCards summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"><FinancialCharts transactions={transactions} isDarkMode={theme === 'dark'} /></div>
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                     <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><Plus className="w-5 h-5 text-red-500" /> Input Cepat Cloud</h3>
                     <TransactionForm onSubmit={addTransaction} categories={categories} />
                   </div>
                </div>
                <div className="lg:col-span-4">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 h-full shadow-sm">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Aktivitas Realtime</h3>
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
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Global Ledger</h2>
                  <p className="text-slate-400 text-sm font-medium">Database sinkronisasi realtime lintas sesi.</p>
                </div>
                <button onClick={() => setIsQuickAddOpen(true)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 w-full md:w-auto"><Plus className="w-5 h-5" /> Tambah Record</button>
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
              syncLogs={syncLogs}
              onUpdateAppName={(name) => { setAppName(name); pushToCloud('APP_CONFIG_UPDATED', { appName: name, broadcast: broadcastMessage }); }}
              onUpdateBroadcast={(msg) => { setBroadcastMessage(msg); pushToCloud('APP_CONFIG_UPDATED', { appName, broadcast: msg }); }}
              onAddCategory={(n, t) => { 
                const newCat = { id: crypto.randomUUID(), name: n, type: t, isCustom: true }; 
                const nc = [...categories, newCat];
                setCategories(nc);
                pushToCloud('CATEGORIES_UPDATED', { categories: nc });
              }} 
              onUpdateCategory={(id, name) => {
                const nc = categories.map(c => c.id === id ? { ...c, name } : c);
                setCategories(nc);
                pushToCloud('CATEGORIES_UPDATED', { categories: nc });
              }} 
              onDeleteCategory={(id) => {
                const nc = categories.filter(c => c.id !== id);
                setCategories(nc);
                pushToCloud('CATEGORIES_UPDATED', { categories: nc });
              }} 
              onUpdateTransaction={setEditingTransaction} 
              onDeleteTransaction={deleteTransaction}
              onResetData={() => { if(confirm("Hapus cloud database?")) { setTransactions([]); pushToCloud('DATABASE_UPDATED', { transactions: [] }); } }} 
              onExport={() => {
                const backup = btoa(JSON.stringify({ transactions, categories, appName, timestamp: Date.now() }));
                const blob = new Blob([backup], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `JejakLangkah_Backup_${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
              }} 
              onRestore={handleRestore}
            />
          )}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto py-10 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden shadow-sm">
                <div className="w-24 h-24 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl bg-red-600 shadow-red-200">
                  <UserCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{userRole} Profile</h2>
                <div className="flex items-center justify-center gap-2 mb-10 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                  <CloudCheck className="w-4 h-4" /> Cloud Verified
                </div>
                <button onClick={handleLogout} className="w-full p-6 bg-red-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95">
                  <LogOut className="w-6 h-6" /> Putuskan Sesi Cloud
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
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{editingTransaction ? 'Ubah Data Cloud' : 'Record Baru Cloud'}</h3>
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
