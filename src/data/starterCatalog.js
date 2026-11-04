// Starter products an admin can import in one click from the admin panel, then
// edit. The shop itself always reads products from Firestore. `keywords` adds
// other English names and spellings so search finds "roma", "spud" or "lime".
const STARTER_STOCK = 50;

const starterCatalog = [
  { id: 'tomato', name: 'Tomatoes', category: 'vegetables', price: 30, mrp: 36, unit: 'kg', icon: 'tomato', keywords: ['tomato', 'roma'], description: 'Firm, ripe hybrid tomatoes for sauces, curries and salads.' },
  { id: 'onion', name: 'Onions', category: 'vegetables', price: 25, mrp: 30, unit: 'kg', icon: 'onion', keywords: ['red onion', 'onion'], description: 'Medium red onions from Nashik, dry and long-lasting.' },
  { id: 'potato', name: 'Potatoes', category: 'vegetables', price: 22, unit: 'kg', icon: 'potato', keywords: ['spud', 'potato'], description: 'Clean, medium potatoes that boil evenly for snacks and curries.' },
  { id: 'carrot', name: 'Carrots', category: 'vegetables', price: 40, unit: 'kg', icon: 'carrot', keywords: ['carrot'], description: 'Sweet red carrots, washed and ready for salads and desserts.' },
  { id: 'green-chilli', name: 'Green chillies', category: 'vegetables', price: 60, mrp: 70, unit: 'kg', icon: 'green-chilli', keywords: ['chili', 'chilli', 'pepper'], description: 'Fresh, medium-hot green chillies.' },
  { id: 'garlic', name: 'Garlic', category: 'vegetables', price: 120, unit: 'kg', icon: 'garlic', keywords: ['garlic bulb'], description: 'Bold, easy-to-peel garlic bulbs.' },
  { id: 'ginger', name: 'Ginger', category: 'vegetables', price: 100, unit: 'kg', icon: 'ginger', keywords: ['ginger root'], description: 'Juicy ginger with thin skin, great for tea and seasoning.' },
  { id: 'coriander', name: 'Coriander leaves', category: 'vegetables', price: 10, unit: 'bunch', icon: 'coriander', keywords: ['cilantro', 'herbs'], description: 'Fragrant fresh coriander for garnish.' },
  { id: 'lemon', name: 'Lemons', category: 'fruits', price: 80, unit: 'kg', icon: 'lemon', keywords: ['lime', 'lemon'], description: 'Juicy lemons for lemonade, snacks and pickles.' },
  { id: 'banana', name: 'Bananas', category: 'fruits', price: 50, unit: 'dozen', icon: 'banana', keywords: ['banana'], description: 'Ripe yellow bananas, sold by the dozen.' },
  { id: 'rice', name: 'Rice', category: 'grains', price: 45, mrp: 52, unit: 'kg', icon: 'rice', keywords: ['basmati', 'long grain'], description: 'Everyday long-grain rice for rice and curry stalls.' },
  { id: 'atta', name: 'Wheat flour', category: 'grains', price: 38, unit: 'kg', icon: 'atta', keywords: ['flour', 'whole wheat'], description: 'Freshly milled whole wheat flour for flatbreads.' },
  { id: 'besan', name: 'Gram flour', category: 'grains', price: 90, unit: 'kg', icon: 'besan', keywords: ['chickpea flour', 'flour'], description: 'Fine chickpea flour for fritters and batters.' },
  { id: 'toor-dal', name: 'Split pigeon peas', category: 'grains', price: 140, mrp: 155, unit: 'kg', icon: 'toor-dal', keywords: ['lentils', 'pulses', 'pigeon peas'], description: 'Polished split pigeon peas that cook soft and quick.' },
  { id: 'turmeric', name: 'Turmeric powder', category: 'spices', price: 200, unit: 'kg', icon: 'turmeric', keywords: ['turmeric'], description: 'Bright, aromatic turmeric powder.' },
  { id: 'red-chilli-powder', name: 'Red chilli powder', category: 'spices', price: 260, mrp: 290, unit: 'kg', icon: 'red-chilli-powder', keywords: ['chili powder', 'cayenne'], description: 'Rich red colour with medium heat.' },
  { id: 'salt', name: 'Salt', category: 'spices', price: 20, unit: 'kg', icon: 'salt', keywords: ['table salt'], description: 'Iodised free-flowing salt.' },
  { id: 'paneer', name: 'Cottage cheese', category: 'dairy', price: 360, unit: 'kg', icon: 'paneer', keywords: ['cheese', 'fresh cheese'], description: 'Soft fresh cottage cheese, made daily.' },
  { id: 'milk', name: 'Milk', category: 'dairy', price: 60, unit: 'litre', icon: 'milk', keywords: ['full cream'], description: 'Full-cream milk for tea stalls.' },
  { id: 'mustard-oil', name: 'Mustard oil', category: 'oil', price: 170, mrp: 185, unit: 'litre', icon: 'mustard-oil', keywords: ['cooking oil'], description: 'Cold-pressed mustard oil with a sharp aroma.' },
  { id: 'refined-oil', name: 'Refined oil', category: 'oil', price: 140, unit: 'litre', icon: 'refined-oil', keywords: ['refined', 'sunflower', 'cooking oil'], description: 'Light refined sunflower oil for frying.' },
  { id: 'combo-tomato-onion', name: 'Tomato + Onion (5 kg each)', category: 'combo', price: 248, mrp: 275, unit: 'pack', icon: 'combo-tomato-onion', keywords: ['combo', 'tomato onion'], description: 'The everyday pair, 5 kg of each, cheaper than buying separately.' },
  { id: 'combo-chaat', name: 'Snack stall pack (potato, onion, chilli, coriander)', category: 'combo', price: 255, mrp: 300, unit: 'pack', icon: 'combo-chaat', keywords: ['combo', 'snack', 'street food'], description: 'Everything for a day of street snacks: 5 kg potato, 3 kg onion, 500 g chilli and 5 bunches of coriander.' },
  { id: 'combo-tadka', name: 'Seasoning pack (garlic, ginger, chilli)', category: 'combo', price: 133, mrp: 140, unit: 'pack', icon: 'combo-tadka', keywords: ['combo', 'seasoning', 'spice'], description: '500 g each of garlic, ginger and green chilli.' },
].map((product, index) => ({ stock: STARTER_STOCK, active: true, sortOrder: (index + 1) * 10, mrp: null, ...product }));

export default starterCatalog;
