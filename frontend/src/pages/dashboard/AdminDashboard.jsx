import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EmployeeCard from '../../components/dashboard/EmployeeCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Search, Plus, Users, Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [employeesRes, dashboardRes] = await Promise.all([
                axios.get(`${API_URL}/employees`, { params: { limit: 50 }, withCredentials: true }),
                axios.get(`${API_URL}/dashboard/admin`, { withCredentials: true }).catch(() => null)
            ]);

            if (employeesRes.data.success) {
                setEmployees(employeesRes.data.data || []);
            }
            if (dashboardRes?.data?.success) {
                setDashboardStats(dashboardRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const name = `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Calculate today's attendance stats from employees list
    const todayStats = {
        total: employees.length,
        present: dashboardStats?.today_stats?.present || 0,
        absent: dashboardStats?.today_stats?.absent || 0,
        onLeave: dashboardStats?.today_stats?.on_leave || 0
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStats.total}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Active employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                        <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{dashboardStats?.payroll_summary?.total_payroll?.toLocaleString() || 0}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Payroll (This Month)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Checked in</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{todayStats.onLeave}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Approved leave</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{dashboardStats?.pending_leaves || 0}</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Awaiting approval</p>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                        className="flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 pl-9 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button className="w-full sm:w-auto" onClick={() => navigate('/employees')}>
                    <Users className="h-4 w-4 mr-2" /> View All Employees
                </Button>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-[hsl(var(--muted-foreground))]">
                        {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                    </div>
                ) : (
                    filteredEmployees.map(emp => (
                        <EmployeeCard
                            key={emp.id}
                            employee={{
                                id: emp.id,
                                name: `${emp.first_name} ${emp.last_name}`,
                                role: emp.designation || emp.department || 'Employee',
                                status: emp.todayStatus || 'Unknown',
                                avatar: emp.profile_picture
                            }}
                            onClick={() => navigate(`/employees/${emp.id}`)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
