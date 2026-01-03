import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AnalyticsView = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${API_URL}/dashboard/analytics`, {
                    withCredentials: true
                });
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Workforce Analytics</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Insights on employee performance, attendance, and leave trends.</p>
            </div>

            {/* Top Level Stats - Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">Top Performers</p>
                                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">{data?.insights.top_performers.length}</h3>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600 opacity-75" />
                        </div>
                        <p className="text-xs text-green-700 mt-2">Candidates for Hike</p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">At Risk</p>
                                <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">{data?.insights.at_risk.length}</h3>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600 opacity-75" />
                        </div>
                        <p className="text-xs text-red-700 mt-2">Needs Attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Employees</p>
                                <h3 className="text-2xl font-bold">{data?.employees.length}</h3>
                            </div>
                            <Users className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avg_hours" name="Avg Daily Hours" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="avg_leaves" name="Avg Leaves" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Performance Classification Pie Chart (Derived) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'High Performer', value: data?.insights.top_performers.length },
                                        { name: 'At Risk', value: data?.insights.at_risk.length },
                                        { name: 'Neutral', value: data?.employees.length - data?.insights.top_performers.length - data?.insights.at_risk.length }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#22c55e" /> {/* High Performer - Green */}
                                    <Cell fill="#ef4444" /> {/* At Risk - Red */}
                                    <Cell fill="#94a3b8" /> {/* Neutral - Gray */}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Top Performers (Hike Candidates)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.insights.top_performers.length === 0 ? (
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">No candidates found matching criteria.</p>
                            ) : (
                                data?.insights.top_performers.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 text-xl font-bold rounded-full bg-green-200 text-green-700 flex items-center justify-center uppercase">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{emp.name}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{emp.department} • {emp.designation}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-700">{emp.avg_daily_hours}h / day</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Avg Working</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Needs Attention (At Risk)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.insights.at_risk.length === 0 ? (
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">No employees currently at risk.</p>
                            ) : (
                                data?.insights.at_risk.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 text-xl font-bold rounded-full bg-red-200 text-red-700 flex items-center justify-center uppercase">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{emp.name}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{emp.department} • {emp.designation}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-red-700">{emp.avg_daily_hours}h / day</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Avg Working</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsView;
