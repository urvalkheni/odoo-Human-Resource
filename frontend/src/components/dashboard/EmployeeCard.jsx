import React from 'react';
import { User, Circle } from 'lucide-react';

const EmployeeCard = ({ employee, onClick }) => {
    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'text-green-500 fill-green-500';
            case 'Half Day': return 'text-orange-500 fill-orange-500';
            case 'On Leave': return 'text-yellow-500 fill-yellow-500';
            case 'Absent': return 'text-red-500 fill-red-500';
            default: return 'text-muted-foreground fill-muted-foreground';
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col items-center p-6 glass-card rounded-2xl cursor-pointer hover:-translate-y-1"
        >
            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
                <Circle className={`h-3 w-3 ${getStatusColor(employee.status)} transition-transform group-hover:scale-110`} />
            </div>

            {/* Avatar */}
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background group-hover:border-primary/20 transition-colors">
                    {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Info */}
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{employee.name}</h3>
            <p className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full mt-2">{employee.role}</p>
        </div>
    );
};

export default EmployeeCard;
