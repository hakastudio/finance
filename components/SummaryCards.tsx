
import React from 'react';
import { FinancialSummary } from '../types';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  summary: FinancialSummary;
}

const SummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Balance Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Saldo</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2">Rp {summary.balance.toLocaleString('id-ID')}</h3>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +2.4% vs Bulan Lalu
          </p>
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pemasukan</span>
          </div>
          <h3 className="text-3xl font-black text-emerald-600 mb-2">Rp {summary.totalIncome.toLocaleString('id-ID')}</h3>
          <p className="text-xs font-bold text-slate-400">Total akumulasi bulan ini</p>
        </div>
      </div>

      {/* Expense Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-rose-50 rounded-full group-hover:bg-rose-100 transition-colors duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pengeluaran</span>
          </div>
          <h3 className="text-3xl font-black text-rose-600 mb-2">Rp {summary.totalExpense.toLocaleString('id-ID')}</h3>
          <p className="text-xs font-bold text-rose-400 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            -4.1% Hemat Energi
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
