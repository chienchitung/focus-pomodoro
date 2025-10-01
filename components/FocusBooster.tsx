import React, { useState } from 'react';
import { getMotivationalQuote } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './icons/SparklesIcon';

const FocusBooster: React.FC = () => {
    const [quote, setQuote] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { language, t } = useLanguage();

    const fetchQuote = async () => {
        setIsLoading(true);
        setQuote('');
        // Pass the current language to get a localized quote
        const newQuote = await getMotivationalQuote(language);
        setQuote(newQuote);
        setIsLoading(false);
    };

    return (
        <div className="bg-secondary p-4 rounded-lg text-center">
            {quote && (
                 <blockquote className="mb-4 italic text-light/90">
                    "{quote}"
                 </blockquote>
            )}
            {isLoading && (
                 <div className="flex justify-center items-center h-6 mb-4">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                 </div>
            )}
            <button 
                onClick={fetchQuote} 
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 bg-accent/20 text-accent font-semibold px-4 py-2 rounded-md hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SparklesIcon />
                <span>{t('focusBooster')}</span>
            </button>
        </div>
    );
}

export default FocusBooster;