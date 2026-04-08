# 🚀 Developer Resource Hub - Fullstack Application

## 📖 Mô tả Dự Án

Ứng dụng web fullstack để quản lý tài nguyên lập trình (Developer Resource Hub). Thay thế Google Sheets bằng một hệ thống web chuyên nghiệp.

### Tính năng chính:
- ✅ Quản lý tài nguyên (CRUD)
- ✅ Tìm kiếm & lọc (search, category, tags, subcategory)
- ✅ Đánh dấu yêu thích (Favorite/Bookmark)
- ✅ Phân trang (Pagination)
- ✅ Giao diện Dashboard (Dark mode)
- ✅ API REST đầy đủ
- ✅ Database MongoDB

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                   DEVELOPER RESOURCE HUB                    │
├──────────────────┬──────────────┬──────────────────────────┤
│                  │              │                          │
│   FRONTEND       │   BACKEND    │     DATABASE             │
│  (React.js)      │  (Express)   │    (MongoDB)             │
│                  │              │                          │
│  - Dashboard     │  - REST API  │  - Resources Collection  │
│  - Components    │  - Routes    │  - Indexes               │
│  - Services      │  - Controllers                          │
│  - Context       │  - Middleware                           │
│                  │  - Validation                           │
│                  │              │                          │
│  Port: 3000      │  Port: 4000  │  Local: 27017           │
└──────────────────┴──────────────┴──────────────────────────┘
```

### Data Flow

```
User Input (Frontend)
    ↓
React Context (State Management)
    ↓
Axios API Service
    ↓
Express Backend
    ↓
MongoDB Database
    ↓
Response → Update UI
```

---

## 📋 Database Schema

### Resources Collection

```javascript
{
  _id: ObjectId,
  title: String,              // Tên resource (required)
  url: String,                // Link (required)
  category: String,           // Enum: Backend, Frontend, AI Tools, ...
  subcategory: String,        // UI Components, Icons, Database, ...
  technologies: [String],     // React, Node.js, Python, ...
  description: String,        // Mô tả ngắn
  notes: String,              // Ghi chú cá nhân
  tags: [String],             // Tags để tìm kiếm
  isFavorite: Boolean,        // Đánh dấu yêu thích
  createdAt: Date,            // Auto
  updatedAt: Date             // Auto
}
```

### Indexes
- Full-text on `title`, `description`
- Index on `category`, `tags`, `subcategory`
- Index on `isFavorite`, `createdAt`

---

## 🧬 Project Structure

```
Developer Resource Hub/
├── backend/                          # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── models/
│   │   │   └── Resource.js          # Mongoose schema
│   │   ├── controllers/
│   │   │   └── resourceController.js # Business logic
│   │   ├── routes/
│   │   │   └── resourceRoutes.js    # API endpoints
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   └── validation.js        # Request validation
│   │   └── index.js                 # Main server
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/                         # React + Tailwind
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Categories filter
│   │   │   ├── SearchBar.jsx        # Search input
│   │   │   ├── ResourceCard.jsx     # Resource card
│   │   │   └── ResourceForm.jsx     # Create/Edit form
│   │   ├── pages/
│   │   │   └── Dashboard.jsx        # Main page
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── context/
│   │   │   └── ResourceContext.js   # Global state (React Context)
│   │   ├── hooks/
│   │   │   └── useDebounce.js       # Custom debounce hook
│   │   ├── styles/
│   │   │   └── index.css            # Tailwind + custom styles
│   │   ├── App.jsx                  # Root component
│   │   └── index.jsx                # Entry point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── README.md                         # This file
└── SETUP.md                          # Detailed setup guide
```

---

## ⚡ Quick Start (5 phút)

### 1. Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local hoặc MongoDB Atlas)

### 2. Backend Setup

```bash
# Vào folder backend
cd backend

# Cài dependencies
npm install

# Copy .env.example -> .env
cp .env.example .env

# Chỉnh sửa .env (nếu dùng MongoDB Atlas)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Chạy backend server (dev mode)
npm run dev

