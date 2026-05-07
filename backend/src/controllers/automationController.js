// src/controllers/automationController.js
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool } = require('../config/database');

// Helper function to extract metadata from HTML
const extractMetadata = (html, url) => {
  const $ = cheerio.load(html);
  
  // Extract Title
  let title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
  
  // Extract Description
  let description = $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || 
                    $('meta[name="twitter:description"]').attr('content') || '';
                    
  // Extract Image (Optional but good to have)
  let image = $('meta[property="og:image"]').attr('content') || 
              $('meta[name="twitter:image"]').attr('content') || '';

  // Clean up whitespace
  title = title.trim();
  description = description.trim();

  return { title, description, image, url };
};

// API Endpoint: /api/automation/fetch-meta
const fetchMeta = async (req, res) => {
  const { url } = req.body;
  const userId = req.user.id;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  try {
    // 1. Cào HTML trang web
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const metadata = extractMetadata(html, url);

    // 2. Lấy danh sách Category hiện có của user
    const catResult = await pool.query(
      'SELECT DISTINCT category FROM resources WHERE owner_id = $1 AND category IS NOT NULL',
      [userId]
    );
    const existingCategories = catResult.rows.map(r => r.category);

    // 3. Gọi Gemini AI để phân tích
    let aiData = { category: '', subcategory: '', technologies: [] };
    
    if (process.env.GEMINI_API_KEY && (metadata.title || metadata.description)) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-flash-latest based on API list models
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
          Analyze the following software/developer resource website.
          Title: "${metadata.title}"
          Description: "${metadata.description}"
          URL: "${metadata.url}"

          User's existing categories: [${existingCategories.join(', ')}]

          Task:
          1. Categorize this resource. STRICTLY PREFER using one of the "User's existing categories" if it fits well. If none fit, you may create a new, broad, standard category (e.g., "Frontend", "Backend", "AI Tools", "Database", "DevOps").
          2. Provide a Subcategory (e.g., "UI Components", "React Library", "PostgreSQL Hosting").
          3. List 1 to 4 technologies/languages/frameworks relevant to this resource.
          4. Translate or summarize the "Description" into fluent Vietnamese (Mục đích sử dụng).
          5. Write a short note (Ghi chú) in Vietnamese about what makes this resource special or useful.

          Return EXACTLY a valid JSON object with NO markdown wrapping, NO formatting, just the raw JSON:
          {
            "category": "Selected Category",
            "subcategory": "Subcategory",
            "technologies": ["Tech 1", "Tech 2"],
            "description": "Vietnamese translated description here",
            "notes": "Vietnamese notes here"
          }
        `;

        const aiResult = await model.generateContent(prompt);
        const text = aiResult.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
        aiData = JSON.parse(text);
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError.message);
        // Fallback gracefully, continue without AI tags
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...metadata,
        ...aiData
      }
    });

  } catch (error) {
    console.error('Lỗi khi fetch meta:', error.message);
    // Vẫn trả về 200 nhưng với dữ liệu rỗng để UI không bị sập hoàn toàn
    res.status(200).json({
      success: true,
      data: {
        title: '',
        description: '',
        url: url,
        error: 'Could not fetch metadata from this URL'
      }
    });
  }
};

module.exports = {
  fetchMeta
};
