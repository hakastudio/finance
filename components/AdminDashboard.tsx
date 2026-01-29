
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, SyncLog } from '../types';
import CategoryManager from './CategoryManager';
import TransactionList from './TransactionList';
import { 
  ShieldCheck, Database, Trash2, 
  Download, Activity, BarChart, 
  Settings2, Info, Save, CheckCircle2,
  Layout, Globe, RefreshCw, ListFilter,
  ArrowRightCircle, Edit3, CloudLightning,
  Calendar, Filter, Megaphone, Send, X,
  Clock, UserCheck, Zap, UploadCloud, FileJson,
  History, ServerCog
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  appName: string;
  broadcastMessage: string;
  syncLogs: SyncLog[];
  onUpdateAppName: (name: string) => void;
  onUpdateBroadcast: (message: string) => void;
  onAddCategory: (name: string, type: TransactionType) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void; 
  onDeleteTransaction: (id: string) => void;
  onResetData: () => void;
  onExport: () => void;
  onRestore: (data: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  transactions, 
  categories, 
  appName: currentAppName,
  broadcastMessage: currentBroadcast,
  syncLogs,
  onUpdateAppName,
  onUpdateBroadcast,
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  onUpdateTransaction,
  onDeleteTransaction,
  onResetData,
  onExport,
  onRestore
}) => {
  const [tempAppName, setTempAppName] = useState(currentAppName);
  const [tempBroadcast, setTempBroadcast] = useState(currentBroadcast);
  const [activeAdminView, setActiveAdminView] = useState<'settings' | 'categories' | 'transactions' | 'broadcast' | 'backup'>('settings');
  const [restoreValue, setRestoreValue] = useState('');

  useEffect(() => {
    setTempAppName(currentAppName);
    setTempBroadcast(currentBroadcast);
  }, [currentAppName, currentBroadcast]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 border border-slate-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                <ServerCog className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="font-black uppercase tracking-[0.2em] text-[8px]">Cloud Master Engine v4.0</span>
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Master Control</h2>
            <p className="text-slate-400 text-sm max-w-sm font-medium">Monitoring sinkronisasi global dan integritas data cloud.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-full lg:w-auto overflow-x-auto">
            {[
              { id: 'settings', label: 'Identity', icon: Globe },
              { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
              { id: 'categories', label: 'Labels', icon: Settings2 },
              { id: 'transactions', label: 'Database', icon: Database },
              { id: 'backup', label: 'Cloud Backup', icon: UploadCloud }
            ].map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveAdminView(v.id as any)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeAdminView === v.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                <v.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeAdminView === 'settings' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn transition-all">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-8"><Globe className="w-6 h-6 text-red-500" /> Branding Global</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" value={tempAppName} onChange={(e) => setTempAppName(e.target.value)} className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-black text-lg focus:border-red-500 dark:text-white transition-all" placeholder="App Name" />
                <button onClick={() => onUpdateAppName(tempAppName)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Push Update</button>
              </div>
            </div>
          )}

          {activeAdminView === 'backup' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn transition-all space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="w-6 h-6 text-emerald-500" />
                      <h4 className="text-sm font-black uppercase tracking-widest">Create Snapshot</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">Ambil seluruh data cloud saat ini dan simpan sebagai file cadangan fisik.</p>
                    <button onClick={onExport} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">Generate Backup File</button>
                 </div>
                 <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <UploadCloud className="w-6 h-6 text-red-500" />
                      <h4 className="text-sm font-black uppercase tracking-widest">Restore Database</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">Timpa database cloud dengan data dari file snapshot eksternal.</p>
                    <textarea value={restoreValue} onChange={(e) => setRestoreValue(e.target.value)} placeholder="Paste Snapshot Code Here..." className="w-full p-4 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-mono min-h-[80px]" />
                    <button onClick={() => onRestore(restoreValue)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Restore Cloud Data</button>
                 </div>
              </div>
              <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                 <ShieldCheck className="w-6 h-6 text-red-500 flex-shrink-0" />
                 <div>
                   <h5 className="text-xs font-black uppercase text-red-600 tracking-widest mb-1">Peringatan Keamanan</h5>
                   <p className="text-[10px] text-red-500 font-medium leading-relaxed">Snapshot berisi data sensitif. Simpan file backup di tempat yang aman. Proses restore akan menghapus seluruh data yang ada saat ini di cloud.</p>
                 </div>
              </div>
            </div>
          )}

          {activeAdminView === 'broadcast' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-fadeIn transition-all">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-8"><Megaphone className="w-6 h-6 text-red-500" /> Live Alert Banner</h3>
              <div className="space-y-4">
                <textarea value={tempBroadcast} onChange={(e) => setTempBroadcast(e.target.value)} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-lg focus:border-red-500 dark:text-white min-h-[120px]" placeholder="Pesan broadcast..." />
                <button onClick={() => onUpdateBroadcast(tempBroadcast)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center gap-2"><Send className="w-5 h-5" /> Update Live Banner</button>
              </div>
            </div>
          )}

          {activeAdminView === 'categories' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
              <CategoryManager categories={categories} transactions={transactions} onAdd={onAddCategory} onUpdate={onUpdateCategory} onDelete={onDeleteCategory} />
            </div>
          )}

          {activeAdminView === 'transactions' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Global Database Master</h3>
                <button onClick={onResetData} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30 flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /> Purge Database</button>
              </div>
              <TransactionList transactions={transactions} onDelete={onDeleteTransaction} onEdit={onUpdateTransaction} showActions={true} />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Cloud Sync Log</h4>
               <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-black uppercase">Online</div>
             </div>
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {syncLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-[10px] font-bold">Menunggu aktivitas...</div>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                      <div className={`w-1 h-8 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{log.action}</p>
                           <p className="text-[8px] font-bold text-slate-400">{log.time}</p>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <UserCheck className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.user}</span>
                         </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/20 to-transparent opacity-50"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <Zap className="w-6 h-6 text-red-500" />
                 <h4 className="text-xs font-black uppercase tracking-widest">System Health</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] text-slate-400 font-bold">Global Records</span>
                    <span className="text-xs font-black">{transactions.length} items</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] text-slate-400 font-bold">Cloud Latency</span>
                    <span className="text-xs font-black text-emerald-400">Stable (24ms)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">Uptime</span>
                    <span className="text-xs font-black">99.9%</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
