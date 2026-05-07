require('dotenv').config();

async function listModels() {
  try {
    const key = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    if (data.models) {
      console.log('Available models:');
      data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).forEach(m => {
        console.log(`- ${m.name}`);
      });
    } else {
      console.log('Error:', data);
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
