import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LeaveRequest from './LeaveRequest';
import LeaveManagement from './LeaveManagement';

const LeaveView = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            {user.role === 'admin' || user.role === 'hr' ? (
                <LeaveManagement />
            ) : (
                <LeaveRequest />
            )}
        </div>
    );
};

export default LeaveView;
