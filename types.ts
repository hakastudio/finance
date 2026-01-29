
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isCustom: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
  createdBy?: 'admin' | 'user';
  timestamp: number; // Untuk pengurutan sinkronisasi
  syncId: string;    // Unique ID untuk mencegah duplikasi cloud
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface SyncLog {
  id: string;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'pending' | 'error';
}
