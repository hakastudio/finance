
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
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
