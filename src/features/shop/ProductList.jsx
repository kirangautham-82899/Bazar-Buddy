import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';

// Grid (wraps) or row (scrolls sideways). Cards reflow smoothly when the list changes.
const ProductList = ({ products, layout = 'grid' }) => (
  <motion.ul layout className={`product-${layout}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      {products.map((product, i) => (
        <motion.li
          key={product.id}
          layout
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: Math.min(i * 0.03, 0.3) } }}
          exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          <ProductCard product={product} />
        </motion.li>
      ))}
    </AnimatePresence>
  </motion.ul>
);

export default ProductList;
