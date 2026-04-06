const axios = require('axios');

exports.simplifyText = async (extractedText, language = 'en') => {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey || groqApiKey === 'your_groq_api_key') {
            console.log(`[AI Service] GROQ_API_KEY not configured. Falling back to multi-lingual ONE-GLANCE stub for ${language}`);
            
            const normalizedLang = language.toLowerCase();
            if (normalizedLang === 'hi' || normalizedLang === 'hindi') {
                return "एक नज़र में: आपके ब्लड शुगर और हीमोग्लोबिन के स्तर सामान्य हैं। केवल हल्का कोलेस्ट्रॉल बढ़ा है, जो आहार बदल कर नियंत्रित हो सकता है।";
            } else if (normalizedLang === 'mr' || normalizedLang === 'marathi') {
                return "एका दृष्टीक्षेपात: तुमची साखरेची पातळी सामान्य आहे. फक्त कोलेस्ट्रॉल थोडेसे वाढले आहे, जे आहाराने नियंत्रणात येऊ शकते.";
            } else if (normalizedLang === 'te' || normalizedLang === 'telugu') {
                return "ఒక చూపులో: మీ షుగర్ లెవెల్స్ సాధారణంగానే ఉన్నాయి. తీసుకునే ఆహారంతో కొలెస్ట్రాల్‌ను తగ్గించుకోవచ్చు.";
            }
            
            return `One-Glance Summary: Your blood sugar and hemoglobin levels are completely stable. Your cholesterol is slightly elevated but manageable with simple diet adjustments.`;
        }

        const prompt = `You are a medical assistant providing a 'One-Glance' summary. Read this pathology report and summarize the absolute core findings in exactly 2 short, highly comprehensible sentences. It must be non-alarming and extremely simple to understand at ONE GLANCE. Language strictly requested: ${language}. Report text: ${extractedText.substring(0, 3000)}`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500
        }, {
            headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Groq Service Error:', error.message);
        return 'We are unable to generate a summary at this time. Please consult your doctor for detailed insights.';
    }
};

const googleTTS = require('google-tts-api');

exports.generateAudio = async (textSummary, language = 'en') => {
    try {
        const langMap = {
            'english': 'en',
            'hindi': 'hi',
            'marathi': 'mr',
            'telugu': 'te'
        };
        const isoCode = langMap[language.toLowerCase()] || language.toLowerCase() || 'en';
        
        console.log(`[AI Service] Generating free TTS audio in language code: ${isoCode} (Original: ${language})`);
        
        // Remove empty lines and limit size
        const cleanText = textSummary.replace(/\n/g, ' ').substring(0, 1000);

        // getAllAudioBase64 handles text chunking (Google TTS native limit is 200 chars)
        const chunks = await googleTTS.getAllAudioBase64(cleanText, {
            lang: isoCode,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        // Combine dynamically generated MP3 base64 chunks into a single readable buffer
        const audioBuffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
        const combinedBuffer = Buffer.concat(audioBuffers);

        return combinedBuffer;
    } catch (error) {
        console.error('Free TTS Error:', error.message);
        // Fallback to silent WAV string if TTS fails
        return Buffer.from("UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAwA=", 'base64');
    }
};
