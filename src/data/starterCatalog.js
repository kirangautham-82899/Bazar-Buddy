// Starter products an admin can import in one click from the admin panel, then
// edit. The shop itself always reads products from Firestore. `keywords` adds
// common Hinglish spellings so search finds "pyaz", "aloo", "tamatar".
const STARTER_STOCK = 50;

const starterCatalog = [
  { id: 'tomato', name: 'Tomatoes', category: 'vegetables', price: 30, mrp: 36, unit: 'kg', icon: 'tomato', keywords: ['tamatar', 'tamater'], description: 'Firm, ripe hybrid tomatoes for chutney, gravies and chaat.' },
  { id: 'onion', name: 'Onions', category: 'vegetables', price: 25, mrp: 30, unit: 'kg', icon: 'onion', keywords: ['pyaz', 'pyaaz', 'kanda'], description: 'Medium red onions from Nashik, dry and long-lasting.' },
  { id: 'potato', name: 'Potatoes', category: 'vegetables', price: 22, unit: 'kg', icon: 'potato', keywords: ['aloo', 'alu', 'batata'], description: 'Clean, medium potatoes that boil evenly for tikki and sabzi.' },
  { id: 'carrot', name: 'Carrots', category: 'vegetables', price: 40, unit: 'kg', icon: 'carrot', keywords: ['gajar'], description: 'Sweet red carrots, washed and ready for salad or halwa.' },
  { id: 'green-chilli', name: 'Green chillies', category: 'vegetables', price: 60, mrp: 70, unit: 'kg', icon: 'green-chilli', keywords: ['mirch', 'hari mirchi', 'chili'], description: 'Fresh, medium-hot green chillies.' },
  { id: 'garlic', name: 'Garlic', category: 'vegetables', price: 120, unit: 'kg', icon: 'garlic', keywords: ['lehsun', 'lahsun'], description: 'Bold, easy-to-peel garlic bulbs.' },
  { id: 'ginger', name: 'Ginger', category: 'vegetables', price: 100, unit: 'kg', icon: 'ginger', keywords: ['adrak'], description: 'Juicy ginger with thin skin, great for chai and tadka.' },
  { id: 'coriander', name: 'Coriander leaves', category: 'vegetables', price: 10, unit: 'bunch', icon: 'coriander', keywords: ['dhaniya', 'dhania', 'cilantro'], description: 'Fragrant fresh coriander for garnish.' },
  { id: 'lemon', name: 'Lemons', category: 'fruits', price: 80, unit: 'kg', icon: 'lemon', keywords: ['nimbu', 'neembu', 'lime'], description: 'Juicy lemons for nimbu pani, chaat and pickles.' },
  { id: 'banana', name: 'Bananas', category: 'fruits', price: 50, unit: 'dozen', icon: 'banana', keywords: ['kela'], description: 'Ripe yellow bananas, sold by the dozen.' },
  { id: 'rice', name: 'Rice', category: 'grains', price: 45, mrp: 52, unit: 'kg', icon: 'rice', keywords: ['chawal', 'basmati'], description: 'Everyday long-grain rice for biryani and pulao stalls.' },
  { id: 'atta', name: 'Wheat flour', category: 'grains', price: 38, unit: 'kg', icon: 'atta', keywords: ['atta', 'gehun'], description: 'Chakki-fresh whole wheat atta for rotis and parathas.' },
  { id: 'besan', name: 'Gram flour', category: 'grains', price: 90, unit: 'kg', icon: 'besan', keywords: ['besan', 'chana'], description: 'Fine besan for pakoras, bhajji and sev.' },
  { id: 'toor-dal', name: 'Toor dal', category: 'grains', price: 140, mrp: 155, unit: 'kg', icon: 'toor-dal', keywords: ['arhar', 'toor', 'tuvar', 'dal', 'daal'], description: 'Polished toor dal that cooks soft and quick.' },
  { id: 'turmeric', name: 'Turmeric powder', category: 'spices', price: 200, unit: 'kg', icon: 'turmeric', keywords: ['haldi'], description: 'Bright, aromatic haldi powder.' },
  { id: 'red-chilli-powder', name: 'Red chilli powder', category: 'spices', price: 260, mrp: 290, unit: 'kg', icon: 'red-chilli-powder', keywords: ['lal mirch'], description: 'Rich red colour with medium heat.' },
  { id: 'salt', name: 'Salt', category: 'spices', price: 20, unit: 'kg', icon: 'salt', keywords: ['namak'], description: 'Iodised free-flowing salt.' },
  { id: 'paneer', name: 'Paneer', category: 'dairy', price: 360, unit: 'kg', icon: 'paneer', keywords: ['cottage cheese'], description: 'Soft fresh paneer, made daily.' },
  { id: 'milk', name: 'Milk', category: 'dairy', price: 60, unit: 'litre', icon: 'milk', keywords: ['doodh', 'dudh'], description: 'Full-cream milk for chai stalls.' },
  { id: 'mustard-oil', name: 'Mustard oil', category: 'oil', price: 170, mrp: 185, unit: 'litre', icon: 'mustard-oil', keywords: ['sarson', 'tel'], description: 'Kachi ghani mustard oil with a sharp aroma.' },
  { id: 'refined-oil', name: 'Refined oil', category: 'oil', price: 140, unit: 'litre', icon: 'refined-oil', keywords: ['refined', 'tel', 'sunflower'], description: 'Light refined sunflower oil for frying.' },
  { id: 'combo-tomato-onion', name: 'Tomato + Onion (5 kg each)', category: 'combo', price: 248, mrp: 275, unit: 'pack', icon: 'combo-tomato-onion', keywords: ['combo', 'tamatar pyaz'], description: 'The everyday pair, 5 kg of each, cheaper than buying separately.' },
  { id: 'combo-chaat', name: 'Chaat pack (potato, onion, chilli, coriander)', category: 'combo', price: 255, mrp: 300, unit: 'pack', icon: 'combo-chaat', keywords: ['combo', 'chaat', 'pani puri', 'golgappa'], description: 'Everything for a day of chaat: 5 kg potato, 3 kg onion, 500 g chilli and 5 bunches of coriander.' },
  { id: 'combo-tadka', name: 'Tadka pack (garlic, ginger, chilli)', category: 'combo', price: 133, mrp: 140, unit: 'pack', icon: 'combo-tadka', keywords: ['combo', 'tadka', 'masala'], description: '500 g each of garlic, ginger and green chilli.' },
].map((product, index) => ({ stock: STARTER_STOCK, active: true, sortOrder: (index + 1) * 10, mrp: null, ...product }));

export default starterCatalog;
