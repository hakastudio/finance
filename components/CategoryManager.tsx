
import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { 
  Plus, Trash2, Edit2, Check, X, Tag, 
  ArrowUpCircle, ArrowDownCircle, 
  Coffee, Car, ShoppingBag, CreditCard, 
  Gift, Heart, GraduationCap, Briefcase, 
  PlusCircle, LayoutGrid
} from 'lucide-react';

interface Props {
  categories: Category[];
  onAdd: (name: string, type: TransactionType) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('makan') || n.includes('kopi')) return <Coffee className="w-5 h-5" />;
  if (n.includes('transpor') || n.includes('bensin') || n.includes('mobil') || n.includes('motor')) return <Car className="w-5 h-5" />;
  if (n.includes('belanja') || n.includes('mall')) return <ShoppingBag className="w-5 h-5" />;
  if (n.includes('tagihan') || n.includes('listrik') || n.includes('air')) return <CreditCard className="w-5 h-5" />;
  if (n.includes('hadiah') || n.includes('kado')) return <Gift className="w-5 h-5" />;
  if (n.includes('sehat') || n.includes('obat') || n.includes('rs')) return <Heart className="w-5 h-5" />;
  if (n.includes('didik') || n.includes('sekolah') || n.includes('kuliah')) return <GraduationCap className="w-5 h-5" />;
  if (n.includes('gaji') || n.includes('kerja') || n.includes('bonus')) return <Briefcase className="w-5 h-5" />;
  return <Tag className="w-5 h-5" />;
};

const CategoryManager: React.FC<Props> = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [newCatName, setNewCatName] = useState('');
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredCategories = categories.filter(c => c.type === activeType);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAdd(newCatName.trim(), activeType);
      setNewCatName('');
    }
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      onUpdate(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Type Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md transition-colors">
        <button
          onClick={() => setActiveType(TransactionType.EXPENSE)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 ${activeType === TransactionType.EXPENSE ? 'bg-white shadow-md text-red-600 font-black' : 'text-slate-500 font-bold hover:text-slate-700'}`}
        >
          <ArrowDownCircle className="w-5 h-5" />
          Pengeluaran
        </button>
        <button
          onClick={() => setActiveType(TransactionType.INCOME)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 ${activeType === TransactionType.INCOME ? 'bg-white shadow-md text-green-600 font-black' : 'text-slate-500 font-bold hover:text-slate-700'}`}
        >
          <ArrowUpCircle className="w-5 h-5" />
          Pemasukan
        </button>
      </div>

      {/* Add Category Section */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <PlusCircle className="h-6 w-6 text-indigo-500" />
            </div>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ketik nama kategori baru di sini..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-slate-900 font-bold text-lg placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-black flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Tambah
          </button>
        </div>
      </form>

      {/* Category Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Daftar Kategori
          </h4>
          <span className="text-xs text-slate-400 font-extrabold">{filteredCategories.length} KATEGORI</span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Belum ada kategori untuk tipe ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className={`bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative ${editingId === cat.id ? 'ring-4 ring-indigo-100 border-indigo-500' : ''}`}
              >
                {editingId === cat.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Edit2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Ubah Nama</span>
                    </div>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-4 py-4 bg-white border-2 border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none text-slate-900 font-black text-lg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={saveEditing} 
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                      >
                        <Check className="w-5 h-5" />
                        Simpan
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 font-black hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-2xl shadow-inner ${activeType === TransactionType.INCOME ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {getCategoryIcon(cat.name)}
                      </div>
                      {!cat.isCustom && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase font-black tracking-widest border border-indigo-100">
                          Sistem
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-black text-slate-900 text-xl mb-6 truncate">{cat.name}</h5>
                      <div className="flex items-center gap-3 border-t-2 border-slate-50 pt-4 mt-2">
                        <button 
                          onClick={() => startEditing(cat)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-black text-xs uppercase tracking-wider"
                        >
                          <Edit2 className="w-4 h-4" />
                          Ubah
                        </button>
                        {cat.isCustom && (
                          <button 
                            onClick={() => onDelete(cat.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-3 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-black text-xs uppercase tracking-wider"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
