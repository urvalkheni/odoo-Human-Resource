import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Briefcase, DollarSign, Lock, CreditCard, Loader2, Save, Camera, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Profile = () => {
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const { id: employeeIdParam } = useParams();

    // Check if we are viewing another employee (read-only mode from admin dashboard)
    const viewOnlyId = location.state?.employeeId || employeeIdParam;
    const isViewOnly = !!viewOnlyId && viewOnlyId !== currentUser?.employee_id;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'hr';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [employeeData, setEmployeeData] = useState(null);
    const [payrollData, setPayrollData] = useState(null);
    const [activeTab, setActiveTab] = useState('account');

    // Editable fields
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        employee_code: '',
        department: '',
        designation: '',
        date_of_joining: '',
        phone: '',
        address: '',
        emergency_contact: '',
        bank_name: '',
        bank_account_number: '',
        basic_salary: ''
    });

    // Password fields
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let response;

                if (viewOnlyId && isAdmin) {
                    // Admin viewing employee
                    response = await axios.get(`${API_URL}/employees/${viewOnlyId}`, {
                        withCredentials: true
                    });
                } else {
                    // User viewing own profile
                    response = await axios.get(`${API_URL}/employees/me`, {
                        withCredentials: true
                    });
                }

                if (response.data.success) {
                    const data = response.data.data;
                    setEmployeeData(data);
                    setFormData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.user?.email || '',
                        role: data.user?.role || '',
                        employee_code: data.employee_code || '',
                        department: data.department || '',
                        designation: data.designation || '',
                        date_of_joining: data.date_of_joining || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        emergency_contact: data.emergency_contact || '',
                        bank_name: data.bank_name || '',
                        bank_account_number: data.bank_account_number || '',
                        basic_salary: data.basic_salary || ''
                    });

                    // Fetch payroll for salary tab if admin
                    if (isAdmin && data.id) {
                        try {
                            const payrollRes = await axios.get(`${API_URL}/payroll/employee/${data.id}`, {
                                params: { limit: 1 },
                                withCredentials: true
                            });
                            if (payrollRes.data.success && payrollRes.data.data?.length > 0) {
                                setPayrollData(payrollRes.data.data[0]);
                            }
                        } catch (err) {
                            console.log('No payroll data found');
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [viewOnlyId, isAdmin]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const endpoint = isAdmin && viewOnlyId
                ? `${API_URL}/employees/${viewOnlyId}`
                : `${API_URL}/employees/me`;

            await axios.put(endpoint, formData, {
                withCredentials: true
            });
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('profile_picture', file);

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const targetId = employeeData?.id;
            if (!targetId) throw new Error('Employee ID not found');

            await axios.post(`${API_URL}/employees/${targetId}/upload-picture`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            setSuccess('Profile picture updated successfully');
            // Refresh
            const response = await axios.get(`${API_URL}/employees/${targetId}`, { withCredentials: true });
            if (response.data.success) {
                setEmployeeData(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await axios.put(`${API_URL}/auth/change-password`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            }, {
                withCredentials: true
            });
            setSuccess('Password changed successfully');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    // Permission check for tabs
    const canSeePrivate = isAdmin || !isViewOnly;
    const canSeeSalary = isAdmin;
    const canSeeSecurity = !isViewOnly;

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    const userData = employeeData?.user || currentUser;
    const employee = employeeData || {};

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

            {/* Header / Basic Info Card */}
            <Card className="border-0 shadow-sm bg-[hsl(var(--card))]">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))] text-2xl font-bold border-4 border-[hsl(var(--background))] shadow overflow-hidden">
                            {employee.profile_picture ? (
                                <img
                                    src={employee.profile_picture.startsWith('http')
                                        ? employee.profile_picture
                                        : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/${employee.profile_picture}`}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{employee.first_name?.[0]}{employee.last_name?.[0]}</span>
                            )}
                        </div>
                        {(!isViewOnly || isAdmin) && (
                            <label className="absolute bottom-0 right-0 p-1.5 bg-[hsl(var(--primary))] text-white rounded-full cursor-pointer hover:bg-[hsl(var(--primary))/90] transition-colors shadow-lg z-10">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        )}
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                            <span className="flex items-center justify-center md:justify-start gap-1">
                                <Briefcase className="h-4 w-4" /> {employee.designation || userData?.role || 'Employee'}
                            </span>
                            <span className="flex items-center justify-center md:justify-start gap-1">
                                <User className="h-4 w-4" /> {employee.employee_id || 'N/A'}
                            </span>
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {employee.department && `${employee.department} • `}
                            {employee.date_of_joining && `Joined ${format(new Date(employee.date_of_joining), 'MMM yyyy')}`}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="border-b border-[hsl(var(--border))]">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['account', 'private', 'salary', 'security'].map((tab) => {
                        if (tab === 'private' && !canSeePrivate) return null;
                        if (tab === 'salary' && !canSeeSalary) return null;
                        if (tab === 'security' && !canSeeSecurity) return null;

                        const labels = { account: 'Account Info', private: 'Private Info', salary: 'Salary Info', security: 'Security' };
                        const icons = { account: User, private: Lock, salary: DollarSign, security: ShieldCheck };
                        const Icon = icons[tab] || User;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab
                                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {labels[tab]}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Areas */}
            <Card className="min-h-[400px]">
                <CardContent className="p-6">
                    {/* Account Info Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="First Name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                                <Input
                                    label="Email Address"
                                    value={formData.email}
                                    readOnly
                                    className="bg-gray-50"
                                />
                                <Input
                                    label="Role"
                                    value={formData.role}
                                    readOnly
                                    className="capitalize bg-gray-50"
                                />
                                <Input
                                    label="Employee ID"
                                    value={formData.employee_code}
                                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                                <Input
                                    label="Department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                                <Input
                                    label="Designation"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                                <Input
                                    label="Date of Joining"
                                    type="date"
                                    value={formData.date_of_joining}
                                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            {isAdmin && (
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Private Info Tab */}
                    {activeTab === 'private' && canSeePrivate && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    readOnly={isViewOnly && !isAdmin}
                                    placeholder="+1 234 567 890"
                                />
                                <Input
                                    label="Emergency Contact"
                                    value={formData.emergency_contact}
                                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                    readOnly={isViewOnly && !isAdmin}
                                    placeholder="Emergency contact number"
                                />
                                <div className="col-span-2">
                                    <Input
                                        label="Home Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        readOnly={isViewOnly && !isAdmin}
                                        placeholder="123 Main St, City, Country"
                                    />
                                </div>
                                <div className="col-span-2 border-t pt-4 mt-4">
                                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> Bank Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Bank Name"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                            readOnly={isViewOnly && !isAdmin}
                                        />
                                        <Input
                                            label="Account Number"
                                            value={formData.bank_account_number}
                                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                                            readOnly={isViewOnly && !isAdmin}
                                        />
                                    </div>
                                </div>
                            </div>
                            {(!isViewOnly || isAdmin) && (
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Salary Info Tab */}
                    {activeTab === 'salary' && canSeeSalary && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {isAdmin && (
                                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        Current Salary Structure
                                    </h3>
                                    <div className="flex gap-4 items-end">
                                        <Input
                                            label="Basic Salary (Monthly)"
                                            type="number"
                                            value={formData.basic_salary || ''}
                                            onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                            placeholder="e.g. 5000"
                                            className="max-w-xs"
                                        />
                                        <Button onClick={handleSave} disabled={saving} className="mb-1">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Update Salary
                                        </Button>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                        Updating Basic Salary will automatically recalculate allowances and net salary.
                                    </p>
                                </div>
                            )}

                            {employeeData?.basic_salary ? (
                                <div>
                                    <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">Current Breakdown</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded bg-[hsl(var(--background))] border">
                                            <span className="font-medium">Basic Salary</span>
                                            <span className="font-mono font-bold">₹{parseFloat(employeeData.basic_salary).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded bg-[hsl(var(--background))] border">
                                            <span className="font-medium">Net Salary (Approx.)</span>
                                            <span className="font-mono font-bold text-green-600">₹{parseFloat(employeeData.net_salary).toLocaleString()}</span>
                                        </div>
                                        {employeeData.allowances && Object.entries(employeeData.allowances).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 rounded bg-[hsl(var(--background))] border">
                                                <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-mono font-bold">₹{parseFloat(value).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                    No salary structure defined for this employee.
                                </div>
                            )}

                            {payrollData && (
                                <div className="mt-8 pt-6 border-t">
                                    <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">Last Payroll Record</h3>
                                    <div className="bg-[hsl(var(--muted))/30] p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Net Paid</span>
                                            <span className="text-xl font-bold font-mono">₹{payrollData.net_salary?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && canSeeSecurity && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-primary" />
                                        <CardTitle>Change Password</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        <Input
                                            label="Current Password"
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="New Password"
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            required
                                            placeholder="Min. 6 characters"
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            required
                                        />
                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={saving}>
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
