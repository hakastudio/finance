
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const FinancialCharts: React.FC<Props> = ({ transactions }) => {
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

  const textColor = '#64748b';
  const gridColor = '#f1f5f9';

  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl transition-colors">
        Data tidak cukup untuk menampilkan grafik
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full">
        <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Trend Pemasukan vs Pengeluaran (7 Hari Terakhir)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }} 
              itemStyle={{ color: '#1e293b' }}
              formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: textColor }} />
            <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[300px] w-full">
        <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Distribusi Pengeluaran per Kategori</h4>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }} 
              itemStyle={{ color: '#1e293b' }}
              formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
           {categoryData.map((entry, index) => (
             <div key={entry.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-500">{entry.name}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
