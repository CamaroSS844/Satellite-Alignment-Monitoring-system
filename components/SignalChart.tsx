
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SignalHistory } from '../types';

interface SignalChartProps {
    signalHistory: SignalHistory;
    signalThresholds: { A: number, B: number };
}

const SignalChart: React.FC<SignalChartProps> = ({ signalHistory, signalThresholds }) => {
    // We assume both histories have the same length
    const data = signalHistory.A.map((_, index) => ({
        name: `${30 - index}m ago`, // Simplified time axis
        stationA: signalHistory.A[index],
        stationB: signalHistory.B[index],
    }));

    return (
        <div className="xl:col-span-2 glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-gray-200">Signal Strength Trends (Last 30 Mins)</h2>
            <div className="bg-slate-100/50 dark:bg-gray-800/50 rounded-lg p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                        <XAxis dataKey="name" stroke="rgb(100 116 139)" fontSize={12} tick={{ fill: 'currentColor' }} />
                        <YAxis domain={[-90, -60]} stroke="rgb(100 116 139)" fontSize={12} tick={{ fill: 'currentColor' }} unit="dBm" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                border: '1px solid #4A5568',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#E2E8F0' }}
                        />
                        <Legend wrapperStyle={{fontSize: '14px'}} />
                        <ReferenceLine y={-80} label={{ value: 'Default Critical', position: 'insideTopLeft', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine y={signalThresholds.A} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'A Thresh', position: 'insideBottomLeft', fill: '#3b82f6', fontSize: 12 }}/>
                        <ReferenceLine y={signalThresholds.B} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: 'B Thresh', position: 'insideBottomLeft', fill: '#8b5cf6', fontSize: 12 }}/>
                        <Line type="monotone" dataKey="stationA" name="Station A" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="stationB" name="Station B" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="flex justify-center flex-wrap space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-300">Station A</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-300">Station B</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-300">Critical Threshold (-80 dBm)</span>
                </div>
            </div>
        </div>
    );
};

export default SignalChart;
