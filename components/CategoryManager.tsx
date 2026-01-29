
import React, { useState, useMemo } from 'react';
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
  Save, AlertCircle, Edit3
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
  if (cat.includes('makan') || cat.includes('restoran') || cat.includes('warung') || cat.includes('jajan')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('kopi') || cat.includes('cafe') || cat.includes('minum') || cat.includes('teh')) return <Coffee className="w-5 h-5" />;
  if (cat.includes('transpor') || cat.includes('bensin') || cat.includes('mobil') || cat.includes('motor')) return <Car className="w-5 h-5" />;
  if (cat.includes('belanja') || cat.includes('mall') || cat.includes('pasar')) return <ShoppingBag className="w-5 h-5" />;
  if (cat.includes('groceries') || cat.includes('supermarket')) return <ShoppingCart className="w-5 h-5" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('internet')) return <Zap className="w-5 h-5" />;
  if (cat.includes('cicilan') || cat.includes('kredit')) return <CreditCard className="w-5 h-5" />;
  if (cat.includes('rumah') || cat.includes('kost')) return <Home className="w-5 h-5" />;
  if (cat.includes('hiburan') || cat.includes('bioskop') || cat.includes('streaming')) return <Music className="w-5 h-5" />;
  if (cat.includes('game') || cat.includes('hobi')) return <Gamepad className="w-5 h-5" />;
  if (cat.includes('sehat') || cat.includes('olahraga')) return <Dumbbell className="w-5 h-5" />;
  if (cat.includes('hp') || cat.includes('laptop') || cat.includes('elektronik')) return <Smartphone className="w-5 h-5" />;
  if (cat.includes('sakit') || cat.includes('obat') || cat.includes('medis')) return <Heart className="w-5 h-5" />;
  if (cat.includes('didik') || cat.includes('sekolah') || cat.includes('buku')) return <GraduationCap className="w-5 h-5" />;
  if (cat.includes('gaji') || cat.includes('kerja') || cat.includes('upah')) return <Briefcase className="w-5 h-5" />;
  if (cat.includes('invest') || cat.includes('saham') || cat.includes('crypto')) return <TrendingUp className="w-5 h-5" />;
  if (cat.includes('bonus') || cat.includes('thr')) return <Coins className="w-5 h-5" />;
  if (cat.includes('hadiah') || cat.includes('donasi')) return <Gift className="w-5 h-5" />;
  if (cat.includes('travel') || cat.includes('liburan') || cat.includes('pesawat') || cat.includes('hotel')) return <Plane className="w-5 h-5" />;
  if (cat.includes('asuransi')) return <Shield className="w-5 h-5" />;
  return <Tag className="w-5 h-5" />;
};

const CategoryManager: React.FC<Props> = ({ categories, transactions, onAdd, onUpdate, onDelete }) => {
  const [newCatName, setNewCatName] = useState('');
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === activeType);
  }, [categories, activeType]);

  const usageStats = useMemo(() => {
    return transactions.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
  }, [transactions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = newCatName.trim();
    if (!nameTrimmed) return;

    // Cek duplikasi
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
      // Validasi duplikasi (kecuali dirinya sendiri)
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
            <ListChecks className="w-7 h-7 text-indigo-500" /> 
            Menu Kelola Kategori
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Atur label kategori untuk transaksi {activeType === TransactionType.EXPENSE ? 'Pengeluaran' : 'Pemasukan'}.
          </p>
        </div>
        
        <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <button
            onClick={() => { setActiveType(TransactionType.EXPENSE); cancelEditing(); }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2 ${activeType === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
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
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
          <PlusCircle className="w-3.5 h-3.5" /> Tambah Kategori {activeType === TransactionType.EXPENSE ? 'Pengeluaran' : 'Pemasukan'}
        </h4>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={`Contoh: ${activeType === TransactionType.EXPENSE ? 'Biaya Langganan' : 'Keuntungan Dagang'}`}
            className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!newCatName.trim()}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${!newCatName.trim() ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'}`}
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
            className={`p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group ${
              editingId === cat.id 
                ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl'
            }`}
          >
            {editingId === cat.id ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-xl">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Sedang Mengubah</h5>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Tekan Enter untuk simpan.</p>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-2xl font-black text-slate-900 dark:text-white outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={saveEditing} 
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Terapkan
                  </button>
                  <button 
                    onClick={cancelEditing} 
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    cat.type === TransactionType.INCOME 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                      : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
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
                
                <h4 className="text-xl font-black text-slate-800 dark:text-white mb-8 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h4>
                
                <div className="mt-auto flex items-center gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={() => startEditing(cat)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all font-black text-[9px] uppercase tracking-widest"
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
                      className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-400 dark:text-indigo-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30" title="Kategori Sistem (Tidak dapat dihapus)">
                      <Shield className="w-2.5 h-2.5" /> Sistem
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <Tag className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-black text-sm uppercase tracking-widest">Belum Ada Kategori</p>
            <p className="text-xs mt-2 font-medium">Gunakan form di atas untuk menambah kategori baru.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
