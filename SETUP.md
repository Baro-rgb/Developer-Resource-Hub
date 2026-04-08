# 📖 Setup Guide - Developer Resource Hub

## Hướng dẫn Chi Tiết Từ Đầu (Step by Step)

---

## ✅ Prerequisites

Trước khi bắt đầu, hãy chắc chắn đã cài đặt:

### 1. Node.js
```bash
# Download từ https://nodejs.org/ (LTS recommended)
# Kiểm tra installation
node --version   # v16+ hoặc v18+
npm --version    # 8+ hoặc 9+
```

### 2. MongoDB
Chọn một trong hai:

**Option A: Local MongoDB**
```bash
# Windows: Download từ https://www.mongodb.com/try/download/community
# Cài đặt và start service

# Kiểm tra
mongod --version
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản (miễn phí)
3. Tạo cluster
4. Lấy connection string

### 3. Git (tùy chọn)
```bash
git --version
```

---

## 🔧 Backend Setup (Node.js + Express + MongoDB)

### Step 1: Vào folder backend

```bash
cd backend
```

### Step 2: Cài đặt dependencies

```bash
npm install
```

Packages sẽ được cài:
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `cors` - Cross-origin support
- `joi` - Validation
- `dotenv` - Environment variables
- `nodemon` - Auto-reload (dev)

### Step 3: Cấu hình environment

```bash
# Copy .env.example -> .env
cp .env.example .env
```

**Windows:**
```bash
copy .env.example .env
```

### Step 4: Chỉnh sửa .env

Mở file `.env` bằng text editor:

```env
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/developer-resource-hub

# Option 2: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/developer-resource-hub

PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Nếu dùng MongoDB Atlas:**
1. Lấy connection string từ Atlas
2. Thay `username:password` thành credentials
3. Keep `developer-resource-hub` sau `/`

### Step 5: Khởi động MongoDB (nếu local)

**Windows:**
```bash
# Nếu MongoDB đã được cài như service
# Nó sẽ tự chạy

# Hoặc chạy manual:
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 6: Chạy backend server

```bash
# Development mode (with auto-reload)
npm run dev

# Hoặc production mode
npm start
```

**Output nên là:**
```
╔════════════════════════════════════════╗
║  Developer Resource Hub - Backend      ║
║  Server running on port 4000           ║
║  Environment: development              ║
╚════════════════════════════════════════╝
✅ MongoDB connected successfully
```

### ✅ Backend Ready!
Backend chạy tại: **http://localhost:4000**

---

## 🎨 Frontend Setup (React + Tailwind CSS)

### Step 1: Mở terminal mới (giữ backend chạy)

```bash
# Từ root folder
cd frontend
```

### Step 2: Cài đặt dependencies

```bash
npm install
```

Packages sẽ được cài:
- `react` - UI library
- `react-router-dom` - Navigation
- `axios` - HTTP client
- `tailwindcss` - Styling
- `postcss` & `autoprefixer` - CSS processing

### Step 3: Cấu hình environment (tùy chọn)

```bash
# Copy .env.example (nếu cần)
cp .env.example .env
```

**Mặc định API URL là:**
```env
REACT_APP_API_URL=http://localhost:4000/api
```

Nếu backend chạy ở port khác, chỉnh sửa giá trị này.

### Step 4: Chạy frontend development server

```bash
npm start
```

**Output nên là:**
```
On Your Network: http://192.168.1.x:3000

Compiled successfully!

The app is running at:
  http://localhost:3000
```

Browser sẽ **tự động mở** http://localhost:3000

### ✅ Frontend Ready!
Frontend chạy tại: **http://localhost:3000**

---

## 🧪 Test the Application

### 1. Mở http://localhost:3000

Bạn sẽ thấy:
- Header "Developer Resource Hub"
- Sidebar (Categories)
- Search bar
- "➕ Add New Resource" button

### 2. Tạo resource đầu tiên

Click "➕ Add New Resource"

Điền form:
```
Title: React Documentation
URL: https://react.dev
Category: Frontend
Subcategory: UI Components
Description: Official React docs
Technologies: React, JavaScript
Tags: javascript, frontend
Favorite: ☑️
```

Click "Create"

### 3. Xem resource trong danh sách

Resource mới sẽ xuất hiện trong grid.

### 4. Test Search

Nhập "React" trong SearchBar → Auto-filter

### 5. Test Filter

Click "Frontend" trong sidebar → Lọc theo category

### 6. Test Edit

Click "Edit" button trên card → Sửa → "Update"

### 7. Test Delete

Click "Delete" button → Confirm → Xóa

### 8. Test Favorite

Click ⭐ trên card → Change status

---

## 📡 API Testing (Optional - Postman/curl)

### Postman Collection

Import vào Postman để test API:

```json
POST http://localhost:4000/api/resources
Content-Type: application/json

