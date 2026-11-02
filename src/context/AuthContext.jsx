import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { checkIsAdmin, ensureUserProfile, subscribeUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  // null until the admins/{uid} check has finished for the signed-in user.
  const [isAdmin, setIsAdmin] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        if (!nextUser) {
          setProfile(null);
          setIsAdmin(false);
        }
        setInitializing(false);
      }),
    []
  );

  useEffect(() => {
    if (!user) return undefined;
    let unsubscribe = () => {};
    let cancelled = false;
    setIsAdmin(null);
    checkIsAdmin(user.uid).then((admin) => !cancelled && setIsAdmin(admin));
    ensureUserProfile(user)
      .catch((err) => console.error('Could not create profile', err))
      .finally(() => {
        if (!cancelled) unsubscribe = subscribeUserProfile(user.uid, setProfile, console.error);
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  const value = useMemo(() => ({ user, profile, isAdmin, initializing }), [user, profile, isAdmin, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
