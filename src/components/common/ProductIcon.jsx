import React from 'react';
import {
  GiBanana,
  GiBasket,
  GiBeet,
  GiBowlOfRice,
  GiCarrot,
  GiCheeseWedge,
  GiChiliPepper,
  GiCookingPot,
  GiFlour,
  GiFruitBowl,
  GiGarlic,
  GiHerbsBundle,
  GiLemon,
  GiMilkCarton,
  GiMortar,
  GiOilDrum,
  GiOlive,
  GiPeas,
  GiPlantRoots,
  GiPotato,
  GiPowder,
  GiSaltShaker,
  GiTomato,
  GiWheat,
} from 'react-icons/gi';
import './ProductIcon.css';

// Vector icons stand in for product photos, so the app ships no images.
const ICONS = {
  tomato: GiTomato,
  onion: GiBeet,
  potato: GiPotato,
  carrot: GiCarrot,
  'green-chilli': GiChiliPepper,
  garlic: GiGarlic,
  ginger: GiPlantRoots,
  coriander: GiHerbsBundle,
  lemon: GiLemon,
  banana: GiBanana,
  rice: GiBowlOfRice,
  atta: GiWheat,
  besan: GiFlour,
  'toor-dal': GiPeas,
  turmeric: GiPowder,
  'red-chilli-powder': GiMortar,
  salt: GiSaltShaker,
  paneer: GiCheeseWedge,
  milk: GiMilkCarton,
  'mustard-oil': GiOlive,
  'refined-oil': GiOilDrum,
  'combo-tomato-onion': GiBasket,
  'combo-chaat': GiFruitBowl,
  'combo-tadka': GiCookingPot,
};

const CATEGORY_TONES = {
  vegetables: 'green',
  fruits: 'amber',
  grains: 'wheat',
  spices: 'red',
  dairy: 'sky',
  oil: 'olive',
  combo: 'brand',
};

export const toneFor = (category) => CATEGORY_TONES[category] || 'brand';

const ProductIcon = ({ id, category, size = 'md' }) => {
  const Icon = ICONS[id] || GiBasket;
  return (
    <span className={`product-icon product-icon-${size} tone-${toneFor(category)}`} aria-hidden="true">
      <Icon />
    </span>
  );
};

export default ProductIcon;
