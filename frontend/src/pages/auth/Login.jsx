import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Shield, User, Lock, ArrowRight, Briefcase } from 'lucide-react';

const Login = () => {
    const [credential, setCredential] = useState(''); // Can be email or employee_id
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); // 'employee' or 'admin'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(credential, password);
            // Optional: Check if role matches if backend returns it
            // For now, we trust the backend to return the correct user
            // But we could show a warning if they logged in as logic different from selected interface
            if (data?.data?.role && role === 'admin' && data.data.role !== 'admin' && data.data.role !== 'hr') {
                setError("You do not have administrative privileges.");
                setLoading(false);
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[hsl(var(--background))]">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-[hsl(var(--primary))] relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-purple-800 opacity-90"></div>
                <div className="relative z-10 p-12 text-white">
                    <div className="mb-8">
                        <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm inline-block mb-4">
                            <Briefcase className="h-8 w-8" />
                        </span>
                        <h1 className="text-4xl font-bold mb-4">Dayflow HRMS</h1>
                        <p className="text-lg text-white/80 max-w-md">
                            Streamline your workforce management with our comprehensive solution.
                            Secure, efficient, and designed for modern teams.
                        </p>
                    </div>
                    {/* Decorative element */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-green-300" />
                            </div>
                            <div>
                                <div className="h-2 w-24 bg-white/40 rounded mb-2"></div>
                                <div className="h-2 w-16 bg-white/20 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-white/10 rounded"></div>
                            <div className="h-2 w-full bg-white/10 rounded"></div>
                            <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                        </div>
                    </div>
                </div>
                {/* Abstract circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mt-2">Sign in to your account</p>
                    </div>

                    <div className="bg-[hsl(var(--muted))] p-1 rounded-lg flex mb-6">
                        <button
                            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${role === 'employee' ? 'bg-[hsl(var(--background))] shadow text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                            onClick={() => setRole('employee')}
                        >
                            <User className="w-4 h-4 mr-2" /> Employee
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${role === 'admin' ? 'bg-[hsl(var(--background))] shadow text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                            onClick={() => setRole('admin')}
                        >
                            <Shield className="w-4 h-4 mr-2" /> Admin & HR
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Email or Employee ID"
                                type="text"
                                placeholder="name@company.com or EMP123"
                                value={credential}
                                onChange={(e) => setCredential(e.target.value)}
                                required
                            />
                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end mt-1">
                                    <Link to="/forgot-password" className="text-sm font-medium text-[hsl(var(--primary))] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm flex items-center gap-2">
                                <Shield className="h-4 w-4" /> {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-[hsl(var(--primary))/20]" loading={loading}>
                            Sign In as {role === 'admin' ? 'Admin' : 'Employee'} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[hsl(var(--primary))] font-semibold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
