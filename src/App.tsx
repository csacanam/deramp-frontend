import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CheckoutPage } from './components/CheckoutPage';
import { CommercePage } from './components/CommercePage';
import { HomePage } from './components/HomePage';
import { DemoPage } from './components/DemoPage';
import { MobileWalletBanner, BannerContext } from './components/MobileWalletBanner';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  return (
    <LanguageProvider>
      <BannerContext.Provider value={{ isBannerVisible, setIsBannerVisible }}>
        <Router>
          <MobileWalletBanner />
          <div className={`transition-all duration-300 ${isBannerVisible ? 'pt-16' : 'pt-0'}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/checkout/:invoiceId" element={<CheckoutPage />} />
              <Route path="/pay/:commerceId" element={<CommercePage />} />
              <Route path="/checkout" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </BannerContext.Provider>
    </LanguageProvider>
  );
}

export default App;