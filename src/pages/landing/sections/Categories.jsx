import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { CATEGORY_LABEL_KEYS } from '../../../data/products';
import ProductIcon from '../../../components/common/ProductIcon';
import { Stagger, staggerItem } from '../../../components/motion';
import { CATEGORY_SHOWCASE } from '../content';
import SectionHeading from './SectionHeading';
import './Categories.css';

const Categories = () => {
  const { t } = useLanguage();
  return (
    <section className="section" id="categories" aria-labelledby="categories-title">
      <SectionHeading id="categories-title" eyebrow="categoriesEyebrow" title="categoriesTitle" lead="categoriesBody" />
      <Stagger as="ul" className="category-row" inView stagger={0.06}>
        {CATEGORY_SHOWCASE.map(({ category, icon }) => (
          <motion.li key={category} variants={staggerItem} whileHover={{ y: -6 }}>
            <ProductIcon id={icon} category={category} size="lg" />
            <span>{t(CATEGORY_LABEL_KEYS[category])}</span>
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

export default Categories;
