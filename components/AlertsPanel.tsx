
import React from 'react';
import { Alert } from '../types';

interface AlertsPanelProps {
    alerts: Alert[];
}

const alertConfigs = {
    AUTO: { color: 'green', messagePrefix: 'Tracking nominal' },
    MANUAL: { color: 'blue', messagePrefix: 'Manual mode active' },
    MAINT: { color: 'yellow', messagePrefix: 'Maintenance mode' },
    ERROR: { color: 'red', messagePrefix: 'System fault' },
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-gray-200">System Alerts & Notifications</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {alerts.length > 0 ? alerts.map((alert, index) => {
                    const config = alertConfigs[alert.mode as keyof typeof alertConfigs] || { color: 'gray' };
                    return (
                        <div
                            key={index}
                            className={`flex items-center space-x-3 p-3 bg-${config.color}-900/10 dark:bg-${config.color}-900/30 border border-${config.color}-700/20 dark:border-${config.color}-700 rounded-lg`}
                        >
                            <div className={`w-2 h-2 bg-${config.color}-500 rounded-full flex-shrink-0`}></div>
                            <span className={`text-sm text-${config.color}-700 dark:text-${config.color}-300`}>{alert.message}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0">{alert.timestamp}</span>
                        </div>
                    );
                }) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent system alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