# Terminal sẽ hiển thị:
# ✅ MongoDB connected successfully
# Server running on port 4000
```

### 3. Frontend Setup

```bash
# Vào folder frontend (terminal mới)
cd frontend

# Cài dependencies
npm install

# Copy .env.example -> .env (optional)
cp .env.example .env

# Chạy frontend development server
npm start

# Browser sẽ mở http://localhost:3000 tự động
```

### 4. Test the Application

- Mở http://localhost:3000
- Click "➕ Add New Resource"
- Điền form và nhấn "Create"
- Xem resource xuất hiện trong danh sách
- Test Search, Filter, Edit, Delete

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### Get Resources
```http
GET /resources

Query Parameters:
- search=<string>           # Full-text search
- category=<string>        # Filter by category
- tag=<string>            # Filter by tag (multiple: ?tag=js&tag=frontend)
- subcategory=<string>    # Filter by subcategory
- isFavorite=true|false   # Filter favorites
- page=<number>           # Page number (default: 1)
- limit=<number>          # Items per page (default: 10)

Example:
GET /resources?search=React&category=Frontend&page=1&limit=10
```

#### Get Single Resource
```http
GET /resources/:id
```

#### Create Resource
```http
POST /resources
Content-Type: application/json

{
  "title": "React Documentation",
  "url": "https://react.dev",
  "category": "Frontend",
  "subcategory": "UI Components",
  "description": "Official React docs",
  "technologies": ["JavaScript", "React"],
  "tags": ["javascript", "frontend"],
  "isFavorite": false
}
```

#### Update Resource
```http
PUT /resources/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "isFavorite": true
}
// Chỉ cần gửi fields cần update
```

#### Delete Resource
```http
DELETE /resources/:id
```

#### Get Categories
```http
GET /resources/categories
```

#### Get All Tags
```http
GET /resources/tags
```

---

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ORM
- **Joi** - Schema validation
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### Development
- **Nodemon** - Auto-reload (backend)
- **react-scripts** - CRA build tools

---

## 🎨 UI Components

### Sidebar
- Hiển thị danh sách categories
- Click để filter
- Reset filters button

### SearchBar
- Full-text search input
- Debounced 500ms
- Clear button

### ResourceCard
- Title, description, category
- Tags, technologies badges
- Visit, Edit, Delete buttons
- Favorite toggle (⭐)
- Created/Updated dates

### ResourceForm
- Create/Edit form
- Required fields validation
- Add multiple technologies
- Add multiple tags
- Favorite checkbox

### Dashboard
- Grid layout (responsive)
- Sidebar + Main content
- Search + Filter
- Pagination
- Empty state
- Loading state
- Error handling

---

## 🔑 Key Features

### 1. Search Functionality
- Full-text search trên title và description
- Search debounced 500ms (ngăn API calls quá thường xuyên)
- Instant results

### 2. Filtering
- **By Category**: Backend, Frontend, AI Tools, ...
- **By Tag**: Multi-select tags
- **By Subcategory**: UI Components, Icons, ...
- **Favorites Only**: Chỉ hiển thị resources đánh dấu
- **All filters can combine**

### 3. CRUD Operations
- **Create**: Tạo resource mới
- **Read**: Xem danh sách + chi tiết
- **Update**: Sửa resource
- **Delete**: Xóa resource (với confirmation)

### 4. Pagination
- 10 items per page (customizable)
- Previous/Next buttons
- Page indicator

### 5. Favorite/Bookmark
- ⭐ Toggle favorite status
- Filter by favorites
- Persistent in database

---

## 🚀 Advanced Usage

### Custom API Base URL

**Frontend** (.env):
```
REACT_APP_API_URL=https://your-api.com/api
```

### MongoDB Atlas (Cloud)

**Backend** (.env):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Environment Variables

**Backend** (.env):
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dev-hub
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (.env):
```
REACT_APP_API_URL=http://localhost:4000/api
```

---

## 🧪 Manual Testing

### Test Create
```bash
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Resource",
    "url": "https://example.com",
    "category": "Frontend",
    "description": "A test resource"
  }'
