
import React from 'react';
import { Station, StationId } from '../types';

interface EnvironmentPanelProps {
    stations: { [key in StationId]: Station | null };
}

const stationColors = {
    A: 'blue',
    B: 'purple'
};

const EnvironmentDataItem: React.FC<{ label: string, value: string, colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-300">{label}:</span>
        <span className={`font-mono ${colorClass}`}>{value}</span>
    </div>
);

const EnvironmentStationBlock: React.FC<{ stationId: StationId, data: Station }> = ({ stationId, data }) => {
    const color = stationColors[stationId];
    const textColor = `text-${color}-500 dark:text-${color}-400`;

    const getRainColor = (rate: number) => {
        if (rate === 0) return 'text-green-500 dark:text-green-400';
        if (rate < 2.5) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    return (
        <div className="bg-slate-100/50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className={`text-sm font-semibold ${textColor} mb-3`}>Station {stationId} Environment</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <EnvironmentDataItem label="Temperature" value={`${data.env.temp.toFixed(1)}°C`} colorClass={textColor} />
                <EnvironmentDataItem label="Humidity" value={`${data.env.humidity}%`} colorClass={textColor} />
                <EnvironmentDataItem label="Wind Speed" value={`${data.env.wind} km/h`} colorClass={textColor} />
                <EnvironmentDataItem label="Pressure" value={`${data.env.pressure} hPa`} colorClass={textColor} />
                <EnvironmentDataItem label="Rain Rate" value={`${data.env.rain.toFixed(1)} mm/h`} colorClass={getRainColor(data.env.rain)} />
                <EnvironmentDataItem label="Visibility" value={data.env.visibility >= 15 ? '15+ km' : `${data.env.visibility.toFixed(1)} km`} colorClass={data.env.visibility > 10 ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'} />
            </div>
        </div>
    );
};

const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({ stations }) => {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-gray-200">Environmental Conditions</h2>
            <div className="space-y-4">
                {stations.A && <EnvironmentStationBlock stationId="A" data={stations.A} />}
                {stations.B && <EnvironmentStationBlock stationId="B" data={stations.B} />}
            </div>
        </div>
    );
};

export default EnvironmentPanel;
