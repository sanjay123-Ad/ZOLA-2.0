import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side after hydration.
    const consentAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentAccepted) {
      // Use a timeout to avoid layout shift during initial render and give a smoother feel.
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#2E1E1E]/90 backdrop-blur-sm text-white p-4 transform transition-transform duration-500 ease-in-out"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 id="cookie-consent-title" className="font-semibold">Our Use of Cookies</h2>
          <p id="cookie-consent-description" className="text-sm text-white/80 mt-1">
            We use essential cookies to make our site work. By using our site, you acknowledge that you have read and understand our use of cookies for session management and analytics.
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="flex-shrink-0 px-6 py-2 bg-[#9F1D35] text-white font-bold rounded-full text-sm shadow-lg hover:bg-[#80172a] transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
