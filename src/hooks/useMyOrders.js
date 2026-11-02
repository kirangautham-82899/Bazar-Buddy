import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeMyOrders } from '../services/orderService';

// Live list of the signed-in vendor's orders: null while loading, [] for guests.
export const useMyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return undefined;
    }
    return subscribeMyOrders(user.uid, setOrders, (err) => {
      console.error(err);
      setOrders([]);
    });
  }, [user]);

  return orders;
};
