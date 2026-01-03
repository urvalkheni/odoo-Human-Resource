# Dayflow - Human Resource Management System

> **Every workday, perfectly aligned.**

Welcome to **Dayflow**, a comprehensive Human Resource Management System (HRMS) designed to digitize and streamline operational HR tasks. This project is a full-stack web application featuring a robust Node.js backend and a modern, responsive React frontend.

---

## 🚀 Project Overview

Dayflow streamlines core HR operations including:
- **Employee Onboarding & Profiles**: Centralized database for employee information.
- **Attendance Tracking**: Real-time check-in/check-out and attendance logs.
- **Leave Management**: Unified interface for applying and approving leave.
- **Payroll Visibility**: Transparent salary structures and payslip accessibility.
- **Role-Based Access**: Specialized dashboards for Admins, HR Officers, and Employees.

## 🏗️ Technical Architecture

This project is organized as a monorepo with separate directories for the backend API and frontend client.

### Backend (`/backend`)
Built with **Node.js** and **Express**, utilizing **PostgreSQL** for data persistence.
- **Framework**: Express.js
- **Database**: PostgreSQL (v14+)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **File Storage**: Cloudinary / Local (via Multer)
- **Email Services**: Nodemailer

### Frontend (`/frontend`)
Built with **React 19** and **Vite**, styled with **Tailwind CSS**.
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts/Visualization**: Recharts
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **🔐 Secure Auth** | Role-based login (Admin/Employee), Email verification, Password reset. |
| **👥 Employee Hub** | Comprehensive profiles with personal, job, and salary details. |
| **📅 Attendance** | Daily check-in/out, logs, and status tracking (Present, Absent, Leave). |
| **🏖️ Leave System** | Easy leave application with status tracking and admin approval workflows. |
| **💰 Payroll** | Read-only payroll data and salary structure visibility for employees. |
| **📊 Dashboards** | Custom dashboards for different user roles (Admin vs. Employee). |

---

## 🛠️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/urvalkheni/odoo-Human-Resource.git
cd odoo-Human-Resource
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies.

```bash
cd backend
npm install
```

**Configuration:**
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`) and other settings.

**Database Setup:**
Create the PostgreSQL database manually or via command line:
```sql
CREATE DATABASE dayflow_hrms;
```

**Run the Server:**
```bash
# Development mode (with nodemon)
npm run dev
```
*The backend server will start on `http://localhost:5000` (or your configured port).*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies.

```bash
cd ../frontend
npm install
```

**Run the Client:**
```bash
npm run dev
```
*The frontend application will start (usually on `http://localhost:5173`).*

---

## 📂 Project Structure

```
root/
├── backend/                # Node.js API Server
│   ├── config/             # DB & App config
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Sequelize schemas
│   │   ├── routes/         # API endpoints
│   │   └── middleware/     # Auth & validation
│   └── server.js           # Entry point
│
└── frontend/               # React Client
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application views
    │   └── assets/         # Styles & images
    ├── index.html          # HTML entry point
    └── tailwind.config.js  # Styling config
```

---

> Built with ❤️ by the Dayflow Team.
