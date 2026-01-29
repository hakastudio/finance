
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Save, X } from 'lucide-react';

interface Props {
  onSubmit: (transaction: Transaction) => void;
  onCancel?: () => void;
  categories: Category[];
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<Props> = ({ onSubmit, onCancel, categories, initialData }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync state with initialData when editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description);
      setType(initialData.type);
      setDate(initialData.date);
    }
  }, [initialData]);

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    const transaction: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      amount: parseFloat(amount),
      category,
      description,
      type,
      date
    };

    onSubmit(transaction);
    
    // Only reset if we are not editing (adding mode)
    if (!initialData) {
      setAmount('');
      setDescription('');
      setCategory('');
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-slate-400 shadow-sm";
  const labelClasses = "text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-2 block px-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-4">
        <button
          type="button"
          onClick={() => {
            setType(TransactionType.EXPENSE);
            setCategory('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${type === TransactionType.EXPENSE ? 'bg-white shadow-md text-red-600 font-black' : 'text-slate-50 font-bold'}`}
          style={{ color: type === TransactionType.EXPENSE ? '' : '#64748b' }}
        >
          <ArrowDownCircle className="w-5 h-5" />
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => {
            setType(TransactionType.INCOME);
            setCategory('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${type === TransactionType.INCOME ? 'bg-white shadow-md text-green-600 font-black' : 'text-slate-50 font-bold'}`}
          style={{ color: type === TransactionType.INCOME ? '' : '#64748b' }}
        >
          <ArrowUpCircle className="w-5 h-5" />
          Pemasukan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClasses}>Jumlah (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={inputClasses}
            required
          />
        </div>
        <div className="space-y-1">
          <label className={labelClasses}>Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClasses} appearance-none cursor-pointer`}
            required
          >
            <option value="">Pilih Kategori</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClasses}>Keterangan Transaksi</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Misal: Makan Siang, Gaji Pokok, dsb."
          className={inputClasses}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={labelClasses}>Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95 border-2 border-slate-200"
          >
            <X className="w-6 h-6" />
            Batal
          </button>
        )}
        <button
          type="submit"
          className={`flex-[2] py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 text-white transition-all shadow-xl active:scale-95 ${type === TransactionType.INCOME ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
        >
          <Save className="w-6 h-6" />
          {initialData ? 'Update Transaksi' : 'Simpan Transaksi'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
