const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');

exports.generateAndStoreAudio = async (textSummary, language = 'en') => {
    try {
        const langMap = {
            'english': 'en',
            'hindi': 'hi',
            'marathi': 'mr',
            'telugu': 'te'
        };
        const isoCode = langMap[language.toLowerCase()] || language.toLowerCase() || 'en';
        
        console.log(`[TTS Service] Generating TTS audio in language code: ${isoCode}`);
        
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

        // Emulate Cloud Storage (S3 / Cloudinary) by saving to a public uploads directory
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const fileName = `voice_summary_${Date.now()}_${isoCode}.mp3`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, combinedBuffer);
        
        // Return the pseudo-public URL
        return `/uploads/audio/${fileName}`;
    } catch (error) {
        console.error('Free TTS Error:', error.message);
        throw new Error('TTS Generation Failed');
    }
};
