
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle } from 'lucide-react';
import { Transaction, FinancialSummary } from '../types';
import { getFinancialAdvice } from '../services/gemini';

interface Props {
  transactions: Transaction[];
  summary: FinancialSummary;
}

const AIInsights: React.FC<Props> = ({ transactions, summary }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    if (transactions.length === 0) {
      setError("Tambahkan beberapa transaksi terlebih dahulu agar AI dapat menganalisis data Anda.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const advice = await getFinancialAdvice(transactions, summary);
      setInsight(advice || "Maaf, AI tidak dapat memberikan saran saat ini.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Analisis Cerdas Finansial</h3>
              <p className="text-slate-500 max-w-lg">
                Gunakan kecerdasan buatan untuk menganalisis pola pengeluaran Anda dan dapatkan tips penghematan yang dipersonalisasi.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
              loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Mulai Analisis AI
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {insight && !loading && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-colors animate-fadeIn">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <h4 className="text-lg font-bold text-slate-800">Hasil Analisis Gemini AI</h4>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {insight.split('\n').map((line, i) => {
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-6 mb-2 text-indigo-600">{line.replace('### ', '')}</h3>;
              } else if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-slate-800 border-b pb-2">{line.replace('## ', '')}</h2>;
              } else if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-4 list-disc mb-1">{line.substring(2)}</li>;
              } else if (line.trim() === '') {
                return <div key={i} className="h-2" />;
              }
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 italic">
              Disclaimer: Saran ini dihasilkan oleh AI berdasarkan data yang Anda masukkan. Tetap pertimbangkan keputusan finansial Anda secara bijak.
            </p>
          </div>
        </div>
      )}

      {!insight && !loading && !error && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
           <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400" />
           </div>
           <h4 className="text-lg font-semibold text-slate-700">Siap untuk Analisis?</h4>
           <p className="text-slate-500 mt-2 max-w-sm mx-auto">Klik tombol di atas untuk melihat bagaimana AI melihat kesehatan keuangan Anda hari ini.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
