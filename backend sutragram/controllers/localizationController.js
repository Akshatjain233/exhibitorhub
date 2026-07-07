// @desc    Get translations for a language
// @route   GET /api/localization/:language
// @access  Public
export const getTranslations = async (req, res) => {
    try {
        const { language } = req.params;

        // In production, fetch from database or i18n files
        // For now, return mock translations
        const translations = {
            en: {
                welcome: 'Welcome to SutraGram',
                profile: 'Profile',
                feed: 'Feed',
                shop: 'Shop',
                logout: 'Logout',
            },
            hi: {
                welcome: 'सूत्रग्राम में आपका स्वागत है',
                profile: 'प्रोफ़ाइल',
                feed: 'फ़ीड',
                shop: 'दुकान',
                logout: 'लॉग आउट',
            },
        };

        const selectedLanguage = translations[language] || translations['en'];

        res.status(200).json({
            success: true,
            data: { translations: selectedLanguage },
        });
    } catch (error) {
        console.error('Get translations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch translations.',
            error: error.message,
        });
    }
};

// @desc    Get supported languages
// @route   GET /api/localization/languages
// @access  Public
export const getSupportedLanguages = async (req, res) => {
    try {
        const languages = [
            { code: 'en', name: 'English', native: 'English' },
            { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
            { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
            { code: 'te', name: 'Telugu', native: 'తెలుగు' },
            { code: 'bn', name: 'Bengali', native: 'বাংলা' },
            { code: 'mr', name: 'Marathi', native: 'मराठी' },
        ];

        res.status(200).json({
            success: true,
            data: { languages },
        });
    } catch (error) {
        console.error('Get supported languages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supported languages.',
            error: error.message,
        });
    }
};
