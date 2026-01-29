
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
    if (!initialData) {
      setAmount('');
      setDescription('');
      setCategory('');
    }
  };

  const labelClasses = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block px-1";
  const inputClasses = "w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
        <button
          type="button"
          onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowDownCircle className="w-4 h-4" /> Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => { setType(TransactionType.INCOME); setCategory(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowUpCircle className="w-4 h-4" /> Pemasukan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
        <div>
          <label className={labelClasses}>Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="">Pilih Kategori</option>
            {filteredCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Keterangan</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Pembayaran Guide"
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Tanggal Transaksi</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Batal</button>
        )}
        <button
          type="submit"
          className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-lg dark:shadow-none transition-all active:scale-95 ${type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {initialData ? 'Perbarui' : 'Simpan Transaksi'}
          </div>
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
