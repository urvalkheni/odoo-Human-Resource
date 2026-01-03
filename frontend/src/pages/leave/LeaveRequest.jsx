import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { X, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const LeaveRequest = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [leaveBalance, setLeaveBalance] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        leave_type: 'paid',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const leaveTypes = [
        { value: 'paid', label: 'Paid Time Off' },
        { value: 'sick', label: 'Sick Leave' },
        { value: 'unpaid', label: 'Unpaid Leave' },
        { value: 'casual', label: 'Casual Leave' },
        { value: 'maternity', label: 'Maternity Leave' },
        { value: 'paternity', label: 'Paternity Leave' }
    ];

    // Fetch my leaves
    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/leaves/my-leaves`, {
                withCredentials: true
            });
            if (response.data.success) {
                setLeaves(response.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch leaves:', err);
            setError('Failed to load leave history');
        } finally {
            setLoading(false);
        }
    };

    // Fetch leave balance
    const fetchLeaveBalance = async () => {
        try {
            // Use employeeProfile.id (UUID) instead of employee_id (string code)
            const employeeId = user?.employeeProfile?.id;
            if (!employeeId) return;
            const response = await axios.get(`${API_URL}/leaves/balance/${employeeId}`, {
                withCredentials: true
            });
            if (response.data.success) {
                setLeaveBalance(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch leave balance:', err);
        }
    };

    useEffect(() => {
        fetchMyLeaves();
        fetchLeaveBalance();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/leaves`, formData, {
                withCredentials: true
            });
            if (response.data.success) {
                setSuccess('Leave application submitted successfully!');
                setShowModal(false);
                setFormData({ leave_type: 'paid', start_date: '', end_date: '', reason: '' });
                fetchMyLeaves();
                fetchLeaveBalance();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (leaveId) => {
        if (!confirm('Are you sure you want to cancel this leave application?')) return;
        try {
            await axios.put(`${API_URL}/leaves/${leaveId}/cancel`, {}, {
                withCredentials: true
            });
            fetchMyLeaves();
            setSuccess('Leave application cancelled');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel leave');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || styles.pending;
    };

    const getLeaveTypeLabel = (type) => {
        const found = leaveTypes.find(lt => lt.value === type);
        return found ? found.label : type;
    };

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

            {/* Header & Stats */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
                        NEW REQUEST
                    </Button>
                </div>

                {/* Availability Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="font-semibold text-blue-500 text-lg">Paid Time Off</span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {leaveBalance?.paid_available ?? '--'} Days Available
                        </span>
                    </div>
                    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="font-semibold text-purple-500 text-lg">Sick Leave</span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {leaveBalance?.sick_available ?? '--'} Days Available
                        </span>
                    </div>
                    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="font-semibold text-green-500 text-lg">Casual Leave</span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                            {leaveBalance?.casual_available ?? '--'} Days Available
                        </span>
                    </div>
                </div>
            </div>

            {/* Time Off Table */}
            <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                            <tr>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Start Date</th>
                                <th className="px-4 py-3 font-medium">End Date</th>
                                <th className="px-4 py-3 font-medium">Days</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[hsl(var(--card))]">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No leave applications found
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="border-b border-[hsl(var(--border))]">
                                        <td className="px-4 py-3 text-blue-500">{getLeaveTypeLabel(leave.leave_type)}</td>
                                        <td className="px-4 py-3">{format(new Date(leave.start_date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-3">{format(new Date(leave.end_date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-3">{leave.number_of_days}</td>
                                        <td className="px-4 py-3 max-w-xs truncate">{leave.reason}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusBadge(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {leave.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancel(leave.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal - Leave Request Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">New Leave Request</h3>
                            <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Leave Type</label>
                                    <select
                                        value={formData.leave_type}
                                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                        className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                        required
                                    >
                                        {leaveTypes.map(lt => (
                                            <option key={lt.value} value={lt.value}>{lt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                                            className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Reason</label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))] min-h-[100px]"
                                        placeholder="Please provide a reason for your leave request..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default LeaveRequest;
