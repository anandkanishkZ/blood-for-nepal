<div align="center">
  <img src="./public/logo.png" alt="Blood For Nepal Logo" width="120" height="120">
  
  # 🩸 Blood For Nepal
  
  **A modern blood donation management system connecting donors with those in need across Nepal**
  
  [![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  
</div>

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login/registration system
- 👤 **User Profiles** - Comprehensive donor profiles with blood type info
- 🌍 **Multi-language** - English and Nepali language support
- 🌙 **Dark/Light Mode** - Modern UI with theme switching
- 📱 **Responsive Design** - Optimized for all devices
- 🔔 **Toast Notifications** - Professional user feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm

### Installation & Setup

```bash
# Clone repository
git clone <repository-url>
cd blood-for-nepal

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Setup database (ensure PostgreSQL is running)
npm run db:migrate

# Start backend server (from server directory)
npm run dev

# Start frontend (from root directory)
cd ..
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Toastify for notifications
- Lucide React for icons

**Backend:**
- Node.js with Express
- PostgreSQL with Sequelize ORM
- JWT for authentication
- bcrypt for password hashing

## 📁 Project Structure

```
blood-for-nepal/
├── 📁 src/                    # Frontend source code
│   ├── 📁 public/            # Components and pages
│   ├── 📁 utils/             # Utility functions
│   └── App.jsx               # Main application
├── 📁 server/                 # Backend source code
│   ├── 📁 controllers/       # API controllers
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API routes
│   └── server.js             # Server entry point
└── README.md                  # Documentation
```

## 🗄️ Database Schema

**Users Table:**
- Personal info (name, email, phone, address)
- Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Authentication (password, email verification)
- Permissions (donor status, role)

## 🔧 Environment Configuration

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=blood_for_nepal
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 👨‍💻 Developer

**Anand Kanishk**
- GitHub: [@anandkanishkZ](https://github.com/anandkanishkZ)
- Facebook: [@anandkanishkZ](https://facebook.com/anandkanishkZ)
- LinkedIn: [@anandkanishkZ](https://linkedin.com/in/anandkanishkZ)
- Twitter: [@anandkanishkZ](https://twitter.com/anandkanishkZ)
- Instagram: [@anandkanishkZ](https://instagram.com/anandkanishkZ)

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

---

<div align="center">
  <p><strong>Developed by <a href="https://sharmaanand.com.np">Anand KanishkZ </a> for Blood For Nepal</strong> 🇳🇵</p>
  <p><em>Saving lives through technology</em></p>
</div>
