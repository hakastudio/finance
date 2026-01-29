
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  Trash2, ShoppingBag, Car, CreditCard, 
  Gift, Heart, GraduationCap, Briefcase, 
  Tag, Utensils, Edit3, Coffee, Home, 
  Zap, Music, Gamepad, Smartphone, 
  TrendingUp, Dumbbell, Plane, Coins, 
  Shield, ShoppingCart, User as UserIcon
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  compact?: boolean;
  showActions?: boolean;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  
  if (cat.includes('makan') || cat.includes('restoran') || cat.includes('warung') || cat.includes('jajan')) return <Utensils className="w-5 h-5" />;
  if (cat.includes('kopi') || cat.includes('cafe') || cat.includes('minum') || cat.includes('teh')) return <Coffee className="w-5 h-5" />;
  if (cat.includes('transpor') || cat.includes('bensin') || cat.includes('mobil') || cat.includes('motor') || cat.includes('parkir') || cat.includes('ojek') || cat.includes('grab') || cat.includes('gojek')) return <Car className="w-5 h-5" />;
  if (cat.includes('belanja') || cat.includes('mall') || cat.includes('pasar') || cat.includes('pakaian') || cat.includes('baju')) return <ShoppingBag className="w-5 h-5" />;
  if (cat.includes('groceries') || cat.includes('supermarket') || cat.includes('toko')) return <ShoppingCart className="w-5 h-5" />;
  if (cat.includes('tagihan') || cat.includes('listrik') || cat.includes('air') || cat.includes('internet') || cat.includes('wifi') || cat.includes('pulsa')) return <Zap className="w-5 h-5" />;
  if (cat.includes('cicilan') || cat.includes('hutang') || cat.includes('kartu kredit')) return <CreditCard className="w-5 h-5" />;
  if (cat.includes('rumah') || cat.includes('kost') || cat.includes('sewa') || cat.includes('apartemen') || cat.includes('perabot')) return <Home className="w-5 h-5" />;
  if (cat.includes('hiburan') || cat.includes('bioskop') || cat.includes('nonton') || cat.includes('streaming') || cat.includes('film')) return <Music className="w-5 h-5" />;
  if (cat.includes('game') || cat.includes('main') || cat.includes('hobi')) return <Gamepad className="w-5 h-5" />;
  if (cat.includes('gym') || cat.includes('olahraga') || cat.includes('sehat')) return <Dumbbell className="w-5 h-5" />;
  if (cat.includes('gadget') || cat.includes('hp') || cat.includes('laptop') || cat.includes('elektronik')) return <Smartphone className="w-5 h-5" />;
  if (cat.includes('sakit') || cat.includes('obat') || cat.includes('rs') || cat.includes('dokter') || cat.includes('medis')) return <Heart className="w-5 h-5" />;
  if (cat.includes('didik') || cat.includes('sekolah') || cat.includes('kuliah') || cat.includes('buku') || cat.includes('kursus')) return <GraduationCap className="w-5 h-5" />;
  if (cat.includes('gaji') || cat.includes('kerja') || cat.includes('upah') || cat.includes('salary')) return <Briefcase className="w-5 h-5" />;
  if (cat.includes('invest') || cat.includes('saham') || cat.includes('crypto') || cat.includes('reksadana')) return <TrendingUp className="w-5 h-5" />;
  if (cat.includes('bonus') || cat.includes('thr') || cat.includes('insentif')) return <Coins className="w-5 h-5" />;
  if (cat.includes('hadiah') || cat.includes('kado') || cat.includes('donasi')) return <Gift className="w-5 h-5" />;
  if (cat.includes('travel') || cat.includes('liburan') || cat.includes('pesawat') || cat.includes('hotel') || cat.includes('tiket')) return <Plane className="w-5 h-5" />;
  if (cat.includes('asuransi') || cat.includes('proteksi')) return <Shield className="w-5 h-5" />;
  
  return <Tag className="w-5 h-5" />;
};

const TransactionList: React.FC<Props> = ({ 
  transactions, 
  onDelete, 
  onEdit, 
  compact = false,
  showActions = true
}) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4">
          <ShoppingBag className="w-10 h-10 opacity-30 text-indigo-500" />
        </div>
        <p className="font-bold">Database Kosong</p>
        <p className="text-sm mt-1 opacity-70">Belum ada record data yang tersimpan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <div className="inline-block min-w-full align-middle p-2">
        <table className="min-w-full">
          {!compact && (
            <thead>
              <tr className="border-b-2 border-slate-50 dark:border-slate-800">
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  Record Details
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden md:table-cell">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden lg:table-cell">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden sm:table-cell">
                  Input By
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  Amount
                </th>
                {showActions && (
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-2xl shadow-sm ${
                      t.type === TransactionType.INCOME 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                    }`}>
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-slate-100 leading-none mb-1.5">{t.description}</p>
                      <div className="flex items-center gap-2 md:hidden">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                          t.createdBy === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.createdBy || 'user'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{t.date}</span>
                      </div>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <td className="px-6 py-5 hidden md:table-cell">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t.category}
                    </span>
                  </td>
                )}
                {!compact && (
                  <td className="px-6 py-5 hidden lg:table-cell whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t.date}</p>
                  </td>
                )}
                {!compact && (
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white ${t.createdBy === 'admin' ? 'bg-purple-500' : 'bg-slate-400'}`}>
                         {(t.createdBy || 'u').charAt(0).toUpperCase()}
                       </div>
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.createdBy || 'user'}</span>
                    </div>
                  </td>
                )}
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <p className={`text-lg font-black ${
                    t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                </td>
                {showActions && (
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => onEdit(t)}
                        className="p-3 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-90"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
