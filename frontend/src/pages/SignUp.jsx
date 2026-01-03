import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import api from '../utils/api'
import './Auth.css'

function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return Math.min(strength, 4) // Max 4 for 100%
  }

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return ''
    if (strength === 1) return 'Weak'
    if (strength === 2) return 'Fair'
    if (strength === 3) return 'Good'
    return 'Strong'
  }

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return '#ef4444'
    if (strength === 2) return '#f59e0b'
    if (strength === 3) return '#3b82f6'
    return '#10b981'
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')

    if (name === 'password') {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (passwordStrength < 2) {
      setError('Please use a stronger password')
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...signUpData } = formData
      const response = await api.signUp(signUpData)
      login(response.user, response.token)

      if (response.user.role === 'admin' || response.user.role === 'hr') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card modern signup">
          <div className="auth-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                <path d="M2 17L12 22L22 17V7L12 12V22" fill="url(#gradient2)" opacity="0.7" />
                <defs>
                  <linearGradient id="gradient1" x1="2" y1="7" x2="22" y2="7">
                    <stop stopColor="#667eea" />
                    <stop offset="1" stopColor="#764ba2" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="2" y1="14.5" x2="22" y2="14.5">
                    <stop stopColor="#f093fb" />
                    <stop offset="1" stopColor="#f5576c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="brand-name">DayFlow HRMS</h1>
          </div>

          <div className="auth-header">
            <h2>Create Your Account</h2>
            <p>Join us and start managing your workforce</p>
          </div>

          {error && (
            <div className="error-message animate-shake">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.54 1.228 1.42.678-.099 1.339-.192 2.092-.333.656-.123 1.333.04 1.82.402.317.236.602.468.867.694a1 1 0 001.622 0c.265-.226.55-.458.867-.694.487-.362 1.164-.525 1.82-.402.753.14 1.414.234 2.092.333.819.12 1.478-.64 1.228-1.42l-.818-2.552c-.195-.61-.726-.99-1.383-.99H6.383c-.657 0-1.188.38-1.383.99z" />
                  </svg>
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                </svg>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill" 
                      style={{ 
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength)
                      }}
                    ></div>
                  </div>
                  <span 
                    className="password-strength-label"
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
              )}
              <div className="password-requirements">
                <div className={formData.password.length >= 8 ? 'requirement met' : 'requirement'}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  At least 8 characters
                </div>
                <div className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'requirement met' : 'requirement'}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  Uppercase & lowercase letters
                </div>
                <div className={/\d/.test(formData.password) ? 'requirement met' : 'requirement'}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  At least one number
                </div>
                <div className={/[^a-zA-Z0-9]/.test(formData.password) ? 'requirement met' : 'requirement'}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  Special character (!@#$%...)
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    {formData.password === formData.confirmPassword ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                    )}
                  </svg>
                  {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin" className="link-gradient">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
