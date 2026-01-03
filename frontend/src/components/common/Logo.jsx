import React from 'react';
import logoSrc from '../../assets/daily-flow-logo.png';

const Logo = ({ className = "h-8 w-auto" }) => {
    return (
        <img
            src={logoSrc}
            alt="Daily Flow Logo"
            className={`${className} object-contain`}
        />
    );
};

export default Logo;
