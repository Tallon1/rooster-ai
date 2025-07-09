"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setIsClient(true);
    const consent = localStorage.getItem("rooster-ai-cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "rooster-ai-cookie-consent",
      JSON.stringify(consentData)
    );
    setShowConsent(false);
  };

  const acceptSelected = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "rooster-ai-cookie-consent",
      JSON.stringify(consentData)
    );
    setShowConsent(false);
  };

  const rejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "rooster-ai-cookie-consent",
      JSON.stringify(consentData)
    );
    setShowConsent(false);
  };

  // Don't render on server or if consent already given
  if (!isClient || !showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cookie Preferences
            </h3>
            <button
              onClick={rejectAll}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            We use cookies to enhance your browsing experience, serve
            personalized content, and analyze our traffic. By clicking "Accept
            All", you consent to our use of cookies.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                <p className="text-sm text-gray-600">
                  Required for basic site functionality
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.necessary}
                disabled
                className="h-4 w-4 text-[#f11d1c] rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">
                  Help us understand how visitors use our site
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    analytics: e.target.checked,
                  })
                }
                className="h-4 w-4 text-[#f11d1c] rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">
                  Used to deliver relevant advertisements
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    marketing: e.target.checked,
                  })
                }
                className="h-4 w-4 text-[#f11d1c] rounded border-gray-300"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptAll}
              className="flex-1 bg-[#f11d1c] text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Accept All
            </button>
            <button
              onClick={acceptSelected}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-[#f11d1c] hover:text-[#f11d1c] transition-colors duration-200"
            >
              Accept Selected
            </button>
            <button
              onClick={rejectAll}
              className="flex-1 text-gray-600 py-3 px-4 rounded-lg hover:text-gray-800 transition-colors duration-200"
            >
              Reject All
            </button>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/privacy"
              className="text-sm text-[#f11d1c] hover:underline"
            >
              Privacy Policy
            </a>
            <span className="text-gray-400 mx-2">|</span>
            <a
              href="/cookies"
              className="text-sm text-[#f11d1c] hover:underline"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
