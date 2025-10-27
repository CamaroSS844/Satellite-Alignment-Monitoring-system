import React, { useState, useEffect, useRef } from 'react';
import { Notification, AppTheme, NotificationType } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { BellIcon } from './icons/BellIcon';
import { ChartIcon } from './icons/ChartIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ExportIcon } from './icons/ExportIcon';
import { CloseIcon } from './icons/CloseIcon';

interface SideNavProps {
    isOpen: boolean;
    onClose: () => void;
    theme: AppTheme;
    toggleTheme: () => void;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onSettingsClick: () => void;
    onDownloadReport: () => void;
    onExportCsv: () => void;
    onMarkAllRead: () => void;
    onClearAll: () => void;
}

const typeIcons: { [key in NotificationType]: string } = {
    warning: '⚠️', error: '❌', info: 'ℹ️', success: '✅'
};

const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, hasBadge?: boolean, badgeCount?: number }> = ({ icon, label, onClick, hasBadge, badgeCount }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full space-x-4 px-4 py-3 rounded-lg text-slate-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
    >
        <div className="relative">
            {icon}
            {hasBadge && badgeCount !== undefined && badgeCount > 0 && (
                <div className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {badgeCount}
                </div>
            )}
        </div>
        <span className="font-medium">{label}</span>
    </button>
);

const SideNav: React.FC<SideNavProps> = ({
    isOpen,
    onClose,
    theme,
    toggleTheme,
    notifications,
    onNotificationClick,
    onSettingsClick,
    onDownloadReport,
    onExportCsv,
    onMarkAllRead,
    onClearAll,
}) => {
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const sideNavRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sideNavRef.current && !sideNavRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <aside
                ref={sideNavRef}
                className={`fixed top-0 right-0 h-full w-80 glass-effect border-l border-gray-700/50 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sidenav-title"
            >
                <div className="p-6 border-b border-gray-700/50 dark:border-gray-700 flex justify-between items-center">
                    <h2 id="sidenav-title" className="text-xl font-bold">Menu</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <div className="bg-slate-200/50 dark:bg-gray-800/50 rounded-lg">
                        <NavButton 
                            icon={<BellIcon />} 
                            label="Notifications" 
                            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                            hasBadge={true}
                            badgeCount={unreadCount}
                         />
                        {isNotificationsOpen && (
                            <div className="px-4 pb-2 max-h-96 overflow-y-auto">
                                <div className="border-t border-gray-600/50 pt-2">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-900/20 dark:bg-blue-500/10' : ''}`}
                                                onClick={() => onNotificationClick(notification)}
                                            >
                                                <div className="flex items-start space-x-2">
                                                    <div className="text-md pt-1">{typeIcons[notification.type]}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline">
                                                          <h4 className="text-sm font-semibold truncate pr-2">{notification.title}</h4>
                                                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{timeAgo(notification.timestamp)}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                                    )}
                                    {notifications.length > 0 && (
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600/50">
                                            <button onClick={onMarkAllRead} className="text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                Mark all as read
                                            </button>
                                            <button onClick={onClearAll} className="text-xs text-red-400 hover:text-red-300 py-1 px-2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                Clear All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <NavButton icon={<ChartIcon />} label="Generate Report" onClick={onDownloadReport} />
                    <NavButton icon={<ExportIcon />} label="Export CSV" onClick={onExportCsv} />
                    <NavButton icon={<SettingsIcon />} label="Settings" onClick={onSettingsClick} />
                    <NavButton 
                        icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />} 
                        label={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`} 
                        onClick={toggleTheme} 
                    />
                </nav>
            </aside>
        </>
    );
};

export default SideNav;