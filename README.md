# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.** ✨

[![Made with React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://reactjs.org/)
[![Made with Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete, modern, production-ready Human Resource Management System with 8 fully functional pages, built with React + Vite frontend and Node.js + Express backend.

![Status: Complete](https://img.shields.io/badge/Status-✅%20Complete-success)
![Pages: 8](https://img.shields.io/badge/Pages-8-blue)
![Features: 50+](https://img.shields.io/badge/Features-50+-orange)

## 🚀 Quick Start

### Installation

```powershell
# Using PowerShell script (Recommended)
.\install.ps1

# Or manually
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Run Application

```powershell
# Using PowerShell script (Recommended)
.\start.ps1

# Or manually
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Default Login

| Role         | Email                | Password     |
| ------------ | -------------------- | ------------ |
| **Admin**    | admin@dayflow.com    | Admin@123    |
| **Employee** | employee@dayflow.com | Employee@123 |

## ✨ Features

### 🎯 Core Modules

- **Authentication**: Secure sign-up/sign-in with JWT tokens
- **Dashboard**: Role-based dashboards (Employee & Admin)
- **Profile Management**: View and edit employee information
- **Attendance**: Check-in/out, weekly view, history tracking
- **Leave Management**: Apply, approve, track leave requests
- **Payroll**: Salary breakdown, slip generation

### 🎨 UI/UX

- Modern gradient design with vanilla CSS
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Interactive dashboards and cards
- Clean, intuitive navigation

### 🔒 Security

- JWT authentication
- Bcrypt password hashing
- Role-based access control
- Protected routes
- Input validation

## 📦 Tech Stack

| Layer          | Technology        |
| -------------- | ----------------- |
| **Frontend**   | React 18 + Vite 5 |
| **Styling**    | Vanilla CSS       |
| **Routing**    | React Router v6   |
| **State**      | Context API       |
| **Backend**    | Node.js + Express |
| **Auth**       | JWT + bcryptjs    |
| **Validation** | express-validator |

## 📄 Documentation

- 📘 **[Quick Start Guide](QUICK_START.md)** - Get started in 2 minutes
- 📗 **[Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- 📙 **[Features Documentation](FEATURES.md)** - Complete feature list
- 📕 **[Project Summary](PROJECT_SUMMARY.md)** - Architecture & implementation

## 🗂️ Project Structure

```
dayflow-hrms/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── pages/        # 8 Main Pages
│   │   ├── components/   # Reusable Components
│   │   ├── styles/       # Vanilla CSS
│   │   └── utils/        # API & Auth
│   └── package.json
│
├── backend/              # Node.js + Express
│   ├── routes/          # API Endpoints
│   ├── middleware/      # Auth Guards
│   ├── models/          # Data Models
│   └── package.json
│
└── Documentation Files
```

## 🎯 8 Pages

1. **Sign In** - Authentication page
2. **Sign Up** - User registration
3. **Employee Dashboard** - Quick access & overview
4. **Admin Dashboard** - Management & statistics
5. **Profile Management** - View/edit employee details
6. **Attendance Tracking** - Check-in/out & history
7. **Leave Management** - Apply & track leaves
8. **Payroll View** - Salary details & slips

## 🔑 Key Highlights

✅ **Production-Ready**: Clean, maintainable code
✅ **Fully Functional**: All features working end-to-end
✅ **Modern Stack**: Latest React & Node.js
✅ **Responsive Design**: Works on all devices
✅ **Secure**: Industry-standard authentication
✅ **Well-Documented**: Comprehensive guides
✅ **Easy Setup**: One-command installation
✅ **Developer-Friendly**: Clear code structure

## 🛠️ Development

```powershell
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Build for production
cd frontend && npm run build
```

## 📊 Statistics

- **Total Files**: 35+
- **Lines of Code**: 5000+
- **API Endpoints**: 20+
- **Components**: 10+
- **Features**: 50+

## 🤝 Contributing

This is a complete, production-ready project. Feel free to use it as a template or reference for your own HRMS implementations.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies and best practices.

---

**Dayflow HRMS** - Making HR management simple and elegant.

For detailed information, see [FEATURES.md](FEATURES.md) or [QUICK_START.md](QUICK_START.md)
