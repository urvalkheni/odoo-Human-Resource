// Utility functions for exporting data to PDF and Excel

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportToPDF = (data, title, headers) => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 20)

  // Add metadata
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  // Create table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 40,
    theme: 'striped',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  })

  // Save the PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}

export const exportToExcel = (data, title, headers) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()

  // Add header row
  const wsData = [headers, ...data]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  const colWidths = headers.map(() => ({ wch: 15 }))
  ws['!cols'] = colWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)) // Excel sheet name limit

  // Save file
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}

export const exportAttendanceReport = (attendanceData) => {
  const headers = ['Employee ID', 'Name', 'Date', 'Check In', 'Check Out', 'Status']
  const data = attendanceData.map(record => [
    record.employeeId,
    record.employeeName,
    new Date(record.date).toLocaleDateString(),
    record.checkIn || 'N/A',
    record.checkOut || 'N/A',
    record.status
  ])

  return { headers, data }
}

export const exportLeaveReport = (leaveData) => {
  const headers = ['Employee ID', 'Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason']
  const data = leaveData.map(leave => [
    leave.employeeId,
    leave.employeeName,
    leave.leaveType,
    new Date(leave.startDate).toLocaleDateString(),
    new Date(leave.endDate).toLocaleDateString(),
    leave.days,
    leave.status,
    leave.reason
  ])

  return { headers, data }
}

export const exportPayrollReport = (payrollData) => {
  const headers = ['Employee ID', 'Name', 'Basic Salary', 'HRA', 'Allowances', 'Deductions', 'Net Salary']
  const data = payrollData.map(payroll => [
    payroll.employeeId,
    payroll.name,
    payroll.basicSalary,
    payroll.hra,
    payroll.allowances,
    payroll.deductions,
    payroll.netSalary
  ])

  return { headers, data }
}
