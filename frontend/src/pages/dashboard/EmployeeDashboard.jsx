import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { User, Clock, Calendar, DollarSign, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/dashboard/employee`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                {error}
            </div>
        );
    }

    const { today_attendance, attendance_stats, leave_stats, latest_payroll, recent_leaves, recent_attendance } = dashboardData || {};

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                        <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">
                            {today_attendance?.status || 'Not Checked In'}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {today_attendance?.check_in && !isNaN(new Date(today_attendance.check_in).getTime())
                                ? `Checked in at ${format(new Date(today_attendance.check_in), 'HH:mm')}`
                                : 'No check-in today'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Attendance</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendance_stats?.monthly_present_days || 0} Days</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {attendance_stats?.total_working_hours || 0} hrs worked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leave_stats?.pending_applications || 0} Pending</div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {leave_stats?.approved_days || 0} days used this year
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Salary</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            ₹{latest_payroll?.net_salary ? parseFloat(latest_payroll.net_salary).toLocaleString() : '0'}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {latest_payroll?.payment_status === 'paid' ? 'Paid' : latest_payroll?.payment_status || 'No records'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-600 text-white border-0">
                <CardHeader>
                    <CardTitle className="text-white">Welcome back, {user?.first_name}!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-white/80">
                        {today_attendance?.check_in
                            ? `You've been working for ${attendance_stats?.total_working_hours || 0} hours this month with ${attendance_stats?.total_overtime_hours || 0} hours overtime.`
                            : "Don't forget to check in today!"}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <Link to="/attendance" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm transition-colors">
                            View Attendance
                        </Link>
                        <Link to="/leave" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm transition-colors">
                            Request Leave
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Attendance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recent_attendance?.length > 0 ? (
                            <div className="space-y-3">
                                {recent_attendance.slice(0, 5).map((att) => {
                                    // Format TIME strings (HH:mm:ss) properly
                                    const formatTime = (timeStr) => {
                                        if (!timeStr) return '-';
                                        if (typeof timeStr === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                                            return timeStr.substring(0, 5); // Extract HH:mm
                                        }
                                        try {
                                            return format(new Date(timeStr), 'HH:mm');
                                        } catch {
                                            return timeStr;
                                        }
                                    };

                                    return (
                                        <div key={att.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{format(new Date(att.date), 'EEE, MMM d')}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {formatTime(att.check_in)} - {formatTime(att.check_out)}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs capitalize ${att.status === 'present' ? 'bg-green-100 text-green-800' :
                                                att.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {att.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-[hsl(var(--muted-foreground))] text-center py-4">No recent attendance</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Leaves */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Leave Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recent_leaves?.length > 0 ? (
                            <div className="space-y-3">
                                {recent_leaves.slice(0, 5).map((leave) => (
                                    <div key={leave.id} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium capitalize">{leave.leave_type} Leave</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')} ({leave.number_of_days} days)
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs capitalize ${leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[hsl(var(--muted-foreground))] text-center py-4">No leave applications</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
