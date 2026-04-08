# Developer Resource Hub - Backend API

## 📋 Mô tả

Backend API cho ứng dụng Developer Resource Hub, được xây dựng bằng Node.js + Express + MongoDB.

## 🗂️ Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Kết nối MongoDB
│   ├── controllers/
│   │   └── resourceController.js # Business logic
│   ├── models/
│   │   └── Resource.js          # MongoDB schema
│   ├── routes/
│   │   └── resourceRoutes.js    # API endpoints
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validation.js        # Request validation
│   └── index.js                 # Server chính
├── .env.example                 # Environment variables
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình environment

```bash
# Copy .env.example thành .env
cp .env.example .env

# Chỉnh sửa .env nếu cần (port, MongoDB URI, v.v.)
```

### 3. Khởi động MongoDB

#### Nếu dùng MongoDB local:
```bash
# Trên Windows (nếu MongoDB đã cài đặt)
mongod

# Hoặc dùng MongoDB Atlas (cloud):
# - Tạo cluster trên mongodb.com
# - Copy connection string vào .env
```

### 4. Chạy server

```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:4000`

## 📡 API Endpoints

### Resource Management

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/resources` | Lấy danh sách resources |
| GET | `/api/resources/:id` | Lấy chi tiết resource |
| POST | `/api/resources` | Tạo resource mới |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Xóa resource |

### Filters & Search

| Query Parameter | Mô tả | Ví dụ |
|-----------------|-------|-------|
| `search` | Full-text search | `?search=React` |
| `category` | Lọc theo category | `?category=Frontend` |
| `tag` | Lọc theo tag | `?tag=javascript` |
| `subcategory` | Lọc theo subcategory | `?subcategory=UI+Components` |
| `isFavorite` | Lọc favorites | `?isFavorite=true` |
| `page` | Số trang (default: 1) | `?page=2` |
| `limit` | Số items/trang (default: 10) | `?limit=20` |

### Metadata

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/resources/categories` | Lấy danh sách categories |
| GET | `/api/resources/tags` | Lấy danh sách tags |

## 📝 Request/Response Examples

### Tạo Resource

```bash
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Documentation",
    "url": "https://react.dev",
    "category": "Frontend",
    "subcategory": "UI Components",
    "description": "Official React documentation",
    "technologies": ["JavaScript", "React"],
    "tags": ["javascript", "frontend", "ui"],
    "isFavorite": false
  }'
```

### Tìm kiếm Resources

```bash
# Search bỏ nút "React"
curl "http://localhost:4000/api/resources?search=React"

# Lọc theo category + pagination
curl "http://localhost:4000/api/resources?category=Frontend&page=1&limit=10"

# Lọc theo multiple tags
curl "http://localhost:4000/api/resources?tag=javascript&tag=frontend"
```

### Lấy Chi tiết Resource

```bash
curl http://localhost:4000/api/resources/[RESOURCE_ID]
```

### Update Resource

```bash
curl -X PUT http://localhost:4000/api/resources/[RESOURCE_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "isFavorite": true
  }'
```

### Xóa Resource

```bash
curl -X DELETE http://localhost:4000/api/resources/[RESOURCE_ID]
```

## 🛡️ Error Handling

Server trả về error response với format chuẩn:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // (optional - cho validation errors)
}
```

## 📊 Database Schema

### Resource Collection

```javascript
{
  _id: ObjectId,
  title: String,
  url: String,
  category: String (enum),
  subcategory: String,
  technologies: [String],
  description: String,
  notes: String,
  tags: [String],
  isFavorite: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `title_text, description_text`: Full-text search
- `category`: Filter by category
- `tags`: Filter by tags
- `subcategory`: Filter by subcategory
- `isFavorite`: Quick favorite filter
- `createdAt`: Sort by newest

## 🔧 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/developer-resource-hub

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📚 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ORM
- **cors**: Cross-Origin Resource Sharing
- **joi**: Schema validation
- **dotenv**: Environment variables
- **express-async-errors**: Async error handling

## 💡 Developer Tips

1. **Logging**: Thêm console.log/console.error để debug
2. **Database**: Dùng MongoDB Compass để visualize data
3. **Testing**: Dùng Postman/Insomnia để test API
4. **Validation**: Tất cả inputs được validate bằng Joi
5. **Errors**: Global error handler ở middleware/errorHandler.js

## 🚀 Mở rộng trong tương lai

- [ ] Authentication (JWT)
- [ ] Authorization (Role-based)
- [ ] Rate limiting
- [ ] Logging system
- [ ] Unit tests
- [ ] API documentation (Swagger)
