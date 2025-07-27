import React, { useState } from "react";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";

export default function SignupPage({ language }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 transition-all">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
        {showLogin ? (
          <LoginForm
            language={language}
            goBack={() => setShowLogin(false)}
          />
        ) : (
          <SignupForm
            language={language}
            goToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
