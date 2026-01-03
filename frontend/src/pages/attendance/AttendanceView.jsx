import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AttendanceView = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'hr';

    // Admin states
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    // ... existing states ...
    const [attendanceData, setAttendanceData] = useState([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [error, setError] = useState('');
    const [todayAttendance, setTodayAttendance] = useState(null);

    // Fetch today's attendance status
    const fetchTodayAttendance = async () => {
        try {
            const response = await axios.get(`${API_URL}/attendance/today`, {
                withCredentials: true
            });
            if (response.data.success && response.data.data) {
                setTodayAttendance(response.data.data);
                if (response.data.data.check_in && !response.data.data.check_out) {
                    setIsCheckedIn(true);
                    setCheckInTime(response.data.data.check_in);
                } else {
                    setIsCheckedIn(false);
                    setCheckInTime(response.data.data.check_in || null);
                }
            }
        } catch (err) {
            console.log('No attendance for today');
        }
    };

    // Fetch employees for filter
    useEffect(() => {
        if (isAdmin) {
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
            fetchEmployees();
        }
    }, [isAdmin]);

    // Fetch attendance history
    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            let url = `${API_URL}/attendance/my-history`;
            let params = { start_date: startDate, end_date: endDate, limit: 100 };

            if (isAdmin && viewMode === 'all') {
                url = `${API_URL}/attendance`;
                if (selectedEmployee) params.employee_id = selectedEmployee;
            }

            const response = await axios.get(url, {
                params,
                withCredentials: true
            });

            if (response.data.success) {
                setAttendanceData(response.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            setError('Failed to load attendance history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    useEffect(() => {
        fetchAttendanceHistory();
    }, [currentMonth, viewMode, selectedEmployee]);

    const handleCheckAction = async () => {
        setActionLoading(true);
        setError('');
        try {
            if (!isCheckedIn) {
                // Check In
                const response = await axios.post(`${API_URL}/attendance/check-in`, {}, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setCheckInTime(response.data.data.check_in);
                    setIsCheckedIn(true);
                    setTodayAttendance(response.data.data);
                    fetchAttendanceHistory(); // Refresh the list
                }
            } else {
                // Check Out
                const response = await axios.post(`${API_URL}/attendance/check-out`, {}, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setIsCheckedIn(false);
                    fetchAttendanceHistory(); // Refresh the list
                    fetchTodayAttendance();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        if (timeString.includes('T') || timeString.includes('-')) {
            return format(new Date(timeString), 'HH:mm');
        }
        return timeString.substring(0, 5);
    };

    const formatWorkHours = (hours) => {
        if (!hours) return '00:00';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>

                {/* Check In/Out Widget - Only for own view or if user wants to check in */}
                <div className="flex items-center gap-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-2 rounded-lg shadow-sm">
                    {checkInTime && (
                        <div className="text-sm font-mono px-2 hidden md:block">
                            In: {formatTime(checkInTime)}
                        </div>
                    )}
                    <Button
                        onClick={handleCheckAction}
                        disabled={actionLoading || (todayAttendance?.check_out)}
                        className={`${isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white w-full md:w-32`}
                    >
                        {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : todayAttendance?.check_out ? (
                            'Done'
                        ) : isCheckedIn ? (
                            'Check Out'
                        ) : (
                            'Check In'
                        )}
                    </Button>
                    <div className={`h-3 w-3 rounded-full ${isCheckedIn ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                </div>
            </div>

            {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-4 bg-[hsl(var(--muted))/20] p-4 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'my' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('my')}
                            size="sm"
                        >
                            My Attendance
                        </Button>
                        <Button
                            variant={viewMode === 'all' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('all')}
                            size="sm"
                        >
                            All Employees
                        </Button>
                    </div>

                    {viewMode === 'all' && (
                        <select
                            className="h-9 w-full sm:w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* Top Controls */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="font-medium text-lg">{format(currentMonth, 'MMMM yyyy')}</span>
            </div>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{viewMode === 'all' ? 'Employee Attendance Log' : 'My Attendance Log'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/50]">
                                        {viewMode === 'all' && (
                                            <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Employee</th>
                                        )}
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Date</th>
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Check In</th>
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Check Out</th>
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Work Hours</th>
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Extra Hours</th>
                                        <th className="h-10 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan={viewMode === 'all' ? 7 : 6} className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                                No attendance records found for this period
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceData.map((row, i) => (
                                            <tr key={row.id || i} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/30]">
                                                {viewMode === 'all' && (
                                                    <td className="p-4 align-middle font-medium">
                                                        {row.employee?.first_name} {row.employee?.last_name}
                                                    </td>
                                                )}
                                                <td className="p-4 align-middle font-medium">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                                                <td className="p-4 align-middle">{formatTime(row.check_in)}</td>
                                                <td className="p-4 align-middle">{formatTime(row.check_out)}</td>
                                                <td className="p-4 align-middle font-mono">{formatWorkHours(row.working_hours)}</td>
                                                <td className="p-4 align-middle font-mono text-[hsl(var(--muted-foreground))]">{formatWorkHours(row.overtime_hours)}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`px-2 py-1 rounded text-xs capitalize ${row.status === 'present' ? 'bg-green-100 text-green-800' :
                                                        row.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                            row.status === 'half_day' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {row.status?.replace('_', ' ')}
                                                    </span>
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200">
                <strong>NOTE:</strong> Check in when you start your workday and check out when you leave. Your working hours and overtime will be calculated automatically.
            </div>
        </div>
    );
};

export default AttendanceView;
