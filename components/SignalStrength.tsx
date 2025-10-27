
import React from 'react';

interface SignalStrengthProps {
    signal: number;
}

const SignalStrength: React.FC<SignalStrengthProps> = ({ signal }) => {
    // Convert dBm to percentage (e.g., -90dBm = 0%, -60dBm = 100%)
    const percentage = Math.max(0, Math.min(100, ((signal + 90) / 30) * 100));
    
    let color = 'bg-green-500';
    if (percentage < 75) color = 'bg-yellow-500';
    if (percentage < 40) color = 'bg-red-500';

    let textColor = 'text-green-400';
    if (percentage < 75) textColor = 'text-yellow-400';
    if (percentage < 40) textColor = 'text-red-400';

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-300">Signal Strength</span>
                <span className={`text-sm font-bold ${textColor}`}>{signal.toFixed(1)} dBm</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default SignalStrength;
