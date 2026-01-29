
import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialSummary } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[], summary: FinancialSummary) => {
  // Always use { apiKey: process.env.API_KEY } for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const transactionSummary = transactions.map(t => ({
    date: t.date,
    category: t.category,
    amount: t.amount,
    type: t.type,
    desc: t.description
  }));

  const prompt = `
    Bertindaklah sebagai penasihat keuangan pribadi profesional. 
    Analisis data transaksi berikut dan berikan ringkasan cerdas, saran penghematan, serta evaluasi kesehatan keuangan pengguna.
    
    Data Ringkasan:
    - Total Pemasukan: Rp ${summary.totalIncome.toLocaleString('id-ID')}
    - Total Pengeluaran: Rp ${summary.totalExpense.toLocaleString('id-ID')}
    - Saldo Saat Ini: Rp ${summary.balance.toLocaleString('id-ID')}
    
    Daftar 10 Transaksi Terakhir:
    ${JSON.stringify(transactionSummary.slice(0, 10), null, 2)}
    
    Berikan respons dalam Bahasa Indonesia yang ramah dan memotivasi. Sertakan:
    1. Evaluasi singkat pengeluaran terbesar.
    2. Satu atau dua tips penghematan yang spesifik berdasarkan kategori pengeluaran mereka.
    3. Kalimat motivasi keuangan.
    
    Format jawaban dalam Markdown yang rapi.
  `;

  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning and data evaluation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    // Access the .text property directly as per the latest SDK guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Gagal mendapatkan analisis dari AI.");
  }
};
