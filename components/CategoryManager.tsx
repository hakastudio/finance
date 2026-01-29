
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Category, TransactionType, Transaction } from '../types';
import { 
  Plus, Trash2, Edit2, Check, X, Tag, 
  ArrowUpCircle, ArrowDownCircle, 
  Coffee, Car, ShoppingBag, CreditCard, 
  Gift, Heart, GraduationCap, Briefcase, 
  PlusCircle, LayoutGrid, Utensils, 
  Zap, Music, Gamepad, Smartphone, 
  TrendingUp, Dumbbell, Plane, Coins, 
  Shield, ShoppingCart, Home, ListChecks,
  Save, AlertCircle, Edit3, User as UserIcon,
  Map, FileText, Settings, Box, Wallet, CheckCircle2
} from 'lucide-react';

interface Props {
  categories: Category[];
  transactions: Transaction[];
  onAdd: (name: string, type: TransactionType) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (name: string) => {
  const cat = name.toLowerCase();
  
  if (cat.includes('porter')) return <UserIcon className="w-5 h-5" />;
  if (cat.includes('guide')) return <Map className="w-5 h-5" />;
  if (cat.includes('simaksi')) return <FileText className="w-5 h-5" />;
  if (cat.includes('operasional')) return <Settings className="w-5 h-5" />;
  if (cat.includes('logistik')) return <Box className="w-5 h-5" />;
  if (cat.includes('dp peserta') || cat.includes('dp')) return <Wallet className="w-5 h-5" />;
  if (cat.includes('pelunasan')) return <CheckCircle2 className="w-5 h-5" />;
  if (cat.includes('kas')) return <Coins className="w-5 h-5" />;

  if (cat.includes('makan') || cat.includes('restoran')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('transpor')) return <Car className="w-5 h-5" />;
  if (cat.includes('invest')) return <TrendingUp className="w-5 h-5" />;
  
  return <Tag className="w-5 h-5" />;
};

const CategoryManager: React.FC<Props> = ({ categories, transactions, onAdd, onUpdate, onDelete }) => {
  const [newCatName, setNewCatName] = useState('');
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === activeType);
  }, [categories, activeType]);

  const usageStats = useMemo(() => {
    return transactions.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
  }, [transactions]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = newCatName.trim();
    if (!nameTrimmed) return;

    if (categories.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase() && c.type === activeType)) {
      alert('Kategori dengan nama ini sudah ada.');
      return;
    }

    onAdd(nameTrimmed, activeType);
    setNewCatName('');
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEditing = () => {
    const nameTrimmed = editingName.trim();
    if (editingId && nameTrimmed) {
      const isDuplicate = categories.some(c => 
        c.id !== editingId && 
        c.type === activeType && 
        c.name.toLowerCase() === nameTrimmed.toLowerCase()
      );

      if (isDuplicate) {
        alert('Nama kategori sudah digunakan.');
        return;
      }

      onUpdate(editingId, nameTrimmed);
      setEditingId(null);
      setEditingName('');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Menu Kategori */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <ListChecks className="w-7 h-7 text-red-500" /> 
            Menu Kelola Kategori
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Atur label kategori untuk transaksi {activeType === TransactionType.EXPENSE ? 'Pengeluaran' : 'Pemasukan'}.
          </p>
        </div>
        
        <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <button
            onClick={() => { setActiveType(TransactionType.EXPENSE); cancelEditing(); }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2 ${activeType === TransactionType.EXPENSE ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ArrowDownCircle className="w-4 h-4" /> Pengeluaran
          </button>
          <button
            onClick={() => { setActiveType(TransactionType.INCOME); cancelEditing(); }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2 ${activeType === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ArrowUpCircle className="w-4 h-4" /> Pemasukan
          </button>
        </div>
      </div>

      {/* Input Kategori Baru */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
          <PlusCircle className="w-3.5 h-3.5" /> Tambah Kategori {activeType === TransactionType.EXPENSE ? 'Pengeluaran' : 'Pemasukan'}
        </h4>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={`Contoh: ${activeType === TransactionType.EXPENSE ? 'Konsumsi' : 'Bonus'}`}
            className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-red-500 transition-all"
          />
          <button
            type="submit"
            disabled={!newCatName.trim()}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${!newCatName.trim() ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100 dark:shadow-none'}`}
          >
            <Plus className="w-4 h-4" /> Simpan Kategori
          </button>
        </form>
      </div>

      {/* Daftar Kategori Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div 
            key={cat.id} 
            className={`p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group flex flex-col min-h-[220px] ${
              editingId === cat.id 
                ? 'bg-red-50/30 dark:bg-red-900/10 border-red-400 dark:border-red-600 shadow-xl scale-[1.02] z-10' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl'
            }`}
          >
            {editingId === cat.id ? (
              <div className="space-y-4 animate-fadeIn flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200 dark:shadow-none">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Ubah Nama Kategori</h5>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Ketik nama baru di bawah ini.</p>
                  </div>
                </div>
                
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-2 border-red-500 rounded-2xl font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20 transition-all shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                />
                
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={saveEditing} 
                    className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 hover:shadow-lg transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Terapkan
                  </button>
                  <button 
                    onClick={cancelEditing} 
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <X className="w-4 h-4" /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    cat.type === TransactionType.INCOME 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                  }`}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Terpakai Pada</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black border border-slate-200 dark:border-slate-700">
                      {usageStats[cat.name] || 0} Record
                    </span>
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-slate-800 dark:text-white mb-8 group-hover:text-red-600 transition-colors">
                  {cat.name}
                </h4>
                
                <div className="mt-auto flex items-center gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={() => startEditing(cat)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all font-black text-[9px] uppercase tracking-widest"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Ubah Nama
                  </button>
                  
                  {cat.isCustom ? (
                    <button 
                      onClick={() => {
                        const count = usageStats[cat.name] || 0;
                        if (count > 0) {
                          if (confirm(`Kategori ini memiliki ${count} transaksi. Jika dihapus, data transaksi mungkin tidak memiliki kategori yang valid. Lanjutkan?`)) {
                            onDelete(cat.id);
                          }
                        } else {
                          onDelete(cat.id);
                        }
                      }}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50/50 dark:bg-red-900/20 text-red-400 dark:text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-red-100 dark:border-red-800/30" title="Kategori Sistem (Tidak dapat dihapus)">
                      <Shield className="w-2.5 h-2.5" /> Sistem
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 transition-all">
            <Tag className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-black text-xs uppercase tracking-widest">Belum Ada Kategori</p>
            <p className="text-[10px] mt-2 font-medium">Gunakan form di atas untuk menambah kategori baru.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