```

### Test Search
```bash
curl http://localhost:4000/api/resources?search=React
```

### Test Filter
```bash
curl http://localhost:4000/api/resources?category=Frontend&page=1&limit=5
```

### Test Update
```bash
curl -X PUT http://localhost:4000/api/resources/[ID] \
  -H "Content-Type: application/json" \
  -d '{"isFavorite": true}'
```

### Test Delete
```bash
curl -X DELETE http://localhost:4000/api/resources/[ID]
```

---

## 📚 Documentation Files

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [SETUP.md](./SETUP.md) - Step-by-step setup guide (nếu có)

---

## 💡 Development Tips

### Backend
1. **Logging**: Thêm console.log để debug
2. **Postman**: Sử dụng Postman để test APIs
3. **MongoDB Compass**: GUI để visualize database
4. **Error handling**: Check error handler middleware
5. **Validation**: Tất cả inputs được validate bằng Joi

### Frontend
1. **React DevTools**: Chrome extension để debug
2. **Network tab**: Kiểm tra API calls
3. **Console**: Xem logs và errors
4. **Dark mode**: Tất cả UI trong dark theme
5. **Responsive**: Test trên mobile (F12 → Device mode)

---

## 🔐 Security Notes

- ✅ Input validation (Joi)
- ✅ CORS configuration
- ❌ Không có authentication (can thêm sau)
- ❌ Không có rate limiting (can thêm sau)
- ❌ Không có logging system (can thêm sau)

### Mở rộng bảo mật:
- [ ] Add JWT authentication
- [ ] Add role-based authorization
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Add helmet (security headers)
- [ ] Add request sanitization

---

## 🚀 Production Deployment

### Backend (Heroku / Railway / Render)
1. Tạo MongoDB Atlas cluster (free)
2. Set environment variables
3. Deploy Node.js app
4. Update CORS_ORIGIN

### Frontend (Vercel / Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Deploy automatically
4. Update REACT_APP_API_URL

---

## 📝 Coding Standards

### Backend
- 📁 MVC pattern (Models, Controllers, Routes)
- 📝 Comments on every function
- ✅ Error handling with try-catch
- 📊 Schema validation with Joi
- 🔗 Index on frequently searched fields

### Frontend
- 📦 Component-based architecture
- 📝 Comments on complex logic
- 🎨 Tailwind CSS for styling
- 🪝 Custom hooks for reusable logic
- 🌐 Context API for state management

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Ensure MongoDB is running (mongod)
2. Check MONGODB_URI in .env
3. Use MongoDB Atlas if local fails
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
1. Check frontend URL in backend CORS_ORIGIN
2. Ensure backend is running on port 4000
3. Set CORS_ORIGIN=http://localhost:3000
```

### API 404 Error
```
Error: Cannot POST /api/resources (404)

Solution:
1. Ensure backend server is running
2. Check API URL in frontend .env
3. Verify route in backend routes/resourceRoutes.js
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000

Solution:
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 📊 Database Backup & Restore

### MongoDB Local
```bash
# Backup
mongodump --db developer-resource-hub --out ./backup

# Restore
mongorestore --db developer-resource-hub ./backup/developer-resource-hub
```

### MongoDB Atlas
- Use Atlas interface
- Settings → Backup & Restore

---

## 🎯 Next Steps & Improvements

### Phase 2
- [ ] User authentication (JWT)
- [ ] User profiles
- [ ] Collections/Lists
- [ ] Sharing & collaboration
- [ ] Comments on resources

### Phase 3
- [ ] Advanced analytics
- [ ] Recommendations
- [ ] API rate limiting
- [ ] Caching (Redis)
- [ ] Full-text search optimization

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Desktop app (Electron)
- [ ] WebSocket for real-time updates

---

## 📞 Support

Nếu có lỗi hoặc câu hỏi:
1. Kiểm tra error message
2. Xem lại logs (terminal)
3. Kiểm tra .env files
4. Đảm bảo MongoDB chạy
5. Kiểm tra ports (3000, 4000)

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

## ✨ Credits

Xây dựng bằng ❤️ cho developer community.

Happy coding! 🚀
