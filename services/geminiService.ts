import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";
import { ALL_CATEGORIES } from "../constants";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  currentMonth: string,
  language: Language
): Promise<string> => {
  try {
    // 1. Prepare data context
    const recentTransactions = transactions.slice(0, 50); 
    
    // Group for summary
    let income = 0;
    let expense = 0;
    const catTotals: Record<string, number> = {};

    recentTransactions.forEach(t => {
      if (t.type === 'INCOME') income += t.amount;
      else {
        expense += t.amount;
        const catName = ALL_CATEGORIES.find(c => c.id === t.categoryId)?.name || t.categoryId;
        catTotals[catName] = (catTotals[catName] || 0) + t.amount;
      }
    });

    const summary = `
      Current Month: ${currentMonth}
      Total Income: ${income}
      Total Expenses: ${expense}
      Expenses by Category: ${JSON.stringify(catTotals)}
    `;

    let langInstruction = "Réponds en français.";
    if (language === 'ar') langInstruction = "Réponds en Arabe standard (اللغة العربية الفصحى).";
    if (language === 'dar') langInstruction = "Réponds en dialecte marocain (Darija), en utilisant l'alphabet arabe.";

    const prompt = `
      Tu es un conseiller financier expert pour une famille marocaine (Père, Mère, Fille 6 ans, Bébé 1.5 an).
      Voici le résumé financier récent de la famille :
      ${summary}

      Analyse ces données et donne 3 conseils brefs, précis et bienveillants.
      Objectifs:
      1. Optimiser les dépenses.
      2. Mieux préparer les événements annuels (Aïd Al Adha, Ramadan, Rentrée scolaire).
      3. Améliorer l'épargne.

      Instructions de langue : ${langInstruction}
      
      Sois direct, utilise des puces, et un ton encourageant.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Erreur de génération.";
  } catch (error) {
    console.error("Error fetching advice:", error);
    return language === 'fr' 
      ? "Une erreur est survenue." 
      : "حدث خطأ أثناء التحليل.";
  }
};