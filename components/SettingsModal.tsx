
import React, { useState, useEffect } from 'react';
import { StationId } from '../types';

interface SettingsModalProps {
    onClose: () => void;
    onSave: (thresholds: { A: number, B: number }) => void;
    currentThresholds: { A: number, B: number };
}

const ThresholdSlider: React.FC<{
    stationId: StationId;
    label: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ stationId, label, value, onChange }) => {
    const color = stationId === 'A' ? 'blue' : 'purple';
    return (
        <div>
            <label htmlFor={`threshold-${stationId}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex items-center space-x-4 mt-2">
                <input
                    id={`threshold-${stationId}`}
                    type="range"
                    min="-90"
                    max="-60"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className={`w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
                />
                <span className={`font-mono text-lg text-${color}-500 dark:text-${color}-400 w-20 text-center`}>{value} dBm</span>
            </div>
        </div>
    );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, currentThresholds }) => {
    const [thresholds, setThresholds] = useState(currentThresholds);

    useEffect(() => {
        setThresholds(currentThresholds);
    }, [currentThresholds]);

    const handleSave = () => {
        onSave(thresholds);
    };
    
    const handleThresholdChange = (stationId: StationId, value: number) => {
        setThresholds(prev => ({...prev, [stationId]: value}));
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-labelledby="settings-title" role="dialog" aria-modal="true">
            <div className="glass-effect rounded-xl p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-700 pb-3">
                    <h2 id="settings-title" className="text-xl font-bold text-slate-700 dark:text-gray-200">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl" aria-label="Close settings">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Signal Strength Alerts</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Set the signal strength (dBm) threshold below which a warning notification will be triggered.
                        </p>
                        <div className="space-y-4">
                            <ThresholdSlider 
                                stationId="A"
                                label="Station A Threshold"
                                value={thresholds.A}
                                onChange={(value) => handleThresholdChange('A', value)}
                            />
                            <ThresholdSlider 
                                stationId="B"
                                label="Station B Threshold"
                                value={thresholds.B}
                                onChange={(value) => handleThresholdChange('B', value)}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end items-center pt-6 mt-6 border-t border-gray-300 dark:border-gray-700 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
