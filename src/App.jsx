import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected routes */}
        <Route path="/editor" element={
          <ProtectedRoute><EditorPage /></ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute><AccountPage /></ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
        } />
        
        {/* Demo - no auth needed */}
        <Route path="/demo" element={<EditorPage isDemo />} />
        
        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
