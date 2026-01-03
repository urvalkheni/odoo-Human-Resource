import { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import Layout from '../components/Layout'
import api from '../utils/api'
import './Payroll.css'

function Payroll() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [payroll, setPayroll] = useState(null)
  const [payrolls, setPayrolls] = useState([])

  useEffect(() => {
    fetchPayroll()
  }, [])

  const fetchPayroll = async () => {
    try {
      if (isAdmin()) {
        const response = await api.getPayroll()
        setPayrolls(response.payrolls)
      } else {
        const response = await api.getPayroll(user.id)
        setPayroll(response.payroll)
      }
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadSalarySlip = async () => {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    try {
      const response = await api.getSalarySlip(user.id, month, year)
      alert(
        `Salary slip for ${response.salarySlip.month}/${response.salarySlip.year} - Net Salary: $${response.salarySlip.netSalary}`
      )
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="payroll-container">
        <div className="page-header">
          <h1>Payroll Management</h1>
          {!isAdmin() && (
            <button onClick={downloadSalarySlip} className="btn btn-primary">
              Download Salary Slip
            </button>
          )}
        </div>

        {!isAdmin() && payroll ? (
          <>
            <div className="payroll-summary">
              <div className="payroll-header-card">
                <div className="payroll-employee-info">
                  <h2>{payroll.employeeName}</h2>
                  <p className="text-secondary">{payroll.position}</p>
                  <p className="text-secondary">{payroll.department}</p>
                </div>
                <div className="payroll-net-salary">
                  <div className="net-salary-label">Net Salary</div>
                  <div className="net-salary-value">
                    ${payroll.netSalary.toLocaleString()}
                  </div>
                  <div className="net-salary-period">per month</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Earnings</h3>
                </div>
                <div className="card-body">
                  <div className="salary-breakdown">
                    <div className="salary-item">
                      <span className="salary-label">Basic Salary</span>
                      <span className="salary-value">
                        ${payroll.basic.toLocaleString()}
                      </span>
                    </div>
                    <div className="salary-item">
                      <span className="salary-label">
                        HRA (House Rent Allowance)
                      </span>
                      <span className="salary-value">
                        ${payroll.hra.toLocaleString()}
                      </span>
                    </div>
                    <div className="salary-item">
                      <span className="salary-label">Other Allowances</span>
                      <span className="salary-value">
                        ${payroll.allowances.toLocaleString()}
                      </span>
                    </div>
                    <div className="salary-item total">
                      <span className="salary-label">Total Earnings</span>
                      <span className="salary-value">
                        $
                        {(
                          payroll.basic +
                          payroll.hra +
                          payroll.allowances
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Deductions</h3>
                </div>
                <div className="card-body">
                  <div className="salary-breakdown">
                    <div className="salary-item">
                      <span className="salary-label">
                        Tax & Other Deductions
                      </span>
                      <span className="salary-value text-danger">
                        ${payroll.deductions.toLocaleString()}
                      </span>
                    </div>
                    <div className="salary-item total">
                      <span className="salary-label">Total Deductions</span>
                      <span className="salary-value text-danger">
                        ${payroll.deductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : isAdmin() ? (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Employee Payroll</h2>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Basic Salary</th>
                      <th>HRA</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.length > 0 ? (
                      payrolls.map(emp => (
                        <tr key={emp.employeeId}>
                          <td>{emp.employeeId}</td>
                          <td>{emp.employeeName}</td>
                          <td>{emp.department || 'N/A'}</td>
                          <td>{emp.position || 'N/A'}</td>
                          <td>${emp.basic.toLocaleString()}</td>
                          <td>${emp.hra.toLocaleString()}</td>
                          <td>${emp.allowances.toLocaleString()}</td>
                          <td className="text-danger">
                            ${emp.deductions.toLocaleString()}
                          </td>
                          <td>
                            <strong className="text-primary">
                              ${emp.netSalary.toLocaleString()}
                            </strong>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center text-secondary">
                          No payroll data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <p className="text-center text-secondary">
                No payroll data available
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Payroll
