
import React from 'react';

interface GaugeProps {
    value: number;
    maxValue: number;
    label: string;
    gaugeColor: string;
    textColor: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, maxValue, label, gaugeColor, textColor }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const percentage = value / maxValue;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;

    return (
        <div className="relative w-[120px] h-[120px] mx-auto mb-3">
            <svg width="120" height="120" className="transform -rotate-90">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="stroke-gray-300 dark:stroke-gray-700"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className={`gauge-fill ${gaugeColor}`}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    style={{ strokeDasharray, transition: 'stroke-dasharray 0.3s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className={`text-2xl font-bold ${textColor}`}>{Math.round(value)}°</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                </div>
            </div>
        </div>
    );
};

export default Gauge;
