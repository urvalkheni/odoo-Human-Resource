import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Download, Banknote, DollarSign, TrendingUp, Loader2, X, Search, Trash2, Eye, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PayrollView = () => {
    const { user } = useAuth();

    if (user?.role === 'admin' || user?.role === 'hr') {
        return <AdminPayroll />;
    }

    return <EmployeePayroll />;
};

const EmployeePayroll = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [payrollData, setPayrollData] = useState([]);
    const [latestPayroll, setLatestPayroll] = useState(null);

    useEffect(() => {
        const fetchMyPayroll = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/payroll/my-payroll`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    const data = response.data.data || [];
                    setPayrollData(data);
                    if (data.length > 0) {
                        setLatestPayroll(data[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch payroll:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPayroll();
    }, []);

    const getMonthName = (month, year) => {
        const date = new Date(year, month - 1, 1);
        return format(date, 'MMMM yyyy');
    };

    const handleDownloadPayslip = (slip) => {
        try {
            const doc = new jsPDF();



            const safeFormat = (dateStr, formatStr) => {
                if (!dateStr) return 'N/A';
                const d = new Date(dateStr);
                return !isNaN(d.getTime()) ? format(d, formatStr) : 'Invalid Date';
            };

            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text('Dayflow HRMS', 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(100);
            const monthName = (slip.month && slip.year) ? getMonthName(slip.month, slip.year) : 'Unknown Period';
            doc.text('Payslip for ' + monthName, 14, 30);

            // Employee Details
            doc.setDrawColor(200);
            doc.line(14, 35, 196, 35);

            doc.setFontSize(10);
            doc.setTextColor(60);

            const empName = user.first_name + ' ' + user.last_name;
            doc.text(`Employee Name: ${empName}`, 14, 45);
            doc.text(`Employee ID: ${user.employee_code || user.employee_id || 'N/A'}`, 14, 50);
            doc.text(`Designation: ${user.designation || 'Employee'}`, 14, 55);



            doc.text(`Date of Payment: ${safeFormat(slip.payment_date, 'dd/MM/yyyy')}`, 120, 45);
            doc.text(`Status: ${slip.payment_status?.toUpperCase() || 'UNKNOWN'}`, 120, 50);

            // Salary Table
            const tableColumn = ["Description", "Amount (Rs)"];
            const tableRows = [];

            // Earnings
            tableRows.push([{ content: 'EARNINGS', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
            tableRows.push(['Basic Salary', parseFloat(slip.basic_salary).toLocaleString()]);

            if (slip.allowances) {
                Object.entries(slip.allowances).forEach(([key, value]) => {
                    tableRows.push([key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), parseFloat(value).toLocaleString()]);
                });
            }

            if (parseFloat(slip.overtime_amount) > 0) tableRows.push(['Overtime', parseFloat(slip.overtime_amount).toLocaleString()]);
            if (parseFloat(slip.bonus) > 0) tableRows.push(['Bonus', parseFloat(slip.bonus).toLocaleString()]);

            tableRows.push([{ content: 'GROSS EARNINGS', styles: { fontStyle: 'bold' } }, { content: parseFloat(slip.gross_salary).toLocaleString(), styles: { fontStyle: 'bold' } }]);

            // Deductions
            tableRows.push([{ content: 'DEDUCTIONS', colSpan: 2, styles: { fillColor: [255, 240, 240], fontStyle: 'bold' } }]);
            if (slip.deductions) {
                Object.entries(slip.deductions).forEach(([key, value]) => {
                    tableRows.push([key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), `-${parseFloat(value).toLocaleString()}`]);
                });
            }

            const totalDeductions = slip.deductions
                ? Object.values(slip.deductions).reduce((a, b) => a + parseFloat(b || 0), 0)
                : 0;

            tableRows.push([{ content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold', textColor: [200, 50, 50] } }, { content: `-${totalDeductions.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: [200, 50, 50] } }]);

            // Net Pay (Footer)
            tableRows.push([{ content: 'NET PAYABLE', styles: { fillColor: [220, 255, 220], fontStyle: 'bold', fontSize: 12 } }, { content: `Rs ${parseFloat(slip.net_salary).toLocaleString()}`, styles: { fillColor: [220, 255, 220], fontStyle: 'bold', fontSize: 12 } }]);

            autoTable(doc, {
                startY: 65,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [51, 51, 51], textColor: 255 }
            });

            // Footer Note
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('This is a system generated payslip and does not require signature.', 14, finalY);
            doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, finalY + 5);

            doc.save(`Payslip_${monthName}_${user.first_name}.pdf`);
        } catch (error) {
            console.error("Payslip Generation Error:", error);
            alert(`Failed to generate PDF: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Payroll</h1>

            {payrollData.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
                        No payroll records found. Contact HR if you believe this is an error.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-gradient-to-br from-[hsl(var(--primary))] to-purple-600 text-white border-0">
                            <CardHeader>
                                <CardTitle className="text-white/90 text-sm font-medium">Net Salary (Latest)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">₹{latestPayroll?.net_salary?.toLocaleString() || 0}</div>
                                <p className="text-white/80 text-xs mt-2">
                                    {latestPayroll ? getMonthName(latestPayroll.month, latestPayroll.year) : ''}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5" /> Salary Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Basic Salary</span>
                                    <span className="font-medium">₹{latestPayroll?.basic_salary?.toLocaleString() || 0}</span>
                                </div>
                                {latestPayroll?.allowances && Object.entries(latestPayroll.allowances).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-[hsl(var(--muted-foreground))] capitalize">{key.replace('_', ' ')}</span>
                                        <span className="font-medium">₹{parseFloat(value).toLocaleString()}</span>
                                    </div>
                                ))}
                                {latestPayroll?.deductions && (
                                    <div className="border-t pt-2 mt-2 space-y-1">
                                        {Object.entries(latestPayroll.deductions).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-red-500 capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-medium text-red-500">-₹{parseFloat(value).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" /> Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Gross Salary</span>
                                    <span className="font-medium">₹{latestPayroll?.gross_salary?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Overtime</span>
                                    <span className="font-medium">₹{latestPayroll?.overtime_amount?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--muted-foreground))]">Bonus</span>
                                    <span className="font-medium text-green-600">₹{latestPayroll?.bonus?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t pt-2 font-bold">
                                    <span>Net Salary</span>
                                    <span className="text-green-600">₹{latestPayroll?.net_salary?.toLocaleString() || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payslip History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-[hsl(var(--border))]">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Month</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Payment Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-[hsl(var(--muted-foreground))]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollData.map((slip) => (
                                            <tr key={slip.id} className="border-b transition-colors hover:bg-[hsl(var(--muted)/50)]">
                                                <td className="p-4 align-middle font-medium">{getMonthName(slip.month, slip.year)}</td>
                                                <td className="p-4 align-middle">
                                                    {slip.payment_date ? format(new Date(slip.payment_date), 'dd/MM/yyyy') : '-'}
                                                </td>
                                                <td className="p-4 align-middle font-mono">₹{slip.net_salary?.toLocaleString()}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                                                        ${slip.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                            slip.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {slip.payment_status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPayslip(slip)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};


const AdminPayroll = () => {
    const [loading, setLoading] = useState(true);
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewPayslip, setViewPayslip] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        employee_id: '',
        month: currentMonth,
        year: currentYear,
        basic_salary: '',
        allowances: { hra: '', transport: '', medical: '' },
        deductions: { tax: '', insurance: '', pf: '' },
        overtime_amount: 0,
        bonus: 0,
        payment_method: 'bank_transfer',
        payment_date: '',
        notes: ''
    });

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/payroll`, {
                params: { limit: 50 },
                withCredentials: true
            });
            if (response.data.success) {
                const records = response.data.data || [];
                setPayrollRecords(records);

                // Calculate stats
                const total = records.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0);
                const pending = records.filter(r => r.payment_status === 'pending').length;
                const paid = records.filter(r => r.payment_status === 'paid').length;
                setStats({ total, pending, paid });
            }
        } catch (err) {
            console.error('Failed to fetch payroll:', err);
            setError('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_URL}/employees`, {
                params: { limit: 100 },
                withCredentials: true
            });
            if (response.data.success) {
                setEmployees(response.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        }
    };

    useEffect(() => {
        fetchPayrollData();
        fetchEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/payroll`, formData, {
                withCredentials: true
            });
            if (response.data.success) {
                setSuccess('Payroll record created successfully');
                setShowModal(false);
                setFormData({
                    employee_id: '',
                    month: currentMonth,
                    year: currentYear,
                    basic_salary: '',
                    allowances: { hra: '', transport: '', medical: '' },
                    deductions: { tax: '', insurance: '', pf: '' },
                    overtime_amount: 0,
                    bonus: 0,
                    payment_method: 'bank_transfer',
                    payment_date: '',
                    notes: ''
                });
                fetchPayrollData();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create payroll');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProcessPayment = async (payrollId) => {
        try {
            await axios.put(`${API_URL}/payroll/${payrollId}/payment-status`,
                { payment_status: 'paid' },
                { withCredentials: true }
            );
            setSuccess('Payment processed successfully');
            fetchPayrollData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process payment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
        try {
            await axios.delete(`${API_URL}/payroll/${id}`, { withCredentials: true });
            setSuccess('Payroll record deleted successfully');
            fetchPayrollData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete payroll');
        }
    };

    const handlePrintPayslip = () => {
        window.print();
    };

    const getMonthName = (month, year) => {
        const date = new Date(year, month - 1, 1);
        return format(date, 'MMMM yyyy');
    };

    const filteredRecords = payrollRecords.filter(record => {
        const employeeName = `${record.employee?.first_name} ${record.employee?.last_name}`;
        return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                    {error}
                    <button onClick={() => setError('')} className="float-right">&times;</button>
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
                    {success}
                    <button onClick={() => setSuccess('')} className="float-right">&times;</button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage employee salaries and payouts</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <DollarSign className="mr-2 h-4 w-4" /> Create Payroll
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">All records this period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Banknote className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Awaiting processing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.paid}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Completed payments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                    type="text"
                    placeholder="Search by employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-md bg-[hsl(var(--background))] w-full"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-[hsl(var(--border))]">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Employee</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Period</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Gross</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Net</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-[hsl(var(--muted-foreground))]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                                No payroll records found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record) => (
                                            <tr key={record.id} className="border-b transition-colors hover:bg-[hsl(var(--muted)/50)]">
                                                <td className="p-4 align-middle font-medium">
                                                    {record.employee?.first_name} {record.employee?.last_name}
                                                </td>
                                                <td className="p-4 align-middle">{getMonthName(record.month, record.year)}</td>
                                                <td className="p-4 align-middle font-mono">₹{record.gross_salary?.toLocaleString()}</td>
                                                <td className="p-4 align-middle font-mono">₹{parseFloat(record.net_salary).toLocaleString()}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                                                        ${record.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                            record.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {record.payment_status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    {record.payment_status === 'pending' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleProcessPayment(record.id)}
                                                        >
                                                            Process Payment
                                                        </Button>
                                                    )}
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setViewPayslip(record)}>
                                                            <Eye className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Payroll Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
                    <Card className="w-full max-w-2xl shadow-2xl my-4">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Create Payroll Record</h3>
                            <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium">Employee</label>
                                        <select
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            required
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Month</label>
                                        <select
                                            value={formData.month}
                                            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {format(new Date(2024, i, 1), 'MMMM')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            min="2020"
                                            max="2030"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium">Basic Salary</label>
                                        <input
                                            type="number"
                                            value={formData.basic_salary}
                                            onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Allowances</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">HRA</label>
                                            <input
                                                type="number"
                                                value={formData.allowances.hra}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    allowances: { ...formData.allowances, hra: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">Transport</label>
                                            <input
                                                type="number"
                                                value={formData.allowances.transport}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    allowances: { ...formData.allowances, transport: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">Medical</label>
                                            <input
                                                type="number"
                                                value={formData.allowances.medical}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    allowances: { ...formData.allowances, medical: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Deductions</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">Tax</label>
                                            <input
                                                type="number"
                                                value={formData.deductions.tax}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    deductions: { ...formData.deductions, tax: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">Insurance</label>
                                            <input
                                                type="number"
                                                value={formData.deductions.insurance}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    deductions: { ...formData.deductions, insurance: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[hsl(var(--muted-foreground))]">PF</label>
                                            <input
                                                type="number"
                                                value={formData.deductions.pf}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    deductions: { ...formData.deductions, pf: e.target.value }
                                                })}
                                                className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Overtime Amount</label>
                                        <input
                                            type="number"
                                            value={formData.overtime_amount}
                                            onChange={(e) => setFormData({ ...formData, overtime_amount: e.target.value })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Bonus</label>
                                        <input
                                            type="number"
                                            value={formData.bonus}
                                            onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium">Remarks / Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            rows="2"
                                            placeholder="Optional notes..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Payroll'}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            )}

            {/* View Payslip Modal */}
            {viewPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
                    <Card className="w-full max-w-2xl shadow-2xl my-4 print:shadow-none print:w-full">
                        <div className="flex justify-between items-center p-4 border-b print:hidden">
                            <h3 className="text-lg font-semibold">Payslip Details</h3>
                            <button onClick={() => setViewPayslip(null)}><X className="h-5 w-5" /></button>
                        </div>
                        <CardContent className="p-8 print:p-8" id="printable-payslip">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold uppercase tracking-wide">Payslip</h1>
                                <p className="text-[hsl(var(--muted-foreground))]">{viewPayslip.employee?.department} Department</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                    {getMonthName(viewPayslip.month, viewPayslip.year)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Employee</p>
                                    <p className="font-medium text-lg">{viewPayslip.employee?.first_name} {viewPayslip.employee?.last_name}</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{viewPayslip.employee?.employee_code}</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize">{viewPayslip.employee?.designation}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Payment Status</p>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                                        ${viewPayslip.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {viewPayslip.payment_status}
                                    </span>
                                    {viewPayslip.payment_date && (
                                        <p className="text-sm mt-1">Paid: {format(new Date(viewPayslip.payment_date), 'dd/MM/yyyy')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-b py-6">
                                <div>
                                    <h4 className="font-semibold mb-3 uppercase text-xs tracking-wider text-[hsl(var(--muted-foreground))]">Earnings</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Basic Salary</span>
                                            <span>₹{parseFloat(viewPayslip.basic_salary).toLocaleString()}</span>
                                        </div>
                                        {viewPayslip.allowances && Object.entries(viewPayslip.allowances).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="capitalize">{k}</span>
                                                <span>₹{parseFloat(v).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {parseFloat(viewPayslip.overtime_amount) > 0 && (
                                            <div className="flex justify-between">
                                                <span>Overtime</span>
                                                <span>₹{parseFloat(viewPayslip.overtime_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {parseFloat(viewPayslip.bonus) > 0 && (
                                            <div className="flex justify-between">
                                                <span>Bonus</span>
                                                <span>₹{parseFloat(viewPayslip.bonus).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Gross Earnings</span>
                                            <span>₹{parseFloat(viewPayslip.gross_salary).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3 uppercase text-xs tracking-wider text-[hsl(var(--muted-foreground))]">Deductions</h4>
                                    <div className="space-y-2 text-sm">
                                        {viewPayslip.deductions && Object.entries(viewPayslip.deductions).map(([k, v]) => (
                                            <div key={k} className="flex justify-between text-red-600">
                                                <span className="capitalize">{k}</span>
                                                <span>-₹{parseFloat(v).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Total Deductions</span>
                                            <span>
                                                -${viewPayslip.deductions
                                                    ? Object.values(viewPayslip.deductions).reduce((a, b) => a + parseFloat(b || 0), 0).toLocaleString()
                                                    : '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center bg-[hsl(var(--muted))/30] p-4 rounded-lg">
                                <span className="font-bold text-lg">Net Pay</span>
                                <span className="font-bold text-2xl">₹{parseFloat(viewPayslip.net_salary).toLocaleString()}</span>
                            </div>

                            {viewPayslip.remarks && (
                                <div className="mt-6 text-sm">
                                    <p className="font-medium text-[hsl(var(--muted-foreground))]">Notes:</p>
                                    <p>{viewPayslip.remarks}</p>
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                                <div>
                                    <p>Dayflow HRMS</p>
                                    <p>Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                                <div className="text-right">
                                    <p>Authorized Signature</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end gap-2 print:hidden">
                            <Button variant="outline" onClick={() => setViewPayslip(null)}>Close</Button>
                            <Button onClick={handlePrintPayslip}>
                                <Printer className="h-4 w-4 mr-2" /> Print Payslip
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PayrollView;
