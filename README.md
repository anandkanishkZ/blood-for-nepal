# 🩸 Blood For Nepal

A comprehensive blood donation management system built to save lives across Nepal. This application connects blood donors with those in need, facilitating efficient blood donation processes.

## 🌟 Features

### Frontend (React)
- **Modern UI/UX**: Beautiful, responsive design with dark/light mode
- **Multi-language Support**: English and Nepali language options
- **User Authentication**: Secure login and registration system
- **Donor Profiles**: Comprehensive user profiles with blood type information
- **Real-time Updates**: Live blood request and donor matching
- **Mobile Responsive**: Optimized for all devices

### Backend (Node.js + PostgreSQL)
- **RESTful API**: Clean, documented API endpoints
- **Authentication**: JWT-based secure authentication
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Rate limiting, CORS, input validation
- **Error Handling**: Comprehensive error management
- **Health Monitoring**: Built-in health check endpoints

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd blood-for-nepal
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables (already configured for development)
# Edit server/.env if needed for your local database setup

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📁 Project Structure

```
blood-for-nepal/
├── 📁 public/                 # Static assets
├── 📁 src/                    # Frontend source code
│   ├── 📁 assets/            # Images, icons
│   ├── 📁 public/            # Public components & pages
│   │   ├── 📁 components/    # Reusable components
│   │   ├── 📁 context/       # React contexts
│   │   ├── 📁 data/          # Static data & translations
│   │   └── 📁 pages/         # Page components
│   ├── 📁 utils/             # Utility functions
│   ├── App.jsx               # Main App component
│   └── main.jsx              # Entry point
├── 📁 server/                 # Backend source code
│   ├── 📁 config/            # Configuration files
│   ├── 📁 controllers/       # Route controllers
│   ├── 📁 middleware/        # Express middleware
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API routes
│   ├── 📁 utils/             # Utility functions
│   ├── 📁 validators/        # Input validation
│   ├── 📁 migrations/        # Database migrations
│   └── server.js             # Server entry point
├── vite.config.js             # Vite configuration
├── package.json              # Frontend dependencies
├── server/package.json       # Backend dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (server/.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blood_for_nepal
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=blood_for_nepal_jwt_secret_development_key_2024
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Port Configuration
- **Frontend**: 5173 (development)
- **Backend**: 5000
- **Database**: 5432

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### Health Check
- `GET /health` - Server health status

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: Helmet.js security middleware
- **SQL Injection Prevention**: Sequelize ORM protection

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `full_name` (String, Required)
- `email` (String, Unique, Required)
- `password` (String, Hashed)
- `blood_type` (Enum: A+, A-, B+, B-, AB+, AB-, O+, O-)
- `phone`, `address`, `date_of_birth` (Optional)
- `is_donor`, `is_active` (Boolean)
- `role` (Enum: user, admin, moderator)
- Timestamps: `created_at`, `updated_at`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the noble cause of blood donation in Nepal
- Inspired by the need to save lives through technology
- Thanks to all contributors and blood donors

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

---

**Made with ❤️ for Nepal** 🇳🇵

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
