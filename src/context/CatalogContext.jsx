import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeActiveProducts } from '../services/catalogService';

const CatalogContext = createContext(null);

// Live list of visible products. Prices and stock update in place as the team edits them.
export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    () =>
      subscribeActiveProducts(
        (list) => {
          setProducts(list);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err);
          setLoading(false);
        }
      ),
    []
  );

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return { products, loading, error, findProduct: (id) => byId.get(id) };
  }, [products, loading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
};
