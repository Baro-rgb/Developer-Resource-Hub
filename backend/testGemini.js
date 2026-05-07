require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Analyze the following software/developer resource website.
      Title: "PromptHero - The best AI prompts"
      Description: "Find the best AI prompts for Midjourney, DALL-E, Stable Diffusion..."
      URL: "https://prompthero.com"

      User's existing categories: []

      Task:
      1. Categorize this resource.
      2. Provide a Subcategory.
      3. List 1 to 4 technologies/languages/frameworks relevant to this resource.

      Return EXACTLY a valid JSON object with NO markdown wrapping, NO formatting, just the raw JSON:
      {
        "category": "Selected Category",
        "subcategory": "Subcategory",
        "technologies": ["Tech 1", "Tech 2"]
      }
    `;

    console.log('Calling Gemini...');
    const aiResult = await model.generateContent(prompt);
    console.log('Result raw:', aiResult.response.text());
    
    const text = aiResult.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    console.log('Parsed:', JSON.parse(text));
  } catch (err) {
    console.error('Error details:', err);
  }
}

testGemini();
