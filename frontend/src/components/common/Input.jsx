import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, ...props }, ref) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 ${error ? 'border-destructive focus-visible:ring-destructive' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