{
  "title": "Learning React",
  "url": "https://learn.react.dev",
  "category": "Frontend",
  "description": "Official React tutorial",
  "tags": ["react", "javascript"]
}
```

### Curl Commands

```bash
# Create
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","url":"https://test.com","category":"Frontend"}'

# Get all
curl http://localhost:4000/api/resources

# Search
curl "http://localhost:4000/api/resources?search=React"

# Filter
curl "http://localhost:4000/api/resources?category=Frontend"

# Get one (replace ID)
curl http://localhost:4000/api/resources/[RESOURCE_ID]

# Update (replace ID)
curl -X PUT http://localhost:4000/api/resources/[RESOURCE_ID] \
  -H "Content-Type: application/json" \
  -d '{"isFavorite":true}'

# Delete
curl -X DELETE http://localhost:4000/api/resources/[RESOURCE_ID]
```

---

## ⚠️ Troubleshooting

### Problem: MongoDB Connection Failed

**Error:**
```
❌ MongoDB connection failed
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check MongoDB running:**
   ```bash
   # Windows - Check Services
   # Or manually start:
   mongod
   ```

2. **Check .env MONGODB_URI:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/developer-resource-hub
   ```

3. **Use MongoDB Atlas instead:**
   - Tạo cluster tại https://atlas.mongodb.com
   - Lấy connection string
   - Cập nhật .env

### Problem: PORT Already in Use

**Error:**
```
Error: listen EADDRINUSE :::4000
```

**Solution:**

```bash
# Kill process using port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -ti:4000 | xargs kill -9

# Hoặc change PORT in .env
PORT=5000
```

### Problem: CORS Error

**Error (in browser console):**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

Check `.env` in backend:
```env
CORS_ORIGIN=http://localhost:3000
```

Ensure:
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:4000

### Problem: Frontend Cannot Connect to Backend

**Error:**
```
Failed to fetch resources
Network Error
```

**Solution:**

1. Ensure backend is running:
   ```bash
   # Terminal should show:
   # Server running on port 4000
   # ✅ MongoDB connected
   ```

2. Check frontend `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   ```

3. Restart frontend:
   ```bash
   # Ctrl+C
   npm start
   ```

### Problem: npm install failures

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency
```

**Solution:**

```bash
# Try legacy flag
npm install --legacy-peer-deps

# Or clear cache
npm cache clean --force
npm install
```

---

## 📊 Verify Everything Works

### Checklist:

- ✅ Terminal 1: Backend running on http://localhost:4000
- ✅ Terminal 2: Frontend running on http://localhost:3000
- ✅ MongoDB running (local hoặc Atlas)
- ✅ Browser shows Dashboard
- ✅ Can create resource
- ✅ Can search resources
- ✅ Can filter by category
- ✅ Can edit resources
- ✅ Can delete resources

---

## 🚀 Next Steps

### 1. Add More Resources

Start adding your favorite dev resources:
- Tools
- Libraries
- Tutorials
- Articles
- Communities

### 2. Customize

Change app name, colors, etc.

### 3. Deploy

Deploy to production:
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify, GitHub Pages

### 4. Add Features

- User authentication
- Collections/Lists
- Sharing
- Comments
- Analytics

---

## 📚 File Structure Quick Reference

### Backend Key Files

```
backend/src/
├── index.js                    # Main server
├── config/
│   └── database.js            # MongoDB connection
├── models/
│   └── Resource.js            # Schema
├── controllers/
│   └── resourceController.js  # Business logic
├── routes/
│   └── resourceRoutes.js      # API endpoints
└── middleware/
    ├── errorHandler.js        # Error handling
    └── validation.js          # Input validation
```

### Frontend Key Files

```
frontend/src/
├── App.jsx                    # Root component
├── index.jsx                  # Entry point
├── components/
│   ├── Sidebar.jsx           # Category filter
│   ├── SearchBar.jsx         # Search
│   ├── ResourceCard.jsx      # Resource display
│   └── ResourceForm.jsx      # Create/Edit form
├── pages/
│   └── Dashboard.jsx         # Main page
├── services/
│   └── api.js                # API client
├── context/
│   └── ResourceContext.js    # Global state
├── hooks/
│   └── useDebounce.js        # Debounce hook
└── styles/
    └── index.css             # Tailwind styles
```

---

## 📞 Need Help?

1. **Check README.md** - Main documentation
2. **Check backend/README.md** - Backend docs
3. **Check frontend/README.md** - Frontend docs
4. **Check console/terminal** - Error messages
5. **Check browser DevTools** - Network/Console tabs

---

## 🎉 You're All Set!

Enjoy your Developer Resource Hub! 🚀

```
   ___  ____  ____  ___  ____  ____  ___  ____ 
  / __ \/ __ \/ __ \/ _ / __ \/ __ \/ _ \/ __ \
 / /_/ / / / / / / / __/ / / / /_/ / __/ __/
 \____/ /_/ / /_/ /___/ /_/ / _, _/___/___/
     Happy Coding! 🚀
```
