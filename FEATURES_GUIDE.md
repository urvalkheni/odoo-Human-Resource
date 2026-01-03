# 🚀 Quick Start Guide - Advanced HRMS Features

## 📋 What's New

Your HRMS now has 6 major new features:

1. 🔔 **Notification System** - Real-time alerts
2. 📊 **Analytics Dashboard** - Interactive charts
3. 📢 **Announcements** - Company-wide communication
4. 📄 **Export Reports** - PDF & Excel downloads
5. 🏖️ **Enhanced Leaves** - Better management
6. 📸 **Profile Upload** - Picture management

## ⚡ Quick Access

### Login Credentials

- **Admin**: admin@dayflow.com / Admin@123
- **Employee**: employee@dayflow.com / Employee@123

### URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Feature Guide

### 1. Notifications (All Users)

**Location:** Top bar → 🔔 Bell Icon

**Actions:**

- Click bell to open notification panel
- Red badge shows unread count
- Click notification to mark as read
- "Mark all read" for bulk action
- Click X to delete notification

**Types:**

- 📅 Leave (green)
- ⏰ Attendance (blue)
- 💰 Payroll (yellow)
- 📢 Announcement (purple)
- ✅ Approval (green)
- ❌ Rejection (red)

---

### 2. Analytics Dashboard (Admin Only)

**Location:** Sidebar → 📊 Analytics

**Features:**

- **Time Filters**: Week, Month, Year
- **Charts**:
  - Attendance Trends (Line chart)
  - Leave Requests (Doughnut chart)
  - Performance (Bar chart)
  - Departments (Progress bars)
- **Hover** over charts for details

---

### 3. Announcements (All Users)

**Location:** Sidebar → 📢 Announcements

**Admin Actions:**

1. Click "+ New Announcement"
2. Fill in:
   - Title (required)
   - Message (required)
   - Priority: Normal/High/Urgent
   - Type: General/Policy/Event/Holiday/Meeting
3. Click "Publish Announcement"

**Employee View:**

- Read all announcements
- Filter by priority (color badges)
- See type icons and timestamps

---

### 4. Export Reports (Admin)

**Location:** Reports Page → Top Right

**Steps:**

1. Go to Reports page
2. Choose export format:
   - 📄 Export PDF
   - 📊 Export Excel
3. File downloads automatically

**Available Reports:**

- Attendance Report
- Leave Report
- Payroll Report

---

### 5. Leave Management (All Users)

**Location:** Sidebar → 🏖️ Leaves

**Employee:**

- Click "Apply for Leave"
- Fill form (type, dates, reason)
- Submit
- See leave balance cards
- Get notifications on approval

**Admin:**

- View all leave requests
- Click "Approve" or "Reject"
- Add comments
- Notification sent to employee

**Features:**

- ✅ Auto-refresh every 10 seconds
- ✅ Toast notifications
- ✅ Real-time balance updates

---

### 6. Profile Picture (All Users)

**Location:** Profile Page

**Steps:**

1. Go to Profile
2. Click camera 📸 icon on picture
3. Select image (max 5MB)
4. Image uploads automatically
5. Preview shown instantly

**Supported:**

- JPG, PNG, GIF
- Max size: 5MB
- Auto-crop to circle

---

## 🎨 Navigation

### Employee Menu:

- 📊 Dashboard
- 👤 Profile
- 📅 Attendance
- 🏖️ Leaves
- 💰 Payroll
- 📢 Announcements
- 📈 Reports

### Admin Menu:

- 📊 Dashboard
- 👥 Employees
- 📅 Attendance
- 🏖️ Leaves
- 💰 Payroll
- 📊 Analytics
- 📢 Announcements
- 📈 Reports
- 👤 My Profile

---

## 🐛 Troubleshooting

### Issue: Notifications not showing

**Fix:** Allow browser notifications when prompted

### Issue: Charts not loading

**Fix:** Refresh page, check console for errors

### Issue: Export not working

**Fix:** Ensure popup blocker is disabled

### Issue: Profile picture won't upload

**Fix:**

- Check file size (< 5MB)
- Check format (JPG/PNG/GIF)
- Check backend is running

### Issue: Page not found

**Fix:** Check if you're logged in as correct role (admin vs employee)

---

## 💡 Pro Tips

1. **Notifications:**

   - Enable browser notifications for instant alerts
   - Check bell icon regularly for updates

2. **Analytics:**

   - Use Year view for long-term trends
   - Hover charts for exact numbers

3. **Announcements:**

   - Use Urgent for critical updates
   - Choose appropriate type for filtering

4. **Export:**

   - Use Excel for data analysis
   - Use PDF for formal reports

5. **Leaves:**
   - Apply leaves in advance
   - Check balance before applying

---

## 🔐 Security

- Tokens expire after session
- Passwords are bcrypt hashed
- Admin routes protected
- File upload validation
- CORS enabled

---

## 📱 Responsive Design

All features work on:

- 💻 Desktop (1920x1080)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667)

---

## 🎓 Keyboard Shortcuts

- `Esc` - Close notification panel
- `Esc` - Close announcement modal
- `Enter` - Submit forms
- `Tab` - Navigate inputs

---

## 📞 Getting Help

1. Check [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for detailed docs
2. Check [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md) for technical details
3. Check browser console for errors
4. Verify both servers are running

---

## ✅ Current Status

- ✅ Backend running on :5000
- ✅ Frontend running on :3000
- ✅ All features operational
- ✅ No compilation errors
- ✅ Dependencies installed

---

## 🎉 Start Using

1. Open http://localhost:3000
2. Login as admin or employee
3. Explore new features in sidebar
4. Click bell icon for notifications
5. Try exporting a report
6. Create an announcement (admin)
7. View analytics dashboard (admin)

**Enjoy your enterprise-grade HRMS! 🚀**
