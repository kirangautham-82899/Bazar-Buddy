// src/components/HelpSection.jsx
import React, { useState } from 'react';
import './HelpSection.css';
import { motion } from 'framer-motion';

const faqs = [
  { q: 'How do I place an order?', a: 'Go to the Marketplace, select items, and click Add to Cart.' },
  { q: 'Can I cancel an order?', a: 'Yes, go to Your Orders and click Cancel before dispatch.' },
  { q: 'How does group ordering work?', a: 'Join a vendor group and collaborate to place bulk orders.' },
  { q: 'What are delivery modes?', a: 'You can choose Priority, Verified, or Scheduled delivery.' },
];

const HelpSection = ({ language = 'en' }) => {
  const isHindi = language === 'hi';
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      className="help-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2>🆘 {isHindi ? 'सहायता अनुभाग' : 'Help & Support'}</h2>

      <div className="help-grid">
        {/* Call Support Block */}
        <div className="help-card">
          <h3>📞 {isHindi ? 'कॉल सहायता' : 'Call Support'}</h3>
          <p>{isHindi ? 'हमें कॉल करें यदि आपको किसी भी चीज़ में सहायता चाहिए।' : 'Call us if you need assistance with anything.'}</p>
          <a href="tel:+911234567890" className="help-btn">
            📲 {isHindi ? 'कॉल करें' : 'Call Now'}
          </a>
        </div>

        {/* Toll-Free Block */}
        <div className="help-card">
          <h3>☎️ {isHindi ? 'टोल-फ्री नंबर' : 'Toll-Free Number'}</h3>
          <p>{isHindi ? 'हमारा नंबर हर समय उपलब्ध है।' : 'Our number is available 24/7.'}</p>
          <div className="toll-number">📞 1800-123-4567</div>
        </div>

        {/* FAQs Block */}
        <div className="help-card faq-card">
          <h3>❓ {isHindi ? 'प्रश्न पूछे गए' : 'Frequently Asked Questions'}</h3>
          <div className="faq-list">
            {faqs.map((item, idx) => (
              <div key={idx} className="faq-item">
                <div
                  className="faq-question"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  {item.q}
                </div>
                {openIndex === idx && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpSection;
