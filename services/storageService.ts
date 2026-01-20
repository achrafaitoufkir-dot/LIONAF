import { Transaction, SavingsGoal, Category } from '../types';

const TRANSACTIONS_KEY = 'sahla_transactions';
const GOALS_KEY = 'sahla_goals';
const CUSTOM_CATEGORIES_KEY = 'sahla_custom_categories';

// Helper for safe parsing
const safeParse = <T>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.warn(`Error parsing key ${key}, resetting to default.`, e);
    return fallback;
  }
};

export const getTransactions = (): Transaction[] => {
  const data = safeParse<Transaction[]>(TRANSACTIONS_KEY, []);
  return Array.isArray(data) ? data : [];
};

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const transactions = getTransactions();
  const newTransactions = [transaction, ...transactions]; // Newest first
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
  return newTransactions;
};

export const updateTransaction = (transaction: Transaction): Transaction[] => {
  const transactions = getTransactions();
  const newTransactions = transactions.map(t => t.id === transaction.id ? transaction : t);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
  return newTransactions;
};

export const deleteTransaction = (id: string): Transaction[] => {
    const transactions = getTransactions();
    const newTransactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
    return newTransactions;
}

export const getSavingsGoals = (): SavingsGoal[] => {
  return safeParse<SavingsGoal[]>(GOALS_KEY, []);
};

export const saveSavingsGoal = (goal: SavingsGoal): SavingsGoal[] => {
  const goals = getSavingsGoals();
  const existingIndex = goals.findIndex(g => g.id === goal.id);
  let newGoals;
  if (existingIndex >= 0) {
    newGoals = [...goals];
    newGoals[existingIndex] = goal;
  } else {
    newGoals = [...goals, goal];
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
  return newGoals;
};

export const deleteSavingsGoal = (id: string): SavingsGoal[] => {
    const goals = getSavingsGoals();
    const newGoals = goals.filter(g => g.id !== id);
    localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
    return newGoals;
};

export const getCustomCategories = (): Category[] => {
  return safeParse<Category[]>(CUSTOM_CATEGORIES_KEY, []);
};

export const saveCustomCategory = (category: Category): Category[] => {
  const categories = getCustomCategories();
  const newCategories = [...categories, category];
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(newCategories));
  return newCategories;
};

// Data Management
export const exportData = () => {
    const data = {
        transactions: getTransactions(),
        goals: getSavingsGoals(),
        customCategories: getCustomCategories(),
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sahla_budget_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.transactions) localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
                if (data.goals) localStorage.setItem(GOALS_KEY, JSON.stringify(data.goals));
                if (data.customCategories) localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(data.customCategories));
                resolve(true);
            } catch (err) {
                console.error("Import failed", err);
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
};

export const resetData = () => {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(CUSTOM_CATEGORIES_KEY);
}