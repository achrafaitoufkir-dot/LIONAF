import { Category, FamilyProfile, MemberId } from './types';

export const FAMILY_PROFILE: FamilyProfile = {
  name: "Ma Famille",
  members: [
    { role: "Père", age: 35 },
    { role: "Mère", age: 32 },
    { role: "Fille", age: 6 },
    { role: "Bébé", age: 1.5 }
  ]
};

export const FAMILY_MEMBERS: { id: MemberId; icon: string; color: string }[] = [
  { id: 'mem_family', icon: 'Home', color: 'bg-purple-100 text-purple-600' },
  { id: 'mem_father', icon: 'User', color: 'bg-blue-100 text-blue-600' },
  { id: 'mem_mother', icon: 'User', color: 'bg-pink-100 text-pink-600' },
  { id: 'mem_daughter', icon: 'Baby', color: 'bg-indigo-100 text-indigo-600' }, // Using Baby icon for child temporarily or specialized icon
  { id: 'mem_baby', icon: 'Baby', color: 'bg-yellow-100 text-yellow-600' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'inc_salary', name: 'Salaire Mensuel (Fixe)', type: 'INCOME', icon: 'Briefcase', isFixed: true },
  { id: 'inc_freelance', name: 'Missions / Variable', type: 'INCOME', icon: 'DollarSign', isFixed: false },
];

