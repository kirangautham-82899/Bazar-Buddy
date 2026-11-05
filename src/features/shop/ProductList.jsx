import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';

// Grid (wraps) or row (scrolls sideways). Products reflow smoothly when the list changes.
// `columns` fixes the grid to one full row of that many products.
const ProductList = ({ products, layout = 'grid', columns }) => (
  <motion.ul layout className={`product-${layout}`} style={columns ? { '--cols': columns } : undefined}>
    <AnimatePresence mode="popLayout" initial={false}>
      {products.map((product, i) => (
        <motion.li
          key={product.id}
          layout
          initial={{ scale: 0.96, y: 10 }}
          animate={{ scale: 1, y: 0, transition: { delay: Math.min(i * 0.03, 0.3) } }}
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
