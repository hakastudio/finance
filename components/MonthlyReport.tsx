
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const MonthlyReport: React.FC<Props> = ({ transactions }) => {
  const monthlyData = useMemo(() => {
    const groups: Record<string, { month: string; income: number; expense: number }> = {};
    
    // Process all transactions
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.toLocaleString('id-ID', { month: 'long' });
      const key = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${month} ${year}`;

      if (!groups[key]) {
        groups[key] = { month: label, income: 0, expense: 0 };
      }

      if (t.type === TransactionType.INCOME) {
        groups[key].income += t.amount;
      } else {
        groups[key].expense += t.amount;
      }
    });

    // Sort by date key and return as array
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => ({
        ...data,
        balance: data.income - data.expense
      }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <Calendar className="w-16 h-16 opacity-20 mb-4 text-indigo-500" />
        <h3 className="text-xl font-black text-slate-800">Data Belum Tersedia</h3>
        <p className="max-w-xs text-center mt-2 font-medium">Laporan bulanan akan muncul setelah Anda mencatat transaksi pertama.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Monthly Chart Card */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100/50">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Trend Keuangan Bulanan</h3>
            <p className="text-sm text-slate-500 font-medium">Perbandingan pemasukan dan pengeluaran tiap bulan</p>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontWeight: 600 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `Rp${val >= 1000000 ? (val/1000000).toFixed(1) + 'jt' : (val/1000).toFixed(0) + 'k'}`}
                tick={{ fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  padding: '12px 16px'
                }} 
                itemStyle={{ fontWeight: 700 }}
                formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={50}
                iconType="circle"
                wrapperStyle={{ fontWeight: 700, fontSize: '12px', paddingBottom: '20px' }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Monthly Table */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Detail Rekapitulasi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-50">
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Bulan</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest text-emerald-600">Pemasukan</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest text-rose-600">Pengeluaran</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></div>
                      <span className="font-black text-slate-800">{row.month}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right whitespace-nowrap">
                    <span className="font-bold text-emerald-600 text-lg">Rp {row.income.toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-6 text-right whitespace-nowrap">
                    <span className="font-bold text-rose-600 text-lg">Rp {row.expense.toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-900">
                      Rp {row.balance.toLocaleString('id-ID')}
                      <ArrowRight className={`w-4 h-4 ${row.balance >= 0 ? 'text-emerald-500' : 'text-rose-500 rotate-45'}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
