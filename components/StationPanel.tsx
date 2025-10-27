import React from 'react';
import { Station, StationId } from '../types';
import Gauge from './Gauge';
import Compass from './Compass';
import SignalStrength from './SignalStrength';

interface StationPanelProps {
    stationId: StationId;
    data: Station;
    onSetMode: (stationId: StationId, mode: string) => void;
    onSliderChange: (stationId: StationId, key: 'azimuth' | 'elevation', value: number) => void;
    onSliderChangeCommit: (stationId: StationId, key: 'azimuth' | 'elevation', value: number) => void;
    pendingAction: {
        stationId: StationId;
        key: 'azimuth' | 'elevation';
        value: number;
    } | null;
}

const stationConfigs = {
    A: {
        name: 'Station A',
        color: 'blue',
        gaugeColors: { azimuth: 'stroke-blue-500', elevation: 'stroke-green-500' },
        textColors: { azimuth: 'text-blue-400', elevation: 'text-green-400' },
    },
    B: {
        name: 'Station B',
        color: 'purple',
        gaugeColors: { azimuth: 'stroke-purple-500', elevation: 'stroke-orange-500' },
        textColors: { azimuth: 'text-purple-400', elevation: 'text-orange-400' },
    },
};

const modeConfigs = {
    AUTO: { color: 'green', text: 'AUTO' },
    MANUAL: { color: 'blue', text: 'MANUAL' },
    MAINT: { color: 'yellow', text: 'MAINT' },
    ERROR: { color: 'red', text: 'ERROR' },
};

const StationPanel: React.FC<StationPanelProps> = ({ stationId, data, onSetMode, onSliderChange, onSliderChangeCommit, pendingAction }) => {
    const config = stationConfigs[stationId];
    const modeConfig = modeConfigs[data.mode];
    const isManual = data.mode === 'MANUAL';
    
    const pendingAzimuth = pendingAction && pendingAction.stationId === stationId && pendingAction.key === 'azimuth';
    const pendingElevation = pendingAction && pendingAction.stationId === stationId && pendingAction.key === 'elevation';

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold text-${config.color}-400`}>{config.name}</h2>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${modeConfig.color}-500`}></div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${modeConfig.color}-900/50 dark:bg-${modeConfig.color}-900 text-${modeConfig.color}-300`}>
                        {modeConfig.text}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-3 text-gray-500 dark:text-gray-300">Azimuth</h3>
                    <Gauge
                        value={data.azimuth}
                        maxValue={360}
                        label="AZ"
                        gaugeColor={config.gaugeColors.azimuth}
                        textColor={config.textColors.azimuth}
                    />
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={data.azimuth}
                        onChange={(e) => onSliderChange(stationId, 'azimuth', parseInt(e.target.value))}
                        onMouseUp={(e) => onSliderChangeCommit(stationId, 'azimuth', parseInt(e.currentTarget.value))}
                        disabled={!isManual}
                        className={`w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer ${!isManual ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    {pendingAzimuth ? (
                        <div className="text-xs text-center text-yellow-400 dark:text-yellow-500 animate-pulse mt-2 h-4">
                            Confirming in 10s...
                        </div>
                    ) : (
                       <div className="h-4 mt-2"></div>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-3 text-gray-500 dark:text-gray-300">Elevation</h3>
                    <Gauge
                        value={data.elevation}
                        maxValue={90}
                        label="EL"
                        gaugeColor={config.gaugeColors.elevation}
                        textColor={config.textColors.elevation}
                    />
                     <input
                        type="range"
                        min="0"
                        max="90"
                        value={data.elevation}
                        onChange={(e) => onSliderChange(stationId, 'elevation', parseInt(e.target.value))}
                        onMouseUp={(e) => onSliderChangeCommit(stationId, 'elevation', parseInt(e.currentTarget.value))}
                        disabled={!isManual}
                        className={`w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer ${!isManual ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    {pendingElevation ? (
                        <div className="text-xs text-center text-yellow-400 dark:text-yellow-500 animate-pulse mt-2 h-4">
                            Confirming in 10s...
                        </div>
                    ) : (
                        <div className="h-4 mt-2"></div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-center mb-6">
                <Compass angle={data.azimuth} />
            </div>
            
            <div className="mb-4">
                <SignalStrength signal={data.signal} />
            </div>

            <div className="grid grid-cols-4 gap-2">
                <button onClick={() => onSetMode(stationId, 'AUTO')} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-semibold transition-colors">AUTO</button>
                <button onClick={() => onSetMode(stationId, 'MANUAL')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold transition-colors">MANUAL</button>
                <button onClick={() => onSetMode(stationId, 'MAINT')} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm font-semibold transition-colors">MAINT</button>
                <button onClick={() => onSetMode(stationId, 'ERROR')} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-semibold transition-colors">ERROR</button>
            </div>
        </div>
    );
};

export default StationPanel;
