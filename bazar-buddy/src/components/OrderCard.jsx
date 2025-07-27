// src/components/OrderCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './OrderCard.css';

const statusFlow = ['Packing', 'Dispatched', 'On the Way', 'Delivered'];
const statusFlow_hi = ['पैकिंग', 'भेजा गया', 'रास्ते में', 'डिलीवर किया गया'];

const OrderCard = ({ order, language }) => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < statusFlow.length - 1 ? prev + 1 : prev));
    }, 3000); // simulate every 3 sec
    return () => clearInterval(interval);
  }, []);

  const currentStatus = language === 'hi' ? statusFlow_hi[statusIndex] : statusFlow[statusIndex];

  return (
    <motion.div
      className="order-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h4>{language === 'hi' ? 'ऑर्डर #' : 'Order #'}{order.id}</h4>
      <p>{language === 'hi' ? 'सामग्री:' : 'Items:'} {order.items.join(', ')}</p>
      <p>{language === 'hi' ? 'स्थिति:' : 'Status:'} <strong>{currentStatus}</strong></p>
    </motion.div>
  );
};

export default OrderCard;
