
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  Trash2, ShoppingBag, Car, CreditCard, 
  Gift, Heart, GraduationCap, Briefcase, 
  Tag, Utensils, Edit3
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  compact?: boolean;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('makan') || cat.includes('kopi') || cat.includes('minum')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('transpor') || cat.includes('bensin') || cat.includes('mobil') || cat.includes('motor')) return <Car className="w-5 h-5" />;
  if (cat.includes('belanja') || cat.includes('mall') || cat.includes('pasar')) return <ShoppingBag className="w-5 h-5" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('air') || cat.includes('internet')) return <CreditCard className="w-5 h-5" />;
  if (cat.includes('hadiah') || cat.includes('kado') || cat.includes('donasi')) return <Gift className="w-5 h-5" />;
  if (cat.includes('sehat') || cat.includes('obat') || cat.includes('rs')) return <Heart className="w-5 h-5" />;
  if (cat.includes('didik') || cat.includes('sekolah') || cat.includes('kuliah') || cat.includes('buku')) return <GraduationCap className="w-5 h-5" />;
  if (cat.includes('gaji') || cat.includes('kerja') || cat.includes('bonus')) return <Briefcase className="w-5 h-5" />;
  return <Tag className="w-5 h-5" />;
};

const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit, compact = false }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 transition-colors">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <ShoppingBag className="w-10 h-10 opacity-30 text-indigo-500" />
        </div>
        <p className="font-bold">Belum ada transaksi terdaftar</p>
        <p className="text-sm mt-1 opacity-70">Mulai catat keuanganmu sekarang!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <div className="inline-block min-w-full align-middle p-2">
        <table className="min-w-full">
          {!compact && (
            <thead>
              <tr className="border-b-2 border-slate-50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Detail & Deskripsi
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                  Jumlah
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                  Aksi
                </th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-2xl shadow-sm ${
                      t.type === TransactionType.INCOME 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 leading-none mb-1.5">{t.description}</p>
                      <div className="flex items-center gap-2 md:hidden">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          t.type === TransactionType.INCOME ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {t.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{t.date}</span>
                      </div>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <td className="px-6 py-5 hidden md:table-cell">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {t.category}
                    </span>
                  </td>
                )}
                {!compact && (
                  <td className="px-6 py-5 hidden lg:table-cell whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-500">{t.date}</p>
                  </td>
                )}
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <p className={`text-lg font-black ${
                    t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                      title="Edit Transaksi"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
