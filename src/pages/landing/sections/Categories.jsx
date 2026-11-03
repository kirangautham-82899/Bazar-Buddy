import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../../content/strings';
import { findCategory } from '../../../data/categories';
import ProductIcon from '../../../components/common/ProductIcon';
import { CATEGORY_SHOWCASE } from '../content';
import SectionHeading from './SectionHeading';
import './Categories.css';

const Categories = () => (
  <section className="section" id="categories" aria-labelledby="categories-title">
    <SectionHeading id="categories-title" eyebrow="categoriesEyebrow" title="categoriesTitle" lead="categoriesBody" />
    <ul className="category-row">
      {CATEGORY_SHOWCASE.map(findCategory).map((category) => (
        <li key={category.id}>
          <Link to={`/shop/category/${category.id}`}>
            <ProductIcon icon={category.icon} category={category.id} size="lg" />
            <span>{t(category.labelKey)}</span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default Categories;
