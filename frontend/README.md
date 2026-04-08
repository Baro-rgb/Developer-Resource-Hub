# Developer Resource Hub - Frontend

## 📋 Mô tả

Frontend React cho ứng dụng Developer Resource Hub với Tailwind CSS.

## 🗂️ Cấu trúc thư mục

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Danh sách categories
│   │   ├── SearchBar.jsx        # Thanh tìm kiếm
│   │   ├── ResourceCard.jsx     # Card hiển thị resource
│   │   └── ResourceForm.jsx     # Form tạo/edit resource
│   ├── pages/
│   │   └── Dashboard.jsx        # Trang chính
│   ├── services/
│   │   └── api.js               # API client (axios)
│   ├── context/
│   │   └── ResourceContext.js   # Global state
│   ├── hooks/
│   │   └── useDebounce.js       # Custom hook debounce
│   ├── styles/
│   │   └── index.css            # Global styles + Tailwind
│   ├── App.jsx                  # Root component
│   └── index.jsx                # Entry point
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
└── README.md
```

## 🚀 Installation & Setup

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình environment (tùy chọn)

```bash
# Copy .env.example (nếu cần)
cp .env.example .env

# Thiết lập API URL (mặc định: http://localhost:4000/api)
REACT_APP_API_URL=http://localhost:4000/api
```

### 3. Chạy development server

```bash
npm start
```

App sẽ chạy tại: `http://localhost:3000`

## 🏗️ Architecture

### Component Hierarchy

```
App
└── ResourceProvider (Global State)
    └── Dashboard
        ├── Sidebar (Categories)
        ├── SearchBar
        └── ResourceCard[] (Grid)
```

### Data Flow

```
User Input (Sidebar/Search)
    ↓
ResourceContext (Global State)
    ↓
API Service (axios)
    ↓
Backend API
    ↓
Response → Update State → Re-render Components
```

### Global State (Context)

```javascript
{
  resources: [],           // Danh sách resources
  pagination: {            // Pagination info
    total,
    page,
    limit,
    pages
  },
  filters: {              // Current filters
    search: '',
    category: '',
    tags: [],
    isFavorite: false
  },
  loading: false,         // Loading state
  error: null            // Error message
}
```

## 🎨 Tailwind CSS

### Custom Classes

```css
.smooth-transition   /* transition-all duration-300 */
.card               /* Dark card styling */
.btn                /* Button base styles */
.btn-primary        /* Blue button */
.btn-secondary      /* Gray button */
.btn-danger         /* Red button */
.input              /* Form input styles */
.badge              /* Badge styling */
```

## 🔧 Features

### Dashboard
- ✅ Hiển thị grid resources
- ✅ Real-time search (debounced)
- ✅ Filter by category
- ✅ Pagination
- ✅ Add/Edit/Delete resources
- ✅ Favorite toggle (⭐)

### Search & Filter
- ✅ Full-text search (title, description)
- ✅ Category filter (dropdown)
- ✅ Tag filter (multi-select)
- ✅ Subcategory filter
- ✅ Favorite filter
- ✅ Debounce search (500ms)

### Form
- ✅ Create new resource
- ✅ Edit existing resource
- ✅ Add multiple technologies
- ✅ Add multiple tags
- ✅ Mark as favorite
- ✅ Validation

## 📡 API Integration

### Service Layer (services/api.js)

```javascript
// Get resources
getResources({ search, category, tag, page, limit })

// Get single resource
getResourceById(id)

// Create resource
createResource(data)

// Update resource
updateResource(id, data)

// Delete resource
deleteResource(id)

// Get categories list
getCategories()

// Get tags list
getTags()
```

## 🪝 Custom Hooks

### useDebounce

```javascript
const debouncedValue = useDebounce(value, delay)

// Usage: Debounce search input
const debouncedSearch = useDebounce(searchInput, 500)
```

## 🎯 Performance Optimizations

1. **Debounce Search** - Ngăn API calls quá thường xuyên
2. **Lazy Loading** - Pagination thay vì load tất cả
3. **Memoization** - useCallback, useMemo
4. **Code Splitting** - React Router lazy loading

## 🚀 Build & Deploy

```bash
# Production build
npm run build

# Output: build/ folder (optimized for production)
```

### Deploy options:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting

## 💡 Developer Tips

1. **Dark Mode**: Tailwind dark mode built-in
2. **Responsive**: Fully responsive (mobile-first)
3. **Accessibility**: Semantic HTML, ARIA labels
4. **Error Handling**: Global error state
5. **Loading States**: Show spinners, disabled buttons

## 📚 Component Examples

### Using SearchBar
```jsx
<SearchBar />
// Automatically updates filters.search in context
```

### Using ResourceCard
```jsx
<ResourceCard
  resource={resource}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleFavorite={handleToggleFavorite}
/>
```

### Using Sidebar
```jsx
<Sidebar />
// Filters by category, shows reset button
```

## 🔄 State Management Flow

```
1. User types in SearchBar
   ↓
2. Input value → useDebounce (500ms)
   ↓
3. updateFilters(search: debouncedValue)
   ↓
4. Trigger useEffect (depend on filters)
   ↓
5. fetchResources(filters)
   ↓
6. API call → Response
   ↓
7. setResources(data)
   ↓
8. Component re-render with new data
```

## 🚀 Mở rộng trong tương lai

- [ ] Dark/Light mode toggle
- [ ] User authentication
- [ ] Collections/Lists
- [ ] Export to CSV
- [ ] Import from CSV
- [ ] Sort options
- [ ] Advanced filters
- [ ] Comments/Discussions
- [ ] Sharing capabilities