export const EXPENSE_CATEGORIES: Category[] = [
  // Fixed Monthly
  { id: 'exp_phone', name: 'Recharge Téléphone', type: 'EXPENSE', icon: 'Smartphone', isFixed: true },
  { id: 'exp_utilities', name: 'Eau & Électricité', type: 'EXPENSE', icon: 'Zap', isFixed: true },
  { id: 'exp_internet', name: 'Internet', type: 'EXPENSE', icon: 'Wifi', isFixed: true },
  { id: 'exp_school', name: 'Scolarité (Fille 6 ans)', type: 'EXPENSE', icon: 'GraduationCap', isFixed: true },
  { id: 'exp_rent', name: 'Loyer / Logement', type: 'EXPENSE', icon: 'Home', isFixed: true },
  
  // Daily / Occasional
  { id: 'exp_market', name: 'Marché & Légumes', type: 'EXPENSE', icon: 'Carrot', isFixed: false },
  { id: 'exp_groceries', name: 'Alimentation (Supermarché)', type: 'EXPENSE', icon: 'ShoppingBag', isFixed: false },
  { id: 'exp_smoking', name: 'Tabac & Perso', type: 'EXPENSE', icon: 'Flame', isFixed: false },
  { id: 'exp_health', name: 'Santé & Couches (Bébé)', type: 'EXPENSE', icon: 'Baby', isFixed: false },
  { id: 'exp_transport', name: 'Transport / Carburant', type: 'EXPENSE', icon: 'Car', isFixed: false },
  { id: 'exp_leisure', name: 'Loisirs / Café', type: 'EXPENSE', icon: 'Coffee', isFixed: false },
  { id: 'exp_clothing', name: 'Vêtements', type: 'EXPENSE', icon: 'Shirt', isFixed: false },
  { id: 'exp_care', name: 'Soins Personnels', type: 'EXPENSE', icon: 'Scissors', isFixed: false },
  
  // Home & Gifts
  { id: 'exp_home', name: 'Maison & Équipement', type: 'EXPENSE', icon: 'Armchair', isFixed: false },
  { id: 'exp_gifts', name: 'Cadeaux / Invités', type: 'EXPENSE', icon: 'Gift', isFixed: false },
  
  // Annual / Big Events
  { id: 'exp_eid_fitr', name: 'Aïd al-Fitr', type: 'EXPENSE', icon: 'Moon', isFixed: true },
  { id: 'exp_eid_adha', name: 'Aïd al-Adha (Mouton)', type: 'EXPENSE', icon: 'Moon', isFixed: true },
  { id: 'exp_ramadan', name: 'Ramadan', type: 'EXPENSE', icon: 'Moon', isFixed: true },
  { id: 'exp_school_start', name: 'Rentrée Scolaire', type: 'EXPENSE', icon: 'PenTool', isFixed: true },
  { id: 'exp_car_maint', name: 'Entretien Voiture', type: 'EXPENSE', icon: 'Car', isFixed: true },
  { id: 'exp_vacation', name: 'Voyages & Vacances', type: 'EXPENSE', icon: 'Plane', isFixed: true },
  
  // Unforeseen
  { id: 'exp_emergency', name: 'Imprévus', type: 'EXPENSE', icon: 'AlertCircle', isFixed: false },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const PRODUCE_LISTS = {
  fr: {
      veg: ["Tomates", "Pommes de terre", "Oignons", "Carottes", "Courgettes", "Poivrons", "Concombres", "Aubergines", "Haricots verts", "Petits pois", "Navets", "Betteraves", "Citrouille", "Chou-fleur"],
      fruit: ["Pommes", "Bananes", "Oranges", "Mandarines", "Raisins", "Citron", "Fraises", "Pastèque", "Melon", "Pêches"],
      meat: ["Poulet", "Viande Rouge", "Viande Hachée", "Dinde", "Poisson", "Sardines"],
      herbs: ["Menthe", "Persil", "Coriandre", "Céleri", "Ail", "Absinthe (Chiba)"]
  },
  ar: {
      veg: ["طماطم", "بطاطس", "بصل", "جزر", "قرع أخضر", "فلفل", "خيار", "باذنجان", "فاصوليا خضراء", "بازلاء", "لفت", "شمندر", "يقطين", "قرنبيط"],
      fruit: ["تفاح", "موز", "برتقال", "يوسفي", "عنب", "حامض", "فراولة", "بطيخ أحمر", "شمام", "خوخ"],
      meat: ["دجاج", "لحم أحمر", "لحم مفروم", "ديك رومي", "سمك", "سردين"],
      herbs: ["نعناع", "قدونس", "كزبرة", "كرفس", "ثوم", "شيبة"]
  },
  dar: {
      veg: ["ماطيشة", "بطاطا", "بصلة", "خيزو", "كورجيط", "فلفلة", "خيار", "دنجال", "لوبيا خضرا", "جلبانة", "لفت", "باربا", "كرعة حمرا", "شوفلور"],
      fruit: ["تفاح", "بنان", "ليمون", "ماندارين", "عنب", "حامض", "فريز", "دلاح", "بطيخ", "خوخ"],
      meat: ["دجاج", "لحم", "كفتة", "بيبي", "حوت", "سردين"],
      herbs: ["نعناع", "معدنوس", "قزبور", "كرافس", "ثومة", "شيبة"]
  }
};

export const GROCERY_LISTS = {
  fr: {
      pantry: ["Lait", "Oeufs", "Yaourt", "Fromage", "Beurre", "Huile", "Sucre", "Thé", "Café", "Farine", "Pâtes", "Riz", "Thon", "Maïs", "Concentré Tomate"],
      cleaning: ["Lessive", "Javel", "Liquide Vaisselle", "Nettoyant Sol", "Éponge", "Sac Poubelle"],
      hygiene: ["Papier Toilette", "Shampoing", "Savon", "Dentifrice", "Couches"]
  },
  ar: {
      pantry: ["حليب", "بيض", "ياغورت", "جبن", "زبدة", "زيت", "سكر", "شاي", "قهوة", "دقيق", "معجنات", "أرز", "تونة", "ذرة", "مركز طماطم"],
      cleaning: ["مسحوق الغسيل", "جافيل", "سائل الأواني", "منظف الأرضيات", "إسفنج", "أكياس القمامة"],
      hygiene: ["ورق المرحاض", "شامبو", "صابون", "معجون أسنان", "حفاظات"]
  },
  dar: {
      pantry: ["حليب", "بيض", "دانرن", "فرماج", "زبدة", "زيت", "سكر", "أتاي", "قهوة", "طحين", "ليباك", "روز", "طون", "مايس", "مطيشة الحك"],
      cleaning: ["تيد", "جافيل", "سائل الماعن", "سانيكروا", "حلفة", "ميكة الزبل"],
      hygiene: ["بابي جينيك", "شمبوان", "صابون", "دونتي فريس", "ليكوش"]
  }
};

export const CAR_EXPENSES = {
  fr: ["Carburant", "Bus", "Taxi", "Indrive", "Train", "Tramway", "Basway", "Vignette", "Assurance", "Visite Technique", "Vidange", "Entretien", "Lavage", "Parking", "Pneus"],
  ar: ["وقود", "حافلة", "تاكسي", "إندرايف", "قطار", "ترامواي", "باصواي", "الضريبة", "تأمين", "الفحص التقني", "تغيير الزيت", "صيانة", "غسيل", "موقف", "إطارات"],
  dar: ["مازوط / ليسانس", "طوبيس", "طالي", "Indrive", "تران", "ترام", "Basway", "لافييييت", "لاسيرونس", "لافيزيت", "الفيدونج", "الميكانيسيان", "lavage", "الباركينغ", "بنوات"]
};

export const SMOKING_ITEMS = {
  fr: ["Paquet Cigarettes", "Cigarette Détail", "Hache (1g)", "Hache (Demi)", "Hache (Autre)", "Feuilles/Filtres", "Briquet"],
  ar: ["علبة سجائر", "سجائر بالتقسيط", "حشيش (1غ)", "حشيش (نصف)", "حشيش (آخر)", "أوراق/فيلتر", "ولاعة"],
  dar: ["باكية كارو", "كارو ديطاي", "زيتونة (1g)", "نص", "طرف", "نيبرو/فيلتر", "بريكة"]
};