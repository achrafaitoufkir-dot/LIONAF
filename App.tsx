import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, PlusCircle, TrendingUp, Wallet, 
  Menu, X, ChevronRight, ChevronLeft, AlertTriangle, Sparkles, Trash2, Globe, Pencil, RefreshCw,
  Briefcase, DollarSign, Smartphone, Zap, Wifi, GraduationCap, 
  Home, Moon, PenTool, Car, Plane, AlertCircle, ShoppingBag, 
  Coffee, HeartPulse, Baby, Shirt, Gift, Scissors, Armchair, Plus, User, Users,
  ShoppingCart, Star, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Check, CornerDownLeft, AlertOctagon, Store, History, Scale, Carrot,
  Beef, Apple, Leaf, Milk, Utensils, SprayCan as Spray, Wrench, Fuel, Bus, Train, Clock, Printer, FileText, CheckSquare, Download, Flame, PiggyBank, Settings, Upload, Save, Filter
} from 'lucide-react';
import { Transaction, TransactionType, Language, Category, MemberId, GroceryItem, SavingsGoal } from './types';
import { ALL_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES, FAMILY_MEMBERS, PRODUCE_LISTS, GROCERY_LISTS, CAR_EXPENSES, SMOKING_ITEMS } from './constants';
import { TRANSLATIONS } from './translations';
import { getTransactions, saveTransaction, updateTransaction, deleteTransaction, getCustomCategories, saveCustomCategory, getSavingsGoals, saveSavingsGoal, deleteSavingsGoal, exportData, importData, resetData } from './services/storageService';
import { getFinancialAdvice } from './services/geminiService';

// --- Constants ---
const LANGUAGES: Language[] = ['fr', 'ar', 'dar'];

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, DollarSign, Smartphone, Zap, Wifi, GraduationCap, 
  Home, Moon, PenTool, Car, Plane, AlertCircle, ShoppingBag, 
  Coffee, HeartPulse, Baby, Shirt, Gift, Scissors, Armchair, Wallet, User, Users, Carrot, Star, Flame
};

// --- Helper Components ---

const Card: React.FC<{ children?: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-gray-500 hover:text-gray-700"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const BudgetAlert = ({ income, expense, t }: { income: number, expense: number, t: (k:string)=>string }) => {
    if (income === 0) return null;
    const ratio = expense / income;
    
    if (ratio >= 1) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
                <AlertOctagon className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-red-700">{t('budget_critical_title')}</h4>
                    <p className="text-sm text-red-600">{t('budget_critical_desc')}</p>
                </div>
            </div>
        );
    }
    if (ratio >= 0.9) {
        return (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-orange-700">{t('budget_alert_title')}</h4>
                    <p className="text-sm text-orange-600">{t('budget_alert_desc')}</p>
                </div>
            </div>
        );
    }
    // Positive Reinforcement
    if (ratio < 0.7 && expense > 0) {
        return (
             <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
                <Check className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-green-700">{t('budget_safe_title')}</h4>
                    <p className="text-sm text-green-600">{t('budget_safe_desc')}</p>
                </div>
            </div>
        )
    }
    return null;
};

// --- Printable Components ---

const PrintableReport = ({ transactions, totalIncome, totalExpense, advice, t, lang }: any) => {
    const balance = totalIncome - totalExpense;
    const expenseData = useMemo(() => {
        const byCat: Record<string, number> = {};
        transactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
            const catName = t.categoryId; 
            byCat[catName] = (byCat[catName] || 0) + t.amount;
        });
        return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [transactions]);

    return (
        <div className="print-only p-8 bg-white text-black">
            <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">Sahla Budget</h1>
                <h2 className="text-xl text-gray-600">{t('report_title')}</h2>
                <p className="text-sm text-gray-500">{t('generated_on')} {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-bold uppercase text-gray-500">{t('income')}</h3>
                    <p className="text-2xl font-bold text-green-700">+{totalIncome.toFixed(2)} MAD</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-bold uppercase text-gray-500">{t('expense')}</h3>
                    <p className="text-2xl font-bold text-red-700">-{totalExpense.toFixed(2)} MAD</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-bold uppercase text-gray-500">Balance</h3>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        {balance.toFixed(2)} MAD
                    </p>
                </div>
            </div>

            <div className="mb-8 print-break-inside">
                <h3 className="text-lg font-bold border-b mb-4 pb-2">{t('financial_summary')}</h3>
                <div className="space-y-2">
                    {expenseData.slice(0, 10).map((item: any) => (
                        <div key={item.name} className="flex justify-between items-center py-1 border-b border-gray-100">
                             <span>{t(item.name)}</span>
                             <span className="font-bold">{item.value.toFixed(2)} MAD</span>
                        </div>
                    ))}
                </div>
            </div>

            {advice && (
                <div className="mb-8 print-break-inside">
                    <h3 className="text-lg font-bold border-b mb-4 pb-2">{t('advisor_report')}</h3>
                    <div className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-line">
                        {advice}
                    </div>
                </div>
            )}
            
            <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t">
                Généré par Sahla Budget Application
            </div>
        </div>
    );
};

