// NOTE: This file has been repurposed to connect to a FastAPI backend instead of Firebase.
// The filename is kept for compatibility with the project structure but now contains the ApiService.

import { Station, StationId, Notification, SignalHistory } from '../types';

// --- CONFIGURATION ---
// The base URL for the REST API
const API_BASE_URL = 'http://localhost:8000/api';
// The URL for the WebSocket connection
const WEBSOCKET_URL = 'ws://localhost:8000/ws';

interface ApiCallbacks {
    onStationAUpdate: (data: Station | null) => void;
    onStationBUpdate: (data: Station | null) => void;
    onNotificationsUpdate: (notifications: Notification[]) => void;
    onSignalHistoryUpdate: (data: SignalHistory | null) => void;
    onInitialState: (state: { stationA: Station, stationB: Station, notifications: Notification[], signalHistory: SignalHistory }) => void;
    onConnectionStatusChange: (status: 'failed') => void;
}

class ApiService {
  private ws: WebSocket | null = null;
  private callbacks: ApiCallbacks | null = null;

  // --- MOCK MODE PROPERTIES ---
  private isMockMode = false;
  private mockUpdateInterval: number | null = null;

  startMockMode() {
    if (!this.callbacks) {
        console.error("Cannot start mock mode: callbacks not initialized. Call connect() first.");
        return;
    }
    console.warn(
      "API connection failed. Running in mock data mode."
    );
    this.isMockMode = true;

    const mockState: {
        stationA: Station;
        stationB: Station;
        notifications: Notification[];
        signalHistory: SignalHistory;
    } = {
        stationA: {
            azimuth: 245, elevation: 32, mode: 'AUTO', signal: -67.3,
            env: { temp: 23.5, humidity: 45, wind: 12, pressure: 1013, rain: 0.0, visibility: 15 }
        },
        stationB: {
            azimuth: 128, elevation: 58, mode: 'MANUAL', signal: -72.8,
            env: { temp: 19.2, humidity: 68, wind: 8, pressure: 1009, rain: 2.1, visibility: 8.5 }
        },
        notifications: [
            { id: 'mock-1', type: 'warning', title: 'Signal Degradation', message: 'Station B signal strength is low.', details: 'Station B is experiencing signal degradation...', timestamp: new Date(Date.now() - 300000).toISOString(), station: 'B', severity: 'medium', read: false },
            { id: 'mock-2', type: 'info', title: 'Maintenance Scheduled', message: 'Station A has upcoming maintenance.', details: 'Routine maintenance is scheduled for tomorrow.', timestamp: new Date(Date.now() - 600000).toISOString(), station: 'A', severity: 'low', read: false },
        ],
        signalHistory: {
            A: Array.from({length: 30}, (_, i) => -67 + Math.sin(i * 0.2) * 3 + (Math.random() - 0.5) * 2),
            B: Array.from({length: 30}, (_, i) => -72 + Math.cos(i * 0.15) * 4 + (Math.random() - 0.5) * 3),
        }
    };
    
    this.callbacks.onInitialState(mockState);

    if (this.mockUpdateInterval) clearInterval(this.mockUpdateInterval);
    this.mockUpdateInterval = window.setInterval(() => {
        const newSignalA = -67 + (Math.random() - 0.5) * 6;
        const newSignalB = -72 + (Math.random() - 0.5) * 8;
        
        const newStationA = { ...mockState.stationA, signal: newSignalA };
        const newStationB = { ...mockState.stationB, signal: newSignalB };
        this.callbacks?.onStationAUpdate(newStationA);
        this.callbacks?.onStationBUpdate(newStationB);

        mockState.signalHistory.A.shift();
        mockState.signalHistory.A.push(newSignalA);
        mockState.signalHistory.B.shift();
        mockState.signalHistory.B.push(newSignalB);
        this.callbacks?.onSignalHistoryUpdate({...mockState.signalHistory});

    }, 2000);
  }

  connect(callbacks: ApiCallbacks) {
    this.callbacks = callbacks;
    if (this.ws) {
        this.ws.close();
    }

    try {
        this.ws = new WebSocket(WEBSOCKET_URL);

        this.ws.onopen = () => {
            console.log('WebSocket connection established. Waiting for initial state...');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };

        this.ws.onerror = () => {
            console.warn('WebSocket connection failed. The browser console may have more details (e.g., net::ERR_CONNECTION_REFUSED).');
            this.callbacks?.onConnectionStatusChange('failed');
            this.ws?.close();
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed.');
            if (!this.isMockMode) {
                 this.callbacks?.onConnectionStatusChange('failed');
            }
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        this.callbacks?.onConnectionStatusChange('failed');
    }
  }

  disconnect() {
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }
    if (this.mockUpdateInterval) {
        clearInterval(this.mockUpdateInterval);
        this.mockUpdateInterval = null;
    }
    this.isMockMode = false;
  }

  retryConnection() {
    this.disconnect();
    if (this.callbacks) {
        this.connect(this.callbacks);
    } else {
        console.error("Cannot retry connection: callbacks not initialized.");
    }
  }
  
  private handleWebSocketMessage(message: { type: string, payload: any }) {
    if (!this.callbacks) return;

    switch (message.type) {
        case 'initial_state':
            this.callbacks.onInitialState(message.payload);
            break;
        case 'station_update':
            if (message.payload.stationId === 'A') {
                this.callbacks.onStationAUpdate(message.payload.data);
            } else {
                this.callbacks.onStationBUpdate(message.payload.data);
            }
            break;
        case 'notifications_update':
            this.callbacks.onNotificationsUpdate(message.payload);
            break;
        case 'signal_history_update':
            this.callbacks.onSignalHistoryUpdate(message.payload);
            break;
        default:
            console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private async post(endpoint: string, body: object) {
    if (this.isMockMode) {
      console.log(`[Mock Mode] POST ${endpoint} with`, body);
      return;
    }
    try {
      await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error(`Failed to POST to ${endpoint}:`, error);
    }
  }

  private async delete(endpoint: string) {
    if (this.isMockMode) {
      console.log(`[Mock Mode] DELETE ${endpoint}`);
      return;
    }
    try {
      await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Failed to DELETE ${endpoint}:`, error);
    }
  }

  // --- API Methods ---
  async setStationMode(stationId: StationId, mode: Station['mode']): Promise<void> {
    return this.post(`/stations/${stationId}/mode`, { mode });
  }

  async updateStationValue(stationId: StationId, key: 'azimuth' | 'elevation', value: number): Promise<void> {
    return this.post(`/stations/${stationId}/control`, { key, value });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.delete(`/notifications/${notificationId}`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.post('/notifications/mark-all-read', {});
  }
  
  async updateNotification(notificationId: string, updates: Partial<Notification>): Promise<void> {
    return this.post(`/notifications/${notificationId}`, updates);
  }

  async clearAllNotifications(): Promise<void> {
    return this.delete('/notifications/all');
  }
}

export const apiService = new ApiService();