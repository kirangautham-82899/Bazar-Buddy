// Lets the landing page find out if a vendor is already signed in without
// putting Firebase in the landing bundle: it is imported only when called.
export const onSignedIn = async (callback) => {
  const [{ auth }, { onAuthStateChanged }] = await Promise.all([
    import('../config/firebase'),
    import('firebase/auth'),
  ]);
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (user) => user && callback(user));
};
