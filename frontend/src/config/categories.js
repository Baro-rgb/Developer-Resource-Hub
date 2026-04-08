/**
 * Categories Configuration
 * Danh sách categories và subcategories cho resource
 */

export const CATEGORIES = {
  BACKEND: {
    name: 'Backend',
    key: 'Backend',
    subcategories: ['API', 'Database', 'Authentication', 'Server', 'Khác'],
  },
  FRONTEND: {
    name: 'Frontend',
    key: 'Frontend',
    subcategories: ['UI Components', 'Icons', 'Animation', 'CSS/Styling', 'Khác'],
  },
  ALGORITHM: {
    name: 'Algorithm',
    key: 'Algorithm',
    subcategories: ['Data Structures', 'Sorting', 'Searching', 'Dynamic Programming', 'Khác'],
  },
  UI_DESIGN: {
    name: 'UI / Design',
    key: 'UI / Design',
    subcategories: ['UI Components', 'Icons', 'Animation', 'Design Systems', 'Khác'],
  },
  DEV_TOOLS: {
    name: 'Dev Tools',
    key: 'Dev Tools',
    subcategories: ['Code Editors', 'Testing', 'Monitoring', 'Build Tools', 'Khác'],
  },
  AI_TOOLS: {
    name: 'AI Tools',
    key: 'AI Tools',
    subcategories: ['Prompt Library', 'AI Image', 'AI Coding', 'AI Text', 'Khác'],
  },
  LEARNING: {
    name: 'Learning',
    key: 'Learning',
    subcategories: ['Tutorials', 'Courses', 'Documentation', 'Articles', 'Khác'],
  },
  DEVOPS: {
    name: 'DevOps',
    key: 'DevOps',
    subcategories: ['Docker', 'Kubernetes', 'CI/CD', 'Infrastructure', 'Khác'],
  },
  TESTING: {
    name: 'Testing',
    key: 'Testing',
    subcategories: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Performance', 'Khác'],
  },
  PRODUCTIVITY: {
    name: 'Productivity',
    key: 'Productivity',
    subcategories: ['Project Management', 'Note Taking', 'Collaboration', 'Automation', 'Khác'],
  },
  HISTORY_AI: {
    name: 'History AI',
    key: 'History AI',
    subcategories: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Khác'],
  },
  TIKTOK_CHANNELS: {
    name: 'TIKTOK CHANNELS',
    key: 'TIKTOK CHANNELS',
    subcategories: ['Programming', 'Design', 'Business', 'Education', 'Khác'],
  },
  TIKTOK_PHOTOS: {
    name: 'TikTok Photos',
    key: 'TikTok Photos',
    subcategories: ['Tips & Tricks', 'Code Snippets', 'Design Ideas', 'Tutorial', 'Khác'],
  },
};

export const getCategoriesList = () => {
  return Object.values(CATEGORIES).map(cat => ({
    name: cat.name,
    key: cat.key,
  }));
};

export const getSubcategoriesByCategory = (categoryKey) => {
  const category = Object.values(CATEGORIES).find(cat => cat.key === categoryKey);
  return category ? category.subcategories : [];
};
