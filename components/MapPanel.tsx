
import React from 'react';
import { Station, StationId } from '../types';

interface MapPanelProps {
    stations: { [key in StationId]: Station | null };
}

const MapPanel: React.FC<MapPanelProps> = ({ stations }) => {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-gray-200">Station Locations & Coverage</h2>
            <div className="bg-slate-100 dark:bg-gray-800 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-slate-400 dark:stroke-gray-700" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                
                {stations.A && (
                    <div className="absolute left-1/4 top-1/3 text-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mb-1 mx-auto"></div>
                        <div className="text-xs text-blue-400 font-semibold">Station A</div>
                        <div className="text-xs text-gray-400">{stations.A.azimuth}° AZ</div>
                    </div>
                )}
                
                {stations.B && (
                    <div className="absolute right-1/4 top-2/3 text-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mb-1 mx-auto"></div>
                        <div className="text-xs text-purple-400 font-semibold">Station B</div>
                        <div className="text-xs text-gray-400">{stations.B.azimuth}° AZ</div>
                    </div>
                )}
                
                <div className="text-center text-gray-500">
                    <div className="text-3xl">🛰️</div>
                    <div className="text-sm">Satellite Coverage Map</div>
                </div>
            </div>
        </div>
    );
};

export default MapPanel;
