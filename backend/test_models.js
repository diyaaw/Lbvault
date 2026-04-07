require('dotenv').config();
const axios = require('axios');
async function run() {
    const key = process.env.GOOGLE_AI_STUDIO_API_KEY;
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        console.log(res.data.models.map(m => m.name));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
