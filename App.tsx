
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
  ShieldCheck, LogOut, Lock, X, Key, AlertCircle, Edit3, Search,
  Calendar, FilterX, ArrowRight
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
  
  // App Config States
  const [appName, setAppName] = useState('KEUANGAN JEJAK LANGKAH');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load Initial Data
  useEffect(() => {
    const savedTransactions = localStorage.getItem('jejaklangkah_data');
    const savedCategories = localStorage.getItem('jejaklangkah_categories');
    const savedAdmin = localStorage.getItem('jejaklangkah_admin_status');
    const savedAppName = localStorage.getItem('jejaklangkah_app_name');
    
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
  }, []);

  // Persistent Storage
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

  // Handlers
  const addTransaction = (transaction: Transaction) => setTransactions(prev => [transaction, ...prev]);
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Hapus transaksi ini secara permanen?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };
  
  const addCategory = (name: string, type: TransactionType) => {
    const newCat: Category = { id: crypto.randomUUID(), name, type, isCustom: true };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const resetAllData = () => {
    if (window.confirm("Hapus seluruh data? Tindakan ini tidak bisa dibatalkan.")) {
      setTransactions([]);
      alert("Semua data berhasil dibersihkan.");
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return alert("Tidak ada data untuk diekspor.");
    const headers = ['ID', 'Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah (IDR)'];
    const rows = transactions.map(t => [t.id, t.date, t.description, t.category, t.type === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran', t.amount]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Export_Keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  // Memos
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

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat', icon: History },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'ai', label: 'Insight AI', icon: Sparkles },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingTransaction(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="bg-indigo-600 p-8 text-white">
              <button onClick={() => setEditingTransaction(null)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-black mb-1">Edit Transaksi</h3>
              <p className="text-indigo-100 text-sm">Perbarui rincian keuangan Anda.</p>
            </div>
            <div className="p-8">
              <TransactionForm onSubmit={updateTransaction} onCancel={() => setEditingTransaction(null)} categories={categories} initialData={editingTransaction} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="bg-purple-600 p-8 text-white">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4"><Lock className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black">Akses Admin</h3>
            </div>
            <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password Admin"
                className={`w-full px-5 py-4 bg-slate-50 border-2 ${loginError ? 'border-rose-500' : 'border-slate-100'} rounded-2xl outline-none font-bold`}
                autoFocus
              />
              {loginError && <p className="text-rose-600 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Password salah.</p>}
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all">Masuk</button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-slate-900 text-white p-8 z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Wallet className="w-6 h-6" /></div>
          <div>
             <h1 className="text-sm font-black tracking-tight leading-none uppercase">Keuangan</h1>
             <h1 className="text-xs font-bold text-indigo-400">JEJAK LANGKAH</h1>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {sidebarLinks.map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === link.id ? 'bg-indigo-600 text-white shadow-lg sidebar-active' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
             <button onClick={() => setIsLoginModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700 transition-colors"><Lock className="w-4 h-4" /> Login Admin</button>
           ) : (
             <button onClick={() => setIsAdmin(false)} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-900/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-900/40 transition-colors"><LogOut className="w-4 h-4" /> Keluar Admin</button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 py-6 sticky top-0 z-40 flex justify-between items-center">
          <div className="md:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Wallet className="w-5 h-5" /></div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {activeTab === 'dashboard' ? 'Overview' : activeTab === 'transactions' ? 'Riwayat' : activeTab === 'reports' ? 'Laporan' : activeTab === 'ai' ? 'Insight AI' : activeTab === 'admin' ? 'Admin Central' : 'Pengaturan'}
          </h2>
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
        </header>

        <main className="p-6 md:p-12 animate-fadeIn">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <SummaryCards summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                   <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"><FinancialCharts transactions={transactions} /></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"><TransactionForm onSubmit={addTransaction} categories={categories} /></div>
                </div>
                <div className="lg:col-span-4 h-full">
                   <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Terakhir</h3>
                     <TransactionList transactions={transactions.slice(0, 5)} onDelete={deleteTransaction} onEdit={setEditingTransaction} compact />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h2 className="text-3xl font-black text-slate-800">Riwayat Transaksi</h2>
                <button onClick={exportToCSV} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 shadow-sm"><Download className="w-4 h-4 text-indigo-500" /> Ekspor CSV</button>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500" /></div>
                  <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                   <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold" />
                   <div className="flex items-center justify-center text-slate-300"><ArrowRight className="w-4 h-4" /></div>
                   <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold" />
                   {hasActiveFilters && <button onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all"><FilterX className="w-5 h-5" /></button>}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
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
              onAddCategory={addCategory} 
              onUpdateCategory={updateCategory} 
              onDeleteCategory={deleteCategory} 
              onResetData={resetAllData} 
              onExport={exportToCSV} 
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-100"><Settings className="w-10 h-10" /></div>
              <h2 className="text-3xl font-black text-slate-800">Pengaturan Profil</h2>
              <p className="text-slate-500">Aplikasi Anda dikonfigurasi secara lokal untuk keamanan maksimal.</p>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={exportToCSV} className="p-6 bg-white border border-slate-100 rounded-3xl font-bold hover:bg-slate-50 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-4"><Download className="w-6 h-6 text-indigo-500" /> Cadangkan Data (.csv)</div>
                   <ArrowRight className="w-4 h-4 text-slate-300" />
                 </button>
                 {!isAdmin && (
                   <button onClick={() => setIsLoginModalOpen(true)} className="p-6 bg-indigo-50 text-indigo-700 rounded-3xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-4"><ShieldCheck className="w-6 h-6" /> Kelola Sebagai Admin</div>
                     <ArrowRight className="w-4 h-4" />
                   </button>
                 )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around p-4 z-50">
        {sidebarLinks.slice(0, 4).map(link => (
          <button key={link.id} onClick={() => setActiveTab(link.id as any)} className={`p-3 rounded-2xl transition-all ${activeTab === link.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <link.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
