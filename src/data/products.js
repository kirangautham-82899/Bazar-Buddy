// Catalog shown in the market. `keywords` holds Hinglish and common spellings
// so search works for "pyaz", "aloo", "tamatar" as well as English and Hindi.
const products = [
  { id: 'tomato', name: { en: 'Tomatoes', hi: 'टमाटर' }, category: 'vegetables', price: 30, unit: 'kg', keywords: ['tamatar', 'tomato', 'tamater'] },
  { id: 'onion', name: { en: 'Onions', hi: 'प्याज़' }, category: 'vegetables', price: 25, unit: 'kg', keywords: ['pyaz', 'pyaaz', 'kanda', 'onion', 'प्याज'] },
  { id: 'potato', name: { en: 'Potatoes', hi: 'आलू' }, category: 'vegetables', price: 22, unit: 'kg', keywords: ['aloo', 'alu', 'batata', 'potato'] },
  { id: 'carrot', name: { en: 'Carrots', hi: 'गाजर' }, category: 'vegetables', price: 40, unit: 'kg', keywords: ['gajar', 'carrot'] },
  { id: 'green-chilli', name: { en: 'Green chillies', hi: 'हरी मिर्च' }, category: 'vegetables', price: 60, unit: 'kg', keywords: ['mirch', 'hari mirchi', 'chilli', 'chili', 'मिर्ची'] },
  { id: 'garlic', name: { en: 'Garlic', hi: 'लहसुन' }, category: 'vegetables', price: 120, unit: 'kg', keywords: ['lehsun', 'lahsun', 'garlic'] },
  { id: 'ginger', name: { en: 'Ginger', hi: 'अदरक' }, category: 'vegetables', price: 100, unit: 'kg', keywords: ['adrak', 'ginger'] },
  { id: 'coriander', name: { en: 'Coriander leaves', hi: 'हरा धनिया' }, category: 'vegetables', price: 10, unit: 'bunch', keywords: ['dhaniya', 'dhania', 'cilantro', 'coriander'] },
  { id: 'lemon', name: { en: 'Lemons', hi: 'नींबू' }, category: 'fruits', price: 80, unit: 'kg', keywords: ['nimbu', 'neembu', 'lemon', 'lime'] },
  { id: 'banana', name: { en: 'Bananas', hi: 'केला' }, category: 'fruits', price: 50, unit: 'dozen', keywords: ['kela', 'banana'] },
  { id: 'rice', name: { en: 'Rice', hi: 'चावल' }, category: 'grains', price: 45, unit: 'kg', keywords: ['chawal', 'basmati', 'rice'] },
  { id: 'atta', name: { en: 'Wheat flour', hi: 'आटा' }, category: 'grains', price: 38, unit: 'kg', keywords: ['atta', 'gehun', 'flour', 'wheat'] },
  { id: 'besan', name: { en: 'Gram flour', hi: 'बेसन' }, category: 'grains', price: 90, unit: 'kg', keywords: ['besan', 'gram flour', 'chana'] },
  { id: 'toor-dal', name: { en: 'Toor dal', hi: 'अरहर दाल' }, category: 'grains', price: 140, unit: 'kg', keywords: ['arhar', 'toor', 'tuvar', 'dal', 'daal', 'दाल'] },
  { id: 'turmeric', name: { en: 'Turmeric powder', hi: 'हल्दी' }, category: 'spices', price: 200, unit: 'kg', keywords: ['haldi', 'turmeric'] },
  { id: 'red-chilli-powder', name: { en: 'Red chilli powder', hi: 'लाल मिर्च पाउडर' }, category: 'spices', price: 260, unit: 'kg', keywords: ['lal mirch', 'chilli powder', 'मिर्च'] },
  { id: 'salt', name: { en: 'Salt', hi: 'नमक' }, category: 'spices', price: 20, unit: 'kg', keywords: ['namak', 'salt'] },
  { id: 'paneer', name: { en: 'Paneer', hi: 'पनीर' }, category: 'dairy', price: 360, unit: 'kg', keywords: ['paneer', 'cottage cheese'] },
  { id: 'milk', name: { en: 'Milk', hi: 'दूध' }, category: 'dairy', price: 60, unit: 'litre', keywords: ['doodh', 'dudh', 'milk'] },
  { id: 'mustard-oil', name: { en: 'Mustard oil', hi: 'सरसों का तेल' }, category: 'oil', price: 170, unit: 'litre', keywords: ['sarson', 'tel', 'oil', 'mustard'] },
  { id: 'refined-oil', name: { en: 'Refined oil', hi: 'रिफाइंड तेल' }, category: 'oil', price: 140, unit: 'litre', keywords: ['refined', 'tel', 'oil', 'sunflower'] },
];

// Combos are sold as one cart line; `price` already includes the discount off `mrp`.
export const combos = [
  { id: 'combo-tomato-onion', name: { en: 'Tomato + Onion (5 kg each)', hi: 'टमाटर + प्याज़ (5-5 किलो)' }, category: 'combo', price: 248, mrp: 275, unit: 'pack', keywords: ['combo', 'tamatar pyaz', 'tomato onion'] },
  { id: 'combo-chaat', name: { en: 'Chaat pack (potato, onion, chilli, coriander)', hi: 'चाट पैक (आलू, प्याज़, मिर्च, धनिया)' }, category: 'combo', price: 255, mrp: 300, unit: 'pack', keywords: ['combo', 'chaat', 'pani puri', 'golgappa'] },
  { id: 'combo-tadka', name: { en: 'Tadka pack (garlic, ginger, chilli)', hi: 'तड़का पैक (लहसुन, अदरक, मिर्च)' }, category: 'combo', price: 133, mrp: 140, unit: 'pack', keywords: ['combo', 'tadka', 'masala'] },
];

export const CATEGORIES = ['vegetables', 'fruits', 'grains', 'spices', 'dairy', 'oil', 'combo'];

export const CATEGORY_LABEL_KEYS = {
  vegetables: 'catVegetables',
  fruits: 'catFruits',
  grains: 'catGrains',
  spices: 'catSpices',
  dairy: 'catDairy',
  oil: 'catOil',
  combo: 'catCombo',
};

export const catalog = [...products, ...combos];

export const findProduct = (id) => catalog.find((p) => p.id === id);

// Turns stored cart lines ({ id, quantity }) into full items with current prices.
// Lines for products no longer in the catalog are dropped.
export const resolveCartItems = (lines) =>
  lines
    .map((line) => {
      const product = findProduct(line.id);
      return product && line.quantity > 0 ? { ...product, quantity: line.quantity } : null;
    })
    .filter(Boolean);

export default products;