const PrintableList = ({ title, items, t }: { title: string, items: string[], t: (k:string)=>string }) => {
    return (
        <div className="print-only p-8 bg-white text-black">
             <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold mb-2">Sahla Budget</h1>
                <h2 className="text-xl text-gray-600">{title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-200">
                        <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                        <span className="text-lg">{item}</span>
                    </div>
                ))}
                {/* Empty lines for manual addition */}
                {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="flex items-center gap-3 py-2 border-b border-gray-200">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded border-dashed"></div>
                        <span className="text-gray-300 italic">.......................................</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Views ---

const MarketView = ({ transactions, onSaveTransaction, t, lang }: { transactions: Transaction[], onSaveTransaction: (t: Transaction) => void, t: (k:string)=>string, lang: Language }) => {
    const [activeTab, setActiveTab] = useState<'checklist' | 'consumption' | 'comparison'>('checklist');
    const [checklistItems, setChecklistItems] = useState<Record<string, { price: string, weight: string, checked: boolean }>>({});
    const [supplier, setSupplier] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);
    const [printType, setPrintType] = useState<'market'|'grocery'>('market');

    // Categorized Default Items from Constants
    const categorizedDefaults = useMemo(() => {
        return PRODUCE_LISTS[lang] || PRODUCE_LISTS.fr;
    }, [lang]);

    // Separate items into groups, including history
    const produceGroups = useMemo(() => {
        const vegs = new Set<string>(categorizedDefaults.veg);
        const fruits = new Set<string>(categorizedDefaults.fruit);
        const meats = new Set<string>(categorizedDefaults.meat);
        const herbs = new Set<string>(categorizedDefaults.herbs);
        
        // Items found in history or manually added that don't fit above
        const others = new Set<string>();

        // Add history items - try to categorize if known, otherwise put in "others" if not present
        transactions.forEach(t => {
            if ((t.categoryId === 'exp_market') && t.groceryItems) {
                t.groceryItems.forEach(i => {
                    const name = i.name.trim();
                    if (!vegs.has(name) && !fruits.has(name) && !meats.has(name) && !herbs.has(name)) {
                        others.add(name);
                    }
                });
            }
        });
        
        // Also add currently added temp items
        Object.keys(checklistItems).forEach(k => {
             if (!vegs.has(k) && !fruits.has(k) && !meats.has(k) && !herbs.has(k)) {
                others.add(k);
            }
        });

        return {
            veg: Array.from(vegs).sort(),
            fruit: Array.from(fruits).sort(),
            meat: Array.from(meats).sort(),
            herbs: Array.from(herbs).sort(),
            other: Array.from(others).sort()
        };
    }, [transactions, categorizedDefaults, checklistItems]);

    // Initialize checklist
    useEffect(() => {
        setChecklistItems(prev => {
            const next = { ...prev };
            [...produceGroups.veg, ...produceGroups.fruit, ...produceGroups.meat, ...produceGroups.herbs, ...produceGroups.other].forEach(name => {
                if (!next[name]) {
                    next[name] = { price: '', weight: '', checked: false };
                }
            });
            return next;
        });
    }, [produceGroups]);

    // Calculate Consumption Stats
    const consumptionStats = useMemo(() => {
        const stats: Record<string, number> = {};
        const currentMonth = new Date().getMonth();
        transactions.forEach(t => {
            if (new Date(t.date).getMonth() === currentMonth && (t.categoryId === 'exp_market' || t.categoryId === 'exp_groceries') && t.groceryItems) {
                t.groceryItems.forEach(item => {
                    if (item.weight && item.weight > 0) {
                        const name = item.name.trim().toLowerCase();
                        stats[name] = (stats[name] || 0) + item.weight;
                    }
                });
            }
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]); // Descending order
    }, [transactions]);

    // Compare Markets (Avg Price per Kg)
    const marketStats = useMemo(() => {
        const comparison: Record<string, Record<string, { spend: number, weight: number }>> = {};
        transactions.forEach(t => {
            if (t.supplier && (t.categoryId === 'exp_market' || t.categoryId === 'exp_groceries') && t.groceryItems) {
                t.groceryItems.forEach(item => {
                    if (item.weight && item.weight > 0 && item.price > 0) {
                        const name = item.name.trim().toLowerCase();
                        if (!comparison[name]) comparison[name] = {};
                        if (!comparison[name][t.supplier]) comparison[name][t.supplier] = { spend: 0, weight: 0 };
                        
                        comparison[name][t.supplier].spend += item.price;
                        comparison[name][t.supplier].weight += item.weight;
                    }
                });
            }
        });
        return comparison;
    }, [transactions]);

    const handleChecklistChange = (name: string, field: 'price' | 'weight' | 'checked', value: any) => {
        setChecklistItems(prev => ({
            ...prev,
            [name]: { ...prev[name], [field]: value }
        }));
    };

    const handleAddNewItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const name = newItemName.trim();
        setChecklistItems(prev => ({
            ...prev,
            [name]: { price: '', weight: '', checked: true }
        }));
        setNewItemName('');
    };

    const handleFinishMarket = () => {
        const items: GroceryItem[] = [];
        let totalAmount = 0;

        Object.entries(checklistItems).forEach(([name, val]) => {
            const data = val as { price: string, weight: string, checked: boolean };
            if (data.checked && data.price) {
                const price = parseFloat(data.price);
                const weight = data.weight ? parseFloat(data.weight) : undefined;
                items.push({
                    id: Date.now().toString() + Math.random(),
                    name: name,
                    price: price,
                    weight: weight,
                    isEssential: true,
                    quality: 'AVERAGE' // Default
                });
                totalAmount += price;
            }
        });

        if (items.length === 0) {
             alert(lang === 'fr' ? "Aucun article coché avec un prix." : "لم يتم تحديد أي عنصر مع السعر.");
             return;
        }

        const transaction: Transaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            amount: totalAmount,
            type: 'EXPENSE',
            categoryId: 'exp_market',
            supplier: supplier || 'Marché',
            groceryItems: items,
            description: 'Marché Hebdomadaire',
            memberId: 'mem_family'
        };

        onSaveTransaction(transaction);
        const reset: any = {};
        // Reset all items
        Object.keys(checklistItems).forEach(name => {
             reset[name] = { price: '', weight: '', checked: false };
        });
        setChecklistItems(reset);
        setSupplier('');
        alert(lang === 'fr' ? "Marché enregistré !" : "تم حفظ السوق !");
    };

    const currentTotal = (Object.values(checklistItems) as { price: string; weight: string; checked: boolean }[]).reduce((acc, item) => {
        return acc + (item.checked && item.price ? parseFloat(item.price) : 0);
    }, 0);

    const handlePrintList = (type: 'market' | 'grocery') => {
        setPrintType(type);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    const renderChecklistSection = (title: string, items: string[], colorClass: string) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-6">
                <h4 className={`font-bold text-sm uppercase tracking-wider mb-2 px-1 ${colorClass}`}>{title}</h4>
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item} className={`p-3 rounded-xl border transition-all ${checklistItems[item]?.checked ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={checklistItems[item]?.checked || false}
                                    onChange={(e) => handleChecklistChange(item, 'checked', e.target.checked)}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 accent-green-600"
                                />
                                <span className={`flex-1 font-bold ${checklistItems[item]?.checked ? 'text-green-800' : 'text-gray-600'}`}>{item}</span>
                            </div>
                            
                            {checklistItems[item]?.checked && (
                                <div className="flex gap-2 pl-8 animate-fade-in-up">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="number" 
                                            placeholder={t('item_price')}
                                            value={checklistItems[item]?.price}
                                            onChange={(e) => handleChecklistChange(item, 'price', e.target.value)}
                                            className="w-full p-2 text-sm border border-green-200 rounded-lg focus:ring-1 focus:ring-green-500 outline-none"
                                        />
                                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">MAD</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="number" 
                                            placeholder={t('kg')}
                                            value={checklistItems[item]?.weight}
                                            onChange={(e) => handleChecklistChange(item, 'weight', e.target.value)}
                                            className="w-full p-2 text-sm border border-green-200 rounded-lg focus:ring-1 focus:ring-green-500 outline-none"
                                        />
                                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">KG</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Prepare printable items
    const printItems = useMemo(() => {
        if (printType === 'market') {
             return [...produceGroups.veg, ...produceGroups.fruit, ...produceGroups.meat, ...produceGroups.herbs];
        } else {
             // Combine grocery lists
             const gl = GROCERY_LISTS[lang] || GROCERY_LISTS.fr;
             return [...gl.pantry, ...gl.cleaning, ...gl.hygiene];
        }
    }, [printType, produceGroups, lang]);

    if (isPrinting) {
        return <PrintableList title={printType === 'market' ? t('shopping_list_market') : t('shopping_list_grocery')} items={printItems} t={t} />;
    }

    return (
        <div className="space-y-6 pb-20 no-print">
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold ${activeTab === 'checklist' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    {t('market_checklist')}
                </button>
                <button onClick={() => setActiveTab('consumption')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold ${activeTab === 'consumption' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    {t('market_consumption')}
                </button>
                <button onClick={() => setActiveTab('comparison')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold ${activeTab === 'comparison' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    {t('market_comparison')}
                </button>
            </div>

            {activeTab === 'checklist' && (
                <div className="space-y-4 animate-fade-in">
                    <Card className="border-t-4 border-green-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-green-600" />
                                    {t('market_checklist')}
                                </h3>
                                {currentTotal > 0 && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm mt-1 inline-block">
                                        Total: {currentTotal} MAD
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handlePrintList('market')} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="Imprimer Liste Marché">
                                    <Printer size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                             <label className="block text-xs font-bold text-gray-700 mb-1">{t('market_select_supplier')}</label>
                             <input 
                                type="text" 
                                value={supplier}
                                onChange={e => setSupplier(e.target.value)}
                                placeholder={lang === 'fr' ? "Souk / Marché..." : "السوق / المحل..."}
                                className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-100"
                             />
                        </div>

                        {/* Add Custom Item Input */}
                        <form onSubmit={handleAddNewItem} className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                placeholder={t('add_item') + "..."}
                                className="flex-1 p-2 border rounded-lg text-sm bg-white outline-none focus:border-green-500"
                            />
                            <button type="submit" className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors">
                                <Plus size={20} />
                            </button>
                        </form>

                        <div className="max-h-[60vh] overflow-y-auto pr-1">
                            {renderChecklistSection(t('section_vegetables'), produceGroups.veg, "text-green-600")}
                            {renderChecklistSection(t('section_fruits'), produceGroups.fruit, "text-orange-500")}
                            {renderChecklistSection(t('section_meat'), produceGroups.meat, "text-red-500")}
                            {renderChecklistSection(t('section_herbs'), produceGroups.herbs, "text-green-800")}
                            {renderChecklistSection(t('section_others'), produceGroups.other, "text-gray-500")}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white pb-2">
                            <Button onClick={handleFinishMarket} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg">
                                <Check className="w-4 h-4" />
                                {t('finish_market')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'consumption' && (
                <div className="space-y-4 animate-fade-in">
                     <Card>
                         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                             <Scale className="w-5 h-5 text-blue-500" />
                             {t('total_consumed')}
                         </h3>
                         {consumptionStats.length === 0 ? (
                             <p className="text-gray-500 text-sm text-center py-4">{t('no_grocery_data')}</p>
                         ) : (
                             <div className="space-y-3">
                                 {consumptionStats.map(([name, weight]) => (
                                     <div key={name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                 {name.charAt(0).toUpperCase()}
                                             </div>
                                             <span className="font-medium text-gray-800 capitalize">{name}</span>
                                         </div>
                                         <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                             {weight.toFixed(1)} <span className="text-xs font-normal text-gray-500">{t('kg')}</span>
                                         </span>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </Card>
                </div>
            )}

            {activeTab === 'comparison' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(marketStats).map(([name, suppliers]) => (
                            <Card key={name} className="relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <h4 className="font-bold text-gray-900 capitalize mb-3 ml-2">{name}</h4>
                                <div className="space-y-2">
                                    {Object.entries(suppliers).map(([sup, data]) => {
                                        const avgPrice = data.spend / data.weight;
                                        return (
                                            <div key={sup} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0">
                                                <span className="text-gray-600">{sup}</span>
                                                <span className="font-bold text-indigo-600">
                                                    {avgPrice.toFixed(2)} <span className="text-[10px] text-gray-400">MAD/KG</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                        {Object.keys(marketStats).length === 0 && (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-400">{t('no_grocery_data')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ShoppingGuideView = ({ transactions, t, lang }: { transactions: Transaction[], t: (k:string)=>string, lang: Language }) => {
    // Logic to aggregate grocery data (Best Price / Supplier)
    const guideData = useMemo(() => {
        const itemMap: Record<string, { 
            bestSupplier: string, 
            bestPrice: number, 
            bestQuality: string, 
            lastDate: string 
        }> = {};

        // Only look at Essential Grocery items
        transactions.forEach(t => {
            if ((t.categoryId === 'exp_groceries' || t.categoryId === 'exp_market') && t.groceryItems && t.groceryItems.length > 0) {
                t.groceryItems.forEach(item => {
                    // Filter: Must be essential (Important)
                    if (!item.isEssential) return;

                    const normalizedName = item.name.trim().toLowerCase();
                    const supplier = t.supplier || 'Inconnu';
                    const currentEntry = itemMap[normalizedName];

                    // Logic to decide if this is the "Better" deal
                    let isBetter = false;

                    if (!currentEntry) {
                        isBetter = true;
                    } else {
                        // If current stored is bad quality, and this one is better
                        if (currentEntry.bestQuality === 'BAD' && item.quality !== 'BAD') isBetter = true;
                        // If qualities are similar (or both good), check price
                        else if (currentEntry.bestQuality === item.quality || (currentEntry.bestQuality !== 'GOOD' && item.quality === 'GOOD')) {
                            if (item.price < currentEntry.bestPrice) isBetter = true;
                        }
                    }

                    if (isBetter) {
                        itemMap[normalizedName] = {
                            bestSupplier: supplier,
                            bestPrice: item.price,
                            bestQuality: item.quality,
                            lastDate: t.date
                        };
                    }
                });
            }
        });

        return Object.entries(itemMap).map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            ...data
        })).sort((a, b) => a.name.localeCompare(b.name));

    }, [transactions]);

    // Logic for Suggested Restock (Items marked Essential, not bought in X days)
    const suggestedItems = useMemo(() => {
        const itemHistory: Record<string, string> = {}; // Name -> LastDate
        const allEssentialItems = new Set<string>();

        transactions.forEach(t => {
            if ((t.categoryId === 'exp_groceries' || t.categoryId === 'exp_market') && t.groceryItems) {
                t.groceryItems.forEach(item => {
                    if(item.isEssential) {
                        const name = item.name.trim().toLowerCase();
                        allEssentialItems.add(name);
                        // Track last date
                        if(!itemHistory[name] || new Date(t.date) > new Date(itemHistory[name])) {
                            itemHistory[name] = t.date;
                        }
                    }
                });
            }
        });

        const now = new Date();
        const suggestions: { name: string, daysAgo: number }[] = [];

        allEssentialItems.forEach(name => {
            const lastDate = new Date(itemHistory[name]);
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Threshold: 7 days
            if(diffDays > 7) {
                suggestions.push({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    daysAgo: diffDays
                });
            }
        });

        return suggestions.sort((a, b) => b.daysAgo - a.daysAgo);
    }, [transactions]);

    const [isPrinting, setIsPrinting] = useState(false);
    const handlePrintList = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    }
    
    // Prepare items for Grocery List Print
    const groceryListItems = useMemo(() => {
         const gl = GROCERY_LISTS[lang] || GROCERY_LISTS.fr;
         return [...gl.pantry, ...gl.cleaning, ...gl.hygiene, ...gl.pantry]; // Duplicate pantry for volume
    }, [lang]);

    if(isPrinting) {
        return <PrintableList title={t('shopping_list_grocery')} items={groceryListItems} t={t} />
    }

    if (guideData.length === 0 && suggestedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                    <ShoppingBag size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{t('guide_title')}</h3>
                <p className="text-gray-500 max-w-sm">{t('no_grocery_data')}</p>
                 <Button onClick={handlePrintList} variant="secondary">
                     <Printer size={16} /> {t('download_list')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20 no-print">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Store className="text-orange-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('guide_title')}</h2>
                        <p className="text-xs text-gray-500">{t('guide_subtitle')}</p>
                    </div>
                </div>
                <button onClick={handlePrintList} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" title={t('download_list')}>
                     <Printer size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Suggestions Section */}
            {suggestedItems.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        {t('restock_suggestions')}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{t('restock_desc')}</p>
                    <div className="flex flex-wrap gap-3">
                        {suggestedItems.map(item => (
                            <div key={item.name} className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full text-red-500 shadow-sm">
                                    <ShoppingBag size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                    <p className="text-[10px] text-red-600">{t('days_ago').replace('{days}', item.daysAgo.toString())}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Best Price Section */}
            <div>
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {t('best_price')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guideData.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                            
                            <h3 className="font-bold text-lg text-gray-800 mb-3 relative z-10">{item.name}</h3>
                            
                            <div className="space-y-2 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold">{t('best_supplier')}</span>
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{item.bestSupplier}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold">{t('best_price')}</span>
                                    <span className="text-xl font-bold text-gray-900">{item.bestPrice} <span className="text-xs font-normal text-gray-400">MAD</span></span>
                                </div>

                                <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                                    <span>
                                        {item.bestQuality === 'GOOD' ? `⭐ ${t('quality_good')}` : 
                                        item.bestQuality === 'BAD' ? `⚠️ ${t('quality_bad')}` : 
                                        `✨ ${t('quality_avg')}`}
                                    </span>
                                    <span>{t('last_bought')} : {new Date(item.lastDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SavingsView = ({ t, lang }: { t: (k:string)=>string, lang: Language }) => {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isAddGoal, setIsAddGoal] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalCurrent, setNewGoalCurrent] = useState('');

    useEffect(() => {
        setGoals(getSavingsGoals());
    }, []);

    const handleSaveGoal = () => {
        if (!newGoalName || !newGoalTarget) return;
        const goal: SavingsGoal = {
            id: Date.now().toString(),
            name: newGoalName,
            targetAmount: parseFloat(newGoalTarget),
            currentAmount: parseFloat(newGoalCurrent) || 0
        };
        const updated = saveSavingsGoal(goal);
        setGoals(updated);
        setIsAddGoal(false);
        setNewGoalName('');
        setNewGoalTarget('');
        setNewGoalCurrent('');
    };

    const handleDeleteGoal = (id: string) => {
        const updated = deleteSavingsGoal(id);
        setGoals(updated);
    }

    const updateGoalAmount = (goal: SavingsGoal, delta: number) => {
        const newAmount = Math.max(0, goal.currentAmount + delta);
        const updatedGoal = { ...goal, currentAmount: newAmount };
        const updated = saveSavingsGoal(updatedGoal);
        setGoals(updated);
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <PiggyBank className="text-pink-500" />
                    {t('savings')}
                </h2>
                <Button onClick={() => setIsAddGoal(true)} className="text-xs">
                    <PlusCircle size={16} /> {t('create_goal')}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => {
                    const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    return (
                        <Card key={goal.id} className="relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{goal.name}</h3>
                                <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                            
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold text-pink-600">{goal.currentAmount} <span className="text-sm text-gray-500">MAD</span></span>
                                <span className="text-xs text-gray-500 mb-1">/ {goal.targetAmount} MAD</span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                                <div 
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => updateGoalAmount(goal, 50)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors">
                                    +50
                                </button>
                                <button onClick={() => updateGoalAmount(goal, 200)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors">
                                    +200
                                </button>
                                <button onClick={() => updateGoalAmount(goal, -50)} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors">
                                    -
                                </button>
                            </div>
                        </Card>
                    )
                })}
                {goals.length === 0 && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <PiggyBank size={48} className="mx-auto mb-2 opacity-20" />
                        <p>{t('savings_possible')}</p>
                    </div>
                )}
            </div>

            {isAddGoal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-fade-in-up">
                        <h3 className="font-bold text-lg mb-4">{t('create_goal')}</h3>
                        <input className="w-full p-2 border rounded mb-3" placeholder={t('goal_name')} value={newGoalName} onChange={e => setNewGoalName(e.target.value)} />
                        <input className="w-full p-2 border rounded mb-3" type="number" placeholder={t('target_amount')} value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
                        <input className="w-full p-2 border rounded mb-4" type="number" placeholder={t('current_saved')} value={newGoalCurrent} onChange={e => setNewGoalCurrent(e.target.value)} />
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setIsAddGoal(false)} className="flex-1">{t('cancel')}</Button>
                            <Button onClick={handleSaveGoal} className="flex-1">{t('save')}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsView = ({ t, onLangChange }: { t: (k:string)=>string, onLangChange: ()=>void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const success = await importData(e.target.files[0]);
            if (success) {
                alert(t('restore_success'));
                window.location.reload();
            }
        }
    };

    const handleReset = () => {
        if (window.confirm(t('reset_confirm'))) {
            resetData();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="text-gray-700" />
                {t('settings')}
            </h2>

            <Card className="space-y-4">
                <div onClick={exportData} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="bg-white p-2 rounded-full text-blue-600"><Save size={20}/></div>
                    <div>
                        <h4 className="font-bold text-blue-900">{t('backup_data')}</h4>
                        <p className="text-xs text-blue-600">Download .json</p>
                    </div>
                </div>

                <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                    <div className="bg-white p-2 rounded-full text-green-600"><Upload size={20}/></div>
                    <div>
                        <h4 className="font-bold text-green-900">{t('restore_data')}</h4>
                        <p className="text-xs text-green-600">Upload .json</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </div>

                <div onClick={handleReset} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                    <div className="bg-white p-2 rounded-full text-red-600"><Trash2 size={20}/></div>
                    <div>
                        <h4 className="font-bold text-red-900">{t('reset_data')}</h4>
                        <p className="text-xs text-red-600">Danger Zone</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

const AddCategory = ({ onSave, onCancel, t }: any) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [isFixed, setIsFixed] = useState(false);
  const [icon, setIcon] = useState('Star');

  const icons = ['Star', 'HeartPulse', 'Zap', 'Coffee', 'ShoppingBag', 'Car', 'Home', 'Gift', 'Baby', 'User'];

  const handleSave = () => {
    if (!name) return;
    onSave({
      id: `custom_${Date.now()}`,
      name,
      type,
      icon,
      isFixed
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in no-print">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-lg mb-4">{t('add_new_category')}</h3>
        <div className="flex gap-2 mb-4">
            <button onClick={() => setType('INCOME')} className={`flex-1 py-2 rounded border ${type === 'INCOME' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200'}`}>{t('income')}</button>
            <button onClick={() => setType('EXPENSE')} className={`flex-1 py-2 rounded border ${type === 'EXPENSE' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200'}`}>{t('expense')}</button>
        </div>
        <input className="w-full p-2 border rounded mb-3" placeholder={t('cat_name')} value={name} onChange={e => setName(e.target.value)} />
        <div className="mb-3">
             <label className="block text-xs font-bold mb-1">{t('cat_icon')}</label>
             <div className="flex gap-2 flex-wrap">
                 {icons.map(ic => {
                     const I = ICON_MAP[ic] || Star;
                     return <button key={ic} onClick={() => setIcon(ic)} className={`p-2 rounded border ${icon === ic ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}><I size={16}/></button>
                 })}
             </div>
        </div>
        {type === 'EXPENSE' && (
             <label className="flex items-center gap-2 mb-4">
                 <input type="checkbox" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} />
                 <span className="text-sm">{t('is_fixed')}</span>
             </label>
        )}
        <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
            <Button onClick={handleSave} className="flex-1">{t('save')}</Button>
        </div>
      </div>
    </div>
  );
};

const HistoryView = ({ transactions, t, lang, onEdit, onDelete, categories }: { transactions: Transaction[], t: (k:string)=>string, lang: Language, onEdit: (t: Transaction)=>void, onDelete: (id: string)=>void, categories: Category[] }) => {
  const [filterMember, setFilterMember] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          const matchMember = filterMember === 'all' || t.memberId === filterMember;
          const matchCategory = filterCategory === 'all' || t.categoryId === filterCategory;
          return matchMember && matchCategory;
      });
  }, [transactions, filterMember, filterCategory]);

  if (transactions.length === 0) return <div className="p-8 text-center text-gray-500">{t('no_transactions')}</div>;
  
  return (
    <div className="space-y-4 animate-fade-in pb-20 no-print">
      {/* Filters */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
          <div className="relative min-w-[140px]">
              <Filter className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
              <select 
                value={filterMember} 
                onChange={(e) => setFilterMember(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold appearance-none outline-none focus:border-blue-500"
              >
                  <option value="all">{t('all_members')}</option>
                  {FAMILY_MEMBERS.map(m => <option key={m.id} value={m.id}>{t(m.id).split(' ')[0]}</option>)}
              </select>
          </div>
          <div className="relative min-w-[140px]">
              <Wallet className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold appearance-none outline-none focus:border-blue-500"
              >
                  <option value="all">{t('all_categories')}</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.id.startsWith('custom') ? c.name : t(c.id)}</option>)}
              </select>
          </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map(tx => {
            const CategoryIcon = ICON_MAP[categories.find(c => c.id === tx.categoryId)?.icon || 'Star'] || Star;
            const isExpense = tx.type === 'EXPENSE';
            return (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isExpense ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                    <CategoryIcon size={20} />
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-sm">{tx.categoryId.startsWith('custom_') ? ALL_CATEGORIES.find(c=>c.id===tx.categoryId)?.name || tx.categoryId : t(tx.categoryId)}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA')} {tx.description && `• ${tx.description}`}</p>
                </div>
                </div>
                <div className="flex items-center gap-3">
                <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpense ? '-' : '+'}{tx.amount}
                </span>
                <div className="flex gap-1">
                    <button onClick={() => onEdit(tx)} className="p-1 text-gray-400 hover:text-blue-500"><Pencil size={16}/></button>
                    <button onClick={() => { if(window.confirm(t('delete_confirm'))) onDelete(tx.id) }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
};

const AnalyticsView = ({ transactions, t, lang, onPrint }: { transactions: Transaction[], t: (k:string)=>string, lang: Language, onPrint: ()=>void }) => {
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const byCat: Record<string, number> = {};
    expenses.forEach(t => {
      const catName = t.categoryId; 
      byCat[catName] = (byCat[catName] || 0) + t.amount;
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  // Monthly Data for Bar Chart
  const monthlyData = useMemo(() => {
      const data: Record<string, {name: string, income: number, expense: number}> = {};
      const allTx = getTransactions(); // Get all history, not just current month
      
      allTx.forEach(t => {
          const date = new Date(t.date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          const monthName = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { month: 'short' });
          
          if (!data[key]) data[key] = { name: monthName, income: 0, expense: 0 };
          
          if (t.type === 'INCOME') data[key].income += t.amount;
          else data[key].expense += t.amount;
      });

      // Sort by date key and take last 6 months
      return Object.entries(data)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([_, val]) => val);
  }, [transactions, lang]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6 animate-fade-in pb-20 no-print">
      <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('analytics')}</h2>
          <Button onClick={onPrint} variant="secondary" className="text-xs">
              <Download size={16} /> {t('download_report')}
          </Button>
      </div>

      <Card>
          <h3 className="font-bold text-gray-800 mb-4">{t('monthly_evolution')}</h3>
          <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 10}} />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="income" name={t('income')} fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 mb-4">{t('expense')} (Mois)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(val: number) => `${val} MAD`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="space-y-2">
          {pieData.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-600">{t(item.name)}</span>
                  <span className="font-bold text-gray-900">{item.value.toFixed(2)} MAD</span>
              </div>
          ))}
      </div>
    </div>
  );
};

const AdvisorView = ({ transactions, t, lang }: { transactions: Transaction[], t: (k:string)=>string, lang: Language }) => {
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        const currentMonth = new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'ar-MA', { month: 'long', year: 'numeric' });
        const result = await getFinancialAdvice(transactions, currentMonth, lang);
        setAdvice(result);
        setLoading(false);
    };

    return (
        <div className="space-y-4 animate-fade-in pb-20 no-print">
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Sparkles className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{t('advisor_title')}</h2>
                        <p className="text-indigo-100 text-sm opacity-90">{t('advisor_desc')}</p>
                    </div>
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold">
                    {loading ? t('advisor_loading') : t('advisor_btn')}
                </Button>
            </Card>

            {advice && (
                <Card className="animate-fade-in-up border-l-4 border-indigo-500">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" />
                        {t('advisor_report')}
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                        {advice}
                    </div>
                </Card>
            )}
        </div>
    );
};

interface AddTransactionProps {
  onSave: (t: Transaction) => void;
  onCancel: () => void;
  onAddCategory: () => void;
  t: (k: string) => string;
  initialData?: Transaction | null;
  customCategories: Category[];
  lang: Language; 
}

const AddTransaction = ({ onSave, onCancel, onAddCategory, t, initialData, customCategories, lang }: AddTransactionProps) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [memberId, setMemberId] = useState<MemberId>('mem_family');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const [supplier, setSupplier] = useState('');
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemEssential, setNewItemEssential] = useState(true);
  const [newItemQuality, setNewItemQuality] = useState<'GOOD' | 'BAD' | 'AVERAGE'>('AVERAGE');
  const [groceryHelperTab, setGroceryHelperTab] = useState<string>(''); 
  
  const groceryNameInputRef = useRef<HTMLInputElement>(null);
  const groceryPriceInputRef = useRef<HTMLInputElement>(null);
  const groceryListEndRef = useRef<HTMLDivElement>(null);

  const defaultCategories = useMemo(() => type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES, [type]);
  const currentCustomCategories = useMemo(() => customCategories.filter(c => c.type === type), [customCategories, type]);
  const displayCategories = useMemo(() => [...defaultCategories, ...currentCustomCategories], [defaultCategories, currentCustomCategories]);

  const isMarket = categoryId === 'exp_market';
  const isSupermarket = categoryId === 'exp_groceries';
  const isGrocery = isMarket || isSupermarket;
  const isCar = categoryId === 'exp_transport' || categoryId === 'exp_car_maint';
  const isSmoking = categoryId === 'exp_smoking';

  const currentHelperSource = useMemo(() => {
      if (isMarket) return PRODUCE_LISTS[lang] || PRODUCE_LISTS.fr;
      if (isSupermarket) return GROCERY_LISTS[lang] || GROCERY_LISTS.fr;
      return null;
  }, [isMarket, isSupermarket, lang]);

  const carHelperSource = useMemo(() => {
      return CAR_EXPENSES[lang] || CAR_EXPENSES.fr;
  }, [lang]);

  const smokingHelperSource = useMemo(() => {
      return SMOKING_ITEMS[lang] || SMOKING_ITEMS.fr;
  }, [lang]);

  useEffect(() => {
      if (currentHelperSource) {
          const keys = Object.keys(currentHelperSource);
          if (keys.length > 0) setGroceryHelperTab(keys[0]);
      }
  }, [currentHelperSource]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setMemberId(initialData.memberId || 'mem_family');
      setDate(initialData.date);
      setDescription(initialData.description);
      if (initialData.isFixed !== undefined) {
         setIsFixed(initialData.isFixed);
      } else {
         const allCats = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...customCategories];
         const cat = allCats.find(c => c.id === initialData.categoryId);
         setIsFixed(!!cat?.isFixed);
      }
      if (initialData.supplier) setSupplier(initialData.supplier);
      if (initialData.groceryItems) setGroceryItems(initialData.groceryItems);
    }
  }, [initialData, customCategories]);

  useEffect(() => {
    if (groceryListEndRef.current) {
        groceryListEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groceryItems]);

  const handleCategorySelect = (catId: string) => {
     setCategoryId(catId);
     setErrors(prev => ({...prev, categoryId: false}));
     if (type === 'EXPENSE') {
         const cat = displayCategories.find(c => c.id === catId);
         if (cat) setIsFixed(!!cat.isFixed);
     }
  }

  const handleAddItem = () => {
    if (!newItemName) return;
    
    const priceVal = newItemPrice ? parseFloat(newItemPrice) : 0;
    const weightVal = newItemWeight ? parseFloat(newItemWeight) : 0;
    
    const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: newItemName,
        price: priceVal,
        weight: weightVal,
        isEssential: newItemEssential,
        quality: newItemQuality
    };
    const updatedItems = [...groceryItems, newItem];
    setGroceryItems(updatedItems);
    
    const total = updatedItems.reduce((acc, item) => acc + item.price, 0);
    setAmount(total.toFixed(2));
    setErrors(prev => ({...prev, amount: false}));

    setNewItemName('');
    setNewItemPrice('');
    setNewItemWeight('');
    setNewItemEssential(true);
    setNewItemQuality('AVERAGE');
    
    groceryNameInputRef.current?.focus();
  };
  
  const handleKeyDownGrocery = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
       e.preventDefault();
       handleAddItem();
    }
  };

  const removeGroceryItem = (id: string) => {
      const updated = groceryItems.filter(i => i.id !== id);
      setGroceryItems(updated);
      const total = updated.reduce((acc, item) => acc + item.price, 0);
      setAmount(total.toFixed(2));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = true;
    if (!categoryId) newErrors.categoryId = true;

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    
    const newTransaction: Transaction = {
      id: initialData ? initialData.id : crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type,
      amount: parseFloat(amount),
      categoryId,
      memberId,
      date,
      description,
      isFixed: type === 'EXPENSE' ? isFixed : undefined,
      supplier: (categoryId === 'exp_groceries' || categoryId === 'exp_market') ? supplier : undefined,
      groceryItems: (categoryId === 'exp_groceries' || categoryId === 'exp_market') ? groceryItems : undefined
    };
    onSave(newTransaction);
  };

  const getTabIcon = (key: string) => {
      switch(key) {
          case 'veg': return <Carrot size={14} />;
          case 'fruit': return <Apple size={14} />;
          case 'meat': return <Beef size={14} />;
          case 'herbs': return <Leaf size={14} />;
          case 'dairy': return <Milk size={14} />;
          case 'pantry': return <Utensils size={14} />;
          case 'cleaning': return <Spray size={14} />;
          default: return <Check size={14} />;
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {initialData ? t('edit_transaction') : t('new_transaction')}
          </h2>
          
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6 sticky top-0 z-10">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'INCOME' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
              onClick={() => { setType('INCOME'); if (!initialData) setCategoryId(''); setIsFixed(false); setErrors({}); }}
            >
              {t('income')}
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'EXPENSE' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
              onClick={() => { setType('EXPENSE'); if (!initialData) setCategoryId(''); setErrors({}); }}
            >
              {t('expense')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${errors.amount ? 'text-red-500' : 'text-gray-700'}`}>
                {t('amount')} (MAD) {errors.amount && '*'}
              </label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({...prev, amount: false})); }}
                className={`w-full text-3xl font-bold text-gray-900 border rounded-lg outline-none p-3 bg-white shadow-sm transition-all ${errors.amount ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-100'}`}
                placeholder="0.00"
              />
            </div>

            {type === 'EXPENSE' && (
                <div className="bg-white rounded-lg p-3 border border-gray-300 shadow-sm">
                    <label className="block text-xs font-bold text-gray-700 mb-2">{t('is_fixed_transaction')}</label>
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsFixed(false)}
                          className={`flex-1 py-2 px-2 text-xs rounded-lg border transition-all ${!isFixed ? 'bg-white border-yellow-500 text-yellow-700 shadow-sm font-bold ring-1 ring-yellow-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        >
                            {t('is_variable_option')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFixed(true)}
                          className={`flex-1 py-2 px-2 text-xs rounded-lg border transition-all ${isFixed ? 'bg-white border-purple-500 text-purple-700 shadow-sm font-bold ring-1 ring-purple-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        >
                            {t('is_fixed_option')}
                        </button>
                    </div>
                </div>
            )}
            
            {type === 'EXPENSE' && (
                <div>
                   <label className="block text-xs font-bold text-gray-700 mb-2">{t('who_spent')}</label>
                   <div className="flex gap-2 overflow-x-auto pb-2">
                       {FAMILY_MEMBERS.map(m => {
                           const isSelected = memberId === m.id;
                           const MemberIcon = ICON_MAP[m.icon] || User;
                           return (
                               <button
                                 key={m.id}
                                 type="button"
                                 onClick={() => setMemberId(m.id)}
                                 className={`flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-xl border transition-all ${
                                     isSelected 
                                     ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' 
                                     : 'bg-white border-gray-200 text-gray-500'
                                 }`}
                               >
                                   <div className={`p-1.5 rounded-full ${m.color} bg-opacity-20`}>
                                       <MemberIcon className="w-4 h-4" />
                                   </div>
                                   <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                       {t(m.id).split(' ')[0]}
                                   </span>
                               </button>
                           )
                       })}
                   </div>
                </div>
            )}

            <div>
               <label className={`block text-xs font-bold mb-2 ${errors.categoryId ? 'text-red-500' : 'text-gray-700'}`}>
                   {t('category')} {errors.categoryId && '*'}
               </label>
               <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 ${errors.categoryId ? 'p-2 border border-red-200 rounded-xl bg-red-50' : ''}`}>
                  {displayCategories.map(cat => {
                    const Icon = ICON_MAP[cat.icon] || Wallet;
                    const isSelected = categoryId === cat.id;
                    const displayName = cat.id.startsWith('custom_') ? cat.name : t(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                          isSelected 
                            ? (type === 'INCOME' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500') 
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? '' : 'text-gray-400'}`} />
                        <span className="text-[10px] text-center font-medium leading-tight line-clamp-2">{displayName}</span>
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={onAddCategory}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all"
                  >
                    <Plus className="w-5 h-5 mb-1 text-gray-500" />
                    <span className="text-[10px] text-center font-medium leading-tight">{t('add')}</span>
                  </button>
               </div>
            </div>

            {isCar && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 animate-fade-in">
                    <label className="block text-xs font-bold text-blue-800 mb-2">{t('car_expense_type')}</label>
                    <div className="flex flex-wrap gap-2">
                        {carHelperSource.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setDescription(item)}
                                className={`text-[10px] px-2 py-1.5 rounded-lg border transition-all font-medium ${
                                    description === item 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                            >
                                {['Carburant', 'وقود', 'مازوط / ليسانس'].includes(item) ? <Fuel className="inline-block w-3 h-3 mr-1" /> : 
                                 ['Entretien & Réparations', 'صيانة وإصلاح', 'الميكانيسيان'].includes(item) ? <Wrench className="inline-block w-3 h-3 mr-1" /> :
                                 ['Bus', 'حافلة', 'طوبيس'].includes(item) ? <Bus className="inline-block w-3 h-3 mr-1" /> :
                                 ['Train', 'قطار', 'تران'].includes(item) ? <Train className="inline-block w-3 h-3 mr-1" /> :
                                 null}
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isSmoking && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 animate-fade-in">
                    <label className="block text-xs font-bold text-gray-700 mb-2">{t('smoking_type')}</label>
                    <div className="flex flex-wrap gap-2">
                        {smokingHelperSource.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setDescription(item)}
                                className={`text-[10px] px-2 py-1.5 rounded-lg border transition-all font-medium ${
                                    description === item 
                                    ? 'bg-gray-700 text-white border-gray-700 shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isGrocery && (
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200 space-y-4 animate-fade-in shadow-sm">
                    <h3 className="font-bold text-orange-800 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {t('grocery_details')}
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-orange-800 mb-1">{t('supplier')}</label>
                        <input 
                            type="text" 
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            placeholder={t('choose')}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 outline-none text-gray-900 shadow-sm"
                        />
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                        {currentHelperSource && (
                            <div className="mb-4">
                                <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                                    {Object.keys(currentHelperSource).map(key => (
                                        <button 
                                            key={key} 
                                            type="button" 
                                            onClick={() => setGroceryHelperTab(key)} 
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${groceryHelperTab === key ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-500 border border-transparent'}`}
                                        >
                                            {getTabIcon(key)} {t(`section_${key}`)}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                    {/* @ts-ignore */}
                                    {currentHelperSource[groceryHelperTab]?.map((item: string) => (
                                        <button 
                                            key={item} 
                                            type="button"
                                            onClick={() => {
                                                setNewItemName(item);
                                                if (groceryPriceInputRef.current) groceryPriceInputRef.current.focus();
                                            }}
                                            className="text-[10px] font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors active:bg-orange-50 active:border-orange-200 active:text-orange-700"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-xs font-bold text-gray-700">{t('add_item')}</label>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                <CornerDownLeft size={10} />
                                {t('press_enter_hint')}
                            </div>
                        </div>
                        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 mb-3">
                            <input 
                                ref={groceryNameInputRef}
                                type="text" 
                                value={newItemName} 
                                onChange={e => setNewItemName(e.target.value)} 
                                onKeyDown={handleKeyDownGrocery}
                                placeholder={t('item_name')} 
                                className="p-3 border border-gray-300 rounded-md text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" 
                            />
                            <div className="relative">
                                <input 
                                    ref={groceryPriceInputRef}
                                    type="number" 
                                    value={newItemPrice} 
                                    onChange={e => setNewItemPrice(e.target.value)} 
                                    onKeyDown={handleKeyDownGrocery}
                                    placeholder={t('item_price')} 
                                    className="w-full p-3 border border-gray-300 rounded-md text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" 
                                />
                                <span className="absolute right-2 top-3 text-[10px] text-gray-400">MAD</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={newItemWeight} 
                                    onChange={e => setNewItemWeight(e.target.value)} 
                                    onKeyDown={handleKeyDownGrocery}
                                    placeholder={t('item_weight')} 
                                    className="w-full p-3 border border-gray-300 rounded-md text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" 
                                />
                                <span className="absolute right-2 top-3 text-[10px] text-gray-400">KG</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                             <button type="button" onClick={() => setNewItemEssential(!newItemEssential)} className={`flex-1 text-xs py-2 rounded border font-medium transition-colors ${newItemEssential ? 'bg-green-100 border-green-500 text-green-800' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>{newItemEssential ? t('essential') : t('non_essential')}</button>
                             <div className="flex-1 flex border border-gray-300 rounded overflow-hidden">
                                 {['BAD', 'AVERAGE', 'GOOD'].map((q) => (
                                     <button 
                                        key={q}
                                        type="button"
                                        onClick={() => setNewItemQuality(q as any)} 
                                        className={`flex-1 flex items-center justify-center transition-colors ${newItemQuality === q ? (q === 'GOOD' ? 'bg-green-500 text-white' : q === 'BAD' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white') : 'bg-gray-50 hover:bg-gray-100 text-gray-400'}`}
                                     >
                                         {q === 'GOOD' ? <ThumbsUp size={14}/> : q === 'BAD' ? <ThumbsDown size={14}/> : '-'}
                                     </button>
                                 ))}
                             </div>
                        </div>
                        <Button variant="secondary" onClick={handleAddItem} className="w-full h-10 text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 bg-white">
                            <PlusCircle size={16} />
                            {t('add')}
                        </Button>
                    </div>

                    {groceryItems.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                                {groceryItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                            <div className="flex gap-1 mt-1">
                                                {item.weight && item.weight > 0 && (
                                                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-200 mr-1">{item.weight} Kg</span>
                                                )}
                                                {item.isEssential && <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-200">{t('essential')}</span>}
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-bold ${item.quality === 'GOOD' ? 'bg-green-500' : item.quality === 'BAD' ? 'bg-red-500' : 'bg-gray-400'}`}>
                                                    {item.quality === 'GOOD' ? t('quality_good') : item.quality === 'BAD' ? t('quality_bad') : t('quality_avg')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 text-sm">{item.price}</span>
                                            <button type="button" onClick={() => removeGroceryItem(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div ref={groceryListEndRef} />
                            </div>
                            <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-200">
                                Total: <span className="font-bold text-gray-900 text-sm">{groceryItems.reduce((acc, i) => acc + i.price, 0)} MAD</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('date')}</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('note')}</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 shadow-sm"
                placeholder="..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
              <Button variant="secondary" onClick={onCancel} className="flex-1 border border-gray-300 bg-white shadow-sm">{t('cancel')}</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md" onClick={handleSubmit}>
                {initialData ? t('update') : t('save')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [view, setView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showAddCat, setShowAddCat] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const currentCustomCategories = useMemo(() => customCategories, [customCategories]);
  const allCategories = useMemo(() => [...ALL_CATEGORIES, ...currentCustomCategories], [currentCustomCategories]);

  useEffect(() => {
    setTransactions(getTransactions());
    setCustomCategories(getCustomCategories());
  }, []);

  const handleSaveTransaction = (tx: Transaction) => {
    if (editingTx) {
      const updated = updateTransaction(tx);
      setTransactions(updated);
      setEditingTx(null);
    } else {
      const updated = saveTransaction(tx);
      setTransactions(updated);
    }
    setShowAdd(false);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const handleSaveCategory = (cat: Category) => {
      const updated = saveCustomCategory(cat);
      setCustomCategories(updated);
      setShowAddCat(false);
  }

  // Calculate totals for dashboard
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = thisMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  const handlePrintReport = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
  };

  if (isPrinting) {
      return <PrintableReport transactions={thisMonthTransactions} totalIncome={totalIncome} totalExpense={totalExpense} t={t} lang={lang} advice="" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900 select-none">
       {/* Header */}
       <header className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center no-print">
            <div className="flex items-center gap-2" onClick={() => setView('dashboard')}>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Wallet size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Sahla Budget</h1>
                    <p className="text-[10px] text-gray-500 font-medium">{t('app_subtitle')}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setView('settings')} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                    <Settings size={20} />
                </button>
                <button onClick={() => setLang(l => l === 'fr' ? 'ar' : l === 'ar' ? 'dar' : 'fr')} className="p-2 bg-gray-100 rounded-lg text-xs font-bold uppercase w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    {lang}
                </button>
            </div>
       </header>

       <main className="p-4 max-w-xl mx-auto space-y-6">
            {/* Dashboard Summary */}
            {view === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                         <Card className="bg-green-600 text-white border-none shadow-lg shadow-green-200">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="p-2 bg-white/20 rounded-lg"><TrendingUp size={16}/></div>
                                 <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider">{t('income')}</span>
                             </div>
                             <p className="text-xl font-bold">{totalIncome.toFixed(0)} <span className="text-xs opacity-70">MAD</span></p>
                         </Card>
                         <Card className="bg-gray-900 text-white border-none shadow-lg shadow-gray-300">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="rotate-180" size={16}/></div>
                                 <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider">{t('expense')}</span>
                             </div>
                             <p className="text-xl font-bold">{totalExpense.toFixed(0)} <span className="text-xs opacity-70">MAD</span></p>
                         </Card>
                    </div>

                    <BudgetAlert income={totalIncome} expense={totalExpense} t={t} />

                    <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => setView('savings')} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow h-24">
                             <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center"><PiggyBank size={16}/></div>
                             <span className="text-[10px] font-bold text-center leading-tight">{t('savings')}</span>
                         </button>
                         <button onClick={() => setView('market')} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow h-24">
                             <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><ShoppingBag size={16}/></div>
                             <span className="text-[10px] font-bold text-center leading-tight">{t('market_produce')}</span>
                         </button>
                         <button onClick={() => setView('guide')} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow h-24">
                             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Store size={16}/></div>
                             <span className="text-[10px] font-bold text-center leading-tight">{t('guide_title')}</span>
                         </button>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">{t('recent_transactions')}</h3>
                            <button onClick={() => setView('history')} className="text-xs text-blue-600 font-bold hover:underline">{t('history')}</button>
                        </div>
                        <HistoryView transactions={transactions.slice(0, 5)} t={t} lang={lang} onEdit={(tx) => { setEditingTx(tx); setShowAdd(true); }} onDelete={handleDeleteTransaction} categories={allCategories} />
                    </div>
                </div>
            )}

            {view === 'history' && <HistoryView transactions={transactions} t={t} lang={lang} onEdit={(tx) => { setEditingTx(tx); setShowAdd(true); }} onDelete={handleDeleteTransaction} categories={allCategories} />}
            {view === 'analytics' && <AnalyticsView transactions={transactions} t={t} lang={lang} onPrint={handlePrintReport} />}
            {view === 'advisor' && <AdvisorView transactions={transactions} t={t} lang={lang} />}
            {view === 'market' && <MarketView transactions={transactions} onSaveTransaction={handleSaveTransaction} t={t} lang={lang} />}
            {view === 'guide' && <ShoppingGuideView transactions={transactions} t={t} lang={lang} />}
            {view === 'savings' && <SavingsView t={t} lang={lang} />}
            {view === 'settings' && <SettingsView t={t} onLangChange={() => setLang(l => l === 'fr' ? 'ar' : l === 'ar' ? 'dar' : 'fr')} />}

       </main>

       {/* Bottom Nav */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 flex justify-around items-center z-40 no-print pb-safe">
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
                <LayoutDashboard size={20} />
                <span className="text-[10px] font-medium">{t('dashboard')}</span>
            </button>
            <button onClick={() => setView('analytics')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${view === 'analytics' ? 'text-blue-600' : 'text-gray-400'}`}>
                <TrendingUp size={20} />
                <span className="text-[10px] font-medium">{t('analytics')}</span>
            </button>
            
            <div className="relative -top-6">
                <button 
                    onClick={() => { setEditingTx(null); setShowAdd(true); }}
                    className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-300 hover:scale-110 transition-transform"
                >
                    <Plus size={28} />
                </button>
            </div>

            <button onClick={() => setView('history')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${view === 'history' ? 'text-blue-600' : 'text-gray-400'}`}>
                <History size={20} />
                <span className="text-[10px] font-medium">{t('history')}</span>
            </button>
            <button onClick={() => setView('advisor')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${view === 'advisor' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Sparkles size={20} />
                <span className="text-[10px] font-medium">IA</span>
            </button>
       </div>

       {/* Modals */}
       {showAdd && (
           <AddTransaction 
                onSave={handleSaveTransaction} 
                onCancel={() => { setShowAdd(false); setEditingTx(null); }} 
                onAddCategory={() => setShowAddCat(true)}
                t={t}
                initialData={editingTx}
                customCategories={customCategories}
                lang={lang}
           />
       )}

       {showAddCat && (
           <AddCategory 
                onSave={handleSaveCategory}
                onCancel={() => setShowAddCat(false)}
                t={t}
           />
       )}
    </div>
  );
};

export default App;