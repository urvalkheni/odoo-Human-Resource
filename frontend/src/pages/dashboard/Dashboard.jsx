import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return null; // Or loading spinner

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {user.role === 'admin' || user.role === 'hr' ? (
                <AdminDashboard />
            ) : (
                <EmployeeDashboard />
            )}
        </div>
    );
};

export default Dashboard;
