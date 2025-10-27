
export type StationId = 'A' | 'B';

export type AppTheme = 'dark' | 'light';

export interface EnvironmentalData {
  temp: number;
  humidity: number;
  wind: number;
  pressure: number;
  rain: number;
  visibility: number;
}

export interface Station {
  azimuth: number;
  elevation: number;
  mode: 'AUTO' | 'MANUAL' | 'MAINT' | 'ERROR';
  signal: number;
  env: EnvironmentalData;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationSeverity = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details: string;
  timestamp: string; // ISO string
  station: StationId | 'Both' | 'System';
  severity: NotificationSeverity;
  read: boolean;
}

export interface Alert {
  station: StationId;
  mode: string;
  message: string;
  timestamp: string;
}

export interface SignalHistory {
  A: number[];
  B: number[];
}
