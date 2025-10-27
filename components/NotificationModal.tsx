
import React from 'react';
import { Notification } from '../types';

interface NotificationModalProps {
    notification: Notification;
    onClose: () => void;
    onDismiss: (id: string) => void;
}

const typeInfo = {
    warning: { icon: '⚠️', color: 'text-yellow-400 border-yellow-500' },
    error: { icon: '❌', color: 'text-red-400 border-red-500' },
    info: { icon: 'ℹ️', color: 'text-blue-400 border-blue-500' },
    success: { icon: '✅', color: 'text-green-400 border-green-500' },
};

const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose, onDismiss }) => {
    const { icon, color } = typeInfo[notification.type];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" role="dialog" aria-modal="true">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-gray-200">Notification Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">{icon}</div>
                        <div>
                            <h3 className={`text-lg font-semibold ${color}`}>{notification.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(notification.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className={`border-l-4 ${color} pl-4 py-2`}>
                        <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 mb-2">Detailed Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notification.details}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-300 dark:border-gray-700">
                        <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span><strong>Station:</strong> {notification.station}</span>
                            <span><strong>Severity:</strong> <span className="capitalize">{notification.severity}</span></span>
                        </div>
                        <button onClick={() => onDismiss(notification.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
