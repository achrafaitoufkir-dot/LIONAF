export type TransactionType = 'INCOME' | 'EXPENSE';

export type Frequency = 'ONE_OFF' | 'MONTHLY' | 'ANNUAL';

export type Language = 'fr' | 'ar' | 'dar';

export type MemberId = 'mem_father' | 'mem_mother' | 'mem_daughter' | 'mem_baby' | 'mem_family';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  isFixed?: boolean; // For fixed monthly/annual expenses
}

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  weight?: number; // Weight in Kg (Optional)
  isEssential: boolean; // true = Important, false = Non important
  quality: 'GOOD' | 'BAD' | 'AVERAGE';
}

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  categoryId: string;
  memberId?: MemberId; // Who is this expense for?
  description: string;
  isRecurring?: boolean;
  isFixed?: boolean; // Explicitly override if it is fixed or not
  // Grocery specific
  supplier?: string; // Nom du fournisseur / Magasin
  groceryItems?: GroceryItem[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface FamilyProfile {
  name: string;
  members: {
    role: string;
    age?: number;
  }[];
}