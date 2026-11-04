import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBolt, FaChartLine, FaChevronRight, FaHeadset, FaMapMarkedAlt, FaTruck, FaWallet } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { t } from '../../content/strings';
import { useCatalog } from '../../context/CatalogContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useDesktopColumns, useIsDesktop } from '../../hooks/useMediaQuery';
import { useMyOrders } from '../../hooks/useMyOrders';
import CATEGORIES from '../../data/categories';
import { EXPRESS_MINUTES, FREE_DELIVERY_ABOVE } from '../../config/app';
import { discountPct } from '../../utils/pricing';
import ProductIcon from '../../components/common/ProductIcon';
import { useAuth } from '../../context/AuthContext';
import { Stagger, staggerItem } from '../../components/motion';
import { openAssistant } from '../assistant/openAssistant';
import CatalogState from './CatalogState';
import ProductList from './ProductList';
import './home.css';

// Rows show one line of products: as many as fit across the window on desktop, 10 to swipe on phones.
const MOBILE_ROW_LIMIT = 10;
// Category rows on the home page; the tiles above lead to every category.
const HOME_CATEGORY_ROWS = 3;

// Products from past orders that are in stock again, most recent first.
const buyAgain = (orders, findProduct) => {
  const seen = new Set();
  return (orders || [])
    .filter((o) => o.status !== 'cancelled')
    .flatMap((o) => o.items)
    .filter((item) => !seen.has(item.id) && seen.add(item.id))
    .map((item) => findProduct(item.id))
    .filter((p) => p && p.stock > 0);
};

// Good morning / afternoon / evening, by the vendor's local time.
const greetingKey = (hour = new Date().getHours()) => (hour < 12 ? 'goodMorning' : hour < 17 ? 'goodAfternoon' : 'goodEvening');

const FACTS = [
  { icon: FaBolt, tone: 'yellow', title: 'factExpressTitle', body: () => t('factExpressBody', { minutes: EXPRESS_MINUTES }) },
  { icon: FaTruck, tone: 'green', title: 'factFreeTitle', body: () => t('factFreeBody', { amount: FREE_DELIVERY_ABOVE }) },
  { icon: FaWallet, tone: 'peach', title: 'factPayTitle', body: () => t('factPayBody') },
  { icon: FaHeadset, tone: 'violet', title: 'factSupportTitle', body: () => t('supportHours') },
];

const TOOLS = [
  { to: '/markets', icon: FaMapMarkedAlt, title: 'toolMarketsTitle', body: 'toolMarketsBody', tone: 'green' },
  { to: '/markets', icon: FaChartLine, title: 'toolPricesTitle', body: 'toolPricesBody', tone: 'yellow' },
  { assistant: true, icon: HiSparkles, title: 'assistantAsk', body: 'toolAssistantBody', tone: 'violet' },
];

const ProductRow = ({ id, title, items, link, isDesktop }) => {
  const columns = useDesktopColumns();
  const limit = isDesktop ? columns : MOBILE_ROW_LIMIT;
  return (
    <section className="shop-row" aria-labelledby={id}>
      <div className="shop-row-head">
        <h2 id={id} className="shop-section-title">{title}</h2>
        {link && items.length > limit && (
          <Link to={link} className="see-all">
            {t('seeAll')} <FaChevronRight aria-hidden="true" />
          </Link>
        )}
      </div>
      <ProductList products={items.slice(0, limit)} layout={isDesktop ? 'grid' : 'row'} columns={isDesktop ? columns : undefined} />
    </section>
  );
};

const Tool = ({ tool }) => {
  const Icon = tool.icon;
  const inner = (
    <>
      <span className={`home-tool-icon tone-${tool.tone}`} aria-hidden="true"><Icon /></span>
      <span className="home-tool-text">
        <strong>{t(tool.title)}</strong>
        <span>{t(tool.body)}</span>
      </span>
      <FaArrowRight className="home-tool-arrow" aria-hidden="true" />
    </>
  );
  return tool.assistant ? (
    <button type="button" className="home-tool" onClick={openAssistant}>{inner}</button>
  ) : (
    <Link to={tool.to} className="home-tool">{inner}</Link>
  );
};

const ShopHome = () => {
  const { products, findProduct } = useCatalog();
  const orders = useMyOrders();
  const isDesktop = useIsDesktop();
  const { profile } = useAuth();
  const firstName = profile?.name?.split(' ')[0];
  useDocumentMeta({ title: `${t('navHome')} – ${t('appName')}` });

  const deals = useMemo(
    () => products.filter((p) => p.stock > 0 && discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)),
    [products]
  );
  const again = useMemo(() => buyAgain(orders, findProduct), [orders, findProduct]);
  const categoryRows = useMemo(
    () => CATEGORIES.map((category) => ({ category, items: products.filter((p) => p.category === category.id) })),
    [products]
  );

  return (
    <div className="page shop-home">
      <section className="home-hero" aria-labelledby="home-title">
        <motion.div className="home-hero-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="home-greeting">
            {firstName ? t('greetingName', { greeting: t(greetingKey()), name: firstName }) : t(greetingKey())}
          </p>
          <h1 id="home-title" className="home-title">{t('homeTitle', { minutes: EXPRESS_MINUTES })}</h1>
          <p className="home-lead">{t('homeBody')}</p>
          <div className="home-actions">
            <Link to="/shop/category/vegetables" className="btn">
              {t('homeShop')} <FaArrowRight aria-hidden="true" />
            </Link>
            <Link to="/markets" className="btn btn-outline">
              <FaMapMarkedAlt aria-hidden="true" /> {t('homeMarkets')}
            </Link>
          </div>
        </motion.div>
        <ul className="home-facts" aria-label={t('homeFacts')}>
          {FACTS.map(({ icon: Icon, tone, title, body }) => (
            <li key={title}>
              <span className={`home-fact-icon tone-${tone}`} aria-hidden="true"><Icon /></span>
              <span>
                <strong>{t(title)}</strong>
                <small>{body()}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-block" aria-labelledby="shop-categories">
        <h2 id="shop-categories" className="shop-section-title">{t('shopByCategory')}</h2>
        <Stagger as="ul" className="home-categories" stagger={0.04}>
          {categoryRows.map(({ category, items }) => (
            <motion.li key={category.id} variants={staggerItem}>
              <Link to={`/shop/category/${category.id}`} className="home-category">
                <ProductIcon icon={category.icon} category={category.id} size="lg" />
                <span className="home-category-name">{t(category.labelKey)}</span>
                {items.length > 0 && <small>{t('categoryCount', { n: items.length })}</small>}
              </Link>
            </motion.li>
          ))}
        </Stagger>
      </section>

      <CatalogState />

      {again.length > 0 && <ProductRow id="row-buy-again" title={t('buyAgainTitle')} items={again} isDesktop={isDesktop} />}
      {deals.length > 0 && <ProductRow id="row-deals" title={t('dealsTitle')} items={deals} isDesktop={isDesktop} />}

      {categoryRows
        .filter(({ items }) => items.length)
        .slice(0, HOME_CATEGORY_ROWS)
        .map(({ category, items }) => (
          <ProductRow
            key={category.id}
            id={`row-${category.id}`}
            title={t(category.labelKey)}
            items={items}
            link={`/shop/category/${category.id}`}
            isDesktop={isDesktop}
          />
        ))}

      <section className="home-block" aria-labelledby="home-tools">
        <h2 id="home-tools" className="shop-section-title">{t('toolsTitle')}</h2>
        <ul className="home-tools">
          {TOOLS.map((tool) => (
            <li key={tool.title}><Tool tool={tool} /></li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ShopHome;
