import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { CheckCircle, Shield, Users, Clock, Award, ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';

// ...

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {/* Navigation */}
            <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/80] backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="text-[hsl(var(--primary))] p-1 rounded-lg">
                        <Logo className="h-10 w-auto" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="font-medium">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-6 lg:px-8 py-24 lg:py-32 overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--primary))/20] via-[hsl(var(--background))] to-[hsl(var(--background))]"></div>

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center rounded-full border border-[hsl(var(--primary))/30] bg-[hsl(var(--primary))/10] px-3 py-1 text-sm font-medium text-[hsl(var(--primary))] mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--primary))] mr-2"></span>
                            Reimagining HR Management
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--muted-foreground))]">
                            Every Workday, <br className="hidden md:block" />
                            <span className="text-[hsl(var(--primary))]">Perfectly Aligned.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
                            Streamline your entire HR process from onboarding to payroll.
                            Dayflow empowers your team with a secure, efficient, and intuitive platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg" className="gap-2 h-12 px-8 text-base">
                                    Start for Free <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                    Live Demo
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Application Dashboard Preview */}
                    <div className="mt-16 relative w-full max-w-6xl mx-auto perspective-1000 hidden md:block group">
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-transparent to-transparent z-10 bottom-0 h-24"></div>

                        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden transform group-hover:scale-[1.01] transition-all duration-500 ease-in-out">
                            <div className="absolute inset-0 bg-[hsl(var(--primary))/5] mix-blend-overlay z-10 pointer-events-none"></div>
                            <img
                                src="/src/assets/dashboard-preview.png"
                                alt="Application Dashboard Preview"
                                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute -inset-4 bg-[hsl(var(--primary))/20] blur-3xl -z-10 rounded-[3rem] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-6 lg:px-8 py-24 bg-[hsl(var(--muted))/30]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to manage your team</h2>
                            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                                Powerful features designed to reduce administrative overhead and improve employee satisfaction.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Shield,
                                    title: "Secure Authentication",
                                    desc: "Enterprise-grade security for your data with role-based access control."
                                },
                                {
                                    icon: Clock,
                                    title: "Smart Attendance",
                                    desc: "Seamless check-in/out tracking with daily and weekly insights."
                                },
                                {
                                    icon: Users,
                                    title: "Employee Profiles",
                                    desc: "Centralized database for all employee information and documents."
                                },
                                {
                                    icon: Award,
                                    title: "Leave Management",
                                    desc: "Automated workflows for leave requests and approvals."
                                },
                                {
                                    icon: CheckCircle,
                                    title: "Payroll Visibility",
                                    desc: "Transparent salary structures and payslip history for everyone."
                                },
                                {
                                    icon: ArrowRight,
                                    title: "Real-time Analytics",
                                    desc: "Comprehensive dashboards for admins to make data-driven decisions."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <div className="bg-[hsl(var(--primary))/10] w-12 h-12 rounded-lg flex items-center justify-center text-[hsl(var(--primary))] mb-4">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-[hsl(var(--muted-foreground))]">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[hsl(var(--border))] py-12 px-6 lg:px-8 bg-[hsl(var(--card))]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-[hsl(var(--primary))] text-white p-1 rounded-md">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold text-[hsl(var(--foreground))]">Dayflow</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        &copy; {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">Privacy</a>
                        <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">Terms</a>
                        <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
