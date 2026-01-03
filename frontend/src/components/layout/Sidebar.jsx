import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCircle,
    CalendarCheck,
    Clock,
    Banknote,
    LogOut,
    Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'hr';

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: UserCircle },
        { name: 'Attendance', path: '/attendance', icon: Clock },
        { name: 'Leave', path: '/leave', icon: CalendarCheck },
        { name: 'Payroll', path: '/payroll', icon: Banknote },
    ];

    // Admin-only nav items
    const adminItems = [
        { name: 'Employees', path: '/employees', icon: Users },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="flex h-14 items-center border-b border-[hsl(var(--border))] px-4">
                <span className="text-xl font-bold tracking-tight text-[hsl(var(--primary))]">Dayflow</span>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}

                    {/* Admin-only items */}
                    {isAdmin && adminItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] rounded-full p-2">
                        <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                            {user?.first_name} {user?.last_name}
                        </span>
                        <span className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                            {user?.role}
                        </span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))/10] transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
