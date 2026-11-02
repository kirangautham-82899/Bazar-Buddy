// Shop categories, in display order. `icon` is a ProductIcon key.
const CATEGORIES = [
  { id: 'vegetables', labelKey: 'catVegetables', icon: 'tomato' },
  { id: 'fruits', labelKey: 'catFruits', icon: 'banana' },
  { id: 'grains', labelKey: 'catGrains', icon: 'atta' },
  { id: 'spices', labelKey: 'catSpices', icon: 'red-chilli-powder' },
  { id: 'dairy', labelKey: 'catDairy', icon: 'milk' },
  { id: 'oil', labelKey: 'catOil', icon: 'mustard-oil' },
  { id: 'combo', labelKey: 'catCombo', icon: 'combo-tomato-onion' },
];

export const findCategory = (id) => CATEGORIES.find((c) => c.id === id);

export const UNITS = ['kg', 'g', 'litre', 'ml', 'dozen', 'piece', 'bunch', 'pack'];

export default CATEGORIES;
