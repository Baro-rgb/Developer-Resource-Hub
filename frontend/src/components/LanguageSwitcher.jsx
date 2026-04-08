import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Language Switcher Component
 * Cho phép người dùng đổi ngôn ngữ
 */
const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-gray-400">
        {t('common.language')}:
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('vi')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === 'vi'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          VI
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
