import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import './ProfileSection.css';
import profileBackground from '../assets/profile.png'; // ✅ Import properly

const ProfileSection = ({ language }) => {
  const isHindi = language === 'hi';
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setNewName(currentUser.displayName || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      window.location.href = '/';
    });
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancel = () => {
    setNewName(user.displayName || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName.trim(),
      });
      setUser({ ...user, displayName: newName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const containerStyle = {
    backgroundImage: `url(${profileBackground})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: '#f7aec3',
    minHeight: '100vh',
  };

  if (!user) {
    return (
      <motion.div
        className="profile-container"
        style={containerStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>{isHindi ? 'प्रोफ़ाइल' : 'Profile'}</h2>
        <p>{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="profile-container"
      style={containerStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>{isHindi ? 'प्रोफ़ाइल' : 'Profile'}</h2>

      <div className="profile-card">
        <p>
          <strong>{isHindi ? 'नाम' : 'Name'}:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="edit-input"
              placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
            />
          ) : (
            user.displayName || 'N/A'
          )}
        </p>

        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>{isHindi ? 'फोन' : 'Phone'}:</strong> {user.phoneNumber || 'N/A'}</p>
        <p><strong>{isHindi ? 'भाषा' : 'Language'}:</strong> {isHindi ? 'हिन्दी' : 'English'}</p>

        {isEditing ? (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              {isHindi ? 'सेव करें' : 'Save'}
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        ) : (
          <button className="edit-btn" onClick={handleEditClick}>
            {isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
          </button>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          {isHindi ? 'लॉग आउट करें' : 'Logout'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileSection;
