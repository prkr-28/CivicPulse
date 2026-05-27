# CivicPulse 📍

**CivicPulse** is a citizen-driven, civic engagement platform that empowers communities to report and resolve local infrastructure issues. Built with modern technologies (MERN stack), it enables seamless communication between citizens and local government authorities.

---

## 🌟 Features

- **📸 Photo Reports** - Upload photos of issues to provide evidence and help authorities understand problems
- **🗺️ Interactive Map** - Visualize all reported issues on an interactive Leaflet map with filters
- **🔔 Status Tracking** - Track issues from open → in-progress → resolved/rejected
- **👍 Upvote System** - Community voting to prioritize issues by importance
- **⚡ AI-Powered Descriptions** - AI assistant to improve issue descriptions
- **💬 Smart Chat Widget** - Built-in AI support chatbot for user assistance
- **📊 Admin Dashboard** - Comprehensive dashboard for administrators to manage and prioritize issues
- **🔐 Role-Based Access** - Separate experiences for citizens and administrators
- **📍 Geolocation** - Mark exact locations of issues and find nearby problems

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CivicPulse                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   React Frontend │        │  Express Backend │          │
│  │   (Port 3000)    │        │  (Port 5000)     │          │
│  └──────────────────┘        └──────────────────┘          │
│         │                            │                      │
│         ├─ Redux Toolkit State ──┐   ├─ MongoDB (Issues)   │
│         ├─ React Router          │   ├─ MongoDB (Users)    │
│         ├─ Framer Motion Anim    │   ├─ JWT Auth          │
│         ├─ Leaflet Maps          │   ├─ Cloudinary (Images)
│         ├─ Tailwind CSS          │   └─ Anthropic AI API  │
│         └─ Axios HTTP Client     └─ CORS Enabled ─────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
CivicPulse/
├── client/                              # React Frontend (Port 3000)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js        # Axios config with JWT interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation with user auth menu
│   │   │   ├── IssueCard.jsx           # Reusable issue display component
│   │   │   ├── IssuePopupCard.jsx      # Popup card for map markers
│   │   │   ├── ProtectedRoute.jsx      # Auth guard for protected pages
│   │   │   ├── StatusBadge.jsx         # Status indicator badge
│   │   │   ├── AiChatWidget.jsx        # AI support chatbot
│   │   │   └── AiDescriptionImprover.jsx # AI description enhancement
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing/home page
│   │   │   ├── Login.jsx               # User login
│   │   │   ├── Register.jsx            # User registration
│   │   │   ├── ReportIssue.jsx         # Issue reporting form
│   │   │   ├── MapPage.jsx             # Interactive map view
│   │   │   ├── IssueDetail.jsx         # Detailed issue view
│   │   │   ├── MyIssues.jsx            # User's reported issues
│   │   │   ├── AdminDashboard.jsx      # Admin control panel
│   │   │   └── AdminIssueDetail.jsx    # Admin issue details
│   │   ├── store/                      # Redux Toolkit State Management
│   │   │   ├── store.js                # Redux store config
│   │   │   ├── hooks.js                # useAppDispatch & useAppSelector
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js        # Authentication state
│   │   │   │   ├── issuesSlice.js      # Issues state & thunks
│   │   │   │   ├── adminSlice.js       # Admin stats state
│   │   │   │   ├── filterSlice.js      # Map filter state
│   │   │   │   └── uiSlice.js          # UI state
│   │   │   └── useLogout.js            # Logout hook
│   │   ├── App.jsx                     # Main app component
│   │   ├── index.js                    # React DOM render
│   │   ├── index.css                   # Global styles
│   │   └── tailwind.config.js          # Tailwind CSS config
│   ├── package.json
│   └── .env.local (configure REACT_APP_API_URL)
│
└── server/                              # Express Backend (Port 5000)
    ├── controllers/
    │   ├── authController.js           # Login/Register endpoints
    │   ├── issueController.js          # Issue CRUD operations
    │   ├── adminController.js          # Admin operations
    │   └── aiController.js             # AI integration endpoints
    ├── models/
    │   ├── User.js                     # MongoDB User schema
    │   └── Issue.js                    # MongoDB Issue schema
    ├── routes/
    │   ├── auth.js                     # /api/auth routes
    │   ├── issues.js                   # /api/issues routes
    │   ├── admin.js                    # /api/admin routes
    │   └── ai.js                       # /api/ai routes
    ├── middleware/
    │   ├── authMiddleware.js           # JWT verification
    │   └── uploadMiddleware.js         # Multer image upload config
    ├── utils/
    │   ├── cloudinary.js               # Cloudinary image upload
    │   └── sendEmail.js                # Email notifications
    ├── server.js                       # Express server entry point
    ├── package.json
    └── .env (configure DB, API keys)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   React Component             │
        │   (e.g., ReportIssue.jsx)     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Redux Slice Thunk           │
        │   (e.g., createIssue)         │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Axios Request with JWT      │
        │   (axiosInstance)             │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Express API Endpoint        │
        │   /api/issues (POST)          │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Auth Middleware             │
        │   (Verify JWT Token)          │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Controller                  │
        │   (issueController.js)        │
        └───────────────┬───────────────┘
                        │
                ┌───────┴───────┐
                │               │
                ▼               ▼
        ┌──────────────┐  ┌──────────────┐
        │  Cloudinary  │  │  MongoDB     │
        │  (Images)    │  │  (Data)      │
        └──────────────┘  └──────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                  User Registration/Login                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │   Frontend: /register or /login    │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │   POST /api/auth/register          │
    │   or /api/auth/login               │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │   Backend: authController          │
    │   - Validate credentials           │
    │   - Hash password (bcryptjs)       │
    │   - Create JWT token               │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │   Return: { token, user }          │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │   Store in localStorage & Redux    │
    │   setAxiosStore() configures auth  │
    └────────┬───────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │   All Future Requests Include JWT  │
    │   Header: Authorization: Bearer... │
    └────────────────────────────────────┘
