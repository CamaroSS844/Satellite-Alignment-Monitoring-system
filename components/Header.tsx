import React, { useState, useEffect } from 'react';
import { BurgerIcon } from './icons/BurgerIcon';

interface HeaderProps {
    systemStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'ERROR';
    onMenuClick: () => void;
    unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ systemStatus, onMenuClick, unreadCount }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    const statusConfig = {
        OPERATIONAL: { color: 'bg-green-500', text: 'OPERATIONAL' },
        MAINTENANCE: { color: 'bg-yellow-500', text: 'MAINTENANCE' },
        ERROR: { color: 'bg-red-500', text: 'SYSTEM ERROR' },
    };

    return (
        <header className="absolute glass-effect border-b z-40 p-6 w-full border-gray-700/50 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Satellite Alignment Monitoring
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-300">Real-time tracking and control system</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-400 dark:text-gray-400">Last Update</p>
                        <p className="text-lg font-mono">{currentTime}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${statusConfig[systemStatus].color} animate-pulse`}></div>
                        <span className="font-semibold">{statusConfig[systemStatus].text}</span>
                    </div>
                    <div className="relative">
                        <button
                            onClick={onMenuClick}
                            className="flex items-center justify-center w-10 h-10 rounded-lg glass-effect hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            aria-label="Open navigation menu"
                        >
                            <BurgerIcon />
                        </button>
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-gray-800">
                                {unreadCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;