# 🔧 Dayflow HRMS - Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation Issues

#### Problem: "npm install" fails

```powershell
# Solution: Clean and reinstall
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
```

#### Problem: Module not found errors

```powershell
# Solution: Install all dependencies
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 2. Port Issues

#### Problem: "Port 5000 is already in use"

**Solution 1**: Stop the process using the port

```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Solution 2**: Change the port in `backend/.env`

```env
PORT=5001
```

#### Problem: "Port 3000 is already in use"

**Solution**: Change the port in `frontend/vite.config.js`

```javascript
export default defineConfig({
  server: {
    port: 3001,
  },
})
```

### 3. CORS Errors

#### Problem: "CORS policy blocked" in browser console

**Solution**: Ensure both servers are running

```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Verify proxy configuration** in `frontend/vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### 4. Login Issues

#### Problem: "Invalid credentials" error

**Check these:**

1. Backend server is running on port 5000
2. Using correct credentials:
   - Admin: admin@dayflow.com / Admin@123
   - Employee: employee@dayflow.com / Employee@123
3. Check browser console for errors
4. Check backend terminal for request logs

#### Problem: "Token is not valid"

**Solution**: Clear browser storage and login again

```javascript
// In browser console
localStorage.clear()
// Then refresh and login again
```

### 5. Page Not Loading

#### Problem: White/blank screen

**Check:**

1. Browser console for errors
2. Both servers are running
3. Correct URL: http://localhost:3000

**Solution**: Hard refresh the page

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 6. Data Not Updating

#### Problem: Changes not reflecting

**Solution**: Data is in-memory, restart backend server

```powershell
# Stop backend (Ctrl+C)
# Start again
cd backend
npm run dev
```

### 7. Styling Issues

#### Problem: CSS not loading or broken layout

**Solution**: Clear build cache and restart

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

### 8. API Errors

#### Problem: 500 Internal Server Error

**Check backend terminal for error stack trace**

Common causes:

- Missing environment variables
- Database connection issues
- Invalid request data

**Solution**: Check backend `.env` file exists:

```env
PORT=5000
JWT_SECRET=dayflow_hrms_secret_key_2026_secure_token
NODE_ENV=development
```

#### Problem: 401 Unauthorized

**Solution**: Token expired or invalid

- Logout and login again
- Check if token is being sent in Authorization header

#### Problem: 404 Not Found

**Check:**

- API endpoint URL is correct
- Backend route is defined
- Proxy configuration in vite.config.js

### 9. Build Issues

#### Problem: Build fails

```powershell
# Solution: Clean and rebuild
cd frontend
Remove-Item -Recurse -Force dist
npm run build
```

### 10. Development Server Issues

#### Problem: Hot reload not working

**Solution**: Restart Vite dev server

```powershell
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

#### Problem: Changes not reflecting

**Check:**

- File is saved
- No syntax errors
- Browser console for errors

### 11. Authentication Flow Issues

#### Problem: Redirect loop after login

**Solution**: Clear localStorage and cookies

```javascript
// Browser console
localStorage.clear()
sessionStorage.clear()
// Refresh page
```

#### Problem: User stays logged in after logout

**Solution**: Check AuthContext logout function

- Should clear localStorage
- Should redirect to signin

### 12. Responsive Design Issues

#### Problem: Layout broken on mobile

**Solution**: Check browser developer tools

```
F12 → Toggle device toolbar
Test different screen sizes
```

### 13. Performance Issues

#### Problem: Slow page loads

**Check:**

- Network tab in DevTools
- Large bundle sizes
- Too many re-renders

**Solution**:

```powershell
# Build optimized version
cd frontend
npm run build
npm run preview
```

### 14. Database Issues

#### Problem: Data lost on restart

**Note**: Using in-memory storage - this is expected behavior

**For persistent storage**: Implement MongoDB

```javascript
// Replace backend/models/database.js with MongoDB connection
```

### 15. Environment Variables

#### Problem: Environment variables not loading

**Check:**

1. `.env` file exists in backend folder
2. No spaces around `=` sign
3. Restart backend server after changes

**Example `.env`**:

```env
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## Debugging Tips

### 1. Check Browser Console

```
F12 → Console tab
Look for red errors
```

### 2. Check Backend Terminal

```
Look for error messages
Check request logs
```

### 3. Check Network Requests

```
F12 → Network tab
Filter: XHR
Check request/response
```

### 4. Verify Server Status

```powershell
# Check if backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Dayflow HRMS API is running"}
```

### 5. Test API Directly

```powershell
# Test login endpoint
$body = @{
    email = "admin@dayflow.com"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/signin -Method POST -Body $body -ContentType "application/json"
```

## Quick Diagnostic Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] Dependencies installed in all folders
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] `.env` file exists in backend
- [ ] Correct credentials being used
- [ ] Browser localStorage is not full
- [ ] Internet connection (for CDN fonts)

## Getting Help

### Check Documentation

1. [README.md](README.md) - Overview
2. [QUICK_START.md](QUICK_START.md) - Quick reference
3. [INSTALLATION.md](INSTALLATION.md) - Setup guide
4. [FEATURES.md](FEATURES.md) - Feature details
5. [ARCHITECTURE.md](ARCHITECTURE.md) - System design

### Debug Mode

Enable verbose logging in backend:

```javascript
// server.js - add this
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})
```

### Still Having Issues?

1. **Restart everything**:

   ```powershell
   # Stop all servers (Ctrl+C)
   # Clear caches
   Remove-Item -Recurse -Force frontend/node_modules/.vite
   # Restart
   npm run dev
   ```

2. **Fresh install**:

   ```powershell
   Remove-Item -Recurse -Force node_modules, frontend/node_modules, backend/node_modules
   .\install.ps1
   ```

3. **Check system requirements**:
   - Node.js v18 or higher
   - npm v8 or higher
   - Modern browser (Chrome, Firefox, Edge)

## Success Indicators

✅ Backend terminal shows: "🚀 Server running on http://localhost:5000"
✅ Frontend terminal shows: "Local: http://localhost:3000"
✅ Browser shows login page without errors
✅ Can login with demo credentials
✅ Dashboard loads with data

---

**If all else fails**: Try the nuclear option

```powershell
# Delete everything and start fresh
Remove-Item -Recurse -Force node_modules, frontend/node_modules, backend/node_modules, frontend/dist
npm cache clean --force
.\install.ps1
.\start.ps1
```

**Dayflow - We've got your back!** 💪