```

---

## 🚀 Tech Stack

### Frontend

- **React 18** - UI library with hooks
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Leaflet & React-Leaflet** - Interactive maps
- **Axios** - HTTP client with interceptors
- **React Dropzone** - File upload handling

### Backend

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **Cloudinary** - Cloud image storage
- **CORS** - Cross-origin requests
- **Helmet** - Security headers
- **Anthropic SDK** - AI integration

### Utilities

- **dotenv** - Environment variables
- **React Dropzone** - File drop zones
- **React Leaflet** - Map integration

---

## 📊 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  passwordHash: String,
  role: String ("citizen" | "admin"),
  createdAt: Date
}
```

### Issue Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String ("Potholes" | "Streetlights" | "Garbage" | ...),
  status: String ("open" | "in-progress" | "resolved" | "rejected"),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  imageUrls: [String],
  reportedBy: ObjectId (ref: User),
  upvotes: [ObjectId] (ref: User),
  priorityScore: Number (0-10),
  priorityLevel: String ("Critical" | "High" | "Medium" | "Low"),
  priorityReason: String,
  priorityCalculatedAt: Date,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - User login
GET    /api/auth/profile       - Get logged-in user profile
```

### Issues (Public/User)

```
GET    /api/issues             - Get all issues (with filters)
GET    /api/issues/nearby      - Get issues near coordinates
GET    /api/issues/my          - Get user's reported issues
GET    /api/issues/:id         - Get issue details
POST   /api/issues             - Create new issue
DELETE /api/issues/:id         - Delete issue (by reporter)
PATCH  /api/issues/:id/upvote  - Upvote/downvote issue
```

### Admin

```
GET    /api/admin/issues       - Get all issues (admin view)
GET    /api/admin/stats        - Get dashboard statistics
PATCH  /api/admin/issues/:id/status        - Update issue status
POST   /api/admin/calculate-priorities     - Calculate priority scores
```

### AI Integration

```
POST   /api/ai/improve         - Improve issue description with AI
POST   /api/ai/chat            - Chat with AI support bot
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Anthropic API key (for AI features)

### Backend Setup

```bash
cd server
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/civicpulse
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF

npm start
```

### Frontend Setup

```bash
cd client
npm install

# Create .env.local file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

npm start
```

Visit: **http://localhost:3000**

---

## 👥 User Roles

### Citizen

- Report issues with photos and location
- View all issues on interactive map
- Upvote issues to prioritize them
- Track their reported issues
- Filter issues by category and status
- Use AI chatbot for support

### Administrator

- View all reported issues
- Update issue status (open → in-progress → resolved/rejected)
- Calculate priority scores based on upvotes and reports
- View dashboard statistics
- Manage and prioritize issues efficiently

---

## 🔒 Security Features

- JWT-based authentication with tokens stored in localStorage
- Password hashing with bcryptjs (10-salt rounds)
- Protected routes with ProtectedRoute component
- Axios interceptors for automatic token injection
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Environment variables for sensitive data
- Role-based access control (citizen vs admin)

---

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Mobile-optimized navigation with hamburger menu
- Touch-friendly buttons and interactions
- Optimized image loading and caching

---

## 🎨 UI/UX Features

- Smooth animations with Framer Motion
- Interactive Leaflet map with dynamic markers
- Progress indicators and loading states
- Form validation with error messages
- Toast notifications for user feedback
- Dark mode ready (color system in place)
- Accessible components (aria-labels, keyboard navigation)

---

## 🧪 Environment Variables

### Frontend (.env.local)

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)

```
MONGODB_URI=mongodb://...
PORT=5000
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ANTHROPIC_API_KEY=...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📦 Dependencies Summary

### Frontend (client/package.json)

- react, react-dom
- react-redux, @reduxjs/toolkit
- react-router-dom
- leaflet, react-leaflet
- framer-motion
- tailwindcss, postcss
- axios
- react-dropzone

### Backend (server/package.json)

- express
- mongodb, mongoose
- jsonwebtoken, bcryptjs
- multer, cloudinary
- cors, helmet
- dotenv
- @anthropic-ai/sdk

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the 'build' folder
```

### Backend (Heroku/Railway)

```bash
git push heroku main
```

Update `FRONTEND_URL` in backend environment variables to your deployed frontend URL.

---

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Project Info

**CivicPulse** connects citizens and local governments through technology, enabling communities to report and resolve infrastructure issues collaboratively.

**Tech Stack:** MERN (MongoDB, Express, React, Node.js) with Redux Toolkit, Leaflet Maps, Tailwind CSS, and Anthropic AI Integration

**Status:** Production Ready ✅

---

## 🎯 Future Enhancements

- [ ] Real-time notifications via WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Payment integration for donations
- [ ] Community badges and gamification
- [ ] Social media sharing
- [ ] Advanced search and filters

---

**Built with ❤️ by Priyanshu for better cities and communities**
