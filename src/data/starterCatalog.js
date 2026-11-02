// Starter products an admin can import in one click from the admin panel, then
// edit. The shop itself always reads products from Firestore. `keywords` adds
// common Hinglish spellings so search finds "pyaz", "aloo", "tamatar".
const starterCatalog = [
  { id: 'tomato', name: 'Tomatoes', category: 'vegetables', price: 30, unit: 'kg', icon: 'tomato', keywords: ['tamatar', 'tamater'] },
  { id: 'onion', name: 'Onions', category: 'vegetables', price: 25, unit: 'kg', icon: 'onion', keywords: ['pyaz', 'pyaaz', 'kanda'] },
  { id: 'potato', name: 'Potatoes', category: 'vegetables', price: 22, unit: 'kg', icon: 'potato', keywords: ['aloo', 'alu', 'batata'] },
  { id: 'carrot', name: 'Carrots', category: 'vegetables', price: 40, unit: 'kg', icon: 'carrot', keywords: ['gajar'] },
  { id: 'green-chilli', name: 'Green chillies', category: 'vegetables', price: 60, unit: 'kg', icon: 'green-chilli', keywords: ['mirch', 'hari mirchi', 'chili'] },
  { id: 'garlic', name: 'Garlic', category: 'vegetables', price: 120, unit: 'kg', icon: 'garlic', keywords: ['lehsun', 'lahsun'] },
  { id: 'ginger', name: 'Ginger', category: 'vegetables', price: 100, unit: 'kg', icon: 'ginger', keywords: ['adrak'] },
  { id: 'coriander', name: 'Coriander leaves', category: 'vegetables', price: 10, unit: 'bunch', icon: 'coriander', keywords: ['dhaniya', 'dhania', 'cilantro'] },
  { id: 'lemon', name: 'Lemons', category: 'fruits', price: 80, unit: 'kg', icon: 'lemon', keywords: ['nimbu', 'neembu', 'lime'] },
  { id: 'banana', name: 'Bananas', category: 'fruits', price: 50, unit: 'dozen', icon: 'banana', keywords: ['kela'] },
  { id: 'rice', name: 'Rice', category: 'grains', price: 45, unit: 'kg', icon: 'rice', keywords: ['chawal', 'basmati'] },
  { id: 'atta', name: 'Wheat flour', category: 'grains', price: 38, unit: 'kg', icon: 'atta', keywords: ['atta', 'gehun'] },
  { id: 'besan', name: 'Gram flour', category: 'grains', price: 90, unit: 'kg', icon: 'besan', keywords: ['besan', 'chana'] },
  { id: 'toor-dal', name: 'Toor dal', category: 'grains', price: 140, unit: 'kg', icon: 'toor-dal', keywords: ['arhar', 'toor', 'tuvar', 'dal', 'daal'] },
  { id: 'turmeric', name: 'Turmeric powder', category: 'spices', price: 200, unit: 'kg', icon: 'turmeric', keywords: ['haldi'] },
  { id: 'red-chilli-powder', name: 'Red chilli powder', category: 'spices', price: 260, unit: 'kg', icon: 'red-chilli-powder', keywords: ['lal mirch'] },
  { id: 'salt', name: 'Salt', category: 'spices', price: 20, unit: 'kg', icon: 'salt', keywords: ['namak'] },
  { id: 'paneer', name: 'Paneer', category: 'dairy', price: 360, unit: 'kg', icon: 'paneer', keywords: ['cottage cheese'] },
  { id: 'milk', name: 'Milk', category: 'dairy', price: 60, unit: 'litre', icon: 'milk', keywords: ['doodh', 'dudh'] },
  { id: 'mustard-oil', name: 'Mustard oil', category: 'oil', price: 170, unit: 'litre', icon: 'mustard-oil', keywords: ['sarson', 'tel'] },
  { id: 'refined-oil', name: 'Refined oil', category: 'oil', price: 140, unit: 'litre', icon: 'refined-oil', keywords: ['refined', 'tel', 'sunflower'] },
  { id: 'combo-tomato-onion', name: 'Tomato + Onion (5 kg each)', category: 'combo', price: 248, mrp: 275, unit: 'pack', icon: 'combo-tomato-onion', keywords: ['combo', 'tamatar pyaz'] },
  { id: 'combo-chaat', name: 'Chaat pack (potato, onion, chilli, coriander)', category: 'combo', price: 255, mrp: 300, unit: 'pack', icon: 'combo-chaat', keywords: ['combo', 'chaat', 'pani puri', 'golgappa'] },
  { id: 'combo-tadka', name: 'Tadka pack (garlic, ginger, chilli)', category: 'combo', price: 133, mrp: 140, unit: 'pack', icon: 'combo-tadka', keywords: ['combo', 'tadka', 'masala'] },
].map((product, index) => ({ stock: 0, active: true, sortOrder: (index + 1) * 10, mrp: null, ...product }));

export default starterCatalog;
