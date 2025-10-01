import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageIcon } from './icons/LanguageIcon';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(lang => lang === 'en' ? 'zh-TW' : 'en');
    };

    return (
        <button 
            onClick={toggleLanguage} 
            className="p-2 rounded-full hover:bg-secondary transition-colors" 
            aria-label="Toggle language"
        >
            <LanguageIcon />
        </button>
    );
};

export default LanguageSwitcher;
