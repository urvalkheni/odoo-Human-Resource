const API_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Auth
  async signUp(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Employees
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`);
  }

  async getProfile() {
    return this.request('/employees/profile');
  }

  async updateEmployee(id, data) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Attendance
  async getAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/attendance${query ? `?${query}` : ''}`);
  }

  async checkIn() {
    return this.request('/attendance/checkin', {
      method: 'POST',
    });
  }

  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async markAttendance(data) {
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Leaves
  async getLeaves() {
    return this.request('/leaves');
  }

  async getLeaveBalance(employeeId) {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return this.request(`/leaves/balance${query}`);
  }

  async applyLeave(data) {
    return this.request('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeaveStatus(id, data) {
    return this.request(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payroll
  async getPayroll(employeeId) {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return this.request(`/payroll${query}`);
  }

  async updatePayroll(employeeId, data) {
    return this.request(`/payroll/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSalarySlip(employeeId, month, year) {
    const query = new URLSearchParams({ month, year }).toString();
    return this.request(`/payroll/slip/${employeeId}?${query}`);
  }
}

export default new ApiService();
