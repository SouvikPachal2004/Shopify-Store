# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HappyPaws E-commerce                      │
└─────────────────────────────────────────────────────────────┘

Frontend (HTML/CSS/JS)          Backend (Node.js + Express)
┌──────────────────┐           ┌──────────────────┐
│   12 HTML Pages  │◄─────────►│   Express Server │
│                  │  REST API │                  │
│  - Home          │           │  - /api/products │
│  - Shop          │           │  - /api/cart     │
│  - Product       │           │  - /api/orders   │
│  - Cart         │           │                  │
│  - Checkout     │           └─────────┬────────┘
│  - Account      │                     │
│  - Auth         │           ┌─────────▼────────┐
│                │           │   MongoDB        │
│  JavaScript:   │           │   Database       │
│  - app.js      │           │                  │
│  - cart.js     │           │  Collections:    │
│  - auth.js     │           │  - products      │
│  - search.js   │           │  - cart          │
└──────────────────┘          └──────────────────┘
```

## User Flow

### Shopping Flow
```
Homepage → Browse Products → View Details → Add to Cart → Checkout → Order Confirmation
    ↓            ↓               ↓              ↓           ↓            ↓
index.html  shop.html    product.html   cart.html  checkout.html  order-confirmation.html
```

### Authentication Flow
```
Login/Signup → Dashboard → View Orders → Update Profile → Logout
     ↓            ↓           ↓              ↓             ↓
 login.html  account.html  account.html  account.html   (session clear)
```

## Data Flow

### Loading Products
```
User Opens Page
       ↓
app.js initializes
       ↓
Fetch /api/products
       ↓
MongoDB returns data
       ↓
Render product cards
       ↓
Display on page
```

### Adding to Cart
```
Click "Add to Cart"
       ↓
cart.js captures event
       ↓
POST /api/cart/add
       ↓
Update MongoDB
       ↓
Return updated cart
       ↓
Update UI + Show notification
```

## Component Architecture

### Frontend Components

```
Page Shell (Common Layout)
├── Header (Navigation + Icons)
├── Hero Section (Page Title)
├── Main Content (Dynamic)
└── Footer (Copyright)

Dynamic Modules:
├── Product Grid (app.js)
├── Cart Manager (cart.js)
├── Auth System (auth.js)
├── Search (search.js)
└── Forms (checkout.js)
```

### Backend Routes

```
GET  /api/products       → List all products
GET  /api/product/:id    → Get single product
GET  /api/cart           → Get current cart
POST /api/cart/add       → Add item to cart
PUT  /api/cart           → Update cart
```

## Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  compareAtPrice: Number,
  inventory: Number,
  sku: String,
  tags: [String],
  image: String,
  reviews: Number,
  rating: Number,
  collection: String
}
```

### Cart Collection
```javascript
{
  _id: ObjectId,
  items: [{
    productId: ObjectId,
    qty: Number,
    title: String,
    price: Number
  }]
}
```

## Security Layers

```
User Input → Validation → Sanitization → API Call → Database Query
    ↓           ↓             ↓            ↓           ↓
  HTML Form  Client-side   Server-side  Express    MongoDB
            Validation     Middleware    Router     Driver
```

## Performance Optimization

### Frontend
- Lazy loading images
- Debounced search
- LocalStorage caching
- Minimal DOM manipulation

### Backend
- MongoDB indexing
- Connection pooling
- Efficient queries
- CORS configuration

## File Structure Map

```
Shopify store/
│
├── Backend/
│   ├── server.js              # Main server + API routes
│   ├── .env                   # Environment config
│   ├── package.json           # Dependencies
│   └── products.json          # Static product data
│
├── Frontend/
│   ├── index.html             # Homepage
│   │
│   ├── pages/                 # All HTML pages
│   │   ├── shop.html
│   │   ├── product.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── order-confirmation.html
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── account.html
│   │   ├── search-results.html
│   │   ├── about.html
│   │   └── contact.html
│   │
│   ├── js/                    # JavaScript modules
│   │   ├── app.js            # Main app controller
│   │   ├── cart.js           # Cart management
│   │   ├── auth.js           # Authentication
│   │   ├── checkout.js       # Checkout handler
│   │   ├── search.js         # Search functionality
│   │   └── account.js        # Account dashboard
│   │
│   ├── css/                   # Stylesheets
│   │   ├── style.css         # Main styles
│   │   ├── navbar.css
│   │   ├── products.css
│   │   └── ...
│   │
│   └── assets/               # Images, icons
│
└── Documentation/
    ├── SETUP_GUIDE.md
    ├── PROJECT_SUMMARY.md
    ├── QUICK_START.md
    └── ARCHITECTURE.md (this file)
```

## Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with Flexbox/Grid
- **Vanilla JavaScript** - No frameworks
- **LocalStorage** - Session persistence
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **MongoDB Driver** - Database access
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

## Deployment Considerations

### Frontend Hosting
- Netlify
- Vercel
- GitHub Pages
- Custom server (Nginx/Apache)

### Backend Hosting
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

### Database
- MongoDB Atlas (Cloud)
- Self-hosted MongoDB
- MongoDB Altas Free Tier

## Environment Variables

```env
# Backend/.env
MONGO_URI=mongodb://localhost:27017
DB_NAME=pawmood
PORT=5000
NODE_ENV=development
```

## API Response Format

### Success Response
```json
{
  "_id": "ObjectId",
  "title": "Product Name",
  "price": 29.99,
  "image": "url",
  "rating": 4.5,
  "reviews": 120
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## State Management

### Client State
```javascript
// Stored in memory
app.products = []
app.cart = { items: [] }
app.user = null

// Stored in localStorage
localStorage.currentUser
localStorage.cart
```

### Server State
```javascript
// MongoDB collections
db.products
db.cart
db.users (future)
db.orders (future)
```

---

**This architecture provides a solid foundation for scaling and enhancement!** 🚀
