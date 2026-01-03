import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';
import Button from '../common/Button';

const TopNavbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = [
        { name: 'Employees', path: '/dashboard', roles: ['admin', 'hr'] },
        { name: 'Attendance', path: '/attendance', roles: ['admin', 'hr', 'employee'] },
        { name: 'Time Off', path: '/leave', roles: ['admin', 'hr', 'employee'] },
        { name: 'Payroll', path: '/payroll', roles: ['admin', 'hr', 'employee'] },
        { name: 'Insights', path: '/analytics', roles: ['admin', 'hr'] },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="glass sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo and Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-3 group">
                            {/* Logo Image */}
                            <div className="group-hover:scale-105 transition-transform">
                                <Logo className="h-12 w-auto" />
                            </div>
                            {/* Text is hidden for now as the logo image likely contains the text 'Daily Flow' based on user request */}
                            {/* If we want to keep text, we can uncomment, but usually graphical logos replace text */}
                        </Link>
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-2">
                                {navItems.map((item) => {
                                    if (item.roles && !item.roles.includes(user?.role)) return null;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                                ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Profile and Right Side */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center gap-4 md:ml-6">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 max-w-xs rounded-full bg-[hsl(var(--card))] text-sm focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <span className="hidden lg:block font-medium">
                                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.email || 'User')}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[hsl(var(--popover))] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-[hsl(var(--popover-foreground))] hover:bg-[hsl(var(--accent))]"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-[hsl(var(--popover-foreground))] hover:bg-[hsl(var(--accent))]"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-[hsl(var(--border))]">
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        {navItems.map((item) => {
                            if (item.roles && !item.roles.includes(user?.role)) return null;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)
                                        ? 'bg-[hsl(var(--primary))] text-white'
                                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="border-t border-[hsl(var(--border))] pb-3 pt-4">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                                    <User className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none">{user?.first_name} {user?.last_name}</div>
                                <div className="text-sm font-medium leading-none text-[hsl(var(--muted-foreground))] mt-1">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                            <Link
                                to="/profile"
                                className="block rounded-md px-3 py-2 text-base font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                My Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default TopNavbar;
