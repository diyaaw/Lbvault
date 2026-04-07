const axios = require('axios');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const FormData = require('form-data');

exports.extractBiomarkersFromDocument = async (filePath) => {
    try {
        console.log(`[OCR PIPELINE] Pushing document to Refactored Python OCR Service: ${filePath}`);
        let extractedText = 'No text cleanly extracted from this file type.';

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            formData.append('enable_preprocessing', 'true');

            // Send multipart request to the Refactored Python OCR Service
            const response = await axios.post('http://127.0.0.1:5001/ocr/process', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            if (response.data && response.data.status === 'success') {
                extractedText = response.data.text;
                console.log(`[OCR PIPELINE] Received OCR text. Length: ${response.data.length}`);
            } else {
                throw new Error("Python OCR service failed or returned error structure.");
            }
        } catch (apiErr) {
            console.error('[OCR PIPELINE ERROR] Python Service failed:', apiErr.message);
            // Fallback for native text PDF parsing if service fails
            if (filePath.toLowerCase().endsWith('.pdf')) {
                console.log('[OCR PIPELINE] Falling back to pdf-parse for native PDF text extraction...');
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                if (pdfData && pdfData.text) extractedText = pdfData.text;
            }
        }

        console.log(`[OCR PIPELINE] Extracted ${extractedText.length} characters. Routing to Groq Medical Parser...`);

        // Forward to the preexisting Groq parsing module
        const aiBiomarkers = await exports.extractStructuredBiomarkers(extractedText);

        return {
            rawOcrText: extractedText,
            biomarkers: aiBiomarkers
        };
    } catch (error) {
        console.error('[EXTRACTION FATAL EXCEPTION]', error.message, error.stack);
        return {
            rawOcrText: 'Native parsing failed. Please upload a clear Text PDF or image.',
            biomarkers: []
        };
    }
};

exports.simplifyText = async (extractedText, language = 'en') => {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        
        let safeText = String(extractedText || '');
        if (safeText.trim().length === 0) {
            safeText = 'No clinical text was provided for this report.';
        }

        if (!groqApiKey || groqApiKey === 'your_groq_api_key') {
            console.log(`[AI Service] GROQ_API_KEY not configured. Falling back to multi-lingual mapped stub for ${language}`);
            
            const normalizedLang = language.toLowerCase();
            if (normalizedLang === 'hi' || normalizedLang === 'hindi') {
                return "आपके ब्लड शुगर और हीमोग्लोबिन के स्तर सामान्य हैं। केवल हल्का कोलेस्ट्रॉल बढ़ा है, जो आहार बदल कर नियंत्रित हो सकता है।\n---\nActionable Steps:\n• आहार में ताजे फल शामिल करें\n• 3 महीने में दोबारा जांच कराएं\n• अपने चिकित्सक से परामर्श लें";
            } else if (normalizedLang === 'mr' || normalizedLang === 'marathi') {
                return "तुमची साखरेची पातळी सामान्य आहे. फक्त कोलेस्ट्रॉल थोडेसे वाढले आहे, जे आहाराने नियंत्रणात येऊ शकते.\n---\nActionable Steps:\n• आहारात ताजी फळे समाविष्ट करा\n• ३ महिन्यांत पुन्हा तपासणी करा\n• डॉक्टरांचा सल्ला घ्या";
            } else if (normalizedLang === 'te' || normalizedLang === 'telugu') {
                return "మీ షుగర్ లెవెల్స్ సాధారణంగానే ఉన్నాయి. తీసుకునే ఆహారంతో కొలెస్ట్రాల్‌ను తగ్గించుకోవచ్చు.\n---\nActionable Steps:\n• తాజా పండ్లు తినండి\n• 3 నెలల్లో మళ్లీ పరీక్ష చేయించుకోండి\n• మీ వైద్యుడిని సంప్రదించండి";
            }
            
            return `Your blood sugar and hemoglobin levels are completely stable. Your cholesterol is slightly elevated but manageable.\n---\nActionable Steps:\n• Maintain a balanced diet\n• Consider a follow-up test in 3 months\n• Share these results with your primary care doctor`;
        }

        const prompt = `You are a clinical AI assistant providing a highly accurate, patient-friendly explanation of a pathology report.
Read the findings and adhere to strict global medical standards. DO NOT hallucinate. Keep the tone reassuring, warm, and extremely simple to understand (no medical jargon).

You MUST format your EXACT response like this:
(Provide a 2-3 sentence summary of the core results. Identify normal and abnormal markers plainly)
---
Actionable Steps:
• (Suggestion 1: Safe lifestyle or follow up step)
• (Suggestion 2)
• (Suggestion 3)

Language strictly requested: ${language}. Report text: ${safeText.substring(0, 3000)}`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-8b-instant',
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

exports.extractStructuredBiomarkers = async (ocrText) => {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        
        let safeText = String(ocrText || '');
        if (safeText.trim().length === 0) {
            safeText = 'No valid biomarker text available.';
        }

        if (!groqApiKey || groqApiKey === 'your_groq_api_key') {
            console.log(`[AI Service] GROQ_API_KEY not configured. Falling back to dummy structured biomarkers.`);
            // Return dummy JSON array
            return [
                { name: 'glucose', value: 105, unit: 'mg/dL', min: 70, max: 100 },
                { name: 'hemoglobin', value: 14.2, unit: 'g/dL', min: 13.5, max: 17.5 },
                { name: 'cholesterol', value: 180, unit: 'mg/dL', min: 125, max: 200 }
            ];
        }

        const prompt = `You are a clinical AI. Your sole task is to extract medical biomarker test results from the provided pathology OCR text.
Output strictly a valid JSON array of objects and absolutely nothing else. No markdown wrapping.
Each object must exactly match this structure:
{
  "name": "string (lowercase marker name, e.g., 'glucose')",
  "value": number (the float/int test result),
  "unit": "string (e.g., 'mg/dL')",
  "min": number (the minimum normal reference range value),
  "max": number (the maximum normal reference range value)
}
If min or max is not found in the text, make your best clinical guess based on the unit.

Report text: ${safeText.substring(0, 3000)}`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1, // Minimum temperature for strict JSON consistency
            response_format: { type: "json_object" } // Enforce JSON
        }, {
            headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' }
        });

        // The response format might require returning an object with the array inside, let's parse it safely
        const rawContent = response.data.choices[0].message.content;
        let parsed;
        try {
            parsed = JSON.parse(rawContent);
            // Handle if the LLM returned { "biomarkers": [...] } instead of just [...]
            if (parsed && !Array.isArray(parsed) && Array.isArray(Object.values(parsed)[0])) {
                parsed = Object.values(parsed)[0];
            } else if (!Array.isArray(parsed)) {
                parsed = [];
            }
        } catch (e) {
            console.error('[AI Extraction Error] Invalid JSON returned:', rawContent);
            parsed = [];
        }
        
        return parsed;
    } catch (error) {
        console.error('Groq Extraction Error:', error.message);
        return [];
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
