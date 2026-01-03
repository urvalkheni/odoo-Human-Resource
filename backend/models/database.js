import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

// Passwords are hashed with bcrypt
// Admin@123 -> $2a$10$xQNopV0jN1tJE4SrD87qU.I/gwFVP3wi3.Pma3MTD4zhUNVq1z3.O
// Employee@123 -> $2a$10$SoXL9HJxpusuXY.bROlk/uX6Ahy3ELZA9FhrUd6TkT2po/5DHjmfW

const initialUsers = [
  {
    id: 'EMP001',
    email: 'admin@dayflow.com',
    password: '$2a$10$xQNopV0jN1tJE4SrD87qU.I/gwFVP3wi3.Pma3MTD4zhUNVq1z3.O', // Admin@123
    role: 'admin',
    name: 'Admin User',
    phone: '+1234567890',
    address: '123 Admin Street',
    department: 'Management',
    position: 'HR Manager',
    joinDate: '2023-01-15',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    salary: {
      basic: 80000,
      hra: 20000,
      allowances: 15000,
      deductions: 5000,
      netSalary: 110000
    }
  },
  {
    id: 'EMP002',
    email: 'employee@dayflow.com',
    password: '$2a$10$SoXL9HJxpusuXY.bROlk/uX6Ahy3ELZA9FhrUd6TkT2po/5DHjmfW', // Employee@123
    role: 'employee',
    name: 'John Doe',
    phone: '+1234567891',
    address: '456 Employee Avenue',
    department: 'Engineering',
    position: 'Software Developer',
    joinDate: '2023-03-20',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    salary: {
      basic: 60000,
      hra: 15000,
      allowances: 10000,
      deductions: 3000,
      netSalary: 82000
    }
  },
  {
    id: 'EMP003',
    email: 'sarah@dayflow.com',
    password: '$2a$10$SoXL9HJxpusuXY.bROlk/uX6Ahy3ELZA9FhrUd6TkT2po/5DHjmfW', // Employee@123
    role: 'employee',
    name: 'Sarah Smith',
    phone: '+1234567892',
    address: '789 Worker Lane',
    department: 'Design',
    position: 'UI/UX Designer',
    joinDate: '2023-06-10',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    salary: {
      basic: 55000,
      hra: 14000,
      allowances: 9000,
      deductions: 2800,
      netSalary: 75200
    }
  }
];

// Load data from file or use initial data
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      console.log('📦 Loaded data from file:', DB_FILE);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }

  // Return initial data
  const initialLeaveBalances = {};
  initialUsers.forEach(user => {
    initialLeaveBalances[user.id] = {
      paid: 20,
      sick: 10,
      unpaid: 0
    };
  });

  return {
    users: initialUsers,
    attendance: [],
    leaves: [],
    leaveBalances: initialLeaveBalances,
    announcements: []
  };
}

// Save data to file
export function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// Initialize database
export const db = loadData();

// Helper functions that auto-save
export const updateUser = (userId, updates) => {
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    saveData(db);
    return db.users[userIndex];
  }
  return null;
};

export const addLeave = (leave) => {
  db.leaves.push(leave);
  saveData(db);
  return leave;
};

export const updateLeave = (leaveId, updates) => {
  const leaveIndex = db.leaves.findIndex(l => l.id === leaveId);
  if (leaveIndex !== -1) {
    db.leaves[leaveIndex] = { ...db.leaves[leaveIndex], ...updates };
    saveData(db);
    return db.leaves[leaveIndex];
  }
  return null;
};

export const addAttendance = (attendance) => {
  db.attendance.push(attendance);
  saveData(db);
  return attendance;
};

export const addAnnouncement = (announcement) => {
  db.announcements.push(announcement);
  saveData(db);
  return announcement;
};

export const updateLeaveBalance = (userId, type, amount) => {
  if (!db.leaveBalances[userId]) {
    db.leaveBalances[userId] = { paid: 20, sick: 10, unpaid: 0 };
  }
  db.leaveBalances[userId][type] = amount;
  saveData(db);
  return db.leaveBalances[userId];
};
