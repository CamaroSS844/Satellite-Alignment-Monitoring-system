import React, { useState, useEffect, useCallback } from 'react';
import { Station, StationId, Notification, Alert, SignalHistory, AppTheme } from './types';
import { apiService } from './services/firebaseService'; // Note: Service file is repurposed
import Header from './components/Header';
import SideNav from './components/SideNav';
import StationPanel from './components/StationPanel';
import AlertsPanel from './components/AlertsPanel';
import EnvironmentPanel from './components/EnvironmentPanel';
import SignalChart from './components/SignalChart';
import MapPanel from './components/MapPanel';
import NotificationModal from './components/NotificationModal';
import SettingsModal from './components/SettingsModal';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
    const [stationA, setStationA] = useState<Station | null>(null);
    const [stationB, setStationB] = useState<Station | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [signalHistory, setSignalHistory] = useState<SignalHistory>({ A: [], B: [] });
    const [theme, setTheme] = useState<AppTheme>('dark');
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);
    const [signalThresholds, setSignalThresholds] = useState({ A: -80, B: -80 });
    
    const [displayStations, setDisplayStations] = useState<{ A: Station | null, B: Station | null }>({ A: null, B: null });

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [confirmationProps, setConfirmationProps] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }>({
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [pendingManualAdjustment, setPendingManualAdjustment] = useState<{
        stationId: StationId;
        key: 'azimuth' | 'elevation';
        value: number;
        timerId: number;
    } | null>(null);
    
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
    const [isShowingErrorBanner, setIsShowingErrorBanner] = useState(false);


    useEffect(() => {
        apiService.connect({
            onStationAUpdate: setStationA,
            onStationBUpdate: setStationB,
            onNotificationsUpdate: setNotifications,
            onSignalHistoryUpdate: setSignalHistory,
            onInitialState: (state) => {
                setStationA(state.stationA);
                setStationB(state.stationB);
                setNotifications(state.notifications);
                setSignalHistory(state.signalHistory);
                setConnectionStatus('connected');
                // A successful connection (even with mock data) means we're good to go.
                // The banner is controlled separately.
            },
            onConnectionStatusChange: (status) => {
                if (status === 'failed') {
                    setConnectionStatus('failed');
                }
            },
        });

        return () => {
            apiService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (connectionStatus === 'failed') {
            setIsShowingErrorBanner(true);
            apiService.startMockMode(); // This will load mock data and call onInitialState
        }
    }, [connectionStatus]);
    
    useEffect(() => {
        if (!pendingManualAdjustment) {
            setDisplayStations({ A: stationA, B: stationB });
        }
    }, [stationA, stationB, pendingManualAdjustment]);


    useEffect(() => {
        return () => {
            if (pendingManualAdjustment) {
                clearTimeout(pendingManualAdjustment.timerId);
            }
        };
    }, [pendingManualAdjustment]);
    
    const addAlert = useCallback((station: StationId, mode: string) => {
        const modeMessages: { [key: string]: string } = {
            'AUTO': `Station ${station}: Switched to automatic mode`,
            'MANUAL': `Station ${station}: Manual control activated`,
            'MAINT': `Station ${station}: Maintenance mode enabled`,
            'ERROR': `Station ${station}: ERROR - System fault detected`,
        };
        const newAlert: Alert = {
            station,
            mode,
            message: modeMessages[mode] || `Station ${station}: Mode changed to ${mode}`,
            timestamp: new Date().toLocaleTimeString(),
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 5));
    }, []);
    
    const stations = { A: stationA, B: stationB };

    const handleSetMode = (stationId: StationId, mode: string) => {
        if (pendingManualAdjustment) {
            clearTimeout(pendingManualAdjustment.timerId);
            setDisplayStations(prev => ({ ...prev, [pendingManualAdjustment.stationId]: stations[pendingManualAdjustment.stationId] }));
            setPendingManualAdjustment(null);
        }

        const isCritical = mode === 'ERROR' || mode === 'MAINT';
        setConfirmationProps({
            title: `Confirm Mode Change`,
            message: `Are you sure you want to switch Station ${stationId} to ${mode} mode? ${isCritical ? 'This is a critical operation.' : ''}`,
            onConfirm: async () => {
                await apiService.setStationMode(stationId, mode as Station['mode']);
                addAlert(stationId, mode);
                setIsConfirmationOpen(false);
            },
        });
        setIsConfirmationOpen(true);
    };

    const handleSliderChange = (stationId: StationId, key: 'azimuth' | 'elevation', value: number) => {
        const station = displayStations[stationId];
        if (station?.mode !== 'MANUAL') return;

        if (pendingManualAdjustment) {
            clearTimeout(pendingManualAdjustment.timerId);
            setPendingManualAdjustment(null);
        }

        setDisplayStations(prev => {
            const currentStation = prev[stationId];
            if (!currentStation) return prev;
            return { ...prev, [stationId]: { ...currentStation, [key]: value }};
        });
    };

    const handleSliderChangeCommit = (stationId: StationId, key: 'azimuth' | 'elevation', value: number) => {
        if (pendingManualAdjustment) {
            clearTimeout(pendingManualAdjustment.timerId);
        }
        
        const originalValue = stationId === 'A' ? stationA?.[key] : stationB?.[key];
        if (value === originalValue) {
            setPendingManualAdjustment(null);
            return;
        }

        const newTimer = window.setTimeout(() => {
            setConfirmationProps({
                title: 'Confirm Manual Adjustment',
                message: `This will command Station ${stationId} to move. Are you sure you want to set ${key} to ${value}°?`,
                onConfirm: async () => {
                    await apiService.updateStationValue(stationId, key, value);
                    setIsConfirmationOpen(false);
                    setPendingManualAdjustment(null);
                },
                onCancel: () => {
                    setDisplayStations(prev => ({...prev, [stationId]: stations[stationId]}));
                    setIsConfirmationOpen(false);
                    setPendingManualAdjustment(null);
                }
            });
            setIsConfirmationOpen(true);
        }, 10000);

        setPendingManualAdjustment({ stationId, key, value, timerId: newTimer });
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.classList.toggle('light-theme', newTheme === 'light');
        document.body.classList.toggle('light-theme', newTheme === 'light');
    };

    const handleSaveSettings = (newThresholds: { A: number; B: number }) => {
        setSignalThresholds(newThresholds);
        setIsSettingsOpen(false);
        console.log("Settings saved (frontend only):", newThresholds);
    };

    const handleDownloadReport = () => {
        const reportData = {
            timestamp: new Date().toISOString(),
            systemStatus: systemStatus,
            stationA: stationA,
            stationB: stationB,
            notifications: notifications,
        };
        const reportJson = JSON.stringify(reportData, null, 2);
        const blob = new Blob([reportJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `satellite-monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportCsv = () => {
        if (!signalHistory || signalHistory.A.length === 0) {
            alert('No signal history data available to export.');
            return;
        }
        const headers = ['Timestamp', 'Station A Signal (dBm)', 'Station B Signal (dBm)'];
        const now = new Date();
        const rows = signalHistory.A.map((signalA, index) => {
            const signalB = signalHistory.B[index] ?? 'N/A';
            const minutesAgo = signalHistory.A.length - index;
            const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
            return [
                timestamp.toLocaleString(),
                signalA.toFixed(2),
                typeof signalB === 'number' ? signalB.toFixed(2) : signalB
            ];
        });
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const dateString = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `signal_history_${dateString}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteNotification = async (id: string) => {
        await apiService.deleteNotification(id);
        setActiveNotification(null);
    };

    const handleMarkAllRead = async () => {
        await apiService.markAllNotificationsAsRead();
    };

    const handleClearAll = async () => {
        await apiService.clearAllNotifications();
    };
    
    useEffect(() => {
        document.body.className = `${theme === 'dark' ? 'gradient-bg' : 'light-theme'} min-h-screen text-white font-sans`;
    }, [theme]);
    
    const systemStatus = stationA?.mode === 'ERROR' || stationB?.mode === 'ERROR' ? 'ERROR' : 
                         stationA?.mode === 'MAINT' || stationB?.mode === 'MAINT' ? 'MAINTENANCE' : 'OPERATIONAL';
    
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleRetryConnection = () => {
        setIsShowingErrorBanner(false);
        setConnectionStatus('connecting');
        apiService.retryConnection();
    };

    const renderContent = () => {
        if (connectionStatus === 'connecting' || !displayStations.A || !displayStations.B) {
            return (
                <div className="flex justify-center items-center h-96">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xl font-semibold">Connecting to Satellite Control...</p>
                        <p className="text-gray-400">Attempting to connect to FastAPI backend.</p>
                    </div>
                </div>
            );
        }

        return (
            <>
                {isShowingErrorBanner && (
                    <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative flex justify-between items-center" role="alert">
                        <div>
                            <strong className="font-bold">Connection Failed.</strong>
                            <span className="block sm:inline ml-2">Running in offline mode with mock data.</span>
                        </div>
                        <button
                            onClick={handleRetryConnection}
                            className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StationPanel stationId="A" data={displayStations.A} onSetMode={handleSetMode} onSliderChange={handleSliderChange} onSliderChangeCommit={handleSliderChangeCommit} pendingAction={pendingManualAdjustment} />
                    <StationPanel stationId="B" data={displayStations.B} onSetMode={handleSetMode} onSliderChange={handleSliderChange} onSliderChangeCommit={handleSliderChangeCommit} pendingAction={pendingManualAdjustment} />
                </div>
                <AlertsPanel alerts={alerts} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <EnvironmentPanel stations={stations} />
                    <SignalChart signalHistory={signalHistory} signalThresholds={signalThresholds} />
                </div>
                <MapPanel stations={stations} />
            </>
        );
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'gradient-bg text-white' : 'light-theme text-slate-800'}`}>
            <Header
                systemStatus={systemStatus}
                onMenuClick={() => setIsSideNavOpen(true)}
                unreadCount={unreadCount}
            />
            <SideNav
                isOpen={isSideNavOpen}
                onClose={() => setIsSideNavOpen(false)}
                theme={theme}
                toggleTheme={toggleTheme}
                notifications={notifications}
                onNotificationClick={(notif) => {
                    setActiveNotification(notif);
                    if (!notif.read) apiService.updateNotification(notif.id, { read: true });
                    setIsSideNavOpen(false);
                }}
                onSettingsClick={() => {
                    setIsSettingsOpen(true);
                    setIsSideNavOpen(false);
                }}
                onDownloadReport={handleDownloadReport}
                onExportCsv={handleExportCsv}
                onMarkAllRead={handleMarkAllRead}
                onClearAll={handleClearAll}
            />
            <main className="absolute max-w-7xl mx-auto p-6 space-y-6 mt-[100px] w-full">
                {renderContent()}
            </main>
            {activeNotification && (
                <NotificationModal
                    notification={activeNotification}
                    onClose={() => setActiveNotification(null)}
                    onDismiss={handleDeleteNotification}
                />
            )}
            {isSettingsOpen && (
                <SettingsModal
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={handleSaveSettings}
                    currentThresholds={signalThresholds}
                />
            )}
            {isConfirmationOpen && (
                <ConfirmationModal
                    isOpen={isConfirmationOpen}
                    title={confirmationProps.title}
                    message={confirmationProps.message}
                    onConfirm={() => {
                        confirmationProps.onConfirm();
                    }}
                    onCancel={() => {
                        if (confirmationProps.onCancel) {
                           confirmationProps.onCancel();
                        } else {
                           setIsConfirmationOpen(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default App;