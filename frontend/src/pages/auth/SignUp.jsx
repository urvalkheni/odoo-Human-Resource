import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Shield, Briefcase, ArrowRight, Check } from 'lucide-react';
import axios from 'axios';

const SignUp = () => {
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        company_id: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        department: '',
        designation: '',
        basic_salary: '',
        role: 'employee'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedCredentials, setGeneratedCredentials] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    // Fetch companies on component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/companies');
                setCompanies(response.data.data || []);
                // Set first company as default if available
                if (response.data.data && response.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, company_id: response.data.data[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch companies:', err);
                // If API fails, set a default company ID
                setFormData(prev => ({ ...prev, company_id: '2f0d8e15-05a7-4ec5-aefc-16e893e2e9f9' }));
            }
        };
        fetchCompanies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            console.log("Submitting form data:", formData);
            const response = await signup(formData);
            if (response?.data) {
                setGeneratedCredentials(response.data);
                setSuccess('Account created successfully! Please save your credentials.');
                // Don't auto-navigate, show credentials first
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/3 bg-[hsl(var(--muted))] relative items-center justify-center border-r border-[hsl(var(--border))]">
                <div className="p-12">
                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-8 transform rotate-3 transition-transform hover:rotate-0 duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                JD
                            </div>
                            <div>
                                <div className="font-bold text-lg text-gray-800">John Doe</div>
                                <div className="text-sm text-gray-500">Software Engineer</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-ful bg-gray-100 rounded"></div>
                            <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Join Dayflow Today</h2>
                    <ul className="space-y-4">
                        {['Automated Payroll', 'Easy Leave Management', 'Real-time Attendance'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                                <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))/20] flex items-center justify-center text-[hsl(var(--primary))]">
                                    <Check className="h-3 w-3" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Trusted Companies Section */}
                <div className="absolute bottom-0 left-0 w-full p-12 bg-black/5 backdrop-blur-sm border-t border-black/5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Trusted by industry leaders</p>
                    <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                        {companies.length > 0 ? (
                            companies.slice(0, 4).map((comp, index) => {
                                // Generate deterministic color based on name length
                                const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-blue-600', 'bg-purple-600'];
                                const colorClass = colors[comp.name.length % colors.length];

                                return (
                                    <div key={comp.id} className="flex items-center gap-2">
                                        <div className={`h-8 w-8 ${colorClass} rounded-lg flex items-center justify-center text-white font-bold`}>
                                            {comp.short_name ? comp.short_name.substring(0, 2).toUpperCase() : comp.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-700">{comp.name}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-sm text-gray-400">Loading partners...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-[hsl(var(--muted-foreground))] mt-2">Get started with Dayflow HRMS</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Role Selection */}
                        <div>
                            <label className="text-sm font-medium mb-3 block">I am joining as a</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'employee' })}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${formData.role === 'employee'
                                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${formData.role === 'employee' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))]'}`}>
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Employee</div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Regular access to personal dashboard</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'admin' })} // Note: usually admin signup is restricted
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${formData.role === 'admin'
                                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${formData.role === 'admin' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))]'}`}>
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Administrator</div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Full access to manage organization</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g. IT, HR, Sales"
                                required
                            />
                            <Input
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g. Software Engineer"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                                    Company
                                </label>
                                <select
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.name} ({company.short_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Basic Salary"
                                type="number"
                                name="basic_salary"
                                value={formData.basic_salary}
                                onChange={handleChange}
                                placeholder="50000"
                                required
                            />
                        </div>

                        <Input
                            label="Date of Joining"
                            type="date"
                            name="date_of_joining"
                            value={formData.date_of_joining}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-4 rounded-lg flex items-center gap-2">
                                <Shield className="h-4 w-4" /> {error}
                            </div>
                        )}

                        {success && generatedCredentials && (
                            <div className="bg-green-50 text-green-800 text-sm p-4 rounded-lg space-y-2">
                                <div className="font-semibold flex items-center gap-2">
                                    <Check className="h-4 w-4" /> {success}
                                </div>
                                <div className="bg-white p-3 rounded border border-green-200 space-y-1">
                                    <p><strong>Employee ID:</strong> {generatedCredentials.employee_id}</p>
                                    <p><strong>Temporary Password:</strong> {generatedCredentials.temporary_password}</p>
                                    <p className="text-xs text-green-600 mt-2">⚠️ Please save these credentials. You'll need them to login.</p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="w-full mt-2"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                        {!generatedCredentials && (
                            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
                                Create Account <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                    </form>

                    <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[hsl(var(--primary))] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
