// ✅ src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../utils/lang';
import PageWrapper from '../components/PageWrapper';

const Dashboard = () => {
  const lang = localStorage.getItem('lang') || 'en';
  const t = translations[lang];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <PageWrapper>
      <div style={{
        height: '100vh',
        backgroundColor: '#ffe6ee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: 'Poppins, sans-serif',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#d6336c' }}>{t.dashboardWelcome}</h1>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#ff7aa5',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          {t.logout}
        </button>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;