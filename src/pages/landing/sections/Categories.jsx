import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../../content/strings';
import { findCategory } from '../../../data/categories';
import ProductIcon from '../../../components/common/ProductIcon';
import { Stagger, staggerItem } from '../../../components/motion';
import { CATEGORY_SHOWCASE } from '../content';
import SectionHeading from './SectionHeading';
import './Categories.css';

const Categories = () => {
  return (
    <section className="section" id="categories" aria-labelledby="categories-title">
      <SectionHeading id="categories-title" eyebrow="categoriesEyebrow" title="categoriesTitle" lead="categoriesBody" />
      <Stagger as="ul" className="category-row" inView stagger={0.06}>
        {CATEGORY_SHOWCASE.map(findCategory).map((category) => (
          <motion.li key={category.id} variants={staggerItem} whileHover={{ y: -6 }}>
            <ProductIcon icon={category.icon} category={category.id} size="lg" />
            <span>{t(category.labelKey)}</span>
          </motion.li>
        ))}
      </Stagger>
    </section>
  );
};

export default Categories;
