# ⚡ Quick Reference Guide - Developer Resource Hub

## 🚀 Start Project (2 Terminals)

### Terminal 1 - Backend
```bash
cd backend
npm install              # First time only
cp .env.example .env    # First time only
npm run dev             # Runs on http://localhost:4000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install              # First time only
npm start               # Opens http://localhost:3000
```

---

## 🔗 API Quick Reference

### Base URL
```
http://localhost:4000/api
```

### Common Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | /resources | List all |
| POST | /resources | Create |
| GET | /resources/:id | Get one |
| PUT | /resources/:id | Update |
| DELETE | /resources/:id | Delete |
| GET | /resources/categories | Get categories |
| GET | /resources/tags | Get all tags |

### Query Examples
```bash
# Search
GET /resources?search=React

# Filter by category
GET /resources?category=Frontend

# Filter by tag (multiple)
GET /resources?tag=javascript&tag=frontend

# Pagination
GET /resources?page=2&limit=20

# Combine filters
GET /resources?search=react&category=Frontend&page=1
```

---

## 📝 Create Resource (curl)

```bash
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Docs",
    "url": "https://react.dev",
    "category": "Frontend",
    "subcategory": "UI Components",
    "description": "Official React documentation",
    "technologies": ["JavaScript", "React"],
    "tags": ["javascript", "frontend"]
  }'
```

---

## 🎨 Category List

- Backend
- Frontend
- Algorithm
- UI Design
- Dev Tools
- AI Tools
- Learning
- DevOps
- Testing
- Productivity

---

## 📂 File Locations

### Important Backend Files
- Server: `backend/src/index.js`
- Routes: `backend/src/routes/resourceRoutes.js`
- Controllers: `backend/src/controllers/resourceController.js`
- Models: `backend/src/models/Resource.js`
- Config: `backend/src/config/database.js`
- Middleware: `backend/src/middleware/`

### Important Frontend Files
- App: `frontend/src/App.jsx`
- Dashboard: `frontend/src/pages/Dashboard.jsx`
- Components: `frontend/src/components/`
- API Service: `frontend/src/services/api.js`
- Context: `frontend/src/context/ResourceContext.js`
- Styles: `frontend/src/styles/index.css`

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/developer-resource-hub
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:4000/api
```

---

## 🐛 Troubleshooting Commands

### Kill Process on Port
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

### Reset npm
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### Start MongoDB
```bash
# Windows (if installed as service)
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

## 📊 React Context API

### Update Filters
```javascript
const { updateFilters } = useResources();

// Update single filter
updateFilters({ category: 'Frontend' });

// Update multiple
updateFilters({ 
  search: 'react',
  category: 'Frontend'
});

// Reset all
resetFilters();
```

### Access Global State
```javascript
const { resources, filters, pagination, loading, error } = useResources();
```

---

## 🧪 Test Checklist

- [ ] Create resource
- [ ] Search by title
- [ ] Filter by category
- [ ] Edit resource
- [ ] Delete resource
- [ ] Toggle favorite
- [ ] Pagination works

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| README.md | Project overview |
| SETUP.md | Detailed setup guide |
| ARCHITECTURE.md | System design |
| QUICK_REFERENCE.md | This file |
| backend/README.md | Backend docs |
| frontend/README.md | Frontend docs |

---

## 🎯 Git Commands

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create branch
git checkout -b feature/add-auth

# Merge
git merge feature/add-auth
```

---

## 📦 NPM Commands

### Backend
```bash
npm install                   # Install packages
npm install package-name      # Add new package
npm run dev                   # Development mode
npm start                     # Production mode
npm uninstall package-name    # Remove package
```

### Frontend
```bash
npm install                   # Install packages
npm start                     # Development server
npm run build                 # Production build
npm test                      # Run tests
npm eject                     # Eject from CRA (⚠️ irreversible)
```

---

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Heroku
heroku login
heroku create app-name
git push heroku main

# Update MongoDB URL to production
```

### Frontend (Vercel/Netlify)
```bash
# Vercel
npm i -g vercel
vercel

# Or connect GitHub repo to Vercel/Netlify
```

---

## 💾 Database Backup

### MongoDB Local
```bash
# Backup
mongodump --db developer-resource-hub --out ./backup

# Restore
mongorestore --db developer-resource-hub ./backup/developer-resource-hub
```

### MongoDB Atlas
Use web interface → Backup & Restore

---

## 🔗 Useful Links

### Documentation
- Node.js: https://nodejs.org/docs
- Express: https://expressjs.com
- React: https://react.dev
- MongoDB: https://docs.mongodb.com
- Tailwind: https://tailwindcss.com

### Tools
- Postman: https://www.postman.com
- MongoDB Compass: https://www.mongodb.com/products/compass
- VS Code: https://code.visualstudio.com
- GitHub: https://github.com

---

## 📞 Common Issues & Solutions

### "Cannot find module"
```bash
npm install
```

### "Port 3000/4000 already in use"
```bash
# Kill the process
# See "Kill Process on Port" above
```

### "MongoDB connection refused"
```bash
# Start MongoDB
mongod
```

### "CORS Error"
```
Check backend .env: CORS_ORIGIN=http://localhost:3000
```

### "npm install --legacy-peer-deps"
Use when dependency conflicts occur

---

## 🎓 Code Examples

### Create Resource (Frontend)
```javascript
// components/ResourceForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  await createResource(formData);
  onSuccess();
};
```

### Get Resources (Backend)
```javascript
// controllers/resourceController.js
const resources = await Resource.find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limitNum);
```

### Update Filter (Frontend)
```javascript
// pages/Dashboard.jsx
useEffect(() => {
  fetchResources();
}, [filters.search, filters.category]);
```

---

## ✨ Tips & Tricks

1. **Debounce Search** - 500ms delay prevents API spam
2. **Full-text Index** - Makes search super fast
3. **Pagination** - Loads only 10 items at a time
4. **Dark Mode** - Already built with Tailwind
5. **Context API** - Simpler than Redux for this scale
6. **Axios Interceptors** - Can add auth headers here
7. **Lazy Loading** - React Router can lazy load components
8. **Error Boundary** - Can wrap components for better error handling

---

## 🎯 Next Immediate Actions

1. ✅ Follow SETUP.md
2. ✅ Run both servers
3. ✅ Create first resource
4. ✅ Test search & filter
5. ✅ Explore code
6. ✅ Understand architecture (ARCHITECTURE.md)
7. ✅ Plan next features

---

## 💡 Remember

```
Frontend = User sees
Backend = Brain of app
Database = Memory of app

All three work together! 🧠
```

---

**Last Updated**: 2024  
**Version**: 1.0.0

For more details, check the full documentation files.

Happy Coding! 🚀
