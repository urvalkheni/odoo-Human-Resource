import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Search, Plus, Eye, Edit, Trash2, Loader2, Users, X } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const EmployeeList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/employees`, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    department: departmentFilter || undefined,
                    search: searchTerm || undefined
                },
                withCredentials: true
            });
            if (response.data.success) {
                setEmployees(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || 0
                }));
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setError('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [pagination.page, departmentFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchEmployees();
    };

    const handleDelete = async (employeeId) => {
        if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;

        try {
            await axios.delete(`${API_URL}/employees/${employeeId}`, {
                withCredentials: true
            });
            setSuccess('Employee deleted successfully');
            setError('');
            fetchEmployees();
            // Auto-dismiss success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete employee');
            setSuccess('');
        }
    };

    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            terminated: 'bg-red-100 text-red-800',
            on_leave: 'bg-blue-100 text-blue-800'
        };
        return styles[status] || styles.active;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">View and manage all employees</p>
                </div>
            </div>

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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-lg">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <input
                            type="text"
                            placeholder="Search by name or employee ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-md bg-[hsl(var(--background))] w-full"
                        />
                    </div>
                    <Button type="submit" variant="outline">Search</Button>
                </form>

                <div className="flex gap-2">
                    <select
                        value={departmentFilter}
                        onChange={(e) => {
                            setDepartmentFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Employees ({pagination.total || employees.length})
                    </CardTitle>
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Employee ID</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Name</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Department</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Designation</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Email</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">Joined</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                                No employees found
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp) => (
                                            <tr key={emp.id} className="border-b transition-colors hover:bg-[hsl(var(--muted)/50)]">
                                                <td className="p-4 align-middle font-mono text-sm">{emp.employee_id}</td>
                                                <td className="p-4 align-middle font-medium">
                                                    {emp.user?.first_name} {emp.user?.last_name}
                                                </td>
                                                <td className="p-4 align-middle">{emp.department || '-'}</td>
                                                <td className="p-4 align-middle">{emp.designation || '-'}</td>
                                                <td className="p-4 align-middle text-[hsl(var(--muted-foreground))]">{emp.user?.email}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(emp.employment_status)}`}>
                                                        {emp.employment_status?.replace('_', ' ') || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-[hsl(var(--muted-foreground))]">
                                                    {emp.date_of_joining ? format(new Date(emp.date_of_joining), 'dd/MM/yyyy') : '-'}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/employees/${emp.id}`)}
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(emp.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                        <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeList;
