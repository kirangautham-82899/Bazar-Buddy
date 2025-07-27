import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import RegisterLogin from './components/RegisterLogin';
import Dashboard from './components/Dashboard';

function App() {
  const [language, setLanguage] = useState(null);

  const handleLanguageSelect = (lang) => setLanguage(lang);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          !language ? (
            <LoginScreen onLanguageSelect={handleLanguageSelect} />
          ) : (
            <RegisterLogin language={language} />
          )
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
