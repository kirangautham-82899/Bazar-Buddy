import React, { useState } from 'react';
import './RegisterLogin.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import Lottie from 'lottie-react';
import welcomeAnim from '../assets/welcome.json'; // Place your Lottie file here

const RegisterLogin = ({ language }) => {
  const isHindi = language === 'hi';
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuth = async () => {
    const { email, password } = formData;
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert(isHindi ? 'सफलतापूर्वक लॉग इन हुआ!' : 'Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert(isHindi ? 'रजिस्ट्रेशन सफल!' : 'Registered successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Lottie animationData={welcomeAnim} loop={true} style={{ height: 180 }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{isLogin ? (isHindi ? 'लॉग इन करें' : 'Login') : (isHindi ? 'रजिस्टर करें' : 'Register')}</h2>

          {!isLogin && (
            <div className="input-icon-group">
              <FaUser />
              <input
                type="text"
                name="name"
                placeholder={isHindi ? 'नाम' : 'Name'}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="input-icon-group">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              placeholder={isHindi ? 'ईमेल' : 'Email'}
              onChange={handleChange}
            />
          </div>
          <div className="input-icon-group">
            <FaLock />
            <input
              type="password"
              name="password"
              placeholder={isHindi ? 'पासवर्ड' : 'Password'}
              onChange={handleChange}
            />
          </div>
          {!isLogin && (
            <div className="input-icon-group">
              <FaPhone />
              <input
                type="text"
                name="phone"
                placeholder={isHindi ? 'फ़ोन नंबर' : 'Phone Number'}
                onChange={handleChange}
              />
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAuth}
            className="submit-btn"
          >
            {isLogin ? (isHindi ? 'लॉग इन' : 'Login') : (isHindi ? 'रजिस्टर' : 'Register')}
          </motion.button>

          <p>
            {isLogin
              ? isHindi
                ? 'कोई खाता नहीं है? '
                : "Don't have an account? "
              : isHindi
              ? 'पहले से ही एक खाता है? '
              : 'Already have an account? '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? (isHindi ? 'रजिस्टर करें' : 'Register') : (isHindi ? 'लॉग इन करें' : 'Login')}
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default RegisterLogin;
