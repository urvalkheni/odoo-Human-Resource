import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [showRemarkModal, setShowRemarkModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [actionType, setActionType] = useState('');
    const [remarks, setRemarks] = useState('');

    const fetchAllLeaves = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/leaves`, {
                params: { status: statusFilter !== 'all' ? statusFilter : undefined },
                withCredentials: true
            });
            if (response.data.success) {
                setLeaves(response.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch leaves:', err);
            setError('Failed to load leave applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLeaves();
    }, [statusFilter]);

    const openActionModal = (leave, action) => {
        setSelectedLeave(leave);
        setActionType(action);
        setRemarks('');
        setShowRemarkModal(true);
    };

    const handleLeaveAction = async () => {
        if (!selectedLeave || !actionType) return;

        setActionLoading(selectedLeave.id);
        setError('');
        try {
            const response = await axios.put(
                `${API_URL}/leaves/${selectedLeave.id}/status`,
                {
                    status: actionType,
                    approval_remarks: remarks
                },
                { withCredentials: true }
            );
            if (response.data.success) {
                setSuccess(`Leave ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`);
                setShowRemarkModal(false);
                fetchAllLeaves();
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${actionType} leave`);
        } finally {
            setActionLoading(null);
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

    const leaveTypeLabels = {
        paid: 'Paid Time Off',
        sick: 'Sick Leave',
        unpaid: 'Unpaid Leave',
        casual: 'Casual Leave',
        maternity: 'Maternity Leave',
        paternity: 'Paternity Leave'
    };

    const filteredLeaves = leaves.filter(leave => {
        const employeeName = leave.employee?.user?.first_name + ' ' + leave.employee?.user?.last_name;
        return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Leave Management (Admin/HR)</h2>

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
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2">
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md bg-[hsl(var(--background))] w-64"
                    />
                </div>
            </div>

            {/* Leave Requests Table */}
            <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden bg-[hsl(var(--card))]">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                            <tr>
                                <th className="px-4 py-2">Employee</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Start Date</th>
                                <th className="px-4 py-2">End Date</th>
                                <th className="px-4 py-2">Days</th>
                                <th className="px-4 py-2">Reason</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                                        No leave applications found
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((leave) => (
                                    <tr key={leave.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/20]">
                                        <td className="px-4 py-3 font-medium">
                                            {leave.employee?.user?.first_name} {leave.employee?.user?.last_name}
                                        </td>
                                        <td className="px-4 py-3 text-blue-500">{leaveTypeLabels[leave.leave_type] || leave.leave_type}</td>
                                        <td className="px-4 py-3">{format(new Date(leave.start_date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-3">{format(new Date(leave.end_date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-3">{leave.number_of_days}</td>
                                        <td className="px-4 py-3 max-w-xs truncate">{leave.reason}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusBadge(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {leave.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openActionModal(leave, 'approved')}
                                                        disabled={actionLoading === leave.id}
                                                        className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600 disabled:opacity-50"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openActionModal(leave, 'rejected')}
                                                        disabled={actionLoading === leave.id}
                                                        className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                            {leave.status !== 'pending' && leave.approval_remarks && (
                                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {leave.approval_remarks}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Remarks Modal */}
            {showRemarkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold capitalize">{actionType} Leave Request</h3>
                            <button onClick={() => setShowRemarkModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} this leave request from{' '}
                                <strong>{selectedLeave?.employee?.user?.first_name} {selectedLeave?.employee?.user?.last_name}</strong>?
                            </p>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Remarks (optional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-[hsl(var(--background))] min-h-[80px]"
                                    placeholder="Add any remarks..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setShowRemarkModal(false)}>Cancel</Button>
                                <Button
                                    onClick={handleLeaveAction}
                                    disabled={actionLoading}
                                    className={actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (actionType === 'approved' ? 'Approve' : 'Reject')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Info Note */}
            <div className="max-w-xl mx-auto border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 rounded-lg shadow-lg">
                <div className="text-center border-b border-[hsl(var(--border))] pb-2 mb-4">
                    <span className="text-yellow-500 font-semibold text-lg">Note</span>
                </div>
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                    As an Admin/HR Officer, you can view and approve/reject leave requests from all employees.
                    Employees can only view their own leave applications.
                </p>
            </div>
        </div>
    );
};

export default LeaveManagement;
