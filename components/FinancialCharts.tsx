
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
  isDarkMode?: boolean;
}

const COLORS = ['#dc2626', '#10b981', '#f43f5e', '#f59e0b', '#e11d48', '#fb7185', '#be123c'];

const FinancialCharts: React.FC<Props> = ({ transactions, isDarkMode = false }) => {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const groups = expenses.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    return Object.keys(groups).map(key => ({
      name: key,
      value: groups[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const groups = transactions.reduce((acc: any, curr) => {
      const dateKey = curr.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (curr.type === TransactionType.INCOME) {
        acc[dateKey].income += curr.amount;
      } else {
        acc[dateKey].expense += curr.amount;
      }
      return acc;
    }, {});

    return Object.values(groups).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
  }, [transactions]);

  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';

  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl transition-colors">
        Data tidak cukup untuk menampilkan grafik
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
        <h4 className="text-sm font-black text-slate-500 dark:text-slate-400 mb-4 text-center uppercase tracking-widest">Trend 7 Hari Terakhir</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }} 
              itemStyle={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}
              formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: textColor, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
            <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[300px] w-full">
        <h4 className="text-sm font-black text-slate-500 dark:text-slate-400 mb-4 text-center uppercase tracking-widest">Distribusi Pengeluaran</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }} 
              itemStyle={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}
              formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
           {categoryData.map((entry, index) => (
             <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{entry.name}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
